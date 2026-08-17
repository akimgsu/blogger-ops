# 02. Cookies and Sessions - Summary

- **Cookie:** 브라우저가 자동 전송하는 작은 키-값. `HttpOnly`/`Secure`/`SameSite`로 보안 강화.
- **Session:** 서버에 상태 저장, 브라우저에는 세션 ID만 전달하는 Stateful 모델.
- **장점:** 즉시 로그아웃·서버 측 상태 통제가 쉬움.
- **한계:** 메모리/Redis 운영 비용, 스케일아웃, 도메인·모바일 비친화.
- **MSA 문제:** 중앙 세션 의존 → 결합·병목 → 토큰 기반 Stateless로 이동 동기.
