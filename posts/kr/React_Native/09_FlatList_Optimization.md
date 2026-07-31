# 09. 대량의 데이터 렌더링 (FlatList와 성능 최적화)

앱을 만들다 보면 수십, 수백 개의 항목을 스크롤해서 보여줘야 할 때가 많습니다(예: 카카오톡 친구 목록, 인스타그램 피드). 단순히 화면을 스크롤 가능하게 만들려면 `<ScrollView>`를 사용할 수 있지만, 데이터가 수백 개를 넘어가면 앱이 버벅거리고 튕길 수 있습니다. 이를 해결하기 위한 성능 최적화의 핵심 컴포넌트, **`<FlatList>`**에 대해 알아보겠습니다.

## 1. ScrollView의 한계와 FlatList의 등장

`<ScrollView>`는 데이터가 1,000개라면 화면에 보이지 않는 990개의 데이터까지 한꺼번에 모두 렌더링(메모리에 로드)합니다. 당연히 기기의 메모리가 낭비되고 앱이 느려지게 됩니다.

반면 **`<FlatList>`**는 **지연 렌더링(Lazy Loading)** 기법을 사용합니다. 화면에 보이지 않는 항목은 메모리에서 지우고, 사용자가 스크롤하여 화면에 나타날 때쯤 실시간으로 렌더링합니다.

> 💡 **핵심 비유: "회전초밥집 컨베이어 벨트"**
> - **ScrollView**: 주방장이 1,000개의 초밥을 한 번에 다 만들어서 상에 올려놓습니다. (상다리가 부러짐 = 앱 크래시)
> - **FlatList**: 손님 눈앞에 지나가는 10개의 빈 접시에만 초밥을 올려두고, 손님이 먹고 지나간 접시의 초밥은 치우며, 새로 다가오는 접시에만 다시 초밥을 올리는 **컨베이어 벨트** 시스템입니다.

## 2. FlatList의 핵심 Props 3가지

`FlatList`를 사용하기 위해서는 반드시 3가지 필수(또는 권장) Props를 알아야 합니다.

1. **`data`**: 렌더링할 원본 배열 데이터입니다. (예: `[{id: 1, name: 'A'}, {id: 2, name: 'B'}]`)
2. **`renderItem`**: `data` 배열의 각 항목을 어떻게 UI로 그릴지 정의하는 함수입니다.
3. **`keyExtractor`**: 각 항목의 고유한 키(Key) 값을 추출하는 함수입니다. React가 항목을 추적하고 최적화하는 데 사용됩니다.

## 3. 실습: 무한 스크롤(Infinite Scroll) 리스트 구현

수백 개의 가짜 데이터를 스크롤할 수 있는 FlatList를 만들어 보겠습니다.

```javascript
import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView } from 'react-native';

// 1. 100개의 가짜(Mock) 데이터 생성
const INITIAL_DATA = Array.from({ length: 100 }, (_, index) => ({
  id: String(index + 1),
  name: `사용자 ${index + 1}`,
}));

export default function UserListApp() {
  const [users, setUsers] = useState(INITIAL_DATA);

  // 2. renderItem 함수: 각 아이템을 어떻게 그릴지 정의
  // 매개변수로 { item }을 구조 분해 할당하여 받습니다.
  const renderUserItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.itemName}>{item.name}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerTitle}>연락처 목록 (FlatList)</Text>
      
      {/* 3. FlatList 컴포넌트 적용 */}
      <FlatList
        data={users}                           // 원본 데이터 배열
        renderItem={renderUserItem}            // UI 렌더링 함수
        keyExtractor={(item) => item.id}       // 고유 Key 추출 함수
        
        // 성능 최적화 및 무한 스크롤 관련 옵션 (참고용)
        initialNumToRender={10}                // 처음 렌더링할 개수
        onEndReached={() => console.log('바닥에 닿았습니다! 데이터 추가 로딩 필요')}
        onEndReachedThreshold={0.5}            // 바닥에 닿기 전(50% 지점) 미리 이벤트 발생
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  itemContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  itemName: {
    fontSize: 18,
  }
});
```

위 코드를 실행하고 빠르게 스크롤해 보세요. 데이터가 100개(심지어 10,000개)가 넘어도 앱이 끊기지 않고 부드럽게 스크롤됩니다. 이는 `FlatList`가 화면에 보이는 아이템만 영리하게 렌더링하기 때문입니다. `onEndReached` 속성을 이용하면 스크롤이 바닥에 닿았을 때 서버에 다음 페이지 데이터를 요청하는 **무한 스크롤** 기능도 쉽게 구현할 수 있습니다.

---

### Chapter Summary
- **ScrollView vs FlatList**: `ScrollView`는 모든 데이터를 한 번에 메모리에 올려 성능 저하를 유발하지만, `FlatList`는 화면에 보이는 데이터만 렌더링(지연 렌더링)하여 메모리를 최적화합니다.
- **회전초밥집 비유**: `FlatList`는 눈앞의 접시(화면 영역)에만 데이터를 올리고 지우는 컨베이어 벨트와 같습니다.
- **필수 Props**: 원본 배열인 `data`, UI를 그리는 `renderItem`, 고유 식별자를 빼내는 `keyExtractor` 3가지를 짝꿍처럼 사용합니다.
