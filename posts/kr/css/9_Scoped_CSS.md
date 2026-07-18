# 9. 컴포넌트 기반 스타일링과 캡슐화 (Scoped CSS)

과거 웹 개발은 하나의 거대한 `style.css` 파일에 모든 스타일을 때려 넣는 방식이었습니다. 하지만 현대의 프론트엔드 개발(Angular, React, Vue 등)은 UI를 독립적인 **컴포넌트(Component)** 단위로 조립합니다. 이때 가장 골칫거리는 A 컴포넌트에서 작성한 `.title` 클래스가 B 컴포넌트의 `.title` 디자인을 망가뜨리는 **스타일 누수(Style Leak)** 현상입니다. 이를 막기 위해 **스타일 캡슐화(Encapsulation)**가 등장했습니다.

## 스타일 캡슐화의 원리 (예: Angular ViewEncapsulation)

Angular는 기본적으로 `ViewEncapsulation.Emulated`를 사용하여 스타일을 격리합니다. 개발자가 컴포넌트 CSS에 `.title { color: red; }`라고 작성하면, 컴파일 시 브라우저에는 다음과 같이 고유한 속성이 붙어서 렌더링됩니다.

```css
/* 렌더링 된 결과물 */
.title[_ngcontent-c1] {
  color: red;
}
```

HTML 태그 역시 `<h1 class="title" _ngcontent-c1>` 형태로 변환됩니다. 즉, 프레임워크가 무작위 식별자(Attribute)를 붙여 오직 해당 컴포넌트 안에서만 스타일이 적용되도록 가두어 버리는(Scope) 원리입니다.

## 네이밍 규칙으로 캡슐화 모방하기: BEM 방법론

프레임워크의 도움 없이 순수 CSS만으로 캡슐화를 흉내 내는 가장 유명한 방법이 **BEM(Block, Element, Modifier)** 방법론입니다. 클래스 이름을 구조적으로 지어 중복을 원천 차단합니다.

- **Block (블록)**: 독립적으로 의미를 가지는 컴포넌트 덩어리 (`.card`)
- **Element (요소)**: 블록에 종속된 하위 요소. `__` (언더스코어 2개)로 연결 (`.card__title`)
- **Modifier (상태/수식어)**: 블록이나 요소의 변형(상태). `--` (대시 2개)로 연결 (`.card--dark`)

```html
<!-- BEM 방법론이 적용된 HTML -->
<div class="card card--dark">
  <h2 class="card__title">카드 제목</h2>
  <button class="card__button card__button--active">클릭</button>
</div>
```

BEM을 사용하면 클래스 이름만 보고도 HTML 구조를 파악할 수 있으며, 전역 스코프에서 이름이 충돌하는 것을 완벽하게 방지할 수 있습니다.

---
### Chapter Summary
- 현대 웹은 스타일이 다른 곳으로 새어나가는 것을 막기 위해 컴포넌트 단위로 스타일을 격리(Scoped CSS)합니다.
- Angular 같은 프레임워크는 고유한 속성(Attribute)을 부여하여 스타일을 캡슐화합니다.
- BEM 방법론(`블록__요소--상태`)을 사용하면 순수 CSS 환경에서도 클래스명 충돌을 방지하고 코드의 가독성을 높일 수 있습니다.
