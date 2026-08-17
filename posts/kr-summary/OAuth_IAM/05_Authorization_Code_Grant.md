# 05. Authorization Code Grant - Summary

- **표준 흐름:** `/authorize` → 로그인/동의 → `code` 콜백 → `/token` 교환 → API 호출.
- **왜 code 먼저?** Front-channel(리다이렉트 URL)에 Access Token을 직접 노출하지 않기 위함.
- **Back-channel 교환:** 서버 간 POST로 토큰 발급, code는 짧고 1회용.
- **필수 검증:** `state`, `redirect_uri` 일치, code 재사용 거부.
- **Public Client:** SPA/모바일은 Authorization Code + **PKCE**가 권장.
