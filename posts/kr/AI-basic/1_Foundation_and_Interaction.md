# Phase 1: AI의 기초와 상호작용 (Foundation & Interaction)

가장 먼저 AI 모델이 어떻게 구성되고, 우리가 어떻게 의도한 결과를 끌어낼 수 있는지 이해하는 단계입니다. API를 통해 모델을 호출하고 테스트하는 과정이 주를 이룹니다. 이 장에서는 현대 AI의 근간을 이루는 세 가지 핵심 요소인 LLM, 프롬프트 엔지니어링, 멀티모달에 대해 알아봅니다.

## 1. LLM (Large Language Model, 대형 언어 모델)

LLM은 텍스트를 이해하고 생성하는 AI의 '뇌' 역할을 합니다. 수많은 텍스트 데이터를 학습하여 다음에 올 단어(엄밀히 말하면 토큰, Token)를 확률적으로 예측하는 원리로 작동합니다.

### 핵심 개념: 트랜스포머(Transformer) 아키텍처와 토큰 예측
현재 대부분의 LLM은 **트랜스포머(Transformer)**라는 아키텍처를 기반으로 합니다. 트랜스포머의 핵심은 **어텐션 메커니즘(Attention Mechanism)**으로, 문장 내의 모든 단어가 서로 어떤 연관성을 가지는지 동시에 파악합니다.

*   **Token (토큰)**: AI가 텍스트를 인식하는 최소 단위입니다. 하나의 단어일 수도 있고, 단어의 일부(sub-word)일 수도 있습니다.
*   **Next-token Prediction (다음 토큰 예측)**: 주어진 문맥(Context)을 바탕으로, 가장 통계적으로 적합한 다음 토큰을 생성해 내는 과정입니다.

```python
# OpenAI API를 활용한 기본적인 LLM 호출 예시
import openai

# API 키 설정
openai.api_key = "your-api-key-here"

response = openai.chat.completions.create(
  model="gpt-4",
  messages=[
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": "What is a Large Language Model?"}
  ]
)

print(response.choices[0].message.content)
```

## 2. Prompt Engineering (프롬프트 엔지니어링)

프롬프트 엔지니어링은 LLM에게 정확한 지시(Prompt)를 내려 원하는 결과를 얻는 기술입니다. 모델이 엉뚱한 대답을 하는 환각(Hallucination) 현상을 줄이고, 복잡한 문제를 논리적으로 풀게 만드는 핵심 노하우입니다.

### 주요 기법

*   **Zero-shot Prompting**: 아무런 예시 없이 바로 질문하거나 지시하는 방식입니다.
*   **Few-shot Prompting**: 원하는 답변의 형태나 패턴을 2~3개 정도 예시로 먼저 보여준 뒤, 실제 질문을 던지는 방식입니다. 모델의 답변 정확도를 크게 높여줍니다.
*   **Chain-of-Thought (CoT)**: "Think step-by-step(단계별로 생각해봐)" 같은 문구를 추가하여, 모델이 중간 추론 과정을 거치도록 유도하는 방식입니다. 복잡한 수학 문제나 논리 문제에 효과적입니다.

```python
# Few-shot Prompting 예시
prompt = """
Word: Happy
Antonym: Sad

Word: Tall
Antonym: Short

Word: Abundant
Antonym:
"""
# 모델은 자연스럽게 'Scarce' 또는 'Lacking'을 예측하게 됩니다.
```

## 3. Multi-modal (멀티모달)

멀티모달은 AI가 텍스트뿐만 아니라 이미지, 오디오, 비디오 등 다양한 형태(Modality)의 데이터를 동시에 처리하고 이해할 수 있도록 하는 확장된 기술입니다.

마치 사람이 눈으로 보고, 귀로 듣고, 말로 표현하는 것처럼 AI도 여러 감각을 결합하여 더 풍부한 상호작용을 할 수 있게 됩니다. 이미지 캡셔닝, 음성을 텍스트로 변환 후 분석하는 등 다양한 응용이 가능합니다.

---

### Chapter Summary
*   **LLM**: 트랜스포머 아키텍처를 기반으로 하며, 어텐션 메커니즘을 통해 맥락을 파악하고 다음 토큰(Token)을 예측하는 AI의 뇌입니다.
*   **Prompt Engineering**: Zero-shot, Few-shot, Chain-of-Thought 기법 등을 통해 환각(Hallucination)을 줄이고 의도한 답변을 이끌어내는 모델 제어 기술입니다.
*   **Multi-modal**: 텍스트를 넘어 이미지, 비디오, 오디오 등 다양한 형태의 데이터를 융합하여 이해하고 처리하는 차세대 AI 확장성입니다.
