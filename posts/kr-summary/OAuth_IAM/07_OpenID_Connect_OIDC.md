# 07. OpenID Connect OIDC - Summary

- **OAuth 한계:** API 인가에는 강하지만 "사용자 누구?" 표준 인증은 부족.
- **OIDC:** OAuth 확장. `openid` scope + **ID Token** + UserInfo.
- **ID Token:** Client가 로그인 처리용으로 검증하는 JWT (`aud`=client_id, `nonce`).
- **역할 분리:** ID Token ≠ API용. Access Token으로 Resource Server 인가.
- **실익:** 프로필/이메일 표준 전달, 다중 앱 SSO 확장의 기반.
