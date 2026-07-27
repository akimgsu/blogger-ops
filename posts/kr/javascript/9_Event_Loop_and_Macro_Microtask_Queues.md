# 9편: 이벤트 루프(Event Loop)와 매크로/마이크로 태스크 큐

자바스크립트는 기본적으로 **싱글 스레드**에서 사용자 코드가 돌아갑니다. `setTimeout`, Promise, DOM 이벤트가 공존하는 이유는 **Event Loop**가 Call Stack과 Task Queue를 조율하기 때문입니다.

## 1. 런타임 구성 요소

1. **Call Stack** — 지금 실행 중인 함수
2. **Heap** — 객체 메모리
3. **Web APIs / Node APIs** — 타이머, 네트워크, I/O
4. **Macrotask Queue** / **Microtask Queue**
5. **Event Loop**

## 2. 한 턴의 순서

1. 스택에서 동기 코드 실행
2. 스택이 비면 **microtask를 가능한 한 모두** 처리
3. (브라우저) 렌더링 기회
4. 다음 **macrotask 하나** 실행
5. 다시 2로…

핵심: **microtask는 macrotask보다 우선**합니다.

## 3. Macrotask vs Microtask

**Macrotask**: `setTimeout`/`setInterval`, I/O 콜백, UI 이벤트, Node `setImmediate`

**Microtask**: `Promise.then`/`catch`/`finally`, `queueMicrotask`, `MutationObserver`  
(Node `process.nextTick`은 더 우선인 별도 큐)

```js
console.log("script start");
setTimeout(() => console.log("timeout"), 0);
Promise.resolve().then(() => console.log("promise"));
queueMicrotask(() => console.log("microtask"));
console.log("script end");

// script start
// script end
// promise
// microtask
// timeout
```

## 4. setTimeout(0)이 늦은 이유

`setTimeout(fn, 0)`은 "0ms 후"가 아니라 **"현재 스택과 microtask가 끝난 뒤 태스크 큐에서 실행"**에 가깝습니다.

## 5. microtask 연쇄의 위험

```js
// ❌ UI/타이머 starvation 가능
function spam() {
  Promise.resolve().then(spam);
}
```

## 6. async/await와 이벤트 루프

`await` 이후 코드는 microtask로 재개됩니다.

```js
async function run() {
  console.log("A");
  await null;
  console.log("B");
}
console.log("C");
run();
console.log("D");
// C A D B
```

## 7. 브라우저 vs Node

개념은 같지만 큐 구현 디테일이 다릅니다. 타이밍을 동일하다고 단정하지 마세요.

Node 페이즈(간략): `timers → pending → poll → check → close` (+ nextTick/microtask 비움)

## 8. 실전에서 느끼는 순간

- 긴 동기 루프로 UI 멈춤
- Promise/타임아웃 race
- 테스트 flaky (타이머/프로미스 플러시 누락)

```js
async function processChunks(items) {
  const size = 1000;
  for (let i = 0; i < items.length; i += size) {
    // heavy work...
    await new Promise((r) => setTimeout(r, 0)); // macrotask yield
  }
}
```

## 9. 한 장 요약

```
동기 코드 → microtasks 전부 → (렌더) → macrotask 1개 → microtasks 전부 → ...
```

---
### Chapter Summary
- Event Loop는 Call Stack이 비었을 때 큐의 작업을 실행한다.
- Microtask(Promise then, queueMicrotask)는 Macrotask(setTimeout 등)보다 우선한다.
- `setTimeout(0)`도 현재 턴의 동기/마이크로보다 늦다.
- `await` 이후는 microtask로 재개된다.
- 과도한 microtask 연쇄는 렌더/타이머 starvation을 유발할 수 있다.
