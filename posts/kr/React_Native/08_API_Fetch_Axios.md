# 08. 외부 데이터 연동 (Fetch / Axios API)

우리가 사용하는 대부분의 앱은 혼자서 돌아가지 않습니다. 유튜브는 영상 목록을 가져오고, 카카오톡은 메시지를 받아옵니다. 이처럼 앱이 서버와 통신하여 데이터를 주고받는 과정은 앱 개발에서 필수적입니다. 오늘은 외부 데이터를 가져오는 **API 통신**과 **비동기 처리**에 대해 알아보겠습니다.

## 1. 동기(Synchronous)와 비동기(Asynchronous)의 이해

데이터를 서버에서 가져올 때는 인터넷 속도나 서버 상태에 따라 시간이 걸립니다. 만약 데이터를 가져오는 동안 앱이 멈춰서(동기 처리) 사용자가 아무것도 누를 수 없다면 어떨까요? 최악의 사용자 경험이 될 것입니다.

이 문제를 해결하기 위해 JavaScript는 **비동기(Asynchronous)** 방식을 사용합니다. 

> 💡 **핵심 비유: "식당의 웨이터"**
> - **동기식**: 웨이터가 주방(서버)에 주문(요청)을 넣고, 요리(데이터)가 나올 때까지 주방 문 앞을 막고 서서 기다립니다. 손님은 아무것도 할 수 없습니다.
> - **비동기식**: 웨이터가 주방에 주문을 넣은 뒤, **즉시 다른 테이블로 가서 주문을 받거나 청소를 합니다.** 요리가 완료되면 주방장이 부르고, 그때 요리를 손님에게 서빙합니다. 

앱에서도 서버에 데이터를 요청(`fetch`)해 두고, 그동안 앱은 멈추지 않고 화면 렌더링이나 다른 작업을 계속합니다. 데이터가 도착하면(`Promise` 해결) 그때 화면에 데이터를 띄워주는 방식입니다. 이를 코드로 깔끔하게 작성하기 위해 `async`와 `await` 키워드를 사용합니다.

## 2. 실습: OpenWeather API 연동하여 날씨 출력하기

기본 내장 함수인 `fetch`를 사용하여, 무료 날씨 API인 OpenWeather에서 가상의 서울 날씨 데이터를 가져와 화면에 출력해 보겠습니다. (실제 환경에서는 본인의 API Key가 필요합니다.)

```javascript
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

export default function WeatherApp() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  // 화면이 처음 마운트될 때 딱 한 번 날씨 데이터를 가져옵니다.
  useEffect(() => {
    getWeather();
  }, []);

  // API를 호출하는 비동기 함수 (async 키워드 사용)
  const getWeather = async () => {
    try {
      // 가상의 서울 날씨 API 호출 (await로 웨이터가 주문을 넣고 응답을 기다림)
      // *주의: 실제 구현 시에는 유효한 URL과 API 키를 사용해야 합니다.
      const response = await fetch('https://api.openweathermap.org/data/2.5/weather?q=Seoul&appid=YOUR_API_KEY');
      
      // 응답 데이터를 JSON 형태로 변환
      const json = await response.json();
      
      // 받아온 데이터를 State에 저장
      setWeather(json);
    } catch (error) {
      console.error('날씨 데이터를 가져오는데 실패했습니다:', error);
    } finally {
      // 성공하든 실패하든 로딩 상태를 false로 변경
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* 데이터가 도착하기 전까지는 빙글빙글 도는 로딩 인디케이터를 보여줍니다. */}
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <View style={styles.weatherBox}>
          <Text style={styles.city}>도시: {weather?.name || 'Seoul'}</Text>
          <Text style={styles.temp}>
            {/* 켈빈 온도를 섭씨로 변환하는 가상의 공식 적용 */}
            온도: { weather?.main?.temp ? (weather.main.temp - 273.15).toFixed(1) : '22.5' }°C
          </Text>
          <Text style={styles.desc}>
            상태: {weather?.weather[0]?.main || 'Clear'}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f8ff' },
  weatherBox: { alignItems: 'center', padding: 20, backgroundColor: 'white', borderRadius: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
  city: { fontSize: 24, fontWeight: 'bold' },
  temp: { fontSize: 30, color: '#ff4500', marginVertical: 10 },
  desc: { fontSize: 20, color: '#555' }
});
```

위 코드는 `useEffect`를 통해 앱이 켜지자마자 `getWeather`라는 **비동기 함수**를 실행합니다. 데이터를 기다리는 동안에는 `ActivityIndicator`(로딩 스피너)가 화면에 표시되고, 데이터 통신이 완료(`await` 종료)되면 State가 업데이트되면서 실제 날씨 정보가 그려집니다.

*(추가 정보: `fetch` 외에도 좀 더 편리한 기능(자동 JSON 변환 등)을 제공하는 `axios`라는 외부 라이브러리도 실무에서 매우 자주 사용됩니다.)*

---

### Chapter Summary
- **비동기 통신**: 데이터를 요청하고 기다리는 동안 앱을 멈추지 않게 하는 방식입니다 (웨이터 비유). `async`와 `await` 문법을 사용해 구현합니다.
- **API 연동**: `fetch` 또는 `axios`를 사용하여 외부 서버(API)에 데이터를 요청하고, 그 결과값(JSON)을 받아옵니다.
- **로딩 처리**: 데이터가 도착하기 전까지는 `loading` State를 활용하여 로딩 스피너 등을 띄워 사용자 경험을 향상시킵니다.
