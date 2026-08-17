# 15. Threat Modeling and Defense - Summary

- **Token Hijacking:** XSS·로그·refresh 도난. BFF/HttpOnly, 짧은 TTL, refresh rotation.
- **Replay:** code 1회용, `nonce`, 짧은 `exp`, step-up 인증으로 완화.
- **CSRF:** 쿠키 자동 첨부 부작용 → SameSite + CSRF 토큰/`state` + Origin 검사.
- **Zero Trust:** 위치 신뢰 거부, 요청마다 검증, 최소 권한, 지속적 인가.
- **완성 조건:** 프로토콜 준수 + XSS/CSRF/키관리/감사·revoke 운영이 결합되어야 함.
