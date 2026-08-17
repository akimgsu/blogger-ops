# 14. OAuth 2.1 and PKCE (최신 표준: OAuth 2.1과 PKCE)

OAuth 2.0은 성공했지만, 초기 grant 중 일부는 브라우저 보안 모델과 맞지 않았습니다. **OAuth 2.1**은 사실상의 보안 권장사항을 본문으로 끌어올려 "지금 어떻게 구현해야 안전한가"를 명확히 합니다. 핵심 변화 중 하나가 **Implicit Flow 폐기**와 **PKCE 의무화에 가까운 강화**입니다.

## 1. OAuth 2.1에서 달라지는 점 (실무 관점)

OAuth 2.1의 중요한 방향성:

- **Authorization Code + PKCE**를 공용 클라이언트의 기본으로
- **Implicit Grant 제거**
- **Resource Owner Password Credentials Grant 제거/배제**
- Bearer 토큰을 쿼리스트링에 넣지 말 것
- `redirect_uri` 정확한 매칭 등 안전한 기본값 강조

즉, "예전에 되던 위험한 편법"을 표준에서 치우는 정리 작업에 가깝습니다.

## 2. Implicit Flow가 폐기된 이유

Implicit Flow는 SPA가 `client_secret`을 보관할 수 없다는 이유로, authorize 리다이렉트에서 **Access Token을 URL fragment로 바로** 돌려주던 방식입니다.

```text
https://app.example.com/callback#access_token=....&token_type=Bearer&expires_in=3600
```

문제점:

1. **Front-channel 노출**: 히스토리, 로그, Referer, 브라우저 확장에 토큰 노출 가능
2. **토큰 교환 단계 부재**: code의 일회성/짧은 수명 완충 구간이 없음
3. **Refresh Token을 안전히 다루기 어려움**
4. XSS가 있으면 토큰이 즉시 탈취 대상

현대 브라우저는 Authorization Code + PKCE로 public client도 충분히 안전하게 구현할 수 있으므로 Implicit는 더 이상 필요 없습니다.

## 3. PKCE란? (Proof Key for Code Exchange)

**PKCE(RFC 7636)**는 Authorization Code가 탈취되더라도 공격자가 토큰으로 교환하지 못하게 막는 기법입니다. 원래 모바일 앱을 위해 고안되었지만, 지금은 SPA를 포함한 public client의 표준 방어입니다.

### 수학적/암호학적 원리

1. 클라이언트가 고엔트로피 무작위 문자열 **Code Verifier**를 생성한다.
2. 이로부터 **Code Challenge**를 계산한다.
   - 권장: `code_challenge = BASE64URL(SHA256(code_verifier))` (`S256`)
3. `/authorize`에는 challenge만 보낸다.
4. 이후 `/token`에는 원본 verifier를 보낸다.
5. 인가 서버는 `SHA256(verifier)`가 처음에 받은 challenge와 일치하는지 확인한다.

```text
Client generates:
  code_verifier = high-entropy random (43~128 chars)

Client computes:
  code_challenge = BASE64URL(SHA256(code_verifier))

/authorize : send code_challenge (+ method=S256)
/token     : send code_verifier

Server checks:
  BASE64URL(SHA256(code_verifier)) == stored code_challenge
```

공격자가 리다이렉트에서 `code`만 훔쳐도, **verifier를 모르면** `/token` 교환에 실패합니다.

## 4. 구현 예시 (JavaScript)

```javascript
function base64UrlEncode(buffer) {
  return Buffer.from(buffer)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

async function createPkcePair() {
  const verifier = base64UrlEncode(crypto.randomBytes(32));
  const challenge = base64UrlEncode(
    crypto.createHash("sha256").update(verifier).digest()
  );
  return { verifier, challenge };
}

// /authorize 파라미터
const { verifier, challenge } = await createPkcePair();
session.codeVerifier = verifier;

const url = new URL("https://auth.example.com/authorize");
url.searchParams.set("response_type", "code");
url.searchParams.set("client_id", "spa-client");
url.searchParams.set("redirect_uri", "https://app.example.com/callback");
url.searchParams.set("code_challenge", challenge);
url.searchParams.set("code_challenge_method", "S256");
url.searchParams.set("state", state);
```

토큰 교환:

```javascript
const body = new URLSearchParams({
  grant_type: "authorization_code",
  code,
  redirect_uri: "https://app.example.com/callback",
  client_id: "spa-client",
  code_verifier: session.codeVerifier
});
```

## 5. 코드 탈취 시나리오로 보는 방어 효과

```text
정상:
SPA -> IdP (challenge)
IdP -> SPA (code)
SPA -> IdP /token (code + verifier) => tokens

공격:
Attacker steals code from redirect
Attacker -> IdP /token (code + ???) => fail (no verifier)
```

특히 커스텀 URL 스킴을 쓰는 모바일이나, redirect를 가로채는 악성 앱 시나리오에서 PKCE의 가치가 큽니다.

## 6. 오늘 당장 적용할 체크리스트

1. Implicit Flow 제거
2. Password Grant 제거
3. 모든 public client에 PKCE `S256`
4. Confidential client도 PKCE를 추가로 쓰면 더 안전(방어 심층화)
5. `state`와 함께 사용 (CSRF 방어는 PKCE가 대체하지 않음)

다음 마지막 강의에서는 Token Hijacking, Replay, CSRF, Zero Trust까지 묶어 **위협 모델링과 방어 대책**을 정리합니다.

---

### Chapter Summary (챕터 요약)

- OAuth 2.1은 위험한 legacy grant를 정리하고 Authorization Code + PKCE를 중심으로 안전 기본값을 강화한다.
- Implicit Flow는 front-channel에 토큰을 노출하므로 폐기되었다.
- PKCE는 Code Verifier/Challenge(보통 SHA-256)로 code 탈취 후 토큰 교환을 차단한다.
- PKCE는 CSRF 방어용 `state`를 대체하지 않으며, 둘 다 사용해야 한다.
