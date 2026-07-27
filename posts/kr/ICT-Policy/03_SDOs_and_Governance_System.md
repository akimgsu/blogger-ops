# [Week 3] 표준개발기구(SDO) 및 글로벌 거버넌스 체계

이전 장에서 우리는 표준이 통신 생태계에서 왜 필수적인지 알아보았습니다. 이번 주차에서는 이러한 표준을 실제로 누가, 어떻게 제정하는지 다루는 **표준개발기구(SDO, Standards Development Organization)**와 이들의 거버넌스 철학에 대해 살펴봅니다.

---

## 1. SDO의 유형 분류: 글로벌/국가 vs 공공/민간

SDO는 그 활동 반경(국가적 vs 글로벌)과 주도 세력(공공 부문 vs 민간 부문)에 따라 크게 4가지 사분면으로 분류할 수 있습니다. 

1. **글로벌, 민간 주도 (Global, Private Sector)**: 전 세계 기업들이 연합하여 기술 스펙을 주도.
   - 예: **3GPP (3rd Generation Partnership Project)** - 글로벌 이동통신 표준 제정.
2. **글로벌, 공공 주도 (Global, Public Sector)**: 국가 간의 조약이나 국제 기구 형태로 운영.
   - 예: **IEC (International Electrotechnical Commission)** - 전기전자 분야 국제 표준.
3. **국가, 공공 주도 (National, Public Sector)**: 특정 국가의 정부 주도로 자국 내 기술 규격을 통제.
   - 예: **CCSA (China Communications Standards Association)** - 중국 통신 표준 기구.
4. **국가, 민간 주도 (National, Private Sector)**: 국가 내의 통신사나 기업 연합이 주도.
   - 예: **ATIS (Alliance for Telecommunications Industry Solutions)** - 북미 정보통신 산업 연합.

---

## 2. 핵심 기술 표준과 SDO 매칭

우리가 매일 사용하는 핵심 통신 기술들은 각각 그 분야의 최고 전문성을 가진 SDO들에 의해 개발되었습니다. 시험 및 실무에서 자주 등장하는 필수 매칭은 다음과 같습니다.

- **Transport Layer Security (TLS)** $\rightarrow$ **IETF** (Internet Engineering Task Force): 인터넷 트래픽 암호화의 핵심.
- **WiFi (802.11)** $\rightarrow$ **IEEE** (Institute of Electrical and Electronics Engineers): 근거리 무선 통신 표준.
- **X.509 Certificates** $\rightarrow$ **ITU** (International Telecommunication Union): 공개키 기반(PKI) 보안 인증서 형식.
- **Mobile Radio Access (이동통신 무선 접속)** $\rightarrow$ **3GPP**: LTE, 5G 등 모바일 네트워크 통신 규격.

### 💻 JSON Code Example: Standard & SDO Mapping
간단한 설정 파일이나 데이터 모델에서 이러한 표준-기관 맵핑을 구현한다면 다음과 같은 형태가 될 것입니다.

```json
{
  "standards_registry": {
    "TLS": {
      "full_name": "Transport Layer Security",
      "sdo": "IETF",
      "domain": "Internet Security"
    },
    "WiFi": {
      "full_name": "IEEE 802.11",
      "sdo": "IEEE",
      "domain": "Wireless LAN"
    },
    "X.509": {
      "full_name": "X.509 Public Key Certificates",
      "sdo": "ITU",
      "domain": "Cryptography"
    },
    "Radio_Access": {
      "full_name": "Mobile Radio Access Network (RAN)",
      "sdo": "3GPP",
      "domain": "Cellular Network"
    }
  }
}
```

---

## 3. 인터넷 아키텍처 및 IETF의 거버넌스 철학

전통적인 통신 기구(예: ITU)가 투표나 국가 간의 지루한 관료적 합의 프로세스(Bureaucratic consensus)를 거치는 것과 달리, 현대 인터넷을 만들어낸 **IETF(Internet Engineering Task Force)**는 완전히 다른 거버넌스 철학을 채택했습니다. 

IETF의 핵심 철학을 대변하는 유명한 선언문은 다음과 같습니다:

> *"We reject kings, presidents, and voting. We believe in **rough consensus and running code**."*
> (우리는 왕, 대통령, 그리고 투표를 거부한다. 우리는 오직 **대략적인 합의와 실제로 작동하는 코드**를 믿는다.)

**"Rough consensus and running code"**는 완벽한 서류상의 합의보다, 다수가 대체로 동의하고 현장에서 즉시 구동할 수 있는 실용적이고 민첩한(Agile) 기술 구현을 우선시한다는 것을 의미합니다. 이러한 바텀업(Bottom-up) 거버넌스 덕분에 인터넷 인프라는 폭발적인 성장에 빠르게 적응할 수 있었습니다.

---

## Chapter Summary
- **SDO 분류 행렬**: 활동 범위(글로벌/국가)와 성격(공공/민간)에 따라 3GPP, IEC, CCSA, ATIS 등으로 세분화된다.
- **핵심 기술 매칭**: TLS는 IETF, WiFi는 IEEE, X.509는 ITU, 이동통신(Mobile Radio)은 3GPP가 주도한다.
- **IETF의 거버넌스 철학**: 관료주의와 다수결 투표를 배격하고, 철저히 실용주의적인 **"Rough consensus and running code (대략적 합의와 작동하는 코드)"**를 기반으로 인터넷 표준을 진화시켰다.
