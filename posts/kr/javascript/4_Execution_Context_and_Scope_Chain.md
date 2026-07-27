# 4편: 실행 컨텍스트(Execution Context)와 스코프(Scope) 체인

"변수가 어디서 보이고, 함수가 어떤 환경에서 도는지"를 설명하는 핵심 모델이 **Execution Context**와 **Scope Chain**입니다. 클로저, `this`, 호이스팅을 이해하려면 이 편이 기초가 됩니다.

## 1. 실행 컨텍스트란?

**Execution Context(EC)**는 코드가 실행되는 환경 정보 묶음입니다. 엔진은 EC를 만들어 **Call Stack**에 쌓습니다.

1. **Global Execution Context (GEC)** — 스크립트 진입 시 1개
2. **Function Execution Context (FEC)** — 함수 호출마다 생성
3. **Eval Execution Context** — 실무에서 지양

```js
function outer() {
  function inner() {
    console.log("inner");
  }
  inner();
}
outer();
// 스택: [GEC] → [GEC, outer] → [GEC, outer, inner] → ...
```

## 2. EC의 구성 요소

학습용으로 다음 세 축을 기억하세요.

1. **Lexical / Variable Environment** — 식별자와 값의 매핑
2. **Scope Chain (outer reference)** — 현재에서 못 찾으면 외부로 탐색
3. **this binding** — 호출 방식에 따라 결정 (6편)

## 3. 생성 단계와 실행 단계

**Creation Phase**: outer 연결, 매개변수 바인딩, 함수 선언 호이스팅, `var`→`undefined`, `let`/`const`는 TDZ.

**Execution Phase**: 실제 할당과 문 실행.

```js
function demo(a) {
  console.log(a); // 1
  console.log(b); // undefined (var 호이스팅)
  // console.log(c); // ReferenceError (TDZ)
  var b = 2;
  let c = 3;
}
demo(1);
```

## 4. 호이스팅(Hoisting)

호이스팅은 "코드가 위로 올라간다"기보다, **생성 단계에서 식별자가 먼저 등록된다**는 뜻입니다.

| 선언 | 생성 단계 상태 | 스코프 |
|------|----------------|--------|
| function declaration | 함수로 초기화 | 함수/블록 |
| `var` | `undefined` | 함수 스코프 |
| `let`/`const` | TDZ | 블록 스코프 |

```js
console.log(sum(2, 3)); // 5
function sum(a, b) { return a + b; }

console.log(add); // undefined
var add = function (a, b) { return a + b; };
```

## 5. Lexical Scope와 스코프 체인

JS는 **lexical(정적) scope**입니다. 스코프는 호출 위치가 아니라 **작성된 위치**로 결정됩니다.

```js
const x = "global";
function outer() {
  const x = "outer";
  function inner() {
    console.log(x); // "outer"
  }
  return inner;
}
const fn = outer();
fn(); // 전역에서 호출해도 outer 환경을 기억
```

식별자 해석: 현재 → outer → … → global → 없으면 `ReferenceError`.

## 6. 블록 스코프와 루프

```js
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}
// 0 1 2

for (var j = 0; j < 3; j++) {
  setTimeout(() => console.log(j), 0);
}
// 3 3 3 — var는 함수 스코프 하나
```

## 7. 콜 스택과 글로벌

스택 트레이스는 EC 스택의 스냅샷입니다. 재귀가 깊으면 `RangeError: Maximum call stack size exceeded`가 납니다.

```js
var fromVar = 1; // 브라우저에서 global property가 될 수 있음
let fromLet = 2; // 전역 객체 프로퍼티로 붙지 않음
console.log(globalThis.fromLet); // undefined
```

ESM 탑레벨 `this`는 `undefined`입니다.

---
### Chapter Summary
- Execution Context는 코드 실행 환경이며 Call Stack에 쌓인다.
- Lexical Environment가 변수 매핑과 스코프 체인(outer 참조)을 담당한다.
- 호이스팅은 생성 단계의 식별자 등록이며, `let`/`const`는 TDZ가 있다.
- JS는 lexical scope — 정의 위치가 호출 위치보다 중요하다.
- `var` vs `let` 스코프 차이는 루프+비동기 버그의 전형적 원인이다.
