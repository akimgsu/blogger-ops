# Phase 2: 모델 최적화 및 안전성 (Optimization & Alignment)

기본적인 LLM을 이해했다면, 이제 기존 모델을 특정 목적에 맞게 튜닝하고, 보안 및 윤리적 기준에 맞게 동작하도록 제어하는 단계를 알아봅니다. 이 과정은 범용 AI를 엔터프라이즈급 실무에 투입하거나, 시스템의 신뢰성을 높이기 위한 핵심 과정입니다.

## 1. Fine tuning (파인 튜닝, 미세 조정)

Fine tuning은 이미 방대한 데이터로 사전 학습된(Pre-trained) 모델에 특정 도메인(예: 코드 작성, 법률 상담, 고객 CS 등)의 특화된 데이터를 추가로 학습시켜 모델의 내부 가중치(Weights)를 미세하게 변경하는 방법입니다.

기본 모델이 "말을 잘하는 사람"이라면, 파인 튜닝은 이 사람에게 "의학 전문 지식"을 집중적으로 가르쳐 "의사"로 만드는 과정과 같습니다.

### 효율적인 파인 튜닝: PEFT와 LoRA
LLM은 파라미터(Parameter) 크기가 워낙 크기 때문에, 전체를 다시 학습시키는 Full Fine-tuning은 막대한 컴퓨팅 비용이 듭니다. 이를 해결하기 위해 **PEFT (Parameter-Efficient Fine-Tuning)** 기법이 등장했습니다.

그중 가장 널리 쓰이는 것이 **LoRA (Low-Rank Adaptation)** 입니다. 모델의 기존 가중치는 그대로 고정(Freeze)한 채, 매우 적은 수의 가중치 행렬만 추가로 학습시켜 모델의 성능을 극대화하면서도 메모리와 비용을 획기적으로 줄이는 기술입니다.

```python
# Hugging Face PEFT/LoRA를 활용한 가상의 파인 튜닝 설정 예시
from peft import LoraConfig, get_peft_model
from transformers import AutoModelForCausalLM

# 모델 로드 (가중치 고정)
model = AutoModelForCausalLM.from_pretrained("base-model-name")

# LoRA 설정
lora_config = LoraConfig(
    r=8, 
    lora_alpha=32, 
    target_modules=["q_proj", "v_proj"],
    lora_dropout=0.05,
    bias="none",
    task_type="CAUSAL_LM"
)

# 모델에 LoRA 어댑터 장착
peft_model = get_peft_model(model, lora_config)
# 이후 특정 도메인 데이터로 학습 진행...
```

## 2. RLHF (Reinforcement Learning from Human Feedback)

RLHF는 인간의 피드백을 통해 모델의 답변을 강화 학습(Reinforcement Learning)시키는 기법입니다. 단순히 지식을 주입하는 파인 튜닝과 달리, 모델이 **인간의 선호도와 윤리적 기준**에 맞게 행동하도록 교정하는 과정입니다.

### Alignment(정렬)와 보안
RLHF는 AI가 유해하거나 편향된 답변, 혹은 차별적인 발언을 피하고 사용자 의도에 정확히 부합(Alignment)하도록 만드는 데 필수적입니다. ChatGPT가 처음 나왔을 때 사람들이 충격받을 만큼 "자연스럽고 친절하게" 대답할 수 있었던 이유가 바로 이 RLHF 덕분입니다.

또한 시스템 보안 관점에서도 프롬프트 인젝션(Prompt Injection)이나 탈옥(Jailbreak) 시도에 방어적으로 대응하도록 모델을 훈련시키는 핵심 기술이기도 합니다.

### 작동 방식 요약
1. 모델이 여러 개의 답변을 생성합니다.
2. 인간 평가자가 어떤 답변이 더 유용하고 안전한지 순위를 매깁니다(Human Feedback).
3. 이 순위 데이터를 바탕으로 '보상 모델(Reward Model)'을 학습시킵니다.
4. 보상 모델의 점수를 극대화하는 방향으로 본 모델을 강화 학습(PPO 알고리즘 등 활용) 시킵니다.

---

### Chapter Summary
*   **Fine tuning**: 사전 학습된 거대 모델에 특정 도메인 지식을 주입하여 전문성을 높이는 과정이며, **LoRA** 같은 기법으로 적은 비용으로도 효율적인 학습이 가능합니다.
*   **RLHF**: 인간의 평가와 피드백을 통해 모델을 강화 학습시키는 기법으로, 답변의 품질을 높일 뿐만 아니라 유해성을 차단하는 **Alignment(정렬)**의 핵심입니다.
*   **보안과 신뢰성**: 위 두 기술은 단순한 장난감 AI를 넘어 실제 비즈니스에 투입할 수 있는 안전하고 신뢰성 높은 AI를 구축하는 필수 관문입니다.
