# 13. BFF Design Pattern (Backend For Frontend 디자인 패턴)

SPA 보안의 난제는 명확합니다. 브라우저는 공격 표면이 넓고, 토큰을 JS로 다루면 XSS 위험이 커집니다. 이에 대한 현대적 해법이 **BFF (Backend For Frontend)** 패턴입니다. 핵심 아이디어는 **브라우저가 Access Token/Refresh Token을 직접 다루지 않게** 책임을 나누는 것입니다.

## 1. BFF란 무엇인가?

BFF는 특정 프론트엔드(예: Angular 웹)를 위해 존재하는 **전용 백엔드 계층**입니다. 일반 API Gateway와 달리 "이 UI가 필요로 하는 인증/세션/응답 shape"에 최적화됩니다.

OAuth 맥락에서의 BFF 역할:

1. Authorization Code + PKCE 흐름을 서버에서 수행(또는 code 교환을 서버가 담당)
2. Access/Refresh Token을 **서버 측**에 저장
3. 브라우저에는 **HttpOnly 세션 쿠키**만 발급
4. Angular 요청이 오면 BFF가 세션을 확인 → 토큰을 붙여 다운스트림 API 호출

```text
[Angular SPA] --session cookie--> [BFF (Node.js)]
                                       |
                                       | Authorization: Bearer <access_token>
                                       v
                                 [Resource API / ORDS]
```

## 2. 왜 SPA가 토큰을 안 쥐는 것이 유리한가?

### XSS 피해 반경 축소

토큰이 JS에 없으면, XSS로 `localStorage`나 메모리에서 Bearer 토큰을 직접 exfiltrate하기 어렵습니다. (세션 쿠키 기반 요청 위조는 별도로 CSRF 방어 필요)

### 토큰 보관/갱신 로직 집중

Silent Refresh, rotation, 재시도 큐를 BFF에 모아 프론트 복잡도를 줄입니다.

### 다운스트림 교체 용이

Cognito든 Keycloak이든, Angular는 "로그인/로그아웃/API"만 보고 BFF가 IdP 상세를 흡수합니다.

## 3. 시퀀스: 로그인부터 API까지

```text
1. Angular: GET /auth/login
2. BFF: redirect to IdP /authorize (code + PKCE)
3. IdP: callback to BFF /auth/callback?code=...
4. BFF: code → token exchange (client secret / PKCE)
5. BFF: store tokens in server session (Redis)
6. BFF: Set-Cookie: sid=...; HttpOnly; Secure; SameSite=Lax
7. Angular: GET /api/orders (cookie auto-sent)
8. BFF: session → access token → call Orders API
9. BFF: return data to Angular
```

```javascript
// BFF callback 개념 코드
app.get("/auth/callback", async (req, res) => {
  const { code, state } = req.query;
  assertState(state, req.session);

  const tokens = await exchangeCode({
    code,
    codeVerifier: req.session.codeVerifier
  });

  req.session.accessToken = tokens.access_token;
  req.session.refreshToken = tokens.refresh_token;
  req.session.user = await verifyIdToken(tokens.id_token);

  res.redirect("https://app.example.com/");
});

app.get("/api/orders", requireSession, async (req, res) => {
  const data = await fetch("https://api.example.com/orders", {
    headers: { Authorization: `Bearer ${req.session.accessToken}` }
  }).then((r) => r.json());

  res.json(data);
});
```

## 4. CSRF 방어는 필수

쿠키 세션을 쓰는 순간 CSRF가 다시 중요해집니다.

방어 조합:

- `SameSite=Lax` 또는 `Strict`
- Double Submit CSRF Token / `X-CSRF-Token` 헤더
- Origin/Referer 검증
- 상태 변경 요청은 POST/PUT/DELETE만 허용

```javascript
app.use((req, res, next) => {
  if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
    if (req.headers["x-csrf-token"] !== req.session.csrfToken) {
      return res.status(403).json({ error: "csrf_rejected" });
    }
  }
  next();
});
```

## 5. Angular 측은 단순해진다

Angular는 Bearer 헤더를 조립하지 않습니다. same-origin BFF만 호출합니다.

```typescript
this.http.get<Order[]>("/api/orders", { withCredentials: true });
```

토큰 갱신도 BFF가 401/만료를 감지해 refresh를 수행하고, 실패 시에만 `/auth/login`으로 보냅니다.

## 6. BFF의 비용과 적합한 상황

장점만큼 운영 포인트도 있습니다.

- BFF가 추가 SPOF/지연 지점이 될 수 있음
- 세션 스토어(Redis) 필요 → 완전 Stateless는 아님
- 모바일 앱까지 같은 패턴을 강제하긴 어려울 수 있음

그래도 **브라우저 SPA + 고보안 요구**에는 현재 가장 추천되는 패턴 중 하나입니다. 다음 강의에서는 OAuth 표준 자체의 진화인 **OAuth 2.1과 PKCE**를 살펴봅니다.

---

### Chapter Summary (챕터 요약)

- BFF는 프론트 전용 백엔드로, OAuth 토큰을 서버에 보관하고 브라우저에는 세션 쿠키만 제공한다.
- SPA가 토큰을 직접 쥐지 않아 XSS로 인한 Bearer 토큰 탈취 위험을 크게 줄일 수 있다.
- 쿠키 기반이므로 CSRF 방어(`SameSite`, CSRF 토큰 등)가 필수다.
- Angular는 same-origin API만 호출하면 되고, IdP/토큰 복잡도는 BFF가 흡수한다.
