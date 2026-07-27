# 3편: 원시 타입(Primitive) vs 참조 타입(Reference)과 불변성

자바스크립트 버그의 상당수는 **"값이 복사됐는지, 참조가 공유됐는지"**를 오해할 때 생깁니다. Primitive와 Reference의 전달 방식, 그리고 불변성(Immutability) 패턴을 실전 중심으로 정리합니다.

## 1. 한 줄 정의

- **Primitive**: 값 자체가 복사된다.
- **Reference (Object)**: 힙 객체를 가리키는 참조가 복사된다(같은 객체를 공유).

```js
let a = 10;
let b = a;
b = 20;
console.log(a); // 10

let obj1 = { n: 10 };
let obj2 = obj1;
obj2.n = 20;
console.log(obj1.n); // 20 — 같은 객체
```

배열, 함수, Date, Map/Set도 모두 객체이므로 참조 의미론을 따릅니다.

## 2. 함수 인자: Pass by Sharing

JS는 인자를 **값으로** 전달합니다. 다만 객체의 값은 **참조(주소)**입니다.

```js
function bump(n) {
  n = n + 1; // 지역만 변경
}
let x = 1;
bump(x);
console.log(x); // 1

function bumpObj(o) {
  o.count += 1; // 외부 객체 변이
}
const state = { count: 1 };
bumpObj(state);
console.log(state.count); // 2

function reassign(o) {
  o = { count: 999 }; // 매개변수 바인딩만 변경
}
const s = { count: 1 };
reassign(s);
console.log(s.count); // 1
```

**재할당(reassign)**과 **변이(mutation)**를 구분하세요.

## 3. === 비교의 의미

```js
1 === 1;   // true — 값 비교
{} === {}; // false — 서로 다른 객체
const a = {};
const b = a;
a === b;   // true — 같은 참조
```

## 4. 불변성(Immutability)

기존 값을 바꾸지 않고 **새 값을 만드는** 태도입니다.

이점: 예측 가능한 상태 변화(React 등), undo/시간 여행, 공유 변이 버그 감소.

Primitive는 이미 불변입니다(`"abc".toUpperCase()`는 새 문자열). 문제는 **객체/배열 변이**입니다.

## 5. 변이 vs 불변 업데이트

```js
const user = { name: "Ada", age: 30 };
// ❌ user.age = 31;
const nextUser = { ...user, age: 31 }; // ✅

const list = [1, 2, 3];
// ❌ list.push(4);
const nextList = [...list, 4]; // ✅
```

스프레드는 **얕은 복사**입니다. 중첩 구조는 경로별로 새 객체를 만드세요.

```js
const state = {
  user: { name: "Ada", prefs: { theme: "dark" } },
};

const next = {
  ...state,
  user: {
    ...state.user,
    prefs: { ...state.user.prefs, theme: "light" },
  },
};
```

깊은 불변 업데이트가 잦다면 Immer 같은 도구를 검토합니다.

## 6. Object.freeze의 한계

```js
const config = Object.freeze({
  api: "/v1",
  nested: { retry: 3 },
});
config.nested.retry = 5; // nested는 freeze되지 않음
```

`Object.freeze`는 **shallow**입니다. 설계(불변 패턴)가 도구보다 중요합니다.

## 7. 복사 방법 정리

| 방법 | 깊이 | 비고 |
|------|------|------|
| `{...obj}` / `[...arr]` | 얕음 | 가장 흔함 |
| `structuredClone(obj)` | 깊음 | 함수/DOM 제한 |
| `JSON.parse(JSON.stringify(obj))` | 깊음(제한적) | `undefined`, Date, Map 손실 |

```js
const original = { a: 1, nested: { b: 2 } };
const clone = structuredClone(original);
clone.nested.b = 99;
console.log(original.nested.b); // 2
```

## 8. 실전 가이드라인

1. 함수가 객체를 받으면 **변이할지/새 객체를 반환할지** API로 명확히 하라.
2. 공유 상태를 직접 mutate하지 말고 새 상태를 만들어라.
3. hot path가 아니라면 불변 업데이트의 명확성을 우선하라.
4. 중첩이 깊어지면 헬퍼/라이브러리를 도입하라.

---
### Chapter Summary
- Primitive는 값 복사, Object는 참조 공유다.
- 함수 인자는 값 전달이지만, 객체의 값은 참조이라 내부 변이가 외부에 보인다.
- 불변성은 기존 데이터를 바꾸지 않고 새 스냅샷을 만드는 실천이다.
- 스프레드는 얕은 복사다. 중첩은 경로별 복사 또는 `structuredClone`을 쓴다.
- `Object.freeze`는 shallow이며, 설계 패턴이 더 중요하다.
