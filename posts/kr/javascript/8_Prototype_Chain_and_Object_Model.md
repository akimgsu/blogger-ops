# 8편: 프로토타입(Prototypes) 체인과 객체 모델의 이해

클래스 문법이 익숙해도, 자바스크립트의 실체는 **프로토타입 기반 객체 모델**입니다. `class`는 문법 설탕에 가깝고, 프로퍼티 조회는 **prototype chain**을 따릅니다.

## 1. [[Prototype]] 위임

```js
const animal = {
  eat() {
    return "yum";
  },
};
const dog = Object.create(animal);
dog.bark = () => "woof";

console.log(dog.bark()); // own
console.log(dog.eat());  // prototype
console.log(dog.toString()); // Object.prototype까지
```

## 2. __proto__ vs prototype vs [[Prototype]]

| 이름 | 의미 |
|------|------|
| `obj.[[Prototype]]` | 실제 위임 대상 |
| `obj.__proto__` | 레거시 accessor |
| `Fn.prototype` | `new Fn()` 인스턴스의 `[[Prototype]]`이 될 객체 |

```js
function Person(name) {
  this.name = name;
}
Person.prototype.sayHi = function () {
  return `Hi, ${this.name}`;
};
const p = new Person("Ada");
Object.getPrototypeOf(p) === Person.prototype; // true
```

권장 API: `Object.getPrototypeOf`, `Object.create`, (신중히) `Object.setPrototypeOf`.

## 3. new가 하는 일

```js
function imaginaryNew(Constructor, ...args) {
  const instance = Object.create(Constructor.prototype);
  const result = Constructor.apply(instance, args);
  return result && typeof result === "object" ? result : instance;
}
```

## 4. 체인 탐색

```js
const a = { x: 1 };
const c = Object.create(Object.create(a));
c.y = 2;
console.log("x" in c);              // true
console.log(Object.hasOwn(c, "x")); // false
```

`in`은 체인을 보고, `Object.hasOwn`은 own만 봅니다.

## 5. class는 무엇을 만드는가?

```js
class Animal {
  constructor(name) {
    this.name = name;
  }
  speak() {
    return `${this.name} makes a noise`;
  }
}
class Dog extends Animal {
  speak() {
    return `${this.name} barks`;
  }
}
Object.getPrototypeOf(Dog.prototype) === Animal.prototype; // true
```

`static` 메서드는 생성자 함수 객체의 프로퍼티입니다.

## 6. 섀도잉(Shadowing)

읽기는 체인을 타고, **쓰기는 기본적으로 own property를 만듭니다**(setter가 없는 한).

## 7. 프로토타입 오염 방어

```js
const dict = Object.create(null); // 프로토타입 없음
dict.admin = true;
console.log(dict.toString); // undefined
```

사전(dictionary) 용도는 `Map` 또는 `Object.create(null)`, unsafe merge와 `__proto__` 키를 피하세요.

## 8. 상태 vs 공유 메서드

```js
function Point(x, y) {
  this.x = x;
  this.y = y;
}
Point.prototype.dist = function () {
  return Math.hypot(this.x, this.y);
};
```

- 상태 → 인스턴스
- 공유 동작 → prototype / class 메서드

## 9. 실무 조언

1. 새 코드는 `class`로 가독성을 확보하되 프로토타입 원리를 이해하라.
2. `__proto__` 직접 조작 대신 표준 API를 써라.
3. 런타임 `setPrototypeOf`는 최적화에 불리할 수 있다.
4. 딕셔너리는 `Map` / null-prototype 객체를 써라.

---
### Chapter Summary
- JS 객체 모델의 핵심은 prototype chain을 통한 프로퍼티 위임이다.
- `Fn.prototype`은 `new Fn()` 인스턴스의 `[[Prototype]]`이 된다.
- `class`는 프로토타입 연결을 감싼 문법이다.
- 읽기는 체인 탐색, 쓰기는 주로 own property 생성(섀도잉)이다.
- 프로토타입 오염을 피하려면 null-prototype 객체나 Map을 활용한다.
