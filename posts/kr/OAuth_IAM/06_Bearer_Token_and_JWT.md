# 06. Bearer Token and JWT (Bearer Token과 JWT)

OAuth에서 API를 호출할 때 가장 흔히 보는 헤더가 `Authorization: Bearer <token>`입니다. 이번 강의에서는 Bearer Token의 의미, JWT의 내부 구조(Header/Payload/Signature), 그리고 **Base64는 암호화가 아니다**라는 실무에서 가장 중요한 보안 주의점을 다룹니다.

## 1. Bearer Token의 의미

**Bearer**는 영어 그대로 "소지자"입니다. Bearer Token 보안 모델(RFC 6750)의 핵심 메시지는 다음과 같습니다.

> **이 토큰을 가진 자에게 권한을 허락한다.**

영화 티켓 비유가 가장 직관적입니다.

- 티켓(토큰)을 소지한 사람은 입장할 수 있다.
- 매표소(Authorization Server)는 티켓을 발급한다.
- 입구 스태프(Resource Server)는 티켓의 진위/유효기간/좌석 등급을 확인한다.
- 티켓을 도난당하면, 도둑도 입장할 수 있다.

즉 Bearer Token은 **소유 자체가 권한**에 가깝습니다. 그래서 전송 구간 보호(HTTPS), 저장소 보호, 짧은 만료가 필수입니다.

```http
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0In0.signature
```

대안적 모델로 DPoP, mTLS bound token처럼 **토큰을 특정 클라이언트 키에 묶는** 방식도 있지만, 현재 생태계의 기본은 여전히 Bearer입니다.

## 2. JWT란 무엇인가?

**JWT (JSON Web Token, RFC 7519)**는 클레임을 JSON으로 표현하고, 이를 서명(또는 암호화)하여 URL-safe 문자열로 만든 포맷입니다. OAuth Access Token이 항상 JWT인 것은 아니지만, 현대 API에서는 JWT Access Token 또는 OIDC ID Token으로 매우 널리 쓰입니다.

JWT는 점(`.`)으로 구분된 세 부분입니다.

```text
base64url(header).base64url(payload).base64url(signature)
```

## 3. Header: 토큰의 메타데이터

Header는 보통 토큰 타입과 서명 알고리즘을 담습니다.

```json
{
  "alg": "RS256",
  "typ": "JWT",
  "kid": "2026-08-key"
}
```

- `alg`: 서명 알고리즘 (`RS256`, `ES256`, `HS256` 등)
- `typ`: 보통 `JWT`
- `kid`: 키 회전(Key Rotation) 시 어떤 공개키로 검증할지 식별

```javascript
const header = JSON.parse(
  Buffer.from(token.split(".")[0], "base64url").toString("utf8")
);
console.log(header.alg); // RS256
```

## 4. Payload: 클레임(Claim)의 본체

Payload는 실제 정보입니다. 표준 클레임과 커스텀 클레임을 함께 담을 수 있습니다.

```json
{
  "iss": "https://auth.example.com/",
  "sub": "user-123",
  "aud": "https://api.example.com",
  "exp": 1760000000,
  "iat": 1759996400,
  "scope": "orders:read profile",
  "roles": ["user"]
}
```

자주 보는 registered claims:

- `iss` (issuer): 발급자
- `sub` (subject): 사용자 식별자
- `aud` (audience): 의도된 수신자
- `exp` (expiration): 만료 시각
- `iat` (issued at): 발급 시각
- `nbf` (not before): 이 시각 이전에는 무효

```javascript
function decodePayload(token) {
  const payloadPart = token.split(".")[1];
  return JSON.parse(Buffer.from(payloadPart, "base64url").toString("utf8"));
}
```

> 주의: 위 함수는 **디코딩**만 합니다. 검증(verify)이 아닙니다.

## 5. Signature: 위변조 방지의 핵심

서명 검증이 JWT 신뢰의 전부라고 해도 과언이 아닙니다.

### RS256 예시

```text
signing_input = base64url(header) + "." + base64url(payload)
signature = RSASSA-PKCS1-v1_5(SHA-256, private_key, signing_input)
```

Resource Server는 공개키로 다음을 확인합니다.

1. 서명이 맞는가?
2. `alg`가 허용 목록에 있는가? (alg confusion 공격 방어)
3. `iss`/`aud`/`exp`가 정책에 맞는가?

```javascript
const jwt = require("jsonwebtoken");

function verifyBearerJwt(token, publicKey) {
  return jwt.verify(token, publicKey, {
    algorithms: ["RS256"], // 반드시 명시
    issuer: "https://auth.example.com/",
    audience: "https://api.example.com"
  });
}
```

## 6. Base64 인코딩은 암호화가 아니다

초보자가 가장 많이 하는 착각입니다.

- JWT의 Header/Payload는 **Base64URL 인코딩**일 뿐입니다.
- 누구나 디코딩해 내용을 읽을 수 있습니다.
- 서명은 "내용이 안 보이게"가 아니라 **"내용이 안 바뀌게"** 만듭니다.

따라서 다음 정보는 Access Token payload에 넣지 않는 것이 좋습니다.

- 주민등록번호, 정확한 집 주소
- 비밀번호 해시
- 과도한 PII(개인식별정보)

비밀이 필요하면 **JWE(암호화된 토큰)**를 사용하거나, 민감 정보는 서버 측에서만 조회하세요.

```bash
# payload는 쉽게 들여다볼 수 있다
echo 'eyJzdWIiOiIxMjM0Iiwicm9sZSI6ImFkbWluIn0' | base64 -d
# {"sub":"1234","role":"admin"}
```

## 7. Bearer + JWT 실무 체크리스트

1. 항상 HTTPS로만 전달
2. `Authorization` 헤더 사용 (가능하면 URL 쿼리에 토큰 금지)
3. Access Token TTL을 짧게
4. 검증 시 `algorithms` 화이트리스트 고정
5. `aud` 검증으로 토큰 재사용(다른 API용 토큰) 방지
6. 로그/APM에 토큰 원문 남기지 않기

다음 단계에서는 OAuth만으로 부족한 "로그인/신원 표준"을 해결하는 **OpenID Connect**로 넘어갑니다.

---

### Chapter Summary (챕터 요약)

- Bearer Token은 소지자에게 권한을 부여하는 모델이며, 탈취 시 그대로 악용될 수 있다.
- JWT는 Header, Payload, Signature로 구성되며, 서명 검증이 신뢰의 핵심이다.
- Base64URL은 가독 가능한 인코딩일 뿐 암호화가 아니므로 민감정보를 payload에 넣으면 안 된다.
- 올바른 검증(`alg`, `iss`, `aud`, `exp`)과 짧은 수명, HTTPS가 Bearer JWT 보안의 기본이다.
