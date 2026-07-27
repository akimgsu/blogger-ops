# 6편: 헷갈리는 this 바인딩 규칙 완벽 정리 (Arrow function 포함)

`this`는 자바스크립트에서 가장 자주 헷갈리는 키워드입니다. 핵심은 **일반 함수의 `this`가 정의 위치가 아니라 호출 방식(call-site)으로 결정된다**는 것입니다. 단, **화살표 함수는 lexical `this`**를 가집니다.

## 1. 한 줄 원칙

| 함수 종류 | this 결정 |
|-----------|-----------|
| 일반 함수 / 메서드 | call-site |
| 화살표 함수 | lexical (상위 this) |
| `new` 호출 | 새 인스턴스 |
| `bind`/`call`/`apply` | 명시적 지정 |

## 2. 네 가지 기본 바인딩

### Default Binding

```js
function show() {
  console.log(this);
}
show(); // non-strict: globalThis / strict: undefined
```

### Implicit Binding

```js
const user = {
  name: "Ada",
  greet() {
    console.log(`Hi, ${this.name}`);
  },
};
user.greet(); // Hi, Ada

const greet = user.greet;
greet(); // this 상실
setTimeout(user.greet, 0); // this 상실
```

### Explicit Binding

```js
function intro(greeting, punct) {
  console.log(`${greeting}, ${this.name}${punct}`);
}
const person = { name: "Lin" };
intro.call(person, "Hello", "!");
intro.apply(person, ["Hello", "!"]);
const bound = intro.bind(person, "Hi");
bound("?");
```

### new Binding

```js
function Person(name) {
  this.name = name;
}
const p = new Person("Grace");
console.log(p.name); // Grace
```

## 3. 우선순위

높음 → 낮음: **`new` > explicit(`call`/`apply`/`bind`) > implicit(`obj.fn`) > default**

## 4. 화살표 함수의 this

화살표 함수는 자신의 `this`를 갖지 않고 상위 스코프의 `this`를 그대로 씁니다.

```js
const timer = {
  label: "tick",
  start() {
    setInterval(() => {
      console.log(this.label); // timer
    }, 1000);
  },
};
```

주의:

- 메서드 본체를 화살표로 두면 `this`가 객체가 아닐 수 있음
- `new`와 함께 사용 불가
- 프로토타입 메서드로 부적합

규칙: **메서드 본체 = 일반 함수**, **메서드 안 콜백 = 화살표**.

## 5. 클래스 필드 화살표

```js
class Button {
  constructor(label) {
    this.label = label;
  }
  onClick() {
    console.log(this.label);
  }
  onClickArrow = () => {
    console.log(this.label);
  };
}
el.addEventListener("click", b.onClick);      // this 상실 가능
el.addEventListener("click", b.onClickArrow); // this 유지
el.addEventListener("click", b.onClick.bind(b));
```

필드 화살표는 인스턴스마다 함수를 복사하므로 메모리/상속 트레이드오프가 있습니다.

## 6. 실전 패턴

```js
const api = {
  base: "/v1",
  get(path) {
    return fetch(this.base + path);
  },
};
const get = api.get.bind(api);
const get2 = (path) => api.get(path);
```

## 7. 디버깅 체크리스트

1. 화살표인가, 일반 함수인가?
2. 호출이 `obj.fn()`, `fn()`, `fn.call`, `new fn()` 중 무엇인가?
3. 콜백으로 전달되며 암묵 바인딩이 끊겼는가?
4. strict / ESM 탑레벨인가?

---
### Chapter Summary
- 일반 함수의 `this`는 정의가 아니라 호출 방식(call-site)으로 결정된다.
- 우선순위: `new` > explicit > implicit > default.
- 메서드를 콜백으로 넘기면 `this`가 풀리기 쉽다. `bind`/래핑/화살표로 고정한다.
- 화살표 함수는 lexical `this`이며, `new`/메서드 본체에는 부적합하다.
- 클래스 필드 화살표는 편하지만 인스턴스 비용이 있다.
