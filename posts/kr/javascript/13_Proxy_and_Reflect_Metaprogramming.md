# 13편: Proxy와 Reflect를 활용한 메타프로그래밍 기초

**메타프로그래밍**은 프로그램이 자신의 구조/동작을 관찰하고 가로채는 기법입니다. ES6의 `Proxy`와 `Reflect`는 객체 연산에 훅을 걸어 반응형, 로깅, 검증, 동적 API의 기초가 됩니다.

## 1. Proxy란?

**target**에 대한 기본 동작을 **trap**으로 재정의한 래퍼입니다.

```js
const target = { name: "Ada" };
const proxy = new Proxy(target, {
  get(obj, prop, receiver) {
    console.log(`get ${String(prop)}`);
    return Reflect.get(obj, prop, receiver);
  },
  set(obj, prop, value, receiver) {
    console.log(`set ${String(prop)} = ${value}`);
    return Reflect.set(obj, prop, value, receiver);
  },
});
proxy.name;
proxy.age = 30;
```

## 2. 주요 Trap

`get`, `set`, `has`, `deleteProperty`, `ownKeys`, `defineProperty`, `getOwnPropertyDescriptor`, `apply`, `construct`, prototype 관련 trap 등. 필요한 것만 구현하세요.

## 3. Reflect가 필요한 이유

기본 구현을 함수 형태로 제공하며, trap 안에서 **원래 동작 위임**에 안전합니다. `receiver` 전달이 getter/setter·상속에서 중요합니다.

```js
const proxied = new Proxy({ age: 20 }, {
  set(target, prop, value, receiver) {
    if (prop === "age" && (typeof value !== "number" || value < 0)) {
      throw new TypeError("invalid age");
    }
    return Reflect.set(target, prop, value, receiver);
  },
});
```

## 4. 실전 예제

```js
function withDefault(obj, defaultValue = 0) {
  return new Proxy(obj, {
    get(target, prop, receiver) {
      if (prop in target) return Reflect.get(target, prop, receiver);
      return defaultValue;
    },
  });
}

function readOnly(obj) {
  return new Proxy(obj, {
    set() {
      throw new Error("readonly");
    },
    deleteProperty() {
      throw new Error("readonly");
    },
  });
}

function fancyArray(arr) {
  return new Proxy(arr, {
    get(target, prop, receiver) {
      if (typeof prop === "string" && /^-?\d+$/.test(prop)) {
        let index = Number(prop);
        if (index < 0) index = target.length + index;
        return target[index];
      }
      return Reflect.get(target, prop, receiver);
    },
  });
}

function reactive(obj, onChange) {
  return new Proxy(obj, {
    set(target, prop, value, receiver) {
      const prev = target[prop];
      const ok = Reflect.set(target, prop, value, receiver);
      if (ok && prev !== value) onChange(prop, value, prev);
      return ok;
    },
  });
}
```

## 5. 함정

1. `proxy !== target` (identity 다름)
2. 핫패스에서 성능 비용
3. trap 불일치 시 `Object.keys` 등이 깨질 수 있음
4. `#private` 필드는 가로채기 어려움
5. 일부 라이브러리가 object invariant를 가정

## 6. Revocable Proxy

```js
const { proxy, revoke } = Proxy.revocable({ secret: 42 }, {});
console.log(proxy.secret); // 42
revoke();
// proxy.secret → TypeError
```

## 7. 언제 쓰고 언제 피하나

**적합**: 프레임워크 인프라, 로깅/권한 가드, 동적 API  
**신중**: 단순 DTO, 극한 성능 루프, identity가 중요한 공개 SDK

---
### Chapter Summary
- Proxy는 target의 기본 연산을 trap으로 가로채는 메타프로그래밍 도구다.
- Reflect는 기본 동작을 함수로 위임하며 receiver 전달이 중요하다.
- 검증, 로깅, 기본값, 반응형, 동적 API에 활용된다.
- identity/성능/trap 일관성/프라이빗 필드 제약을 기억한다.
- `Proxy.revocable`로 접근 권한을 회수할 수 있다.
