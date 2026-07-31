# 핵심 요약: 06. 부수 효과와 생명주기 (useEffect)

- **생명주기 (Lifecycle) 3단계**
  1. **Mount**: 화면에 처음 나타남.
  2. **Update**: State/Props 변경으로 리렌더링됨.
  3. **Unmount**: 화면에서 사라짐.

- **`useEffect`의 역할**
  - 데이터 통신(API), 타이머 등 화면 렌더링과 직접 관련 없는 **'부수 효과(Side Effect)'**를 실행하는 훅(Hook).
  - 💡 **핵심 비유**: 출근(Mount 시 세팅)하고, 근무하고(Update), 퇴근(Unmount 시 정리)하는 **"직원의 출퇴근 기록부"**.

- **의존성 배열 (Dependency Array)**
  - `useEffect(함수, [])`: **빈 배열**일 경우 Mount 시 딱 한 번만 실행 (초기 세팅용).
  - `useEffect(함수, [상태값])`: 배열 안의 **상태값이 변할 때마다** 다시 실행.

- **Clean-up 함수 (정리 작업)**
  - `useEffect` 안에서 `return () => { ... }` 형태로 작성.
  - 컴포넌트가 **Unmount(소멸)** 되거나 다음 Effect가 덮어쓰기 직전에 실행됨.
  - 타이머를 끄거나(clearInterval) 이벤트 리스너를 지워 메모리 누수를 방지하는 퇴근 전 **"자리 정리"** 역할.
