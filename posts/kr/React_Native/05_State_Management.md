# 05. 상태 관리 (State와 useState)

이전 시간에 배운 **Props**가 부모로부터 물려받아 '변하지 않는' 데이터라면, 오늘 배울 **State(상태)**는 컴포넌트 내부에서 '스스로 변할 수 있는' 데이터입니다. 앱이 사용자와 상호작용하기 위해 반드시 알아야 하는 핵심 개념, State와 `useState` 훅(Hook)에 대해 알아보겠습니다.

## 1. State란 무엇이며 왜 필요한가?

**State**는 컴포넌트가 자체적으로 보유하고 관리하는 데이터입니다. 
앱을 사용하다 보면 숫자가 올라가거나, 텍스트가 입력되거나, 체크박스가 켜고 꺼지는 등 화면에 보이는 데이터가 계속 변합니다. 일반적인 변수(`let count = 0;`)의 값을 변경하면 화면이 알아서 업데이트될까요? **아닙니다.** React는 일반 변수의 값이 바뀌어도 화면을 다시 그리지 않습니다.

화면을 다시 그리게(Re-rendering) 만들려면, 이 값이 변했다는 것을 React에게 알려주어야 하는데, 그 역할을 하는 것이 바로 **State**입니다. State 값이 변경되면 React는 변경된 값을 바탕으로 화면을 즉각적으로 새롭게 업데이트합니다.

> 💡 **핵심 비유: "카멜레온의 기분"**
> Props가 물려받은 'DNA'라면, State는 카멜레온의 **'기분'**과 같습니다. 카멜레온은 주변 환경이나 자신의 기분에 따라 스스로 실시간으로 피부 색깔(UI)을 바꿉니다. 컴포넌트도 자신의 State(기분)가 바뀌면 스스로 화면(색깔)을 바꿉니다.

## 2. useState 훅(Hook) 사용법

React Native에서 State를 만들기 위해서는 React에서 제공하는 `useState`라는 함수(Hook)를 사용합니다.

```javascript
import React, { useState } from 'react';

// 구조 분해 할당을 통해 값을 꺼냅니다.
const [count, setCount] = useState(0); 
```

- **`useState(0)`**: 소괄호 안의 `0`은 State의 **초깃값**입니다.
- **`count`**: 현재 State 값을 담고 있는 **변수**입니다.
- **`setCount`**: State 값을 변경할 때 사용하는 **함수**입니다. (반드시 이 함수를 통해 값을 변경해야 화면이 업데이트됩니다!)

## 3. 실습: 숫자 카운터 및 실시간 텍스트 미니 앱

State를 활용하여 버튼을 누르면 숫자가 올라가고, 글씨를 입력하면 즉시 화면에 나타나는 미니 앱을 만들어 보겠습니다.

```javascript
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

export default function StateApp() {
  // 1. 숫자를 관리하는 State (초깃값: 0)
  const [count, setCount] = useState(0);
  
  // 2. 입력된 텍스트를 관리하는 State (초깃값: 빈 문자열)
  const [text, setText] = useState('');

  return (
    <View style={styles.container}>
      
      {/* 카운터 영역 */}
      <View style={styles.section}>
        <Text style={styles.title}>숫자 카운터</Text>
        <Text style={styles.countText}>{count}</Text>
        
        {/* setCount를 통해 count 값을 1 증가시킵니다. */}
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => setCount(count + 1)}
        >
          <Text style={styles.buttonText}>+ 1 증가</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      {/* 텍스트 입력 영역 */}
      <View style={styles.section}>
        <Text style={styles.title}>실시간 텍스트 미러링</Text>
        
        {/* 사용자가 글자를 입력할 때마다 onChangeText가 실행되어 text State를 업데이트합니다. */}
        <TextInput 
          style={styles.input} 
          placeholder="여기에 글자를 입력해보세요."
          onChangeText={(inputText) => setText(inputText)} 
        />
        
        {/* text State 값이 바뀔 때마다 즉시 화면에 다시 그려집니다. */}
        <Text style={styles.mirrorText}>입력된 값: {text}</Text>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  section: {
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  countText: {
    fontSize: 40,
    color: '#007AFF',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 30,
  },
  input: {
    width: '100%',
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  mirrorText: {
    fontSize: 16,
    color: '#555',
  }
});
```

위 코드를 실행하면, 버튼을 누를 때마다 화면의 숫자가 올라가고, 키보드로 글자를 칠 때마다 하단 텍스트가 실시간으로 변경되는 것을 확인할 수 있습니다. 이것이 바로 State를 이용한 화면 업데이트(Re-rendering)의 힘입니다!

---

### Chapter Summary
- **State란**: 컴포넌트 내부에서 스스로 관리하고 변경할 수 있는 동적인 데이터입니다.
- **Re-rendering(리렌더링)**: 일반 변수와 달리, State 값이 변경(`setState`)되면 React는 이를 감지하고 화면을 새롭게 다시 그립니다.
- **useState 훅**: `const [값 변수, 변경 함수] = useState(초깃값);` 형태로 사용하며, 변경 함수를 통해서만 안전하게 값을 업데이트할 수 있습니다.
