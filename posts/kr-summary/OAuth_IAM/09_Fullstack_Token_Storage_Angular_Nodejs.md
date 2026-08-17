# 09. Fullstack Token Storage Angular and Node.js - Summary

- **LocalStorage 금지 이유:** XSS 시 JS가 토큰을 읽어 탈취 가능.
- **권장:** `HttpOnly` + `Secure` + `SameSite` 쿠키 (또는 BFF 세션).
- **Angular:** `withCredentials: true`로 쿠키 전송, Bearer를 JS에 두지 않기.
- **Node 미들웨어:** JWT 서명/`iss`/`aud`/`exp` 검증 후 Scope 체크 분리.
- **ORDS 앞단:** 검증 통과 요청만 프록시. 인증과 인가를 계층으로 분리.
