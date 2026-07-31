# 06. 부수 효과와 생명주기 (useEffect)

React Native 앱을 만들다 보면 단순히 화면을 그리는 것 외에 다른 작업들이 필요해집니다. 앱이 켜지자마자 서버에서 데이터를 가져오거나(API 호출), 타이머를 작동시키거나, 기기의 위치 정보를 추적하는 일들이죠. 이렇게 렌더링 외의 작업들을 **부수 효과(Side Effect)**라고 부르며, 이를 관리하는 핵심 훅(Hook)이 바로 `useEffect`입니다.

## 1. 컴포넌트의 생명주기 (Lifecycle)

모든 React 컴포넌트는 사람처럼 생명주기를 가집니다.
1. **Mount (탄생)**: 컴포넌트가 처음 화면에 나타날 때
2. **Update (성장/변화)**: State나 Props가 변경되어 화면이 다시 그려질 때
3. **Unmount (죽음/소멸)**: 컴포넌트가 화면에서 완전히 사라질 때

`useEffect`는 이 세 가지 시점에 우리가 원하는 특정 코드를 실행할 수 있게 해줍니다.

> 💡 **핵심 비유: "직원의 출퇴근 기록부"**
> 컴포넌트를 회사 직원이라고 생각해 봅시다.
> - **Mount (출근)**: 아침에 출근하면 컴퓨터를 켜고 이메일을 확인합니다. (초기 데이터 불러오기)
> - **Update (근무 중)**: 상사가 새로운 지시(State 변경)를 내리면 하던 일을 수정합니다.
> - **Unmount (퇴근)**: 퇴근할 때는 반드시 컴퓨터를 끄고 자리를 정리(Clean-up)해야 합니다. 그렇지 않으면 전기 요금이 계속 나가겠죠! (메모리 누수 방지)

## 2. useEffect 사용법과 의존성 배열 (Dependency Array)

`useEffect`는 두 개의 인자를 받습니다. 첫 번째는 **실행할 함수**, 두 번째는 **의존성 배열(Dependency Array)**입니다.

```javascript
import React, { useEffect, useState } from 'react';

useEffect(() => {
  // 실행할 작업 (Side Effect)
  console.log('컴포넌트가 렌더링되었습니다!');

  return () => {
    // 정리 작업 (Clean-up) - Unmount 되거나 다음 Effect가 실행되기 직전에 호출됨
    console.log('정리(Clean-up) 완료!');
  };
}, [의존성 배열]);
```

### 의존성 배열에 따른 3가지 실행 조건
1. **`[]` (빈 배열)**: 컴포넌트가 **처음 나타날 때(Mount) 딱 한 번만** 실행됩니다. (예: 초기 API 데이터 로딩)
2. **`[state1, state2]`**: 배열 안에 넣은 **특정 State나 Props가 바뀔 때마다** 실행됩니다.
3. **배열 생략**: 컴포넌트가 렌더링 될 때마다 **매번** 실행됩니다. (성능 저하의 원인이 될 수 있어 거의 쓰지 않습니다.)

## 3. 실습: 화면이 켜지면 시작되고, 닫히면 멈추는 스톱워치

`useEffect`를 사용하여 화면에 렌더링되면 1초마다 숫자가 올라가고, 화면에서 사라질 때 타이머를 정리하는 스톱워치를 만들어 보겠습니다.

```javascript
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

// 1. 스톱워치 컴포넌트
function Stopwatch() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    // Mount 시 타이머 시작 (출근)
    console.log('스톱워치 시작!');
    const interval = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);

    // Unmount 시 타이머 정리 (퇴근)
    return () => {
      console.log('스톱워치 정지 및 정리!');
      clearInterval(interval);
    };
  }, []); // 빈 배열이므로 처음 렌더링 시 한 번만 Effect 실행

  return (
    <View style={styles.stopwatchContainer}>
      <Text style={styles.timeText}>{seconds} 초</Text>
    </View>
  );
}

// 2. 부모 컴포넌트 (스톱워치를 껐다 켰다 하는 역할)
export default function App() {
  const [showStopwatch, setShowStopwatch] = useState(true);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>useEffect 생명주기 테스트</Text>
      
      {/* showStopwatch가 true일 때만 Stopwatch 컴포넌트 렌더링 (Mount) */}
      {showStopwatch && <Stopwatch />}

      <Button 
        title={showStopwatch ? '스톱워치 끄기(Unmount)' : '스톱워치 켜기(Mount)'} 
        onPress={() => setShowStopwatch(!showStopwatch)} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  stopwatchContainer: {
    padding: 20,
    backgroundColor: '#e3f2fd',
    borderRadius: 10,
    marginBottom: 20,
  },
  timeText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#1565c0',
  }
});
```

'스톱워치 끄기' 버튼을 누르면 `<Stopwatch />` 컴포넌트가 화면에서 제거(Unmount)되면서 `return () => clearInterval(interval);` 부분이 실행됩니다. 덕분에 보이지 않는 곳에서 타이머가 계속 돌아가 메모리를 낭비하는 일(메모리 누수)을 막을 수 있습니다.

---

### Chapter Summary
- **생명주기(Lifecycle)**: 컴포넌트가 화면에 나타나고(Mount), 업데이트되고(Update), 사라지는(Unmount) 과정.
- **useEffect 훅**: UI 렌더링 외의 부수 효과(타이머, API 호출 등)를 처리할 때 사용합니다.
- **의존성 배열(Dependency Array)**: 빈 배열 `[]`을 넣으면 처음 한 번만 실행되며, 배열 안의 값을 넣으면 해당 값이 변할 때마다 실행됩니다.
- **Clean-up 함수**: `useEffect` 내에서 `return`하는 함수로, 컴포넌트가 사라지거나 Effect가 다시 실행되기 직전에 호출되어 자원 낭비를 막습니다 (퇴근 시 자리 정리).
