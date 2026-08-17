# 06. Bearer Token and JWT - Summary

- **Bearer:** "소지자에게 권한 허용" — 영화 티켓처럼 탈취 시 악용 가능.
- **JWT 구조:** Header(alg/typ) · Payload(claims) · Signature(위변조 방지).
- **검증 필수:** `alg` 화이트리스트, `iss`/`aud`/`exp` 확인.
- **Base64 ≠ 암호화:** Payload는 누구나 디코딩 가능 → 민감정보 금지.
- **실무:** HTTPS 전용, 짧은 TTL, 로그에 토큰 원문 남기지 않기.
