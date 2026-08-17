# 07. OpenID Connect OIDC (인증의 귀환: OpenID Connect)

OAuth 2.0을 배우고 나면 자연스럽게 이런 질문이 나옵니다. "그런데 소셜 로그인은 어떻게 되는 거죠?" 많은 팀이 OAuth로 로그인을 구현했다고 말하지만, 엄밀히 말하면 **OAuth 2.0 자체는 인증(Authentication) 프로토콜이 아닙니다.**

이번 강의에서는 OAuth의 한계를 짚고, 그 위에 표준 인증 계층을 올린 **OpenID Connect(OIDC)**와 **ID Token**을 설명합니다.

## 1. OAuth 2.0은 왜 인증 프로토콜이 아닌가?

OAuth의 원래 질문은 이것입니다.

> "클라이언트가 자원 소유자를 대신해 이 API를 호출해도 되는가?"

반면 애플리케이션 로그인에 필요한 질문은 다릅니다.

> "지금 브라우저 앞에 앉은 사용자는 누구인가? 이메일은? 이름은? 이메일 검증 여부는?"

Access Token만 가지고는 다음이 모호할 수 있습니다.

- 토큰의 `sub`가 사람인가, 서비스 계정인가?
- 클라이언트가 사용자 프로필을 어디서 표준적으로 가져오나?
- 서로 다른 IdP 간 claim 이름이 제각각이면?

과거에는 UserInfo API를 제각각 호출하거나, Access Token을 잘못 "로그인 증거"로 오용하는 구현이 많았습니다.

## 2. OIDC: OAuth 2.0 위의 인증 레이어

**OpenID Connect**는 OAuth 2.0을 확장하여 표준 인증을 제공합니다. 핵심 추가 요소는 다음과 같습니다.

- **ID Token**: 사용자 인증 이벤트와 프로필 클레임을 담은 JWT
- **UserInfo Endpoint**: 추가 사용자 정보를 조회하는 표준 API
- **표준 scope**: `openid`, `profile`, `email`, `address`, `phone`
- **Discovery**: `/.well-known/openid-configuration`

```http
GET /authorize?
  response_type=code&
  client_id=my-app&
  redirect_uri=https://app.example.com/callback&
  scope=openid profile email&
  state=abc&
  nonce=n0nce-value
```

`scope`에 `openid`가 포함되면 이 흐름은 OIDC입니다. 토큰 응답에는 Access Token과 함께 ID Token이 포함되는 경우가 많습니다.

```json
{
  "access_token": "...",
  "id_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "..."
}
```

## 3. ID Token: "당신은 누구인가"의 표준 답변

ID Token은 **Client가 사용자를 로그인 처리하기 위해** 검증하는 JWT입니다. Resource Server API 인가에 쓰는 Access Token과 목적이 다릅니다.

대표 클레임:

```json
{
  "iss": "https://auth.example.com/",
  "sub": "user-123",
  "aud": "my-app",
  "exp": 1760000000,
  "iat": 1759996400,
  "nonce": "n0nce-value",
  "email": "alice@example.com",
  "email_verified": true,
  "name": "Alice Kim"
}
```

- `aud`는 보통 **Client ID**
- `nonce`는 재생 공격(Replay) 및 토큰 치환 공격 완화
- `email`, `name` 등은 `profile`/`email` scope에 의해 포함

```javascript
const jose = require("jose");

async function verifyIdToken(idToken, jwks, clientId, expectedNonce) {
  const { payload } = await jose.jwtVerify(idToken, jwks, {
    issuer: "https://auth.example.com/",
    audience: clientId
  });

  if (payload.nonce !== expectedNonce) {
    throw new Error("INVALID_NONCE");
  }

  return payload; // 로그인 세션 생성에 사용
}
```

## 4. Access Token vs ID Token 역할 분리

| 항목 | ID Token | Access Token |
|------|----------|---------------|
| 주 소비자 | Client (앱) | Resource Server (API) |
| 목적 | 인증 결과/신원 | API 인가 |
| 전달 위치 | Client가 검증 후 보관/세션화 | API `Authorization` 헤더 |
| API에 보내나? | 기본적으로 보내지 않음 | 보낸다 |

실무 안티패턴: ID Token을 API에 Bearer로 보내는 것. API는 Access Token(또는 introspection 결과)으로 인가해야 합니다.

## 5. UserInfo로 프로필 가져오기

ID Token에 모든 정보를 넣지 않는 경우, Access Token으로 UserInfo를 호출합니다.

```http
GET /userinfo HTTP/1.1
Host: auth.example.com
Authorization: Bearer <access_token>
```

```json
{
  "sub": "user-123",
  "name": "Alice Kim",
  "email": "alice@example.com",
  "picture": "https://cdn.example.com/a.png"
}
```

## 6. Angular + 백엔드에서 OIDC가 주는 실익

Angular SPA와 Node.js/ORDS 백엔드를 쓰는 환경에서도 OIDC의 가치는 명확합니다.

- 프론트/BFF는 ID Token으로 **누가 로그인했는지** 확정
- API는 Access Token의 `scope`/`roles`로 **무엇을 허용할지** 결정
- 여러 앱이 같은 IdP를 쓰면 SSO로 확장 가능

다음 강의에서는 토큰을 발급받는 것에서 한 걸음 더 나가, **만료와 갱신(Refresh)**이라는 생명주기 문제를 다룹니다.

---

### Chapter Summary (챕터 요약)

- OAuth 2.0은 인가 프레임워크이며,  alone으로는 표준 사용자 인증을 완성하지 못한다.
- OIDC는 OAuth 위에 ID Token과 표준 클레임/엔드포인트를 추가해 인증을 표준화한다.
- ID Token은 Client의 로그인 증거이고, Access Token은 API 인가에 사용한다. 역할을 섞으면 안 된다.
- `openid` scope, `nonce` 검증, `aud` 검증이 OIDC 구현의 핵심 체크포인트다.
