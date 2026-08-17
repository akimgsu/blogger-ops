# 08. Token Lifecycle Management - Summary

- **Access Token:** 짧은 수명, API 호출용. 탈취 피해 최소화.
- **Refresh Token:** 긴 수명, 재발급용. 더 엄격히 보호 + rotation 권장.
- **Silent Refresh:** 사용자 재로그인 없이 만료 임박/401 시 갱신.
- **Single-flight:** 동시 401에 refresh가 중복 호출되지 않게 직렬화.
- **설계 원칙:** 자주 노출되는 토큰은 짧게, 재발급 열쇠는 드물게·안전하게.
