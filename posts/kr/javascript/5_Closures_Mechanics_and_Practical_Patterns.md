# 5편: 클로저(Closures)의 동작 원리와 실전 활용법 및 주의점

클로저는 자바스크립트에서 가장 강력하면서도 오해받기 쉬운 개념입니다. "함수가 자신의 Lexical Scope를 기억한다"는 한 문장으로 시작하지만, 실무에서는 상태 캡슐화, 커링, 그리고 메모리 누수 주의점까지 이어집니다.

## 1. 클로저란?

**Closure**는 함수와, 그 함수가 선언될 당시의 **Lexical Environment** 조합입니다. 내부 함수는 외부 함수가 반환된 뒤에도 외부 변수에 접근할 수 있습니다.

```js
function makeCounter() {
  let count = 0;
  return function increase() {
    count += 1;
    return count;
  };
}
const counter = makeCounter();
console.log(counter()); // 1
console.log(counter()); // 2
```

`makeCounter`의 EC는 끝났지만, `increase`가 `count` 환경을 **참조로 유지**합니다.

## 2. 왜 가능한가?

```js
function outer(name) {
  const greeting = "Hello";
  return function inner() {
    return `${greeting}, ${name}`;
  };
}
const say = outer("Ada");
say(); // "Hello, Ada"
// inner [[Environment]] → outer env → global
```

엔진은 클로저가 참조하는 **자유 변수(free variables)**를 위해 해당 환경 레코드를 힙에 살려 둡니다.

## 3. 실전 활용

### 데이터 캡슐화

```js
function createWallet(initial = 0) {
  let balance = initial;
  return {
    deposit(amount) {
      if (amount <= 0) throw new Error("invalid");
      balance += amount;
      return balance;
    },
    getBalance() {
      return balance;
    },
  };
}
```

### 함수 팩토리 / 부분 적용

```js
function multiply(a) {
  return (b) => a * b;
}
const double = multiply(2);
console.log(double(5)); // 10
```

### 디바운스

```js
function debounce(fn, delay) {
  let timerId;
  return function (...args) {
    clearTimeout(timerId);
    timerId = setTimeout(() => fn.apply(this, args), delay);
  };
}
```

## 4. 고전 버그: 루프와 var

```js
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}
// 3 3 3

for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}
// 0 1 2
```

## 5. 메모리와 수명

클로저는 외부 환경을 붙잡습니다. 큰 불필요 데이터까지 붙잡으면 GC가 수거하지 못합니다.

```js
function createHandler(hugeData) {
  const id = hugeData.id; // 필요한 값만 추출
  return () => console.log(id);
}

function attach(el) {
  const onClick = () => console.log("click");
  el.addEventListener("click", onClick);
  return () => el.removeEventListener("click", onClick);
}
```

## 6. 클로저 vs 객체 상태

| | 클로저 | 객체 필드 |
|--|--------|-----------|
| 은닉 | 기본적으로 강함 | `#private` 또는 컨벤션 |
| 여러 인스턴스/상속 | 덜 자연스러움 | 자연스러움 |
| 직렬화 | 어려움 | 비교적 쉬움 |

은닉·수명이 중요하면 클로저, 인스턴스·상속·직렬화가 중요하면 클래스/객체가 자연스럽습니다.

## 7. 한 문장 정의

> 클로저는 함수가 정의된 Lexical Environment를 기억하여, 외부 함수 실행이 끝난 뒤에도 그 변수에 접근하게 하는 메커니즘이다.

---
### Chapter Summary
- 클로저 = 함수 + 정의 시점 Lexical Environment.
- 외부 함수가 끝나도 자유 변수에 접근할 수 있다.
- 캡슐화, 커링/부분 적용, 이벤트/디바운스에 핵심적으로 쓰인다.
- `var` 루프 + 비동기 콜백은 고전적 버그이며 `let`으로 해결한다.
- 불필요 참조를 붙잡으면 메모리 압력이 생기므로 리스너 해제와 스코프 최소화가 중요하다.
