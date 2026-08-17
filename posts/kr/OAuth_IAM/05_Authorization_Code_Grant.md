# 05. Authorization Code Grant (인가 코드 승인 방식)

OAuth 2.0에서 가장 중요하고, 오늘날 사실상 기본이 된 흐름이 **Authorization Code Grant**입니다. "로그인 버튼 클릭 → 동의 → 콜백 → 토큰 발급 → API 호출"까지를 이 방식이 표준화합니다.

이번 강의에서는 전체 시퀀스를 따라가며, 왜 Access Token을 브라우저에 바로 주지 않고 **중간 단계의 임시 코드(Authorization Code)**를 먼저 발급하는지 설명합니다.

## 1. 등장 인물 복습

- **User / Resource Owner**: 브라우저에서 로그인하고 동의하는 사람
- **Client**: 우리 웹 애플리케이션 (백엔드가 있는 Confidential Client를 기준으로 설명)
- **Authorization Server**: 예) Google Accounts, Keycloak, Cognito
- **Resource Server**: 보호된 API

## 2. 전체 흐름도 (Step-by-Step)

```text
1. User가 Client의 "Login with IdP" 클릭
2. Client가 Authorization Server의 /authorize로 리다이렉트
3. User 로그인 + Consent(동의)
4. Authorization Server가 redirect_uri로 Authorization Code 전달
5. Client(백엔드)가 Code + Client Secret으로 /token 호출
6. Authorization Server가 Access Token(+ Refresh/ID Token) 반환
7. Client가 Access Token으로 Resource Server API 호출
```

### Step 1–2: Authorize 요청

```http
GET https://auth.example.com/authorize?
  response_type=code&
  client_id=my-web-app&
  redirect_uri=https://app.example.com/oauth/callback&
  scope=orders:read profile&
  state=random-csrf-token&
  code_challenge=....&          # PKCE 사용 시
  code_challenge_method=S256
```

- `response_type=code`: "코드 발급 흐름"을 요청
- `state`: CSRF 방어용 넌스(Nonce). 콜백에서 반드시 검증
- `redirect_uri`: 미리 등록된 콜백만 허용되어야 함

### Step 3–4: 코드 콜백

사용자가 동의하면 브라우저가 클라이언트로 돌아옵니다.

```http
GET https://app.example.com/oauth/callback?code=SplxlOBeZQQYbYS6WxSbIA&state=random-csrf-token
```

이 시점의 `code`는 **짧은 수명**의 일회성 자격 증명입니다. 아직 Access Token이 아닙니다.

### Step 5–6: 코드를 토큰으로 교환

이 교환은 **브라우저가 아니라 클라이언트 백엔드**에서 수행하는 것이 전통적 Confidential Client 패턴입니다.

```http
POST /token HTTP/1.1
Host: auth.example.com
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code&
code=SplxlOBeZQQYbYS6WxSbIA&
redirect_uri=https://app.example.com/oauth/callback&
client_id=my-web-app&
client_secret=SECRET
```

성공 응답 예:

```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "8xLOxBtZp8",
  "scope": "orders:read profile"
}
```

### Step 7: API 호출

```http
GET /orders HTTP/1.1
Host: api.example.com
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 3. 왜 토큰을 바로 주지 않고 Code를 먼저 줄까?

핵심 이유는 **브라우저 리다이렉트 채널이 안전하지 않기 때문**입니다.

### 문제: Front-channel의 노출면

Authorize 응답은 URL 쿼리/프래그먼트를 통해 브라우저로 돌아옵니다. 이 채널은 다음 위험에 노출됩니다.

- 브라우저 히스토리
- 프록시/중간 로그
- Referer 헤더 유출
- 악성 브라우저 확장 프로그램

만약 여기서 **Access Token을 직접** 돌려주면(구 Implicit Flow), 토큰이 front-channel에 장시간 노출될 수 있습니다.

### 해결: Back-channel Token Exchange

Authorization Code는:

1. **짧게 살고**
2. **대개 1회용**이며
3. **토큰 엔드포인트에서 client 인증과 함께** Access Token으로 교환됩니다.

즉, 진짜 貴重한 Access Token은 서버 간(back-channel) HTTPS POST로만 이동하게 만들어 노출면을 줄입니다.

```text
Front-channel (browser redirect):  short-lived code
Back-channel  (server POST /token): access token / refresh token
```

## 4. Confidential Client vs Public Client

- **Confidential Client**: 서버에서 `client_secret`을 안전하게 보관 가능 (전통적 웹 앱)
- **Public Client**: SPA/모바일처럼 비밀을 숨길 수 없음 → **PKCE 필수**

현대 권장사항(OAuth 2.1)에서는 SPA도 Authorization Code + PKCE를 사용하고 Implicit는 사용하지 않습니다.

```javascript
// Node.js에서 code → token 교환 개념 코드
async function exchangeCodeForToken(code) {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: "https://app.example.com/oauth/callback",
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET
  });

  const res = await fetch("https://auth.example.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });

  if (!res.ok) throw new Error("TOKEN_EXCHANGE_FAILED");
  return res.json();
}
```

## 5. 구현 시 반드시 지킬 체크리스트

1. `state` 값 생성 → 세션에 저장 → 콜백에서 일치 검증
2. `redirect_uri` 완전 일치 비교 (등록값과 동일)
3. Authorization Code 재사용 거부
4. 토큰 응답을 로그에 남기지 않기
5. Public Client라면 PKCE(`code_verifier`/`code_challenge`) 적용

Authorization Code Grant를 이해하면 OAuth의 다른 변형(PKCE, OIDC authorization code flow)도 쉽게 확장할 수 있습니다. 다음 강의에서는 실제로 API에 실어 나르는 **Bearer Token**과 그 대표 포맷인 **JWT**를 해부합니다.

---

### Chapter Summary (챕터 요약)

- Authorization Code Grant는 OAuth 2.0의 표준적이고 권장되는 권한 부여 흐름이다.
- 브라우저는 임시 `code`만 받고, Access Token은 백엔드가 `/token`에서 교환한다.
- Front-channel 노출을 줄이고, client 인증/PKCE와 결합해 토큰 탈취 위험을 낮추는 것이 핵심 설계 의도다.
- `state`, `redirect_uri` 검증, 코드 일회성은 구현 필수 보안 요건이다.
