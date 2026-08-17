# 13. BFF Design Pattern - Summary

- **BFF:** 프론트 전용 백엔드가 토큰을 보관, 브라우저는 HttpOnly 세션 쿠키만 사용.
- **이점:** XSS로 Bearer 탈취 난이도↑, refresh/IdP 복잡도 서버 집중.
- **흐름:** code 교환은 BFF → Redis 세션 저장 → SPA는 `/api/*`만 호출.
- **필수:** 쿠키 사용 시 CSRF 방어 (`SameSite`, CSRF 토큰, Origin 검사).
- **비용:** 세션 스토어·BFF 운영 필요. 고보안 SPA에 특히 적합.
