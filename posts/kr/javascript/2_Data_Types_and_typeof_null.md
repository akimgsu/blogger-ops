# 2편: 자바스크립트 데이터 타입과 typeof null의 비밀

자바스크립트의 타입 시스템은 겉보기엔 단순하지만, `typeof null === "object"` 같은 역사적 유산과 동적 타이핑이 겹쳐 혼란을 줍니다. 이 편에서는 **ECMAScript 타입 분류**, `typeof` 동작, 그리고 그 유명한 `null` 버그의 진짜 이유를 정리합니다.

## 1. ECMAScript의 타입 분류

### Primitive Types (원시 타입)

| 타입 | 예시 | `typeof` 결과 |
|------|------|----------------|
| Undefined | `undefined` | `"undefined"` |
| Null | `null` | `"object"` ⚠️ |
| Boolean | `true` / `false` | `"boolean"` |
| Number | `42`, `NaN` | `"number"` |
| BigInt | `10n` | `"bigint"` |
| String | `"hi"` | `"string"` |
| Symbol | `Symbol("id")` | `"symbol"` |

### Object Type

Plain object, Array, Date, Map/Set, 그리고 **Function**(callable object)이 포함됩니다. 함수만 `typeof`가 `"function"`입니다.

```js
typeof {};           // "object"
typeof [];           // "object"
typeof function(){}; // "function"
typeof null;         // "object"
```

## 2. typeof 치트시트

```js
typeof undefined;      // "undefined"
typeof true;           // "boolean"
typeof 123;            // "number"
typeof 123n;           // "bigint"
typeof "text";         // "string"
typeof Symbol();       // "symbol"
typeof class A {};     // "function"
typeof notDeclared;    // "undefined" (ReferenceError 없음)
```

`typeof`는 선언되지 않은 식별자에도 안전하게 `"undefined"`를 반환합니다.

## 3. typeof null === "object"의 비밀

### 결론

이것은 **의도된 설계가 아니라 초기 구현의 버그(유산)**입니다. 웹 호환성 때문에 고치지 못하고 남아 있습니다.

### 기술적 배경

초기 JS 엔진은 값에 **타입 태그**를 붙인 머신 워드로 값을 표현했습니다. object 태그가 `000`이었고, **`null`은 빈 포인터(`0`)**로 표현되어 하위 비트가 object처럼 보였습니다.

```
null 비트패턴 ≈ 0
object 태그   ≈ 000
→ typeof null → "object"
```

`typeof null`을 `"null"`로 바꾸면 전 세계 레거시가 깨지므로, TC39도 사실상 수정을 포기했습니다. **버그이지만 표준처럼 취급**해야 합니다.

## 4. null vs undefined

| | `null` | `undefined` |
|--|--------|-------------|
| 의미 | 의도적으로 비어 있음 | 값이 할당되지 않음 |
| 누가 만드나 | 주로 개발자 | 엔진/기본 동작 |
| `typeof` | `"object"` | `"undefined"` |

```js
let a;
console.log(a); // undefined

const user = { name: "Ada", nickname: null }; // 일부러 비움
```

실무 규칙: API에서 "없음"을 명시 → `null`, 아직 미할당/누락 → `undefined`(또는 필드 생략).

## 5. 올바른 타입 검사

```js
// ❌ null도 통과
if (typeof value === "object") { /* ... */ }

// ✅
if (value !== null && typeof value === "object") { /* ... */ }

Array.isArray([]);     // true — 배열 판별에 typeof는 부적합
typeof NaN;            // "number"
Number.isNaN(NaN);     // true
Number.isFinite(42);   // true

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isNil(value) {
  return value === null || value === undefined;
}
```

## 6. Boxing 주의

원시값은 객체가 아니지만, 프로퍼티 접근 시 일시적으로 래퍼가 생깁니다.

```js
"hello".toUpperCase();
const s = new String("hi");
typeof s;   // "object"
s === "hi"; // false
```

`new String()`, `new Number()`, `new Boolean()`은 실무에서 거의 쓰지 마세요.

## 7. Symbol과 BigInt

```js
Symbol("id") === Symbol("id"); // false — 매번 고유
typeof 9007199254740993n;      // "bigint"
```

`Number.MAX_SAFE_INTEGER`(`2^53 - 1`)를 넘는 정수는 `BigInt`를 검토하세요.

---
### Chapter Summary
- JS 값은 Primitive(7종)와 Object로 나뉘며, 함수는 `typeof`가 `"function"`이다.
- `typeof null === "object"`는 초기 엔진 타입 태그 유산이며 호환성 때문에 유지된다.
- `null`은 의도적 공백, `undefined`는 미할당/누락에 가깝다.
- 타입 검사 시 `null` 가드, `Array.isArray`, `Number.isNaN`/`isFinite`를 함께 쓴다.
- 원시 래퍼 객체는 피하고, Symbol/BigInt의 `typeof`도 기억하자.
