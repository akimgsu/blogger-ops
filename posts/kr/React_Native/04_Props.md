# 04. 데이터 전달하기 (Props)

지금까지 우리는 컴포넌트를 만들고 UI를 배치하는 방법을 배웠습니다. 하지만 앱이 동작하려면 데이터가 필요하겠죠? 오늘은 컴포넌트 간에 데이터를 주고받는 핵심 개념인 **Props(프롭스)**에 대해 알아보겠습니다.

## 1. Props란 무엇인가?

**Props**는 'Properties'의 줄임말로, 컴포넌트의 속성을 의미합니다. 좀 더 쉽게 말해, **부모 컴포넌트가 자식 컴포넌트에게 전달하는 데이터**입니다.

앱의 규모가 커지면 화면을 여러 개의 작은 컴포넌트로 쪼개어 개발하게 됩니다. 이때 하나의 컴포넌트에서 다른 컴포넌트로 데이터를 넘겨주어야 할 상황이 반드시 발생하는데, 이때 사용하는 것이 바로 Props입니다.

### 단방향 데이터 흐름
React와 React Native의 아주 중요한 원칙 중 하나는 **"데이터는 위에서 아래로 흐른다"**는 것입니다. 부모에서 자식으로만 Props를 전달할 수 있으며, 자식이 부모의 데이터를 직접 변경할 수는 없습니다. 이를 단방향 데이터 바인딩이라고 합니다.

> 💡 **핵심 비유: "유전자(DNA)"**
> Props는 부모가 자식에게 물려주는 **유전자(DNA)**와 같습니다. 자식은 부모로부터 눈동자 색이나 머리카락 색(데이터)을 물려받아 그대로 띄울 수는 있지만, 자식 스스로 물려받은 유전자를 마음대로 바꿀 수는 없는 것과 같은 이치입니다.

## 2. 왜 Props를 사용할까? (컴포넌트 재사용성 극대화)

Props를 사용하는 가장 큰 이유는 **컴포넌트의 재사용성**을 높이기 위해서입니다.

만약 '확인', '취소', '제출' 버튼이 필요할 때마다 버튼 컴포넌트를 3개씩 새로 만든다면 비효율적이겠죠? 
대신, 뼈대가 되는 버튼 컴포넌트를 딱 1개만 만들어 두고, **Props를 통해 색상이나 텍스트만 다르게 전달**하면 코드를 훨씬 깔끔하고 효율적으로 작성할 수 있습니다.

## 3. 실습: 재사용 가능한 커스텀 버튼 컴포넌트 만들기

하나의 버튼 컴포넌트를 만들고, 부모 컴포넌트에서 Props를 다르게 주어 여러 개의 버튼으로 재사용해 봅시다.

### 자식 컴포넌트 (CustomButton.js)
```javascript
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

// 매개변수로 props 객체를 받습니다. (구조 분해 할당 사용)
export default function CustomButton({ title, bgColor }) {
  return (
    <TouchableOpacity style={[styles.button, { backgroundColor: bgColor }]}>
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  }
});
```

### 부모 컴포넌트 (App.js)
```javascript
import React from 'react';
import { View, StyleSheet } from 'react-native';
import CustomButton from './CustomButton';

export default function App() {
  return (
    <View style={styles.container}>
      {/* 
        자식 컴포넌트(CustomButton)를 호출하며 
        title과 bgColor라는 Props를 전달합니다. 
      */}
      <CustomButton title="확인" bgColor="#007AFF" />
      <CustomButton title="취소" bgColor="#FF3B30" />
      <CustomButton title="제출하기" bgColor="#34C759" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
});
```

위의 실습을 통해 우리는 버튼 컴포넌트 구조를 단 하나만 작성하고도, 부모 컴포넌트에서 내려주는 Props(`title`, `bgColor`) 값에 따라 전혀 다른 모습의 버튼 3개를 만들어 냈습니다!

---

### Chapter Summary
- **Props의 정의**: 부모 컴포넌트에서 자식 컴포넌트로 전달되는 데이터입니다.
- **단방향 흐름**: 데이터는 위에서 아래로만 흐르며, 자식 컴포넌트는 전달받은 Props를 읽을 수만 있고 직접 수정할 수 없습니다 (유전자 비유).
- **재사용성**: UI 구조는 동일하되 데이터만 다른 여러 요소를 만들 때, 컴포넌트를 하나만 짠 뒤 Props만 다르게 주어 재사용성을 극대화합니다.
