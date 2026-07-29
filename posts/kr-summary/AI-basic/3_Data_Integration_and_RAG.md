# Phase 3: Data Integration & RAG 핵심 요약

*   **Knowledge base (지식 기반)**:
    *   AI가 실시간으로 참고할 수 있는 사내/외부 데이터 저장소.
    *   **Embedding (임베딩)**: 텍스트 데이터를 AI가 이해할 수 있는 수학적 **Vector(벡터)**로 변환하는 작업.
    *   **Vector Database**: 변환된 벡터를 저장하고 유사도 기반으로 빠르게 검색하는 특수 DB.
*   **RAG (검색 증강 생성)**:
    *   LLM의 한계(최신 정보 부족, 내부 데이터 부재)를 극복하고 환각을 방지하는 아키텍처.
    *   과정: 사용자 질문 -> Vector DB 검색(Retrieval) -> 정보와 질문 결합(Augmented) -> LLM 답변 생성(Generation).
*   **보안 (Access Control)**: 
    *   사내 구축 시 문서 검색 단계에서 사용자 권한을 검증하여 기밀 유출을 원천 차단하는 설계가 필수적.
