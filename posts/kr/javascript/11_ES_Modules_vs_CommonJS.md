# 11편: ES Modules (ESM) vs CommonJS 차이점과 활용

모듈 시스템은 대규모 JS 코드의 경계입니다. 오늘날 표준은 **ES Modules(ESM)**이고, Node 생태계에는 여전히 **CommonJS(CJS)**가 많이 남아 있습니다.

## 1. 한눈에 비교

| | ESM | CommonJS |
|--|-----|----------|
| 문법 | `import` / `export` | `require` / `module.exports` |
| 로딩 | 정적(기본), `import()`로 동적 | 동기 |
| Tree-shaking | 유리 | 어려움 |
| 브라우저 네이티브 | 지원 | 비지원 |
| top-level this | `undefined` | 모듈 관련 |

## 2. ESM 기본

```js
// math.js
export const PI = 3.14;
export function add(a, b) {
  return a + b;
}
export default function sum(list) {
  return list.reduce((a, b) => a + b, 0);
}

// main.js
import sum, { PI, add } from "./math.js";
import * as math from "./math.js";
```

## 3. CommonJS 기본

```js
// math.cjs
module.exports = {
  PI: 3.14,
  add(a, b) {
    return a + b;
  },
};

const { add } = require("./math.cjs");
const key = condition ? "./a" : "./b";
require(key); // 동적 경로 가능
```

## 4. 정적 vs 동적

```js
// 정적 import 경로는 완전히 동적일 수 없음
const mod = await import(condition ? "./a.js" : "./b.js");
```

정적 ESM 그래프 덕분에 번들러가 **tree-shaking**을 잘 수행합니다.

## 5. Live Binding

```js
// counter.js
export let count = 0;
export function inc() {
  count += 1;
}

import { count, inc } from "./counter.js";
inc();
console.log(count); // 1 — live binding
```

CJS는 보통 값 스냅샷(복사) 느낌이 강합니다(getter로 우회 가능).

## 6. 순환 의존

둘 다 순환이 가능하지만 평가 타이밍이 다릅니다. ESM에서는 일시적으로 `undefined`를 볼 수 있습니다. **가능하면 설계로 제거**하세요.

## 7. Node.js 혼용

```json
{ "type": "module" }
```

- `"type": "module"` → `.js`는 ESM, CJS는 `.cjs`
- 미설정 시 → `.js`는 CJS, ESM은 `.mjs`

```js
import pkg from "./legacy.cjs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);

// CJS에서 ESM은 대개:
const esm = await import("./modern.js");

import path from "node:path";
import { fileURLToPath } from "node:url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
```

## 8. 브라우저 ESM

```html
<script type="module" src="/app.js"></script>
```

자동으로 defer에 가까운 동작, 기본 strict mode, CORS 주의.

## 9. 실무 가이드

1. 새 프로젝트는 ESM 기본
2. 라이브러리 dual package 시 dual-package hazard 주의
3. `sideEffects`로 tree-shaking 최적화
4. named export로 명시성 확보

---
### Chapter Summary
- ESM은 표준 정적 모듈 시스템, CJS는 Node의 전통적 동기 모듈이다.
- ESM은 live binding·tree-shaking에 유리하고, 동적 로딩은 `import()`다.
- CJS는 `require`/`module.exports`이며 값 복사 느낌이 강하다.
- Node에서는 `type`/`mjs`/`cjs`로 혼용하며 CJS←ESM 방향에 제약이 있다.
- 순환 참조는 피하고 신규 코드는 ESM을 기본으로 한다.
