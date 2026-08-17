# 03. Token-Based Systems - Summary

- **토큰:** 요청의 신원/권한을 증명하는 문자열. 보통 `Authorization: Bearer`.
- **Stateless 장점:** Sticky Session 불필요, 수평 확장·다중 클라이언트에 유리.
- **검증 원리:** HMAC/공개키 서명으로 위변조 여부를 확인해 DB 조회 없이 신뢰.
- **공개키 모델:** Auth Server가 서명, API들은 JWKS 공개키로 검증.
- **트레이드오프:** 즉시 폐기가 어렵고 키 관리가 핵심 → 짧은 TTL로 보완.
