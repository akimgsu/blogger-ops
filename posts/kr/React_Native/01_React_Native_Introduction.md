# 01. React Native란 무엇인가? (React와의 차이)

안녕하세요! 오늘은 모바일 앱 개발의 세계로 들어가는 첫걸음, **React Native (이하 RN)**에 대해 알아보겠습니다. 웹 개발 경험이 있거나 React를 다뤄보신 분들에게 RN은 굉장히 매력적인 프레임워크입니다. 그렇다면 왜 RN을 사용할까요? 그리고 웹 환경의 React와는 어떤 차이점이 있을까요?

## 1. 웹 개발(React)과 모바일 앱(RN)의 렌더링 방식 차이

React는 브라우저 위에서 동작하며, HTML, CSS, JavaScript를 사용해 **DOM (Document Object Model)**을 조작하여 화면을 그립니다. 우리가 `<div>`, `<span>` 같은 태그를 사용하면 브라우저가 이를 해석하여 화면에 렌더링하는 방식이죠.

하지만 모바일 앱(iOS, Android)은 브라우저가 아닙니다. iOS는 Objective-C나 Swift로 작성된 `UIView`를, Android는 Java나 Kotlin으로 작성된 `View`를 사용하여 화면을 그립니다.

React Native는 바로 이 지점에서 마법을 부립니다. 우리가 작성한 JavaScript 코드를 네이티브 운영체제가 이해할 수 있는 네이티브 컴포넌트(`UIView`, `View`)로 매핑(Mapping)해주는 역할을 합니다.

## 2. React Native의 핵심 아키텍처: Bridge (브릿지)

JavaScript 코드가 어떻게 네이티브 요소로 변환될까요? RN의 핵심 아키텍처인 **Bridge(브릿지)** 덕분입니다.

Bridge는 JavaScript 코드가 실행되는 환경(JS Thread)과 네이티브 코드가 실행되는 환경(Native Thread) 사이에서 메시지를 주고받는 통로 역할을 합니다. 

> 💡 **핵심 비유: "통역사(Bridge)"**
> 한국어(JavaScript)로 지시하면, 통역사(Bridge)가 이를 영어(iOS)와 스페인어(Android)로 번역하여 현지 작업자(Native Thread)에게 명령을 내리는 구조와 같습니다.

우리가 JavaScript로 "여기에 버튼을 그려줘"라고 Bridge를 통해 메시지를 보내면, iOS는 `UIButton`을, Android는 `android.widget.Button`을 생성하여 화면에 띄우는 것이죠.

## 3. 실습: RN 개발 환경 세팅 (Expo vs CLI) 및 'Hello World' 앱 구동

React Native 앱을 시작하는 방법에는 크게 두 가지가 있습니다: **Expo CLI**와 **React Native CLI**.

- **Expo CLI**: 복잡한 네이티브 설정 없이 빠르게 앱 개발을 시작할 수 있도록 도와주는 툴체인입니다. 초보자에게 강력히 추천합니다.
- **React Native CLI**: 네이티브 코드(Java, Objective-C 등)를 직접 건드려야 하거나 커스텀 네이티브 모듈이 필요할 때 사용합니다.

### Expo를 이용한 'Hello World' 실습

1. **Expo 프로젝트 생성**
   터미널을 열고 아래 명령어를 입력합니다.
   ```bash
   npx create-expo-app HelloWorld
   cd HelloWorld
   ```

2. **앱 실행**
   ```bash
   npx expo start
   ```

3. **코드 수정하기**
   프로젝트 폴더 내의 `App.js` 파일을 열고 다음과 같이 수정해 보세요.

   ```javascript
   import { StatusBar } from 'expo-status-bar';
   import { StyleSheet, Text, View } from 'react-native';

   export default function App() {
     return (
       <View style={styles.container}>
         <Text>Hello World! 첫 React Native 앱입니다.</Text>
         <StatusBar style="auto" />
       </View>
     );
   }

   const styles = StyleSheet.create({
     container: {
       flex: 1,
       backgroundColor: '#fff',
       alignItems: 'center',
       justifyContent: 'center',
     },
   });
   ```
저장 후 Expo Go 앱(또는 시뮬레이터)을 확인하면 'Hello World!'가 화면에 나타나는 것을 볼 수 있습니다.

---

### Chapter Summary
- **React vs React Native**: React는 DOM을 조작하여 브라우저에 렌더링하지만, React Native는 네이티브 컴포넌트(iOS, Android)로 매핑하여 모바일 기기에 렌더링합니다.
- **Bridge 아키텍처**: JavaScript 환경과 Native 환경 사이를 연결해 주는 통역사 역할을 하며, 비동기적으로 메시지를 주고받습니다.
- **Expo vs CLI**: 빠른 시작과 편의성을 원한다면 Expo를, 네이티브 단의 세밀한 제어가 필요하다면 React Native CLI를 선택합니다.
