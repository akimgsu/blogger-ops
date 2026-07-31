# 07. 화면 이동하기 (React Navigation)

대부분의 앱은 단일 화면으로 구성되지 않습니다. 카카오톡이나 인스타그램처럼 여러 화면이 존재하고, 사용자는 버튼을 눌러 이 화면 저 화면을 돌아다닙니다. React Native에서 이러한 화면 전환(라우팅)을 처리하는 가장 표준적인 라이브러리인 **React Navigation**에 대해 알아보겠습니다.

## 1. 모바일 앱 네비게이션의 이해

웹에서는 링크(`<a>` 태그)를 클릭하면 완전히 새로운 HTML 페이지를 불러옵니다. 하지만 모바일 앱은 브라우저가 아니기 때문에 방식이 다릅니다.

모바일 앱의 네비게이션은 주로 다음과 같은 형태를 띱니다:
1. **Stack (스택)**: 화면 위에 새로운 화면을 쌓아 올리는 방식입니다. (가장 기본적)
2. **Tab (탭)**: 화면 하단이나 상단에 탭을 두고 화면을 전환하는 방식입니다. (인스타그램 하단 바)
3. **Drawer (드로어)**: 화면 모서리에서 서랍처럼 스와이프하여 꺼내는 메뉴 방식입니다.

## 2. Stack Navigation과 파라미터 전달

가장 많이 쓰이는 **Stack Navigation**에 대해 자세히 알아봅시다.

> 💡 **핵심 비유: "카드 쌓기(Stack)"**
> 책상 위에 카드를 쌓는 것을 상상해 보세요.
> 새 화면으로 이동할 때(`navigation.navigate`): 기존 화면 위에 새로운 화면 카드를 덮어 얹습니다.
> 뒤로 갈 때(`navigation.goBack`): 맨 위에 얹어진 카드를 버리고, 그 밑에 있던 기존 화면을 다시 보여줍니다.

이동할 때는 단순히 화면만 바꾸는 것이 아니라 데이터(파라미터)도 함께 넘겨줄 수 있습니다. 예를 들어, 상품 리스트 화면에서 '사과'를 클릭하면, 상세 화면으로 넘어갈 때 '사과'라는 데이터를 넘겨주어 사과 상세 페이지를 띄우는 식입니다.

## 3. 실습: 로그인 ↔ 메인 탭(홈, 설정) 네비게이션 구조 완성

로그인 화면(Stack)을 거쳐서, 홈과 설정 화면이 있는 메인 탭(Tab)으로 이동하는 실전 앱 구조를 만들어 보겠습니다.

*(참고: 이 실습을 위해서는 `@react-navigation/native`, `@react-navigation/native-stack`, `@react-navigation/bottom-tabs` 등의 라이브러리 설치가 필요합니다.)*

### 앱의 전체 뼈대 (App.js)
```javascript
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, Button, StyleSheet } from 'react-native';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// --- 화면 컴포넌트들 ---

// 1. 로그인 화면
function LoginScreen({ navigation }) {
  return (
    <View style={styles.center}>
      <Text style={styles.text}>로그인 화면</Text>
      {/* MainTab으로 이동 (카드 위에 새 카드 쌓기) */}
      <Button title="로그인 하기" onPress={() => navigation.navigate('MainTab')} />
    </View>
  );
}

// 2. 홈 화면 (탭 1)
function HomeScreen() {
  return (
    <View style={styles.center}>
      <Text style={styles.text}>🏠 홈 화면입니다.</Text>
    </View>
  );
}

// 3. 설정 화면 (탭 2)
function SettingsScreen() {
  return (
    <View style={styles.center}>
      <Text style={styles.text}>⚙️ 설정 화면입니다.</Text>
    </View>
  );
}

// --- 네비게이터 구성 ---

// 하단 탭 네비게이터 (홈, 설정 묶음)
function MainTabNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

// 최상위 스택 네비게이터 (로그인 화면과 하단 탭 묶음)
export default function App() {
  return (
    // 전체 네비게이션을 감싸는 컨테이너
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        {/* MainTab 화면을 호출하면 MainTabNavigator가 통째로 렌더링됨 */}
        <Stack.Screen 
          name="MainTab" 
          component={MainTabNavigator} 
          options={{ headerShown: false }} // 탭 화면에서는 스택 헤더 숨김
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 24, marginBottom: 20 },
});
```

코드를 실행하면 '로그인 화면'이 먼저 뜹니다. '로그인 하기' 버튼을 누르면 새로운 카드(MainTab)가 위에 쌓이면서, 하단에 탭바(Home, Settings)가 달린 메인 화면으로 이동합니다!

---

### Chapter Summary
- **React Navigation**: React Native 앱에서 화면을 이동하고 전환하는 데 사용되는 사실상의 표준 라이브러리입니다.
- **Stack Navigation**: 기존 화면 위에 새 화면을 "카드 쌓듯" 얹고, 뒤로 가기를 누르면 위 카드를 빼는 방식입니다. `navigation.navigate()`로 이동합니다.
- **다양한 네비게이터 조합**: 실무에서는 Stack(스택), Tab(하단 탭), Drawer(옆 서랍)를 하나의 앱 안에서 복합적으로 연결하여 사용합니다 (예: 로그인(Stack) -> 홈(Tab)).
