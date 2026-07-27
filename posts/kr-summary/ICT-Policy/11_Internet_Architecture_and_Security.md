# 핵심 요약: [Week 11] 인터넷 아키텍처 원칙과 네트워크 보안/프라이버시

- **종단간 원칙 (End-to-End Argument)**: 네트워크 설계의 대원칙. 
  - 네트워크는 패킷 전달(Packet forwarding)에만 충실해야 하며, 복잡한 로직(Intelligence)은 양 끝단(Endpoints) 기기에서 처리함.
  - 주의: 비디오 스트리밍을 위해 네트워크 자체를 최적화(Network design optimized for streaming video)하는 것은 종단간 원칙의 예시가 **아님**.
- **DNS 프라이버시 강화 기술**:
  - **DoH (DNS over HTTPS)**: 기존 포트 53을 우회하고, 일반 암호화 웹 트래픽과 동일한 **포트 443(Port 443)**을 사용하여 검열과 감청을 방지함.
- **필수 암기: 주요 IETF RFC 매칭**:
  - **RFC 7258 (2014)** $\rightarrow$ "Pervasive Monitoring is an Attack" (무차별 감청은 공격이다)
  - **RFC 7858 (2016)** $\rightarrow$ DNS over TLS (DoT)
  - **RFC 8484 (2018)** $\rightarrow$ DNS over HTTPS (DoH)
  - **RFC 8446 (2018)** $\rightarrow$ Transport Layer Security 1.3 (TLS 1.3)
