# 03. 모바일 레이아웃과 Flexbox (StyleSheet)

React Native에서 UI를 배치하고 꾸미려면 레이아웃 시스템을 완벽하게 이해해야 합니다. 오늘은 모바일 앱 화면 구성의 핵심인 **Flexbox**와 **StyleSheet**에 대해 알아보겠습니다.

## 1. CSS와 RN StyleSheet의 차이점

웹 개발에서는 CSS(Cascading Style Sheets)를 사용하여 스타일을 지정합니다. React Native에서도 비슷한 방식을 사용하지만, CSS 코드를 그대로 가져와 쓸 수는 없으며 JavaScript 객체 형태로 스타일을 정의하는 **StyleSheet API**를 사용합니다.

주요 차이점은 다음과 같습니다:
- **CamelCase 사용**: CSS에서 `background-color`라고 쓰던 것을 RN에서는 `backgroundColor`로 작성합니다. (하이픈 `-` 대신 대문자 사용)
- **단위 생략**: 대부분의 크기(width, height, padding 등)는 기본적으로 단위(px 등)를 생략한 숫자로 입력합니다. 이 숫자는 모바일 화면의 밀도 독립적 픽셀(dp)로 자동 변환됩니다.
- **StyleSheet.create()**: 스타일 객체를 캐싱하여 렌더링 성능을 높여주는 내장 메서드를 사용합니다.

## 2. 모바일 환경 필수 요소: Flexbox

모바일 기기는 크기가 천차만별입니다. 작은 스마트폰부터 넓은 태블릿까지, 모든 화면에서 UI가 깨지지 않고 잘 보여야 합니다. 이를 해결해 주는 것이 바로 **Flexbox(플렉스박스)**입니다.

> 💡 **핵심 비유: "도시락 통의 칸막이"**
> 고정된 픽셀로 크기를 박아두는 것이 아닙니다. Flexbox는 화면 크기에 맞춰 고무줄처럼 부드럽게 늘어나고 줄어들며 공간의 비율을 자동으로 맞춰주는 유연한 **도시락 반찬통**과 같습니다.

### RN Flexbox의 기본 방향 (Column)
웹 CSS에서 Flexbox의 기본 방향(`flex-direction`)은 가로(`row`)입니다. 하지만 **React Native에서는 기본 방향이 세로(`column`)입니다.** 
왜냐하면 우리가 사용하는 스마트폰 화면이 세로로 길기 때문에, 위에서 아래로 요소를 쌓아 내려가는 것이 모바일 UI의 가장 자연스러운 흐름이기 때문입니다.

### 핵심 Flexbox 속성 3가지
1. **`flex`**: 공간을 차지하는 비율을 결정합니다. `flex: 1`을 주면 남은 공간을 모두 차지합니다.
2. **`justifyContent`**: 주 축(Primary Axis)을 기준으로 요소를 어떻게 정렬할지 결정합니다. (예: `center`, `space-between`)
3. **`alignItems`**: 교차 축(Cross Axis)을 기준으로 요소를 어떻게 정렬할지 결정합니다.

## 3. 실습: 인스타그램 피드 형태의 반응형 UI 레이아웃 구축

Flexbox를 활용하여 상단 헤더, 이미지 영역, 하단 액션 버튼이 있는 인스타그램 스타일의 피드 레이아웃을 만들어 봅시다.

```javascript
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

export default function FeedPost() {
  return (
    <View style={styles.cardContainer}>
      
      {/* 1. 상단 헤더 영역 (가로 배치) */}
      <View style={styles.header}>
        <Image source={{ uri: 'https://via.placeholder.com/40' }} style={styles.avatar} />
        <Text style={styles.username}>react_native_master</Text>
      </View>

      {/* 2. 메인 이미지 영역 */}
      <Image source={{ uri: 'https://via.placeholder.com/400' }} style={styles.mainImage} />

      {/* 3. 하단 액션 버튼 영역 (가로 배치) */}
      <View style={styles.actions}>
        <Text style={styles.icon}>❤️</Text>
        <Text style={styles.icon}>💬</Text>
        <Text style={styles.icon}>✈️</Text>
      </View>
      
      <Text style={styles.likes}>좋아요 1,024개</Text>
      
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    flex: 1, // 전체 공간 사용
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row', // 가로 방향 정렬 (기본값 column을 row로 변경)
    alignItems: 'center', // 세로 기준 가운데 정렬
    padding: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10, // 아바타와 이름 사이 간격
  },
  username: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  mainImage: {
    width: '100%',
    height: 400, // 고정 높이를 주거나 비율(aspectRatio)을 사용할 수 있음
  },
  actions: {
    flexDirection: 'row', // 액션 버튼들을 가로로 나열
    padding: 10,
  },
  icon: {
    fontSize: 24,
    marginRight: 15, // 버튼 사이 간격
  },
  likes: {
    fontWeight: 'bold',
    paddingHorizontal: 10,
    marginBottom: 10,
  }
});
```

`flexDirection: 'row'`를 사용하여 프로필 사진과 이름을 가로로 묶고, 좋아요 아이콘들을 가로로 묶은 것을 볼 수 있습니다. 메인 컨테이너는 기본값인 `column`을 유지하여 위에서 아래로 차곡차곡 쌓이게 만들었습니다.

---

### Chapter Summary
- **StyleSheet 사용**: CSS 문법과 유사하나 카멜케이스(CamelCase)를 사용하며 단위 없이 숫자를 입력합니다.
- **모바일 맞춤 Flexbox**: 다양한 화면 크기에 대응하기 위해 고무줄처럼 늘어나는 Flexbox 레이아웃을 사용합니다.
- **기본 축은 Column**: 모바일 화면의 특성상 위에서 아래로 쌓이는 세로 방향(`column`)이 기본값이며, 가로 배치가 필요할 때만 `flexDirection: 'row'`로 변경합니다.
