# 02. 기본 컴포넌트의 이해 (View, Text, TextInput)

React Native(RN) 세계에 오신 것을 환영합니다! 앞서 우리는 RN이 어떻게 JavaScript 코드를 네이티브 앱으로 변환하는지 알아보았습니다. 이번 시간에는 앱 화면을 구성하는 가장 기본적인 뼈대인 **기본 컴포넌트(Core Components)**에 대해 자세히 알아보겠습니다.

## 1. HTML 태그를 그대로 쓸 수 없는 이유

웹 개발에 익숙하신 분들은 `<div>`로 구역을 나누고, `<span>`이나 `<p>`로 글자를 쓰고, `<input>`으로 사용자의 입력을 받는 것에 익숙하실 겁니다. 하지만 React Native에서는 **이러한 HTML 태그들을 사용할 수 없습니다.** 

왜 그럴까요? 앞선 모듈에서 배웠듯이, RN은 브라우저를 띄우는 것이 아니라 모바일 기기의 순수 네이티브 UI로 매핑되기 때문입니다. 즉, 브라우저가 해석하는 HTML 언어 대신, iOS와 Android가 이해할 수 있는 "전용 컴포넌트"를 사용해야 합니다.

> 💡 **핵심 비유: "규격화된 레고 블록"**
> 웹 개발이 빈 도화지에 자유롭게 그림을 그리는 것이라면, 모바일 앱 개발은 정해진 규격의 **레고 블록**을 조립하는 것과 같습니다. RN은 웹 태그 대신 모바일에 딱 맞는 전용 레고 블록(기본 컴포넌트)들을 제공합니다.

## 2. RN 기본 컴포넌트 매핑 가이드

웹에서 사용하던 태그들이 RN에서는 어떤 컴포넌트로 대체되는지 표로 확인해 보겠습니다.

| 웹 (HTML) | React Native | 역할 | 네이티브 매핑 (iOS / Android) |
| :--- | :--- | :--- | :--- |
| `<div>` | **`<View>`** | UI를 감싸는 컨테이너, 레이아웃 구성 | `UIView` / `ViewGroup` |
| `<p>`, `<span>` | **`<Text>`** | 텍스트를 화면에 표시 | `UITextView` / `TextView` |
| `<input>` | **`<TextInput>`** | 사용자의 텍스트 입력 받기 | `UITextField` / `EditText` |
| `<img>` | **`<Image>`** | 이미지 표시 | `UIImageView` / `ImageView` |
| `<button>` | **`<Button>`**, `<TouchableOpacity>` | 클릭/터치 이벤트 처리 | `UIButton` / `Button` |

### 핵심 컴포넌트 자세히 보기

1. **`<View>`**: 가장 기본이 되는 블록입니다. 다른 컴포넌트들을 담는 상자 역할을 하며, CSS의 flexbox를 이용해 레이아웃을 잡을 때 필수적입니다.
2. **`<Text>`**: RN에서는 모든 문자열을 반드시 `<Text>` 컴포넌트 안에 넣어야 합니다. `<View>` 안에 그냥 글씨를 쓰면 에러가 발생합니다!
3. **`<TextInput>`**: 비밀번호, 검색어 등 사용자의 입력을 받을 때 사용합니다.

## 3. 실습: 프로필 카드 UI 화면 퍼블리싱

배운 내용을 바탕으로 간단한 프로필 카드 UI를 만들어 보겠습니다.

```javascript
import React from 'react';
import { View, Text, TextInput, Image, StyleSheet, TouchableOpacity } from 'react-native';

export default function ProfileCard() {
  return (
    <View style={styles.container}>
      {/* 프로필 이미지 (임시 URL 사용) */}
      <Image 
        source={{ uri: 'https://via.placeholder.com/100' }} 
        style={styles.profileImage} 
      />
      
      {/* 사용자 이름 및 상태 표시 (Text 컴포넌트 사용) */}
      <Text style={styles.name}>개발자 김코딩</Text>
      <Text style={styles.bio}>React Native 정복 중! 🚀</Text>

      {/* 상태 메시지 업데이트 영역 (TextInput 사용) */}
      <TextInput 
        style={styles.input} 
        placeholder="상태 메시지를 업데이트 하세요." 
      />

      {/* 버튼 영역 (TouchableOpacity 사용) */}
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>저장하기</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    alignItems: 'center',
    margin: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  bio: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  }
});
```

위 코드를 실행해보면 `<View>`로 틀을 잡고, `<Image>`로 사진을 넣고, `<Text>`로 글씨를 쓰며, `<TextInput>`으로 입력창을 만든 번듯한 프로필 카드가 화면에 나타납니다.

---

### Chapter Summary
- **HTML 사용 불가**: RN은 네이티브 앱을 만들기 때문에 웹용 마크업인 HTML(`<div>`, `<span>` 등)을 사용할 수 없습니다.
- **기본 컴포넌트 매핑**: `<div>`는 `<View>`로, 텍스트는 `<Text>`로, 입력창은 `<TextInput>`으로 대체하여 사용합니다.
- **모바일 맞춤형 조립**: 제공되는 "규격화된 레고 블록"들을 활용해 모바일 환경에 최적화된 네이티브 UI를 안전하게 구축할 수 있습니다.
