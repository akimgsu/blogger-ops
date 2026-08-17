# 11. Open Source IAM GLUU and Keycloak - Summary

- **자체 IdP 이유:** 데이터 주권, 커스텀 정책, AD/LDAP 유지, 벤더 종속 완화.
- **Keycloak:** OIDC/SAML, Realm, LDAP federation, brokering, MFA — PoC·커뮤니티에 강점.
- **GLUU:** 디렉터리 중심 엔터프라이즈 IAM/SSO 구축에 자주 사용.
- **연동 핵심:** Source of Truth, 속성/그룹→롤 매핑, 퇴사자 즉시 차단.
- **MFA:** IdP에서 강제하면 연결 앱 전체에 인증 강도 전파.
