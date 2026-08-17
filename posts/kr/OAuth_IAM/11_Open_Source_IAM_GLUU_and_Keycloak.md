# 11. Open Source IAM GLUU and Keycloak (오픈소스 IAM: GLUU와 Keycloak)

클라우드 IdP를 쓰기 전, 또는 규제/데이터 주권 때문에 자체 운영이 필요할 때 선택지가 되는 것이 오픈소스 IAM입니다. 대표적으로 **GLUU**와 **Keycloak**이 있으며, 둘 다 자체 Authorization Server/IdP를 구축하는 데 사용됩니다.

이번 강의에서는 자체 Auth Server 구축의 의미, 디렉터리(LDAP/AD) 연동, MFA 도입 포인트를 정리합니다.

## 1. 왜 자체 Authorization Server를 짓는가?

관리형 서비스(Cognito, Auth0 등)가 편리하지만 아래 요구가 있으면 오픈소스 IAM을 검토합니다.

- 온프레미스/프라이빗 클라우드에 신원 데이터 유지
- 커스텀 인증 흐름, 복잡한 조직 단위(Organization) 정책
- 라이선스 비용 최적화와 벤더 종속성 완화
- 기존 LDAP/Active Directory를 권위 있는 저장소로 유지

자체 IdP를 띄운다는 것은 곧 **OAuth/OIDC 엔드포인트, 키 관리, 동의 화면, 사용자 페더레이션**을 직접 운영한다는 뜻입니다.

## 2. Keycloak 한눈에

**Keycloak**은 Red Hat 생태계에서 널리 쓰이는 오픈소스 IdP입니다.

주요 기능:

- OIDC / SAML IdP
- Realm 단위 멀티테넌시
- Identity Brokering (Google, GitHub 등 외부 IdP 연결)
- User Federation (LDAP/AD)
- 역할/그룹, Admin REST API
- MFA(OTP 등), 패스키 지원 확대

```text
[Apps] --OIDC--> [Keycloak Realm]
                      |
                      +--> local users
                      +--> LDAP federation
                      +--> external IdP broker
```

```bash
# 개념적 실행 예시 (개발용)
docker run -p 8080:8080 \
  -e KEYCLOAK_ADMIN=admin \
  -e KEYCLOAK_ADMIN_PASSWORD=admin \
  quay.io/keycloak/keycloak:latest start-dev
```

Realm을 만들고 Client(공개/기밀), Redirect URI, Scope, Role을 설정한 뒤 앱의 `issuer`를 Keycloak으로 가리키면 됩니다.

## 3. GLUU Server 한눈에

**GLUU**는 엔터프라이즈 IAM/SSO에 초점을 둔 플랫폼으로, Authorization Server, 사용자 관리, 인터셉션 스크립트 등 컴포넌트 조합으로 구성됩니다. OAuth/OIDC 표준을 제공하면서 기존 디렉터리와 강하게 결합하는 시나리오에 자주 등장합니다.

전형적인 역할:

- 자체 Authorization Server / OpenID Provider
- LDAP 기반 신원 저장과 정책
- SSO 허브로서 SAML/OIDC 앱 연결
- MFA/커스텀 인증 워크플로 확장

선택 기준을 단순화하면:

- **Keycloak**: 커뮤니티/문서/클라우드 네이티브 배포 사례가 매우 풍부, 빠른 PoC에 유리
- **GLUU**: 디렉터리 중심 엔터프라이즈 IAM 패키징과 특정 조직의 기존 운영 표준에 맞춰 도입되는 경우 다수

> 제품은 빠르게 변하므로, 도입 시점의 라이선스(예: Keycloak의 배포판/지원 모델)와 보안 패치 정책을 반드시 확인하세요.

## 4. 사용자 디렉터리 연동 (LDAP / Active Directory)

엔터프라이즈의 권위 있는 신원 저장소는 여전히 AD/LDAP인 경우가 많습니다. IAM은 이를 복제하거나 실시간 연동합니다.

연동 시 핵심 설계:

- **Source of Truth**: 비밀번호/상태의 원본은 AD인가, IAM 로컬인가?
- **속성 매핑**: `sAMAccountName` → `preferred_username`, `mail` → `email`
- **그룹-롤 매핑**: AD 그룹 `APP-ORDERS-ADMIN` → Keycloak role `orders-admin`
- **비활성화 동기화**: 퇴사 시 즉시 SSO 차단

```text
[Active Directory] --federation--> [Keycloak/GLUU] --OIDC tokens--> [Apps]
```

## 5. MFA 도입

SSO의 중앙화는 MFA 강제에 유리합니다. 한곳만 강화하면 연결된 앱 전체에 효과가 전파됩니다.

일반적인 단계:

1. 관리자/특권 계정부터 OTP·보안키 필수화
2. 일반 사용자로 확대 (단계적 enrollment)
3. 위험 기반 정책(새로운 디바이스, 해외 IP) 적용
4. 복구 코드/헬프데스크 절차 수립 (계정 복구가 새 공격면이 되지 않게)

```javascript
// 앱 쪽에서는 MFA를 직접 구현하기보다
// IdP 토큰의 ACR(Authentication Context Class Reference)를 검사할 수 있다
function requireMfa(req, res, next) {
  if (req.user?.acr !== "mfa") {
    return res.status(403).json({ error: "mfa_required" });
  }
  next();
}
```

다음 강의에서는 직접 운영 대신 클라우드 관리형 IdP를 쓰는 대표 사례로 **AWS Cognito**의 User Pool/Identity Pool과 소셜 페더레이션을 살펴봅니다.

---

### Chapter Summary (챕터 요약)

- GLUU와 Keycloak은 자체 Authorization Server/IdP를 구축할 때 쓰는 대표 오픈소스 IAM이다.
- LDAP/AD 연동을 통해 기존 기업 디렉터리를 유지한 채 OIDC/SAML SSO를 제공할 수 있다.
- MFA를 IdP에서 강제하면 연결된 다수 앱의 인증 강도를 일괄 향상시킬 수 있다.
- 도입 시 Source of Truth, 속성/그룹 매핑, 패치·HA 운영 책임이 핵심 결정 포인트다.
