# 핵심 요약: 01. React Native란 무엇인가?

- **React와 React Native의 차이**
  - **React (웹)**: HTML, CSS, DOM을 사용하여 브라우저에서 렌더링.
  - **React Native (앱)**: 브라우저가 아닌 모바일 기기의 네이티브 UI 요소(`UIView`, `View`)로 매핑하여 렌더링.
  
- **Bridge (브릿지) 아키텍처**
  - JavaScript Thread와 Native Thread 간의 소통 창구.
  - 💡 **비유**: 한국어(JS) 지시를 영어(iOS)/스페인어(Android)로 번역해 주는 **통역사**.

- **개발 환경 세팅 (Expo vs CLI)**
  - **Expo**: 네이티브 설정 없이 JS/TS만으로 빠르게 개발 가능 (초보자 권장).
  - **RN CLI**: 네이티브 모듈 직접 제어 및 커스텀 필요 시 사용.

- **Hello World 실습**
  - `npx create-expo-app 앱이름` 명령어로 프로젝트 생성 후 `npx expo start`로 실행.
