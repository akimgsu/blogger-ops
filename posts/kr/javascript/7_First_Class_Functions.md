# 7편: 일급 객체(First-class functions)로서의 자바스크립트 함수

자바스크립트에서 함수는 "동작 묶음"을 넘어 **값(value)**으로 취급됩니다. 이 성질을 **first-class functions**라 하며, 콜백·고차 함수·함수형 패턴·미들웨어의 토대입니다.

## 1. 일급의 조건

1. 변수에 할당
2. 함수 인자로 전달
3. 함수 결과로 반환
4. 자료구조에 저장

```js
const add = (a, b) => a + b;
const ops = { add, sub: (a, b) => a - b };

function compute(fn, a, b) {
  return fn(a, b);
}
console.log(compute(ops.add, 2, 3)); // 5

function makeAdder(x) {
  return (y) => x + y;
}
console.log(makeAdder(10)(5)); // 15

function greet(name) {
  return `Hi ${name}`;
}
greet.version = "1.0"; // 함수도 객체
```

## 2. 함수 표현의 종류

```js
function declared(x) { return x; }
const expr = function (x) { return x; };
const fact = function factorial(n) {
  return n <= 1 ? 1 : n * factorial(n - 1);
};
const doubled = (n) => n * 2;
const obj = { method() { return 1; } };
```

## 3. Higher-Order Function (고차 함수)

함수를 인자로 받거나 함수를 반환하는 함수입니다.

```js
const nums = [1, 2, 3, 4, 5];
nums.filter((n) => n % 2 === 0);
nums.map((n) => n * n);
nums.reduce((acc, n) => acc + n, 0);

function withLogging(fn) {
  return function (...args) {
    console.log("args:", args);
    const result = fn(...args);
    console.log("result:", result);
    return result;
  };
}
```

## 4. Callback과 IoC

```js
function fetchUser(id, onSuccess, onError) {
  setTimeout(() => {
    if (id <= 0) onError(new Error("invalid id"));
    else onSuccess({ id, name: "Ada" });
  }, 100);
}
```

강력하지만 중첩되면 callback hell이 됩니다. Promise/async가 이를 개선합니다(10편).

## 5. 순수 함수와 부수 효과

```js
function tax(price, rate) {
  return price * rate; // pure
}

let total = 0;
function addToTotal(n) {
  total += n; // side effect
  return total;
}
```

실전에서는 **순수 코어 + 비순수 껍데지(I/O)**로 경계를 나눕니다.

## 6. 커링과 부분 적용

```js
const curryAdd = (a) => (b) => (c) => a + b + c;
console.log(curryAdd(1)(2)(3)); // 6

function partial(fn, ...preset) {
  return (...rest) => fn(...preset, ...rest);
}
function send(method, url, body) {
  return { method, url, body };
}
const post = partial(send, "POST");
```

## 7. 함수 합성

```js
const pipe =
  (...fns) =>
  (value) =>
    fns.reduce((acc, fn) => fn(acc), value);

const shout = pipe(
  (s) => s.trim(),
  (s) => s.toLowerCase(),
  (s) => `${s}!`
);
console.log(shout("  Hello  ")); // "hello!"
```

## 8. rest / default 권장

```js
function modern(a, b = 0, ...rest) {
  return [a, b, rest];
}
```

`arguments`보다 rest/default를 쓰세요.

## 9. 아키텍처에 미치는 영향

- 전략 패턴: 알고리즘을 함수로 주입
- 의존성 주입: 팩토리/콜백 전달
- 플러그인/훅: 라이프사이클에 콜백 등록
- 미들웨어 체인: `(req, res, next) => {}`

---
### Chapter Summary
- JS 함수는 할당·전달·반환·저장이 가능한 일급 값이자 객체다.
- 고차 함수는 함수를 받거나 반환하며 `map`/`filter`/데코레이터의 기반이다.
- 콜백은 IoC를 가능케 하지만 중첩 복잡도를 올릴 수 있다.
- 커링·부분 적용·합성으로 작은 함수를 조립할 수 있다.
- 순수 함수와 부수 효과의 경계를 나누면 테스트 가능한 설계가 된다.
