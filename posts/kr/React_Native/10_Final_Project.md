# 10. 종합 프로젝트 완성 및 배포 기초

지금까지 React Native의 핵심 개념들(기본 컴포넌트, Props, State, useEffect, Navigation, FlatList, API 연동)을 하나씩 살펴보았습니다. 이제 이 모든 조각들을 하나로 합쳐 번듯한 실전 앱을 완성하고, 실제 스토어에 올리기 위한 배포 기초 과정을 맛볼 시간입니다.

## 1. 모든 개념의 통합: 종합 프로젝트

지금까지 우리가 배운 것들은 마치 각기 다른 악기 연주법을 배운 것과 같습니다. 이제는 하나의 훌륭한 교향곡을 연주할 차례입니다.

> 💡 **핵심 비유: "오케스트라 합주"**
> 바이올린(UI), 첼로(State), 플루트(API), 지휘자(Navigation) 등 각기 연습한 악기(기능)들을 하나의 악보(앱 기획)에 맞춰 동시에 조화롭게 연주하는 과정이 바로 '종합 프로젝트'입니다.

## 2. 실습: 'Weather Todo' 앱 만들기

배운 내용을 총동원하여 '현재 날씨를 보여주고, 할 일을 추가/삭제할 수 있는 날씨 연동 Todo 앱'을 만들어 보겠습니다.

### 앱의 주요 기능 및 사용된 개념
- **API (fetch)**: 상단에 현재 날씨 출력 (OpenWeather API)
- **State (useState)**: 할 일 텍스트 입력값 관리 및 할 일 목록 배열 관리
- **생명주기 (useEffect)**: 앱이 켜질 때 날씨 데이터 최초 1회 로딩
- **리스트 최적화 (FlatList)**: 수많은 할 일 목록을 버벅임 없이 렌더링
- **Props**: 커스텀 버튼 컴포넌트(삭제 버튼 등) 재사용

### 핵심 코드 구조 (App.js)
```javascript
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, SafeAreaView } from 'react-native';

export default function WeatherTodoApp() {
  const [weather, setWeather] = useState('날씨 불러오는 중...');
  const [task, setTask] = useState('');
  const [todoList, setTodoList] = useState([]);

  // 1. useEffect + API (날씨 불러오기)
  useEffect(() => {
    // 가상의 날씨 API 호출 시뮬레이션
    setTimeout(() => {
      setWeather('☀️ 맑음 (24°C)');
    }, 1000);
  }, []);

  // 2. State 변경 함수 (할 일 추가)
  const addTask = () => {
    if (task.trim() === '') return;
    const newTask = { id: Date.now().toString(), text: task };
    setTodoList([...todoList, newTask]);
    setTask(''); // 입력창 초기화
  };

  // 3. State 변경 함수 (할 일 삭제)
  const deleteTask = (id) => {
    setTodoList(todoList.filter(item => item.id !== id));
  };

  // 4. FlatList용 렌더링 함수
  const renderTodoItem = ({ item }) => (
    <View style={styles.todoItem}>
      <Text style={styles.todoText}>{item.text}</Text>
      <TouchableOpacity onPress={() => deleteTask(item.id)} style={styles.deleteBtn}>
        <Text style={styles.deleteBtnText}>삭제</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 영역 (날씨 출력) */}
      <View style={styles.header}>
        <Text style={styles.headerText}>오늘의 날씨: {weather}</Text>
      </View>

      {/* 입력 영역 */}
      <View style={styles.inputContainer}>
        <TextInput 
          style={styles.input} 
          placeholder="할 일을 입력하세요" 
          value={task}
          onChangeText={setTask}
        />
        <TouchableOpacity style={styles.addBtn} onPress={addTask}>
          <Text style={styles.addBtnText}>추가</Text>
        </TouchableOpacity>
      </View>

      {/* 리스트 영역 (FlatList 적용) */}
      <FlatList 
        data={todoList}
        renderItem={renderTodoItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 20 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { padding: 20, backgroundColor: '#4A90E2', alignItems: 'center' },
  headerText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  inputContainer: { flexDirection: 'row', padding: 20, backgroundColor: 'white' },
  input: { flex: 1, borderWidth: 1, borderColor: '#ddd', padding: 10, borderRadius: 5, marginRight: 10 },
  addBtn: { backgroundColor: '#4A90E2', padding: 15, borderRadius: 5, justifyContent: 'center' },
  addBtnText: { color: 'white', fontWeight: 'bold' },
  todoItem: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#eee' },
  todoText: { fontSize: 16 },
  deleteBtn: { backgroundColor: '#FF3B30', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 5 },
  deleteBtnText: { color: 'white' }
});
```

## 3. 배포(Build) 및 앱 아이콘 설정 기초

앱 개발이 완료되었다면 스토어(Play Store, App Store)에 올리기 위해 앱 아이콘을 설정하고 빌드(Build)해야 합니다.

**Expo를 사용하는 경우의 빌드 흐름:**
1. **앱 아이콘 및 스플래시 화면 설정**: 프로젝트 내 `app.json` 파일에서 `icon`과 `splash.image` 경로를 내가 만든 예쁜 이미지로 교체합니다.
2. **EAS(Expo Application Services) 설정**: 터미널에서 `npm install -g eas-cli`로 도구를 설치하고 `eas login`으로 로그인합니다.
3. **프로젝트 초기화**: `eas build:configure`를 실행하여 빌드 설정을 구성합니다.
4. **빌드 명령 실행**: 
   - 안드로이드용(APK/AAB): `eas build -p android`
   - iOS용(IPA): `eas build -p ios`
5. Expo 서버에서 빌드가 완료되면 다운로드 링크를 제공하며, 이를 기기에 설치하거나 스토어 개발자 콘솔에 업로드하여 출시합니다!

---

### Chapter Summary
- **종합 프로젝트의 의의**: 그동안 개별적으로 배운 UI 구성, 상태 관리, 부수 효과, 데이터 통신 등을 하나로 결합하여 상호작용하는 완전한 앱을 경험합니다.
- **오케스트라 합주**: 모든 컴포넌트와 훅(Hook)들이 조화롭게 동작해야 버그 없는 원활한 앱(훌륭한 연주)이 탄생합니다.
- **앱 배포 기초 (Expo 기준)**: `app.json`을 통해 메타데이터와 아이콘을 설정하고, EAS CLI 도구를 사용하여 클라우드 환경에서 안드로이드/iOS 설치 파일을 빌드(Build)합니다.
