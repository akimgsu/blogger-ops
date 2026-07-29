# Phase 3: 외부 데이터 결합 (Data Integration & RAG)

LLM은 학습된 시점 이후의 정보를 알지 못하며, 기업 내부의 기밀 데이터에도 접근할 수 없습니다. 이 장에서는 AI가 학습하지 않은 최신 정보나 사내 데이터베이스(예: ORDS 등으로 관리되는 데이터)를 안전하게 연결하여 답변의 정확성을 극대화하는 실무적인 방법을 다룹니다.

## 1. Knowledge base (지식 기반)

Knowledge base(지식 기반)는 AI가 질문에 답하기 위해 참고할 수 있는 데이터 저장소입니다. 매뉴얼, 사내 정책 문서, 데이터베이스 레코드 등 정형화·비정형화된 모든 데이터가 포함될 수 있습니다. 

AI가 이 데이터를 빠르고 정확하게 검색하려면 데이터를 AI가 이해할 수 있는 형태, 즉 **벡터(Vector)**로 변환해야 합니다.

### Embedding(임베딩)과 Vector Database
텍스트 데이터를 수치화된 배열로 바꾸는 과정을 **Embedding(임베딩)**이라고 합니다. 의미가 비슷한 문장들은 벡터 공간(Vector Space) 상에서 서로 가까운 곳에 위치하게 됩니다. 이렇게 변환된 거대한 벡터들을 저장하고 빠르게 검색(유사도 검색)할 수 있게 해주는 시스템이 바로 **Vector Database**입니다.

## 2. RAG (Retrieval-Augmented Generation, 검색 증강 생성)

RAG는 LLM의 환각(Hallucination) 현상을 해결하고, 최신/내부 데이터를 기반으로 답변하도록 만드는 현재 가장 각광받는 아키텍처입니다.

작동 방식은 다음과 같습니다:
1. **Retrieval (검색)**: 사용자가 질문을 하면, 시스템은 질문을 벡터로 변환한 뒤 Knowledge base(Vector DB)에서 의미상 가장 유사한 문서(정보)를 검색해 가져옵니다.
2. **Augmented (증강)**: 검색된 문서의 내용을 원래의 사용자 질문과 결합하여(Prompt 조합) LLM에게 전달합니다.
3. **Generation (생성)**: LLM은 주입된 문서를 바탕으로 정확하고 근거 있는 답변을 생성합니다.

### 보안과 권한 관리 (Access Control)
실무에서 RAG를 구축할 때 가장 중요한 것은 **보안과 권한 관리**입니다. 직급이나 부서에 따라 접근할 수 있는 Knowledge base가 달라야 합니다. 문서 검색(Retrieval) 단계에서 검색자의 권한을 체크하여, 열람 권한이 없는 문서는 아예 LLM에게 전달되지 않도록 아키텍처를 설계하는 것이 필수적입니다.

```python
# RAG 파이프라인의 간략한 구조 예시 (LangChain 활용)
from langchain.chains import RetrievalQA
from langchain.llms import OpenAI
from langchain.vectorstores import Chroma
from langchain.embeddings import OpenAIEmbeddings

# 1. Embedding 모델 및 Vector DB 설정 (Knowledge Base)
embeddings = OpenAIEmbeddings()
vectordb = Chroma(persist_directory="./db", embedding_function=embeddings)

# 2. Retriever (검색기) 설정
retriever = vectordb.as_retriever(search_kwargs={"k": 3}) # 상위 3개 문서 검색

# 3. LLM 및 RAG 체인 생성
llm = OpenAI(temperature=0)
qa_chain = RetrievalQA.from_chain_type(
    llm=llm, 
    chain_type="stuff", 
    retriever=retriever
)

# 4. 사용자 질문 실행 (질문 -> 검색 -> 증강 -> 생성)
query = "회사 복지 규정 중 의료비 지원 한도는 얼마인가요?"
response = qa_chain.run(query)
print(response)
```

---

### Chapter Summary
*   **Knowledge base**: AI가 참고할 수 있는 외부 데이터 저장소로, 텍스트의 의미를 수치화한 **Vector(벡터)** 형태로 변환(Embedding)하여 저장합니다.
*   **RAG (Retrieval-Augmented Generation)**: AI가 답변을 생성(Generation)하기 전에 Vector DB에서 관련 정보를 먼저 검색(Retrieval)하여 답변의 정확성을 극대화하는 기술입니다.
*   **데이터 보안**: 엔터프라이즈 환경에서는 RAG 검색 단계에서 사용자의 **권한 관리(Access Control)**를 엄격하게 적용하여 정보 유출을 방지해야 합니다.
