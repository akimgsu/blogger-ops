# 12. AWS Cognito Integration (클라우드 관리형 IdP: AWS Cognito 연동)

자체 IdP 운영이 부담스럽다면 클라우드 관리형 옵션을 검토합니다. AWS 생태계에서는 **Amazon Cognito**가 대표적입니다. 이번 강의에서는 **User Pool**과 **Identity Pool**의 역할 차이, 그리고 Google/Apple 같은 소셜 로그인 **Federation** 아키텍처를 정리합니다.

## 1. Cognito의 두 축: User Pool vs Identity Pool

많은 초보자가 두 개념을 혼동합니다. 역할을 분리해 기억하세요.

### User Pool = 인증(IdP)

- 회원 가입/로그인/비밀번호 찾기
- MFA, 비밀번호 정책
- OIDC/OAuth 기반 앱 클라이언트
- 소셜/SAML/OIDC 페더레이션 사용자도 User Pool 사용자로 매핑 가능
- 결과물: **ID Token / Access Token / Refresh Token**

### Identity Pool (Federated Identities) = AWS 리소스 인가용 자격 증명

- 이미 인증된 사용자(Cognito User Pool, Facebook, 자체 IdP 등)에게
- 임시 **AWS credentials**(Access Key, Secret, Session Token)를 발급
- 목적: S3, DynamoDB 등 AWS API를 직접 호출할 때 IAM Role 기반 권한 부여

```text
[User] -> [User Pool Auth] -> JWT tokens
                               |
                               +--> [API Gateway / App Backend] (일반 API 인가)
                               |
                               +--> [Identity Pool] -> temporary AWS creds -> S3/DynamoDB
```

> 오직 백엔드 API만 호출하고 AWS SDK를 브라우저에서 직접 쓰지 않는다면, User Pool만으로 충분한 경우가 많습니다.

## 2. User Pool 설계 포인트

1. **App Client 유형**: Public(SPA) vs Confidential(서버)
2. **Callback/Logout URL** 정확한 등록
3. **Hosted UI** vs 커스텀 UI + SDK
4. **Attribute**: `email` 필수/검증, custom attributes
5. **토큰 만료**: Access/ID/Refresh TTL 정책
6. **그룹/커스텀 claim**: Pre Token Generation 트리거로 `roles` 주입 가능

```javascript
// amazon-cognito-identity-js / aws-jwt-verify 개념
const { CognitoJwtVerifier } = require("aws-jwt-verify");

const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.COGNITO_USER_POOL_ID,
  tokenUse: "access",
  clientId: process.env.COGNITO_CLIENT_ID
});

async function requireCognitoAuth(req, res, next) {
  try {
    const token = req.headers.authorization?.slice(7);
    req.user = await verifier.verify(token);
    next();
  } catch {
    res.status(401).json({ error: "invalid_token" });
  }
}
```

## 3. Identity Pool 설계 포인트

Identity Pool은 **Authenticated role**과 **Unauthenticated role**을 가집니다.

- 로그인 사용자 → `AuthRole` (예: 본인 폴더만 S3 읽기/쓰기)
- 게스트 → `UnauthRole` (매우 제한적, 가능하면 비활성)

중요 IAM 정책 예시 개념:

```json
{
  "Effect": "Allow",
  "Action": ["s3:GetObject", "s3:PutObject"],
  "Resource": "arn:aws:s3:::my-app-bucket/${cognito-identity.amazonaws.com:sub}/*"
}
```

`${cognito-identity.amazonaws.com:sub}`로 **사용자별 홈 디렉터리**를 강제하는 패턴이 흔합니다.

## 4. 소셜 로그인 Federation 아키텍처

Cognito User Pool에 Google/Apple IdP를 연결하면 흐름은 대략 다음과 같습니다.

```text
[Angular App]
    | authorize
    v
[Cognito Hosted UI / OAuth]
    | redirect to Google/Apple
    v
[Social IdP Login + Consent]
    |
    v
[Cognito] maps federated user -> User Pool user
    |
    v
returns Cognito tokens to app (not raw Google token for your API)
```

장점:

- 앱은 **Cognito 토큰만** 검증하면 됨 (업스트림 IdP마다 검증 로직 분기 불필요)
- 소셜 계정과 로컬 계정을 하나의 사용자 디렉터리로 통합 가능
- Apple의 비공개 이메일 릴레이 같은 특수 케이스도 IdP 설정으로 흡수

```typescript
// Angular에서 Cognito Hosted UI로 리다이렉트하는 개념
const domain = "myapp.auth.ap-northeast-2.amazoncognito.com";
const params = new URLSearchParams({
  client_id: environment.cognitoClientId,
  response_type: "code",
  scope: "openid email profile",
  redirect_uri: environment.redirectUri
});
window.location.href = `https://${domain}/oauth2/authorize?${params}`;
```

## 5. 풀스택에서 추천되는 경계

- **Angular**: Authorization Code + PKCE로 Cognito 로그인 (또는 BFF 경유)
- **Node.js**: Cognito JWT 검증 후 비즈니스 API/ORDS 호출
- **Identity Pool**: 브라우저가 S3에 직접 업로드해야 할 때만 선택적으로 사용

다음 단계(최고급 보안)에서는 브라우저가 토큰을 아예 쥐지 않게 만드는 **BFF 패턴**으로 이동합니다.

---

### Chapter Summary (챕터 요약)

- Cognito User Pool은 사용자 인증/토큰 발급 IdP이고, Identity Pool은 AWS 리소스용 임시 자격 증명을 제공한다.
- 일반 API 보호에는 User Pool JWT 검증이 중심이며, Identity Pool은 S3 등 AWS 직접 접근이 필요할 때 사용한다.
- 소셜 로그인은 User Pool Federation으로 흡수해 앱이 Cognito 토큰만 검증하도록 단순화할 수 있다.
- App Client 유형, 콜백 URL, 토큰 TTL, 역할 매핑이 Cognito 설계의 핵심이다.
