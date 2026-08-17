# 14. OAuth 2.1 and PKCE - Summary

- **OAuth 2.1 방향:** Implicit/Password grant 제거, Auth Code + PKCE 중심.
- **Implicit 폐기 이유:** URL fragment로 Access Token 노출, refresh 곤란.
- **PKCE:** `code_challenge = BASE64URL(SHA256(verifier))`로 code 탈취 후 교환 차단.
- **적용:** Public client 필수에 가깝고, Confidential에도 추가하면 심층 방어.
- **주의:** PKCE는 `state`(CSRF)를 대체하지 않는다. 둘 다 사용.
