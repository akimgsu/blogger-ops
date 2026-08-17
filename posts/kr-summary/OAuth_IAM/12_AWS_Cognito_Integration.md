# 12. AWS Cognito Integration - Summary

- **User Pool:** 회원/로그인/MFA/OIDC 토큰 발급 (IdP).
- **Identity Pool:** 인증된 사용자에게 AWS 임시 자격 증명 발급 (S3 등).
- **일반 API만 쓰면** User Pool JWT 검증이 중심, Identity Pool은 선택.
- **소셜 Federation:** Google/Apple → Cognito 사용자 매핑 → 앱은 Cognito 토큰만 검증.
- **설계 포인트:** App Client 유형, 콜백 URL, TTL, 그룹/커스텀 claim.
