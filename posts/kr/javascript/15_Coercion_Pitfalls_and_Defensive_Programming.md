# 15편: 자바스크립트의 느슨한 타입(Coercion) 함정과 방어적 프로그래밍

자바스크립트는 연산 과정에서 타입을 **암묵적으로 변환(coercion)**합니다. 편리하지만 `==`, `+`, `if (value)`에 예리한 버그가 숨어 있습니다.

## 1. Coercion이란?

- **Implicit**: `1 + "2"` → `"12"`
- **Explicit**: `Number("2")`, `String(1)`, `Boolean(0)`

원칙: **암묵 변환에 의존하지 말고, 경계에서 명시적으로 변환**하라.

## 2. Truthy / Falsy

**Falsy**: `false`, `0`, `-0`, `0n`, `""`, `null`, `undefined`, `NaN`  
그 외는 대부분 truthy (`[]`, `{}`, `"0"` 포함).

```js
const name = input || "Anonymous"; // ""도 대체됨
const port = input ?? 3000;        // null/undefined만
```

## 3. == vs ===

```js
0 == false;        // true
null == undefined; // true
"0" == 0;          // true
[] == ![];         // true

// 기본은 ===
if (value == null) {
  // null 또는 undefined만 허용하는 팀 관례
}
```

## 4. + 연산자와 ToPrimitive

```js
1 + 2;       // 3
"1" + 2;     // "12"
1 + 2 + "3"; // "33"
[] + [];     // ""
[] + {};     // "[object Object]"
```

```js
const money = {
  value: 10,
  [Symbol.toPrimitive](hint) {
    if (hint === "string") return `$${this.value}`;
    return this.value;
  },
};
console.log(String(money)); // $10
console.log(money + 5);     // 15
```

## 5. Number 변환 함정

```js
Number("");        // 0
Number(null);      // 0
Number(undefined); // NaN
Number([]);        // 0
Number([1, 2]);    // NaN
parseInt("12px", 10); // 12
NaN === NaN;       // false
Number.isNaN(NaN); // true
Number.isFinite(10); // true
```

`parseInt`는 앞부분만, `Number`는 전체 문자열이 유효해야 합니다.

## 6. 명시적 변환

```js
String(123);
Boolean(0); // false
!!value;
```

## 7. 방어적 프로그래밍

```js
function createUser(dto) {
  if (dto == null || typeof dto !== "object") {
    throw new TypeError("dto must be object");
  }
  const name = String(dto.name ?? "").trim();
  if (!name) throw new Error("name required");
  const age = Number(dto.age);
  if (!Number.isInteger(age) || age < 0) {
    throw new Error("invalid age");
  }
  return { name, age };
}

const city = user?.address?.city ?? "Unknown";
const qty = Number(form.qty.value); // 폼 값은 문자열
```

## 8. 도구로 방어층 쌓기

- ESLint: `eqeqeq`, `no-implicit-coercion`, `radix`
- TypeScript: 컴파일 타임 좁히기
- Zod/Valibot 등: 외부 입력 런타임 스키마 검증

## 9. 안전한 습관

1. 비교는 `===`
2. nullish 기본값 → `??`
3. 숫자 변환 후 `Number.isFinite` / `isInteger`
4. `typeof` + `Array.isArray` + `null` 가드
5. `+value` 대신 `Number(value)`
6. 유효값 `0`/`""`/`false`를 `||`로 지우지 않기

```js
// ❌
const count = rawCount || 1;
// ✅
const count = rawCount ?? 1;
```

---
### Chapter Summary
- JS는 연산 맥락에 맞춰 암묵적 타입 변환(coercion)을 수행한다.
- falsy는 `0`, `""`, `null`, `undefined`, `NaN` 등이며 `[]`/`{}`는 truthy다.
- 기본 비교는 `===`, nullish만 `== null`을 허용하는 팀이 많다.
- `+`와 `Number`/`parseInt` 차이를 경계에서 명시적으로 다룬다.
- 입력 검증, `??`/`?.`, 런타임 스키마, 린트/타입이 방어의 한 세트다.
