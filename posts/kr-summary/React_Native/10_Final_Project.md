# 핵심 요약: 10. 종합 프로젝트 완성 및 배포 기초

- **배운 개념의 총동원 (오케스트라 합주)**
  - UI 레이아웃 (`View`, `Text`, Flexbox)
  - 상호작용 및 데이터 관리 (`useState`, Props)
  - 생명주기 및 API 통신 (`useEffect`, `fetch`)
  - 대용량 데이터 최적화 (`FlatList`)
  - 💡 **핵심 비유**: 개별적으로 연습한 악기들을 하나의 악보(앱 기획)에 맞춰 조화롭게 연주하는 **"오케스트라 합주"**.

- **실습 포인트 (Weather Todo 앱)**
  - `useEffect`로 진입 시 1회 날씨 로딩.
  - `TextInput`과 `useState`로 할 일 항목 추가 및 삭제 로직 구현.
  - 배열로 저장된 할 일 목록을 `FlatList`를 통해 화면에 스크롤 리스트로 출력.

- **앱 배포(Build) 기초 과정 (Expo 기준)**
  1. `app.json`에서 앱 이름, 버전, 앱 아이콘(`icon`), 스플래시 이미지 세팅.
  2. `eas-cli` 도구 설치 및 로그인 (`eas login`).
  3. `eas build -p android` 또는 `eas build -p ios` 명령어로 스토어 등록용 파일(AAB, IPA) 클라우드 빌드 진행.
