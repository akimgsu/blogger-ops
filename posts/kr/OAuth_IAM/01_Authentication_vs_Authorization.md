# 01. Authentication vs Authorization (인증 vs 인가)

보안 시스템을 설계하거나 API를 보호할 때 가장 먼저 마주치는 두 단어가 있습니다. 바로 **Authentication(인증)**과 **Authorization(인가)**입니다. 일상 대화에서는 둘을 섞어 쓰기도 하지만, 엔지니어링에서는 이 둘을 엄격히 분리해야 합니다. 혼동하면 잘못된 토큰 설계, 과도한 권한 부여, 그리고 치명적인 보안 사고로 이어집니다.

이번 강의에서는 두 개념을 직관적으로 구분하고, 실생활 비유와 코드 예시로 "신원 확인"과 "권한 확인"이 어떻게 다른지 정리합니다.

## 1. Authentication: "당신은 누구인가?"

**Authentication(인증)**은 사용자가 주장하는 신원을 **검증(Verify)**하는 과정입니다. 즉, "이 요청을 보낸 주체가 정말 Alice인가?"를 확인합니다.

일반적인 인증 수단은 다음과 같습니다.

- **Something you know**: 비밀번호, PIN
- **Something you have**: OTP 앱, 하드웨어 키(YubiKey), 스마트폰
- **Something you are**: 지문, Face ID 등 생체 정보

인증이 성공하면 시스템은 보통 **세션(Session)**이나 **토큰(Token)**을 발급하여, 이후 요청에서 다시 비밀번호를 묻지 않도록 합니다. 이때 발급된 자격 증명은 "이 요청의 주체는 Alice다"라는 **신원(Identity)** 정보를 전달하는 역할을 합니다.

```javascript
// 인증의 개념적 예시: 자격 증명 검증
async function authenticate(username, password) {
  const user = await findUserByUsername(username);
  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    throw new Error("INVALID_CREDENTIALS");
  }

  // 인증 성공 → 신원(Identity)을 담은 자격 증명 발급
  return issueCredential({ sub: user.id, email: user.email });
}
```

핵심은 이 단계가 **"누구인지"**만 다룬다는 점입니다. Alice가 관리자인지, 게시글을 삭제할 수 있는지는 아직 판단하지 않습니다.

## 2. Authorization: "무엇을 할 수 있는가?"

**Authorization(인가)**은 이미 신원이 확인된 주체가 **특정 자원(Resource)에 대해 특정 행위(Action)를 수행해도 되는지** 결정하는 과정입니다.

예를 들어 Alice가 로그인에 성공했다고 해서 모든 API를 호출할 수 있는 것은 아닙니다.

- `GET /profile` → 허용
- `DELETE /users/42` → 관리자(Admin)만 허용
- `GET /admin/metrics` → `scope: admin:read`가 있는 토큰만 허용

인가는 보통 다음 요소의 조합으로 결정됩니다.

- **Role(역할)**: `user`, `editor`, `admin`
- **Permission / Scope**: `orders:read`, `orders:write`
- **Attribute**: 부서, 지역, 구독 플랜, 리소스 소유자 여부(ABAC)
- **Policy**: "본인 리소스만 수정 가능" 같은 규칙

```javascript
// 인가의 개념적 예시: 신원은 이미 확인된 상태
function authorize(user, action, resource) {
  // RBAC 예시
  if (user.roles.includes("admin")) {
    return true;
  }

  // 소유자 기반 규칙
  if (action === "update" && resource.ownerId === user.id) {
    return true;
  }

  return false;
}

// 인증 후 인가
const identity = await authenticate("alice", "secret");
const allowed = authorize(identity, "delete", { ownerId: "bob" });
// allowed === false (Alice는 admin도 아니고 소유자도 아님)
```

## 3. 실생활 비유: 주민등록증 vs 건물 출입증

두 개념을 가장 쉽게 구분하는 방법은 실생활 비유입니다.

### 주민등록증 = Authentication

주민등록증(또는 여권)은 **"당신이 누구인지"**를 증명합니다. 경비원이 신분증을 확인하는 행위는 인증입니다. 이름, 사진, 고유 번호로 신원을 맞춥니다.

하지만 주민등록증만으로 회사 서버실에 들어갈 수는 없습니다. 신원은 확인되었어도 **출입 권한**은 별개이기 때문입니다.

### 건물 출입증 = Authorization

출입증(Access Badge)은 **"이 건물/이 층의 어디에 들어갈 수 있는지"**를 나타냅니다. 로비는 가능해도 임원실이나 IDC는 막힐 수 있습니다. 같은 사람이라도 역할이 바뀌면 출입증의 권한이 달라집니다.

정리하면 다음과 같습니다.

| 구분 | Authentication | Authorization |
|------|-----------------|---------------|
| 질문 | Who are you? | What can you do? |
| 비유 | 주민등록증 | 건물 출입증 |
| 실패 시 | 401 Unauthorized (관례상) | 403 Forbidden |
| 결과물 | Identity / Credential | Allow / Deny |

> HTTP 상태 코드 참고: 역사적으로 `401 Unauthorized`가 "인증 실패"에 쓰이고, `403 Forbidden`이 "인가 실패"에 쓰입니다. 이름과 의미가 어긋나 있어 초보자가 자주 헷갈리는 포인트입니다.

## 4. 왜 분리가 중요한가?

현대 시스템에서는 인증과 인가가 **서로 다른 컴포넌트**에서 수행되는 경우가 많습니다.

- **IdP / Authorization Server**: 로그인과 토큰 발급(주로 인증 + 일부 권한 claim 부여)
- **Resource Server / API**: 토큰을 검증한 뒤 Scope/Role로 인가 결정
- **Gateway / BFF**: 공통 인증 검증 후 다운스트림으로 신원 전달

이 분리가 깨지면 다음과 같은 문제가 생깁니다.

1. **비밀번호를 여러 앱에 공유**하는 Password Anti-Pattern
2. **"로그인만 되면 전부 허용"**하는 과도한 권한
3. 마이크로서비스마다 제각각인 권한 모델로 인한 감사(Audit) 실패

OAuth 2.0과 IAM을 배우는 여정의 출발점도 바로 이 구분입니다. OAuth는 본질적으로 **인가(Authorization) 위임** 프레임워크이고, 사용자 인증을 표준화한 것은 이후의 OpenID Connect(OIDC)입니다. 이 차이를 모르면 "OAuth로 로그인했다"는 말을 정확히 해석할 수 없습니다.

## 5. 실무에서 자주 쓰는 표현 정리

- **Login / Sign-in**: 보통 Authentication을 의미
- **Access Control**: Authorization의 구현 방식 전반
- **RBAC (Role-Based Access Control)**: 역할 기반 인가
- **ABAC (Attribute-Based Access Control)**: 속성 기반 인가
- **Policy Decision Point (PDP)**: 인가 결정을 내리는 엔진
- **Policy Enforcement Point (PEP)**: 결정을 실제로 강제하는 지점(API Gateway, 미들웨어 등)

```text
[Client] --credentials--> [Authentication]
                              |
                              v
                         Identity asserted
                              |
                              v
[Client] --request+token--> [Authorization] --> Allow / Deny
```

---

### Chapter Summary (챕터 요약)

- **Authentication**은 신원을 확인하는 과정이고, **Authorization**은 확인된 신원에 대해 권한을 검사하는 과정이다.
- 주민등록증은 인증, 건물 출입증은 인가에 해당한다. 둘은 함께 쓰이지만 목적이 다르다.
- HTTP에서는 관례적으로 인증 실패에 `401`, 인가 실패에 `403`을 사용한다.
- OAuth/IAM을 올바르게 이해하려면 "로그인(인증)"과 "권한 위임(인가)"을 분리해서 사고해야 한다.
