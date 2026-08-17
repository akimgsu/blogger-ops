# 10. IAM and SSO (IAM과 Single Sign-On)

서비스가 하나일 때는 각 앱이 자체 로그인만으로도 버틸 수 있습니다. 하지만 회사 규모가 커져 인사, 메일, ERP, 내부 대시보드, 고객 포털이 수십 개가 되면 "앱마다 다른 계정"은 사용자와 보안팀 모두에게 악몽이 됩니다.

이번 강의에서는 **IAM(Identity and Access Management)**의 역할과, 한 번의 로그인으로 여러 시스템을 쓰는 **SSO(Single Sign-On)** 원리를 설명합니다.

## 1. IAM이란 무엇인가?

**IAM**은 디지털 신원(Identity)의 생애주기와 접근 권한을 중앙에서 관리하는 체계입니다. 단순히 로그인 화면을 넘어 다음을 포함합니다.

- **Identification**: 사용자/서비스 계정을 고유하게 식별
- **Authentication**: 로그인, MFA, 패스키
- **Authorization**: 역할, 그룹, 정책 기반 접근 제어
- **Administration**: 입사/퇴사/부서이동에 따른 계정 Provisioning
- **Audit**: 누가 언제 무엇에 접근했는지 기록

앱이 각자 사용자를 저장하면:

- 비밀번호 정책이 제각각
- 퇴사자 계정이 일부 시스템에 남음
- 감사 대응이 불가능에 가까움

IAM은 이를 **단일 진실 공급원(Single Source of Truth)**에 가깝게 만듭니다.

## 2. SSO: 한 번 로그인, 여러 앱 접근

**SSO**는 사용자가 중앙 IdP(Identity Provider)에 한 번 인증하면, 신뢰 관계에 있는 여러 애플리케이션(Service Provider, SP / Relying Party)에 반복 로그인 없이 접근하게 하는 방식입니다.

대표 프로토콜:

- **SAML 2.0**: 엔터프라이즈/레거시 앱에 강점
- **OIDC**: 현대 웹/모바일/API에 강점
- **OAuth 2.0**: 인가 위임 (SSO의 기반 계층으로 자주 결합)

```text
[User] -> [App A] --redirect--> [IdP Login]
                              |
                              +--session established--
                              |
[User] -> [App B] --redirect--> [IdP] --already logged in--> SSO success
```

## 3. SSO가 동작하는 구체적 원리 (OIDC 기준)

1. 사용자가 `crm.company.com`에 처음 접속한다.
2. CRM은 IdP의 `/authorize`로 리다이렉트한다.
3. 사용자가 IdP에서 로그인(+ MFA)한다.
4. IdP는 CRM에 Authorization Code/ID Token을 돌려준다.
5. CRM은 로컬 앱 세션을 생성한다.
6. 이후 사용자가 `hr.company.com`에 가면, HR도 IdP로 리다이렉트하지만 IdP 세션이 이미 있어 **조용히(silent/SSO)** 인증이 완료된다.

핵심은 **앱 세션**과 **IdP 세션**이 분리되어 있다는 점입니다.

- IdP 세션: 중앙 로그인 상태
- 각 앱 세션: 앱별 자체 쿠키/세션

그래서 SSO Logout(Single Logout)은 "모든 앱 세션 + IdP 세션"을 어떻게 끝낼지 설계가 필요합니다.

## 4. SSO의 비즈니스/보안 가치

### 사용자 경험

- 비밀번호 피로(Password Fatigue) 감소
- 헬프데스크의 비밀번호 초기화 티켓 감소

### 보안

- MFA를 IdP 한곳에서 강제
- 퇴사 시 IdP 계정 비활성화로 다수 앱 접근 차단
- 중앙 감사 로그

### 주의점

- IdP는 **단일 장애점(SPOF)**이자 **최우선 공격 대상**
- IdP 장애 = 전사 로그인 장애 가능 → 고가용성 필수
- 잘못된 연방(Federation) 설정은 과도한 권한 확산을 부를 수 있음

## 5. 엔터프라이즈에서 자주 보는 구성

```text
[Employees] --> [SSO Portal / IdP]
                    |
                    +--> HR System
                    +--> CRM
                    +--> Git / CI
                    +--> Data Warehouse UI
                    +--> Customer Support Tool

[Identity Store] LDAP / Active Directory / Cloud Directory
        ^
        |
     [IdP]
```

다음 강의에서는 직접 Authorization Server를 구축할 때 쓰는 오픈소스 IAM인 **GLUU**와 **Keycloak**을 비교·이해합니다.

---

### Chapter Summary (챕터 요약)

- IAM은 신원과 접근 권한의 전 생애주기를 중앙 관리하는 체계다.
- SSO는 IdP에 한 번 로그인하면 신뢰된 여러 앱에 반복 인증 없이 접근하게 한다.
- OIDC/SAML이 대표 프로토콜이며, 앱 세션과 IdP 세션을 구분해 이해해야 한다.
- SSO는 UX와 보안을 동시에 높이지만, IdP 보호와 고가용성이 전제 조건이다.
