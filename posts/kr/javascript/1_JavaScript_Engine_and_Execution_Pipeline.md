# 1편: 자바스크립트 엔진과 실행 파이프라인 완벽 이해 (V8, AST, JIT)

자바스크립트는 "인터프리터 언어"라고 불리지만, 현대 엔진(특히 Chrome/Node.js의 **V8**)은 한 줄씩만 실행하지 않습니다. **파싱 → AST → 바이트코드 → JIT 컴파일 → 최적화/디옵티마이즈**라는 정교한 파이프라인을 거칩니다. 이 흐름을 이해하면 성능 이슈의 원인을 훨씬 빠르게 짚을 수 있습니다.

## 1. 자바스크립트 엔진이란?

**JavaScript Engine**은 JS 소스 코드를 읽어 실행 가능한 형태로 바꾸고 실제로 돌리는 프로그램입니다.

| 엔진 | 사용처 |
|------|--------|
| V8 | Chrome, Node.js, Deno, Electron |
| SpiderMonkey | Firefox |
| JavaScriptCore | Safari, Bun(일부) |

실무에서 가장 많이 마주치는 **V8**을 기준으로 설명합니다.

## 2. 실행 파이프라인 한눈에 보기

```
Source Code
  → Parser (Lexical + Syntax Analysis)
  → AST (Abstract Syntax Tree)
  → Ignition (Interpreter) → Bytecode
  → Hot Spot 감지
  → TurboFan (Optimizing JIT) → Machine Code
  → (가정 깨짐 시) Deoptimization → Bytecode로 복귀
```

처음부터 전부 네이티브 코드로 컴파일하지 않습니다. 빠르게 시작한 뒤, **자주 도는 코드(hot code)**만 깊게 최적화합니다.

## 3. Parsing: 소스 → 토큰 → AST

### Lexical Analysis

소스 문자열을 **token** 단위로 나눕니다.

```js
const sum = (a, b) => a + b;
```

### Syntax Analysis와 AST

토큰을 문법 규칙에 맞춰 **Abstract Syntax Tree(AST)**로 조립합니다. AST는 코드 구조의 중간 표현이며, Babel, ESLint, TypeScript 컴파일러도 AST를 중심으로 동작합니다.

```js
// 입력
const x = 1 + 2;

// 개념적 AST
// VariableDeclaration
//  └─ BinaryExpression(+)
//      ├─ Literal(1)
//      └─ Literal(2)
```

## 4. Ignition: 인터프리터와 바이트코드

V8의 **Ignition**은 AST를 **bytecode**로 바꿔 해석 실행합니다.

왜 바로 머신 코드가 아닐까요?

1. **빠른 startup** — 컴파일 비용을 앞당기지 않음
2. **메모리 효율** — 최적화된 머신 코드는 용량이 큼
3. **프로파일링** — 실행하며 타입/호출 패턴을 수집

실행 중 V8는 **Feedback Vector**(인라인 캐시)에 타입 힌트를 쌓습니다.

## 5. JIT과 TurboFan

**JIT(Just-In-Time)**은 실행 중에 hot code를 네이티브 머신 코드로 바꿉니다. 같은 함수가 수만 번 호출되면 **TurboFan**이 **speculative optimization**(가정 기반 최적화)을 수행합니다.

```js
function add(a, b) {
  return a + b; // 관측: 항상 number + number
}

for (let i = 0; i < 100000; i++) add(i, i + 1);

add("hello", "world"); // 가정이 깨질 수 있음 → deopt 후보
```

## 6. Deoptimization (디옵트)

최적화된 코드의 가정이 깨지면 V8는 머신 코드를 버리고 Ignition 바이트코드로 돌아갑니다.

자주 발생하는 원인:

- 인자 타입이 갑자기 바뀜
- 객체 **shape**(히든 클래스)가 바뀜
- `eval`, `with` 등 최적화 방해 패턴
- megamorphic 호출 사이트

```js
function greet(user) {
  return "Hi, " + user.name;
}

greet({ name: "Ada" });
greet({ name: "Grace", age: 30 }); // shape 변화
greet({ fullName: "NoName" });     // 프로퍼티도 다름 → 더 불리
```

실무 팁: **같은 shape의 객체를 일관되게** 만들고, 핫 함수는 **한두 가지 타입**에 집중시키세요.

## 7. 느린 패턴 vs 안정적인 패턴

```js
// ❌ 타입이 자주 바뀌는 함수
function accumulate(list) {
  let sum = 0;
  for (const item of list) sum += item;
  return sum;
}

// ✅ 역할을 분리
function sumNumbers(list) {
  let sum = 0;
  for (const n of list) sum += n;
  return sum;
}

function joinStrings(list) {
  let out = "";
  for (const s of list) out += s;
  return out;
}
```

## 8. 실무 포인트

1. JS는 "한 번에 인터프리트만" 하지 않는다 — Ignition + TurboFan 협업이다.
2. **AST**는 린트/트랜스파일/번들러의 공통 언어다.
3. **Hot path**만 JIT으로 깊게 최적화된다.
4. 타입/객체 shape 안정성이 성능에 직접 영향을 준다.
5. 마이크로벤치는 warm-up 구간을 고려해야 한다.

---
### Chapter Summary
- V8는 Parser → AST → Ignition(bytecode) → TurboFan(JIT) → (필요 시) Deopt 파이프라인으로 실행한다.
- AST는 도구 체인의 중심이 되는 코드 구조 중간 표현이다.
- JIT은 hot code를 가정 기반으로 머신 코드로 바꾼다.
- 타입/객체 모양이 흔들리면 deopt가 발생해 성능이 떨어질 수 있다.
- 일관된 데이터 shape와 좁은 타입이 V8 친화적이다.
