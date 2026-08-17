# 15. Threat Modeling and Defense (위협 모델링 및 방어 대책)

구현이 끝난 뒤에도 보안은 끝나지 않습니다. 공격자는 명세의 빈틈이 아니라 **운영·UX·브라우저 행동의 빈틈**을 노립니다. 이번 강의에서는 Token Hijacking, Replay Attack, CSRF, 그리고 **Zero Trust** 관점의 지속적 인가를 위협 모델링 방식으로 정리합니다.

## 1. 위협 모델링의 기본 질문

STRIDE 등 방법론을 쓰더라도, OAuth/IAM에서는 다음 질문을 반복합니다.

1. 토큰/세션은 어디서 생성·저장·전송·폐기되는가?
2. 각 단계에서 누가 가로채거나 재사용할 수 있는가?
3. 탈취가 성공하면 blast radius(피해 반경)는 얼마나 되는가?
4. 탐지와 회복(폐기, 키 회전, 재인증)은 가능한가?

자산을 먼저 식별하세요: Access Token, Refresh Token, ID Token, 세션 쿠키, client secret, 서명 개인키.

## 2. Token Hijacking 시나리오

### 시나리오 A: XSS로 Bearer 토큰 탈취

- 전제: Access Token이 LocalStorage 또는 JS 메모리에 존재
- 공격: XSS 스크립트가 토큰을 외부로 전송
- 결과: 공격자가 API를 사용자인 척 호출

방어:

- 토큰을 HttpOnly 쿠키 또는 BFF 서버 세션으로 이동
- 엄격한 CSP, 입력 sanitization, 의존성 보안
- Access Token TTL 최소화

### 시나리오 B: 네트워크/로그 유출

- 전제: 토큰이 URL 쿼리로 전달되거나 접근 로그에 남음
- 공격: 프록시 로그, analytics referrer, 지원용 스크린샷
- 방어: Authorization 헤더만 사용, 로그 마스킹, HTTPS 강제

### 시나리오 C: Refresh Token 도난

- 전제: 장기 refresh가 탈취됨
- 결과: 반복적으로 새 access token 발급
- 방어: rotation + reuse detection, 바인딩(DPoP/mTLS), 이상 로그인 탐지, 즉시 revoke

```javascript
// refresh reuse detection 개념
async function refresh(presentedToken) {
  const saved = await store.get(presentedToken);
  if (!saved) {
    // 이미 rotate되어 무효인데 재등장 → 탈취 의심
    await store.revokeFamily(presentedToken);
    throw new Error("REFRESH_REUSE_DETECTED");
  }
  const next = await issueRotatedTokens(saved);
  await store.invalidate(presentedToken);
  return next;
}
```

## 3. Replay Attack 시나리오

**Replay**는 정상적인 요청/토큰을 그대로 다시 보내 권한을 되풀이하는 공격입니다.

예시:

- 탈취한 Access Token으로 만료 전까지 반복 호출
- 오래된 authorize `code` 재전송
- ID Token을 다른 세션에 재사용

방어:

- 짧은 `exp`, 시계 동기화
- Authorization Code 1회용
- OIDC `nonce` 검증
- (고보안) DPoP / sender-constrained token
- 중요 거래는 step-up authentication (재인증/MFA)

```javascript
function assertNonce(idTokenPayload, expectedNonce) {
  if (!expectedNonce || payload.nonce !== expectedNonce) {
    throw new Error("replay_or_token_swap_suspected");
  }
}
```

## 4. CSRF와 SameSite

쿠키가 자동 첨부된다는 사실은 편리하지만 CSRF의 근원입니다.

### 공격 개요

1. 사용자가 은행 앱에 로그인된 상태(세션 쿠키 유지)
2. 악성 사이트가 `POST https://bank.example/transfer`를 유도
3. 브라우저가 쿠키를 자동 첨부 → 원치 않는 이체

OAuth에서도:

- Login CSRF: 피해자 브라우저에 공격자 계정을 고정
- 상태 변경 API 호출 위조

방어:

```http
Set-Cookie: sid=...; HttpOnly; Secure; SameSite=Lax
```

- `SameSite=Lax`: 안전한 기본값에 가깝지만 모든 CSRF를 막지는 못함
- `SameSite=Strict`: 더 강하지만 UX/링크 유입에 영향
- `SameSite=None; Secure`: cross-site 필요 시에만, 추가 CSRF 토큰 필수

추가 방어:

- `state` 파라미터 (OAuth 플로우)
- CSRF 토큰 헤더
- Origin 검사

```javascript
if (req.headers.origin !== "https://app.example.com") {
  return res.status(403).json({ error: "origin_denied" });
}
```

## 5. Zero Trust: 한 번 인증으로 끝내지 않는다

전통 경계 보안은 "회사 네트워크 안이면 신뢰"였습니다. **Zero Trust**는 반대로 말합니다.

> 네트워크 위치와 무관하게, 모든 요청을 지속적으로 검증한다.

IAM에 적용하면:

- 매 요청마다 토큰/세션 유효성 검사
- 장치 상태, 위치, 위험 점수에 따른 조건부 접근
- 최소 권한(Least Privilege)과 단기 자격 증명
- 관리자 작업에 step-up MFA
- 마이크로세그멘테이션: 서비스 간에도 상호 인증(mTLS)

```text
[Request] -> Authenticate -> Authorize(policy) -> Risk engine
                                |                     |
                                +-- allow ------------+
                                +-- deny
                                +-- step-up auth
```

Zero Trust는 제품 이름이라기보다 **설계 철학**입니다. OAuth의 짧은 Access Token, 연속적 정책 평가, BFF, MFA, 장치 신뢰이 그 구현 수단이 됩니다.

## 6. 실무 방어 체크리스트 (최종)

1. Authorization Code + PKCE, Implicit/Password grant 금지
2. Access 짧게, Refresh는 rotation + 안전 저장
3. 브라우저에 토큰 최소화 (BFF/HttpOnly)
4. JWT 검증 시 `alg`/`iss`/`aud`/`exp` 강제
5. CSRF: SameSite + state/CSRF token
6. XSS: CSP + 안전한 렌더링
7. 키/비밀 관리: KMS/HSM, 정기 회전
8. 감사 로그와 이상 탐지, 즉시 revoke 절차
9. Zero Trust: 지속 검증 + step-up + least privilege

이 시리즈의 여정은 "인증과 인가의 구분"에서 시작해, OAuth/OIDC 구현을 지나, 엔터프라이즈 IAM과 공격자 관점의 방어까지 이어졌습니다. 표준을 올바르게 쓰는 것과, 위협 모델에 맞춰 운영하는 것이 함께일 때 비로소 실전 보안이 됩니다.

---

### Chapter Summary (챕터 요약)

- Token Hijacking과 Replay는 탈취·재전송을 노리므로 짧은 TTL, 일회성 code, nonce, refresh rotation으로 방어한다.
- CSRF는 쿠키 자동 첨부의 부작용이며 SameSite와 CSRF 토큰/`state`로 완화한다.
- Zero Trust는 일회성 로그인 신뢰를 거부하고, 요청 단위의 지속적 인증·인가와 최소 권한을 요구한다.
- OAuth/IAM 보안은 프로토콜 준수와 XSS/CSRF/키관리/운영 대응이 결합될 때 완성된다.
