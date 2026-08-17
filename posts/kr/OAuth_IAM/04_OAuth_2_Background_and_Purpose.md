# 04. OAuth 2.0 Background and Purpose (OAuth 2.0의 탄생 배경과 목적)

"구글 계정으로 로그인" 또는 "GitHub 권한으로 내 저장소 읽기" 같은 경험 일상화되기 전, 서드파티 애플리케이션은 종종 사용자의 **실제 비밀번호**를 요구했습니다. 이는 편리해 보였지만 보안적으로는 재앙에 가까운 패턴이었습니다.

**OAuth 2.0**은 바로 이 문제를 해결하기 위해 등장한 **인가(Authorization) 위임 프레임워크**입니다. 이번 강의에서는 Password Anti-Pattern의 위험성과, OAuth를 구성하는 네 가지 핵심 역할을 정리합니다.

## 1. Password Anti-Pattern이란?

Password Anti-Pattern은 다음과 같은 흐름을 말합니다.

1. 사용자가 인쇄 서비스 앱에 Google 아이디/비밀번호를 입력한다.
2. 앱이 그 비밀번호로 Google에 로그인한다.
3. 앱이 사용자 메일/드라이브에 마음대로 접근한다.

```text
[User] --email+password--> [Third-party App] --login-as-user--> [Google]
```

이 방식의 문제점은 치명적입니다.

- **자격 증명 유출 범위 확대**: 앱 DB가 해킹되면 Google 비밀번호까지 탈취될 수 있음
- **최소 권한 불가**: 비밀번호를 주면 보통 계정 전체에 가까운 권한이 열림
- **회수 불가능에 가까움**: 앱을 더 이상 신뢰하지 않아도, 비밀번호를 바꾼 뒤에야 차단 가능
- **감사/동의 UX 부재**: 사용자가 "어떤 권한을 얼마나" 주는지 세밀히 통제하기 어려움

OAuth의 목적은 명확합니다.

> **비밀번호를 공유하지 않고도, 제한된 권한(Scope)을 위임하고, 필요 시 그 위임을 취소할 수 있게 한다.**

## 2. OAuth 2.0이 해결하는 것 / 해결하지 않는 것

OAuth 2.0(RFC 6749)은 **Authorization Framework**입니다.

- 해결: 클라이언트가 Resource Owner를 대신해 Resource Server의 보호된 자원에 접근하는 방법
- 비해결(단독으로는): "이 사용자가 누구인지"를 표준화된 방식으로 애플리케이션에 전달하는 완전한 인증 프로토콜

즉, OAuth만으로 "소셜 로그인"을 완벽히 구현했다고 말하기는 어렵습니다. 사용자 인증 계층은 이후 **OpenID Connect(OIDC)**가 보완합니다. 다만 실무에서는 OAuth 흐름 위에 로그인 UX가 겹쳐 있어 혼동하기 쉽습니다.

## 3. 네 가지 핵심 역할 (The Four Roles)

OAuth 2.0을 이해하려면 역할 분담을 먼저 외워야 합니다.

### 1) Resource Owner (자원 소유자)

보호된 자원의 소유자, 보통 **엔드 유저**입니다. "내 Google Drive 파일", "내 GitHub repo"의 주인입니다.

### 2) Client (클라이언트)

Resource Owner를 대신해 자원에 접근하려는 **애플리케이션**입니다. 웹 앱, SPA, 모바일 앱, 서버 앱이 모두 Client가 될 수 있습니다.

> 주의: 여기서 Client는 "브라우저"가 아니라 OAuth 관점의 **응용 프로그램**을 뜻합니다.

### 3) Authorization Server (인가 서버)

Resource Owner에게 동의를 받고, Client에게 **Access Token**을 발급하는 서버입니다. 로그인 UI, 동의 화면(Consent), 토큰 발급 엔드포인트(`/authorize`, `/token`)를 제공합니다.

### 4) Resource Server (자원 서버)

보호된 API/자원을 호스팅하는 서버입니다. Access Token을 검증하고 요청을 허용/거부합니다. 예: Google Drive API, 내부 Orders API.

```text
+--------+                               +---------------+
|        |--(1) Authorization Request--->|               |
|        |                               | Authorization |
|        |<-(2) Authorization Grant-------|    Server     |
|        |                               +---------------+
| Client |
|        |                               +---------------+
|        |--(3) Token + API Request ----->|  Resource     |
|        |<-(4) Protected Resource -------|   Server     |
+--------+                               +---------------+
```

## 4. Scope: 최소 권한의 언어

OAuth의 핵심 설계 원칙 중 하나는 **Scope**입니다. Client는 "필요한 권한만" 요청해야 합니다.

```http
GET /authorize?
  response_type=code&
  client_id=print-app&
  redirect_uri=https://print.example.com/callback&
  scope=drive.readonly&
  state=xyz
```

사용자는 동의 화면에서 "읽기 전용 Drive 접근"만 허용할 수 있고, 나중에 Google 계정 설정에서 해당 앱의 접근을 **Revoke**할 수 있습니다. 비밀번호를 넘기던 시절에는 불가능했던 통제력입니다.

## 5. 간단한 의사코드로 보는 책임 분리

```javascript
// Authorization Server: 토큰 발급 (개념)
function issueAccessToken({ clientId, resourceOwnerId, scopes }) {
  return signJwt({
    sub: resourceOwnerId,
    client_id: clientId,
    scope: scopes.join(" "),
    aud: "https://api.drive.example.com",
    exp: Math.floor(Date.now() / 1000) + 3600
  });
}

// Resource Server: 토큰 검증 후 인가
function handleDriveList(req) {
  const token = extractBearer(req);
  const claims = verify(token);

  if (!claims.scope.split(" ").includes("drive.readonly")) {
    return { status: 403, error: "insufficient_scope" };
  }

  return listFiles(claims.sub);
}
```

역할이 분리되어 있기 때문에, 인쇄 앱은 Google 비밀번호를 몰라도 되고, Drive API는 "유효한 토큰 + 필요 scope"만 보면 됩니다.

## 6. 왜 至今도 OAuth인가?

OAuth 2.0은 완벽하지 않습니다. Implicit Flow 같은 초기 패턴은 보안상 폐기되었고, PKCE와 OAuth 2.1로 발전했습니다. 그럼에도 OAuth가 남아 있는 이유는 산업 표준으로서 다음을 제공하기 때문입니다.

- 공통 언어(역할, grant type, token, scope)
- IdP/IAM 제품 간 상호운용성
- 동의 기반 최소 권한 위임

다음 강의에서는 가장 중요한 표준 흐름인 **Authorization Code Grant**를 처음부터 끝까지 따라가 봅니다.

---

### Chapter Summary (챕터 요약)

- Password Anti-Pattern은 서드파티에 실비밀번호를 넘기는 위험한 방식이며, OAuth는 이를 권한 위임으로 대체한다.
- OAuth 2.0은 인증 프로토콜이 아니라 인가 프레임워크다.
- 네 가지 역할(Resource Owner, Client, Authorization Server, Resource Server)의 분리가 핵심이다.
- Scope와 토큰 폐기를 통해 최소 권한과 사후 통제가 가능해진다.
