# 14편: V8 엔진에 친화적인 코드 작성법과 메모리 누수 방지

빠르고 안정적인 JS를 쓰려면 (1) **V8가 최적화하기 쉬운 형태**를 유지하고, (2) **불필요하게 살아있는 참조**를 관리해야 합니다.

## 1. 측정하라

감으로 미세 최적화하지 마세요. DevTools Performance/Memory, Node inspect, warm-up 포함 벤치를 쓰세요.

```js
function bench(label, fn, n = 100000) {
  fn(); // warm-up
  const start = performance.now();
  for (let i = 0; i < n; i++) fn();
  console.log(label, performance.now() - start, "ms");
}
```

## 2. Hidden Class / Shape 안정성

```js
// ✅ 생성 시 모양 고정
function Point(x, y) {
  this.x = x;
  this.y = y;
}

// ❌ 인스턴스마다 프로퍼티 추가 순서가 다름
const a = {};
a.x = 1;
a.y = 2;
const b = {};
b.y = 2;
b.x = 1;

function User(name, age) {
  this.name = name;
  this.age = age ?? null; // 자리 고정
}
```

## 3. 모노모픽 함수 유지

```js
// ❌ 한 함수에 여러 타입
function getLength(x) {
  return x.length;
}

// ✅ 분리
function stringLen(s) {
  return s.length;
}
function arrayLen(a) {
  return a.length;
}
```

## 4. 배열 요소 종류

```js
const xs = [1, 2, 3, 4]; // packed — 좋음
const ys = [1, , 3];     // holey — 불리
const zs = [1, 2, "3"];  // 혼합 — 불리
```

`delete arr[i]`로 hole을 만들지 마세요.

## 5. 인라인 캐시를 깨는 패턴

`arguments`보다 rest를, 핫 루프 안 예외 흐름은 피하세요.

```js
function sum2(...nums) {
  return nums.reduce((a, b) => a + b, 0);
}
```

## 6. 메모리 누수 전형

### 잊힌 리스너/타이머

```js
class Widget {
  constructor(el) {
    this.el = el;
    this.onClick = () => this.render();
    el.addEventListener("click", this.onClick);
  }
  destroy() {
    this.el.removeEventListener("click", this.onClick);
    this.el = null;
  }
  render() {}
}
```

### 클로저가 큰 객체를 붙잡음

```js
function createHandler(hugeData) {
  const id = hugeData.id;
  return () => console.log(id);
}
```

### 무한 성장 캐시 / DOM 참조 보관 / 전역 누적

LRU·TTL·WeakMap, unmount 시 DOM 참조 해제, 프로덕션 디버그 배열 금지.

## 7. WeakMap

```js
const metadata = new WeakMap();
function tag(obj, info) {
  metadata.set(obj, info);
}
let user = { name: "Ada" };
tag(user, { role: "admin" });
user = null; // 키와 함께 엔트리 수거 가능
```

확정 정리는 `dispose` 패턴이 더 낫습니다.

## 8. 체크리스트

**속도**: shape 고정, 핫 함수 타입 단일화, packed 배열, 알고리즘 복잡도 우선  
**메모리**: unsubscribe, clearTimer, 캐시 상한, 클로저 최소화, 힙 스냅샷

## 9. 본질

> 일관된 데이터 형태 + 좁은 타입 + 명확한 수명 관리

---
### Chapter Summary
- V8는 shape-stable 객체와 monomorphic 호출을 좋아한다.
- 배열은 packed/동질 요소일 때 더 잘 최적화된다.
- 성능은 측정 기반으로, 알고리즘을 먼저 본다.
- 메모리 누수는 남은 참조(리스너, 클로저, 캐시, DOM)에서 온다.
- WeakMap과 명시적 dispose로 수명을 설계한다.
