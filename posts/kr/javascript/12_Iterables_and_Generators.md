# 12편: 이터러블(Iterables)과 제너레이터(Generators) 프로토콜

`for...of`, 스프레드, 구조 분해가 배열뿐 아니라 Map/Set/문자열에서도 동작하는 이유는 **Iterable Protocol** 덕분입니다. **Generator**는 그 프로토콜을 쉽게 구현하고 지연 평가·비동기 스트림까지 확장합니다.

## 1. Iterable과 Iterator

- **Iterable**: `obj[Symbol.iterator]`가 iterator를 반환
- **Iterator**: `next()`가 `{ value, done }`를 반환

```js
const arr = [10, 20];
const it = arr[Symbol.iterator]();
console.log(it.next()); // { value: 10, done: false }
console.log(it.next()); // { value: 20, done: false }
console.log(it.next()); // { value: undefined, done: true }
```

## 2. 내장 Iterable

Array, String, Map, Set, TypedArray 등. 일반 객체는 기본적으로 iterable이 **아닙니다**.

```js
for (const [k, v] of Object.entries({ a: 1 })) {
  console.log(k, v);
}
```

## 3. 직접 Iterable 만들기

```js
const range = {
  from: 1,
  to: 3,
  [Symbol.iterator]() {
    let current = this.from;
    const last = this.to;
    return {
      next() {
        if (current <= last) return { value: current++, done: false };
        return { value: undefined, done: true };
      },
    };
  },
};
console.log([...range]); // [1, 2, 3]
```

## 4. Generator

```js
function* rangeGen(from, to) {
  for (let i = from; i <= to; i++) yield i;
}
console.log([...rangeGen(1, 3)]); // [1, 2, 3]
```

`next` / `return` / `throw`를 지원합니다.

## 5. yield* 위임

```js
function* a() {
  yield 1;
  yield 2;
}
function* b() {
  yield* a();
  yield 3;
}
console.log([...b()]); // [1, 2, 3]
```

## 6. 지연 평가

```js
function* infiniteIds(start = 1) {
  let id = start;
  while (true) yield id++;
}
function* take(n, iterable) {
  let i = 0;
  for (const item of iterable) {
    if (i++ >= n) return;
    yield item;
  }
}
console.log([...take(3, infiniteIds(100))]); // [100, 101, 102]
```

## 7. next로 값 밀어 넣기

```js
function* mixer() {
  const a = yield "first";
  const b = yield `got ${a}`;
  return `got ${b}`;
}
const m = mixer();
m.next();
m.next("A");
m.next("B");
```

## 8. Async Generator

```js
async function* fetchPages(url) {
  let next = url;
  while (next) {
    const res = await fetch(next);
    const data = await res.json();
    yield data.items;
    next = data.nextUrl;
  }
}

for await (const items of fetchPages("/api?page=1")) {
  console.log(items.length);
}
```

## 9. 실무 활용

1. 커스텀 컬렉션의 `for...of` 지원
2. 대용량 청크 처리(메모리 절약)
3. 상태 머신/파서
4. 비동기 페이지네이션 스트림

주의: Generator는 보통 one-shot입니다. 다시 쓰려면 factory로 새 generator를 만드세요. 복잡한 제어 흐름은 async/await가 더 읽기 쉬운 경우가 많습니다.

---
### Chapter Summary
- Iterable은 `Symbol.iterator`로 iterator를 제공하고, `next()`는 `{value, done}`을 반환한다.
- `for...of`, 스프레드 등이 이 프로토콜에 의존한다.
- `function*`/`yield`로 iterator를 간결히 구현하고 지연 평가할 수 있다.
- `yield*`로 위임하고, async generator로 비동기 스트림을 만든다.
- 무한 시퀀스는 `take`와 조합해 안전하게 소비한다.
