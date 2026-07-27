# 10편: Promise와 async/await 실전 비동기 처리 가이드

콜백 지옥을 끝내고 비동기 흐름을 선형으로 다루게 한 것이 **Promise**와 **async/await**입니다. 상태 모델, 조합 메서드, 에러 처리, 실전 패턴과 안티패턴을 정리합니다.

## 1. Promise란?

미래 완료/실패를 나타내는 객체입니다. 상태는 한 방향으로만 바뀝니다.

- `pending` → `fulfilled`
- `pending` → `rejected`

```js
const p = new Promise((resolve, reject) => {
  const ok = true;
  if (ok) resolve({ id: 1 });
  else reject(new Error("fail"));
});
p.then(console.log).catch(console.error).finally(() => console.log("done"));
```

## 2. then 체이닝

`then`은 항상 **새 Promise**를 반환합니다.

```js
Promise.resolve(1)
  .then((n) => n + 1)
  .then(() => {
    throw new Error("boom");
  })
  .catch((e) => {
    console.error(e.message);
    return 0; // 복구
  })
  .then((n) => console.log("recovered:", n));
```

- 값 반환 → 다음 then fulfill
- Promise 반환 → 합류(flatten)
- throw/reject → 다음 catch

## 3. async/await

`async` 함수는 항상 Promise를 반환합니다. `await`는 settle까지 함수 실행을 잠시 멈춥니다(microtask 재개).

```js
async function loadUser(id) {
  const res = await fetch(`/api/users/${id}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
loadUser(1).then(console.log).catch(console.error);
```

## 4. 에러 처리

```js
async function main() {
  try {
    const user = await loadUser(1);
    console.log(user.name);
  } catch (e) {
    console.error("failed:", e);
  } finally {
    console.log("cleanup");
  }
}
// floating promise는 반드시 .catch
```

## 5. 병렬 vs 직렬

```js
const a = await fetchA();
const b = await fetchB(); // 직렬

const [a2, b2] = await Promise.all([fetchA(), fetchB()]); // 병렬
```

| 메서드 | 의미 |
|--------|------|
| `Promise.all` | 모두 성공 / 하나 실패 시 즉시 실패 |
| `Promise.allSettled` | 모두 끝날 때까지 |
| `Promise.race` | 가장 먼저 settle |
| `Promise.any` | 가장 먼저 성공 |

```js
function withTimeout(promise, ms) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("timeout")), ms)
  );
  return Promise.race([promise, timeout]);
}
```

## 6. 실전 패턴

```js
async function mapSeries(items, fn) {
  const out = [];
  for (const item of items) out.push(await fn(item));
  return out;
}

async function mapPool(items, limit, fn) {
  const results = new Array(items.length);
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await fn(items[idx]);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, () => worker())
  );
  return results;
}
```

## 7. 안티패턴

- 독립 작업을 루프에서 직렬 `await`
- `new Promise(async () => { ... })` (async executor)
- catch 없는 floating promise
- then과 await를 섞어 가독성만 악화

## 8. 콜백 래핑 / top-level await

```js
function readFileP(path) {
  return new Promise((resolve, reject) => {
    readFile(path, "utf8", (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
}
```

ESM에서는 탑레벨 `await`가 가능하지만 모듈 평가가 지연됩니다.

---
### Chapter Summary
- Promise는 pending → fulfilled/rejected의 불변 상태 머신이다.
- then 체이닝과 async/await는 같은 모델의 다른 문법이다.
- 독립 작업은 `Promise.all`/`allSettled`로 병렬화하고 실패 정책을 고른다.
- try/catch와 `.catch`로 rejection을 반드시 처리한다.
- 직렬 await 남용, async executor, floating promise는 안티패턴이다.
