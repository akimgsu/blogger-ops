# 03. Token-Based Systems (토큰 기반 시스템의 등장)

쿠키-세션 모델이 모놀리식 웹에서는 잘 작동했지만, API 중심 아키텍처와 마이크로서비스가 확산되면서 **"서버가 모든 로그인 상태를 기억해야 한다"**는 가정이 비싸지기 시작했습니다. 이에 대한 대안으로 떠오른 것이 **Token(토큰) 기반 시스템**입니다.

이번 강의에서는 Stateless 서버의 장점과, 서버가 토큰 내용을 데이터베이스에서 조회하지 않아도 **암호학적으로 검증**할 수 있는 원리를 설명합니다.

## 1. 토큰이란 무엇인가?

넓은 의미에서 토큰은 **"이 요청의 주체와 권한을 증명하는 문자열"**입니다. 클라이언트는 로그인(또는 인가 흐름) 후 토큰을 받고, 이후 API 호출 시 보통 아래처럼 전달합니다.

```http
GET /api/orders HTTP/1.1
Host: api.example.com
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

토큰의 종류는 다양합니다.

- **Opaque Token**: 서버만 의미를 아는 불투명 문자열 (introspection 필요)
- **JWT (JSON Web Token)**: 클레임(Claim)이 토큰 안에 포함된 자기 기술형(Self-contained) 토큰
- **Access Token / Refresh Token / ID Token**: 용도별 분류 (이후 강의에서 상세히)

이번 장에서는 특히 **"검증 가능한 토큰"**이 Stateless를 가능하게 만드는 핵심임을 이해하면 됩니다.

## 2. Stateless 서버의 장점

**Stateless**란 서버가 각 요청을 처리할 때 **이전 요청의 서버 측 세션 상태**에 의존하지 않는다는 뜻입니다. 토큰이 요청에 필요한 신원/권한 정보를 스스로 담고 있거나, 최소한 검증에 필요한 단서를 제공합니다.

### 장점 1: 수평 확장(Horizontal Scaling)이 쉬움

어떤 앱 인스턴스가 요청을 받든, 같은 검증 규칙(공개키, 공유 비밀키, issuer 설정)만 있으면 됩니다. Sticky Session이 필요 없습니다.

### 장점 2: 서비스 간 전달이 단순함

API Gateway가 토큰을 검증한 뒤 `X-User-Id`, `X-Roles` 같은 헤더로 내부 서비스에 전달하거나, 토큰 자체를 전파할 수 있습니다.

### 장점 3: 다양한 클라이언트에 친화적

브라우저, 모바일 앱, CLI, 서버 투 서버 클라이언트 모두 `Authorization` 헤더 패턴을 공유할 수 있습니다.

```text
[Mobile App] --Bearer Token--> [API Gateway] --verify--> allow
[SPA]        --Bearer Token--> [API Gateway] --verify--> allow
[Batch Job]  --Bearer Token--> [API Gateway] --verify--> allow
```

## 3. 서버가 토큰을 기억하지 않아도 되는 암호학적 원리

핵심 아이디어는 단순합니다.

> **토큰의 내용이 위조되지 않았음을 수학적으로 검증할 수 있다면, 서버는 그 내용을 믿어도 된다.**

가장 널리 쓰이는 형태가 **디지털 서명(Digital Signature)**입니다.

### HMAC 기반 (대칭키)

서버(또는 토큰 발급자와 검증자가 동일 보안 도메인)가 공유 비밀키로 서명합니다.

```text
signature = HMAC_SHA256(base64url(header) + "." + base64url(payload), secret)
```

검증자는 같은 비밀키로 서명을 재계산해 일치 여부를 확인합니다. 구현은 쉽지만, **모든 검증자가 비밀키를 가져야** 하므로 서비스가 많아질수록 키 배포가 어렵습니다.

### 공개키 기반 (비대칭키, 권장되는 분산 패턴)

Authorization Server가 **개인키(Private Key)**로 서명하고, Resource Server들은 **공개키(Public Key)**로 검증합니다.

```text
Authorization Server (has private key)
        |
        | signs token
        v
   signed JWT
        |
        +--> Resource Server A (public key verify)
        +--> Resource Server B (public key verify)
        +--> Resource Server C (public key verify)
```

공개키는 JWKS(`/.well-known/jwks.json`)로 배포되는 경우가 많습니다. 서버는 토큰을 DB에서 찾지 않고도 다음을 확인할 수 있습니다.

1. 서명이 유효한가? (위변조 여부)
2. `iss`(발급자)가 신뢰하는 서버인가?
3. `aud`(수신자)가 우리 API인가?
4. `exp`(만료 시각)가 지나지 않았는가?
5. `scope`/`roles`가 요청에 충분한가?

```javascript
// Node.js에서 JWT 검증 개념 예시 (jsonwebtoken)
const jwt = require("jsonwebtoken");

function verifyAccessToken(token, publicKey) {
  const payload = jwt.verify(token, publicKey, {
    algorithms: ["RS256"],
    issuer: "https://auth.example.com/",
    audience: "https://api.example.com"
  });

  // payload.sub, payload.scope 등을 신뢰할 수 있음
  return payload;
}
```

## 4. Stateless의 트레이드오프

완벽한 은탄환은 없습니다.

- **즉시 폐기(Revocation)가 어렵다**: 이미 발급된 JWT는 만료 전까지 유효할 수 있음 → 짧은 TTL, 토큰 블랙리스트, introspection 등으로 보완
- **토큰에 과도한 정보 저장 위험**: 개인정보가 payload에 들어가면 유출 피해가 커짐
- **키 관리가 보안의 중심**: 개인키 유출은 시스템 전체 신뢰 붕괴

따라서 실무에서는 Access Token을 **짧게**, Refresh Token을 **더 엄격하게 보호**하는 생명주기 전략을 함께 씁니다.

## 5. 세션에서 토큰으로: 패러다임 전환 한눈에

| 항목 | Session | Token (JWT 중심) |
|------|---------|------------------|
| 상태 위치 | 서버 저장소 | 주로 토큰 자체 |
| 확장 | 공유 세션 스토어 필요 | 검증키만 공유 |
| 로그아웃 | 세션 삭제로 즉시 가능 | 만료/블랙리스트 전략 필요 |
| API/MSA 적합성 | 낮~중간 | 높음 |
| 모바일/서드파티 | 비교적 불편 | 자연스러움 |

토큰 기반 시스템은 이후 OAuth 2.0에서 **"누가 어떤 권한을 어떤 클라이언트에게 위임했는가"**를 표준 프로토콜로 정식화합니다. 다음 단계에서는 그 탄생 배경인 Password Anti-Pattern과 4가지 핵심 역할을 다룹니다.

---

### Chapter Summary (챕터 요약)

- 토큰 기반 시스템은 요청마다 중앙 세션을 조회하지 않아도 되는 Stateless API에 적합하다.
- 디지털 서명(HMAC 또는 공개키)으로 토큰 위변조를 검증하면, 서버는 토큰에 담긴 신원/권한 클레임을 신뢰할 수 있다.
- 공개키 검증 모델은 마이크로서비스 환경에서 키 배포와 확장에 유리하다.
- Stateless는 확장성에 강하지만 즉시 폐기와 키 관리라는 새로운 과제를 남긴다.
