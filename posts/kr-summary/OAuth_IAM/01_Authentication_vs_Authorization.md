# 01. Authentication vs Authorization - Summary

- **Authentication(인증):** "당신은 누구인가?" — 신원 확인 (비밀번호, OTP, 생체 등).
- **Authorization(인가):** "무엇을 할 수 있는가?" — 권한 확인 (Role, Scope, Policy).
- **비유:** 주민등록증 = 인증, 건물 출입증 = 인가. 둘은 함께 쓰이지만 목적이 다르다.
- **HTTP 관례:** 인증 실패 `401`, 인가 실패 `403`.
- **왜 중요?** OAuth는 인가 위임, OIDC가 인증 표준. 혼동하면 설계가 틀어진다.
