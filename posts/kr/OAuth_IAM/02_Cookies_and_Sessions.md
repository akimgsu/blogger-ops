# 02. Cookies and Sessions (쿠키와 세션)

웹이 처음 설계될 때 HTTP는 **무상태(Stateless)** 프로토콜이었습니다. 서버는 요청 하나를 처리하고 나면 "이 사용자가 이전에 무엇을 했는지"를 기억하지 않습니다. 하지만 쇼핑몰 장바구니, 로그인 상태, 다단계 폼처럼 **연속된 사용자 경험**을 유지하려면 상태가 필요했습니다.

그 해답으로 등장한 고전적인 조합이 바로 **Cookie(쿠키)**와 **Session(세션)**입니다. 이번 강의에서는 Stateful 인증의 원리, 서버 메모리 관리의 한계, 그리고 MSA 시대에 세션이 겪는 구조적 문제를 살펴봅니다.

## 1. Cookie란 무엇인가?

**Cookie**는 서버가 브라우저에게 "다음에 이 사이트로 요청할 때 이 값을 다시 보내라"고 맡기는 작은 데이터입니다. `Set-Cookie` 응답 헤더로 저장되고, 이후 요청의 `Cookie` 헤더로 자동 전송됩니다.

```http
HTTP/1.1 200 OK
Set-Cookie: session_id=abc123; Path=/; HttpOnly; Secure; SameSite=Lax
```

브라우저는 이후 같은 도메인으로 요청할 때:

```http
GET /dashboard HTTP/1.1
Host: app.example.com
Cookie: session_id=abc123
```

쿠키 자체는 단순한 **키-값 저장소**입니다. 보안 속성은 속성에 의해 결정됩니다.

- **HttpOnly**: JavaScript에서 접근 불가 → XSS로 탈취하기 어려움
- **Secure**: HTTPS에서만 전송
- **SameSite**: CSRF 완화 (`Strict` / `Lax` / `None`)
- **Max-Age / Expires**: 수명 제어

## 2. Session이란 무엇인가?

실무에서 "로그인 세션"이라 부를 때, 보통 다음 구조를 의미합니다.

1. 사용자가 로그인에 성공한다.
2. 서버는 메모리/DB/Redis에 **세션 데이터**를 저장한다. (예: `userId`, `roles`, `cart`)
3. 브라우저에는 **세션 ID**만 쿠키로 내려준다.
4. 다음 요청마다 서버는 세션 ID로 서버 측 저장소를 조회해 사용자를 복원한다.

```javascript
// Express + express-session 개념 예시
const session = require("express-session");

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 1000 * 60 * 30 // 30분
  }
}));

app.post("/login", async (req, res) => {
  const user = await validateCredentials(req.body);
  req.session.userId = user.id;
  req.session.roles = user.roles;
  res.json({ ok: true });
});

app.get("/me", (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "UNAUTHENTICATED" });
  }
  res.json({ userId: req.session.userId, roles: req.session.roles });
});
```

중요한 포인트: **진짜 상태(State)는 서버에 있고**, 브라우저는 열쇠(세션 ID)만 들고 있습니다. 그래서 이 방식을 **Stateful Authentication**이라고 부릅니다.

## 3. Stateful 시스템의 장점

세션 방식은 오랫동안 주류였고, 지금도 전통적인 서버 렌더링 웹앱에서는 매우 유효합니다.

- **즉시 무효화 가능**: 서버에서 세션을 삭제하면 즉시 로그아웃아웃 처리 가능
- **민감 정보를 클라이언트에 안 실음**: 역할, 권한, 내부 ID를 서버에만 보관
- **구현이 직관적**: 모놀리식 앱에서는 미들웨어 몇 줄로 끝

## 4. 서버 메모리 관리의 한계

문제는 규모가 커질 때 발생합니다.

### 메모리 세션의 문제

세션을 앱 서버 프로세스 메모리에 두면:

- 서버가 재시작되면 모든 사용자가 로그아웃아웃된다.
- 서버가 여러 대면 **세션 스티키(Sticky Session)**가 필요하거나, 공유 저장소가 필요하다.
- 트래픽이 늘수록 세션 저장소의 메모리/IO 비용이 커진다.

그래서 실무에서는 Redis 같은 **외부 세션 스토어**를 사용합니다. 하지만 이것도 "상태 저장소"를 운영해야 한다는 본질적 부담은 남습니다.

```text
[Browser] --session_id--> [App Server A]
                               |
                               +--> [Redis Session Store]
                               |
[Browser] --session_id--> [App Server B] --lookup--> Redis
```

## 5. MSA 시대의 세션 단점

**Microservices Architecture(MSA)**에서는 하나의 요청이 여러 서비스를 거쳐 처리됩니다. 이때 고전적 세션은 다음과 같은 마찰을 만듭니다.

### 1) 공유 상태의 결합(Coupling)

주문 서비스, 결제 서비스, 알림 서비스가 모두 같은 세션 저장소에 의존하면, 서비스 독립 배포와 소유권 분리가 어려워집니다. "누가 세션 스키마를 바꾸는가?"라는 조직적 문제도 생깁니다.

### 2) 네트워크 경계와 도메인 문제

프론트엔드 도메인, API Gateway, 내부 서비스가 분리되면 쿠키의 `Domain`/`Path` 설정이 복잡해집니다. 크로스 도메인 SPA에서는 쿠키 전송 자체가 제약됩니다.

### 3) 확장성과 성능

모든 API 호출마다 중앙 세션 저장소를 조회하면, 저장소가 **단일 병목(Single Point of Bottleneck)**이 될 수 있습니다. 캐시를 붙여도 일관성(Consistency)과 만료 처리가 추가 과제가 됩니다.

### 4) 모바일/서드파티 클라이언트 비친화

브라우저 쿠키에 최적화된 모델은 네이티브 앱, IoT, 서버 간 통신, 파트너 API에는 잘 맞지 않습니다. 이런 클라이언트들은 **토큰을 Authorization 헤더로 전달**하는 방식이 훨씬 자연스럽습니다.

## 6. 그래서 다음 세대가 필요해졌다

세션이 "틀렸다"기보다, **분산 시스템과 다중 클라이언트 환경**에서 비용이 커진 것입니다. 업계는 다음을 원했습니다.

- 서버가 요청마다 중앙 저장소를 조회하지 않아도 되는 **Stateless 검증**
- 서비스 간 표준화된 신원/권한 전달
- 서드파티 앱에 비밀번호를 주지 않고 권한만 위임

그 답이 **Token 기반 시스템**과 이후의 **OAuth 2.0**입니다. 다음 강의에서 Stateless 토큰이 어떻게 서버 기억 없이도 신뢰 가능한지, 암호학적 관점에서 살펴보겠습니다.

---

### Chapter Summary (챕터 요약)

- Cookie는 브라우저가 자동으로 첨부하는 작은 클라이언트 측 데이터이고, Session은 보통 서버에 상태를 두고 세션 ID만 쿠키로 전달하는 Stateful 모델이다.
- 세션의 장점은 즉시 로그아웃과 서버 측 상태 통제가 쉽다는 점이다.
- 서버 메모리/공유 저장소 운영 비용, 스케일아웃, 도메인 제약은 규모가 커질수록 부담이 된다.
- MSA와 다양한 클라이언트 환경에서는 중앙 세션 의존이 결합도와 병목을 키우므로, 토큰 기반 Stateless 인증/인가로 이동하는 동기가 된다.
