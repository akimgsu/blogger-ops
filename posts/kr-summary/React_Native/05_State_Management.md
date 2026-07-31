# 핵심 요약: 05. 상태 관리 (State와 useState)

- **Props vs State**
  - **Props**: 부모가 내려주는 '변하지 않는' 데이터 (유전자).
  - **State**: 컴포넌트 자신이 스스로 바꾸고 관리하는 '변하는' 데이터.

- **State의 핵심 역할 (Re-rendering)**
  - 일반 변수는 값이 바뀌어도 화면이 그대로임.
  - State 값이 변경되면 React가 이를 감지하여 화면을 즉각적으로 **다시 그림(Re-rendering)**.
  - 💡 **비유**: 주변 환경이나 자신의 기분에 따라 스스로 피부색(UI)을 바꾸는 **"카멜레온"**.

- **`useState` 사용법**
  - 문법: `const [state변수, setState함수] = useState(초깃값);`
  - 주의: 값을 변경할 때는 반드시 두 번째 인자인 `setState함수` (예: `setCount(새로운값)`)를 사용해야만 화면이 업데이트됨.

- **실습 포인트**
  - `<TouchableOpacity onPress={() => setCount(count + 1)}>` : 버튼 클릭 이벤트로 State 변경.
  - `<TextInput onChangeText={(text) => setText(text)}>` : 키보드 입력 시마다 실시간으로 State 변경 후 화면에 반영.
