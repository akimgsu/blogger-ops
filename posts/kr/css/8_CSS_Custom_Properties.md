# 8. CSS 변수와 다크 모드 (CSS Custom Properties)

CSS가 강력해지면서 SASS나 LESS 같은 전처리기를 쓰지 않고도 네이티브에서 변수를 사용할 수 있게 되었습니다. 이를 **CSS Custom Properties (CSS 변수)**라고 부릅니다. 이 기술은 특히 테마 변경, 그중에서도 **다크 모드(Dark Mode)** 구현에 있어서 자바스크립트의 개입을 최소화하는 혁신적인 방법입니다.

## 네이티브 CSS 변수 선언과 활용

변수는 대시 두 개(`--`)로 시작하며, 전역에서 사용하려면 `:root` 가상 클래스에 선언합니다. 사용할 때는 `var()` 함수를 호출합니다.

```css
/* 전역 변수 선언 */
:root {
  --main-bg-color: #ffffff;
  --main-text-color: #333333;
  --primary-accent: #007bff;
}

/* 변수 적용 */
body {
  background-color: var(--main-bg-color);
  color: var(--main-text-color);
}

button {
  background-color: var(--primary-accent);
}
```

변수를 사용하면 서비스의 메인 컬러가 변경될 때 파일 수십 개를 뒤질 필요 없이 `:root`에 있는 변수 값 하나만 수정하면 됩니다.

## 자바스크립트 없이, 혹은 최소화하여 다크 모드 구현하기

CSS 변수가 빛을 발하는 순간은 테마 교체입니다. 브라우저가 사용자의 OS 다크 모드 설정을 감지하게 하려면 `@media (prefers-color-scheme: dark)`를 사용할 수 있습니다.

```css
/* 사용자의 시스템 설정이 다크 모드일 때 변수 덮어쓰기 */
@media (prefers-color-scheme: dark) {
  :root {
    --main-bg-color: #121212;
    --main-text-color: #e0e0e0;
    --primary-accent: #bb86fc;
  }
}
```

만약 사용자가 사이트 내에 있는 '테마 전환 토글 버튼'을 누르게 하고 싶다면, 자바스크립트로 `<body>`나 `<html>` 태그에 `data-theme="dark"` 속성 하나만 추가/제거해주면 됩니다.

```css
/* 데이터 속성을 활용한 다크 모드 제어 */
[data-theme="dark"] {
  --main-bg-color: #121212;
  --main-text-color: #e0e0e0;
}
```

이처럼 CSS 변수를 활용하면 각 요소들의 컬러 코드를 일일이 자바스크립트로 변경할 필요 없이, 가장 상위의 변수 값만 갈아 끼우는 방식으로 성능 좋고 깔끔하게 다크 모드를 구현할 수 있습니다.

---
### Chapter Summary
- 네이티브 CSS 변수(`--var-name`)를 `:root`에 선언하고 `var()`로 호출하여 스타일 코드의 재사용성과 유지보수성을 극대화합니다.
- 테마가 바뀔 때 모든 요소의 색상을 수정할 필요 없이, 최상단 변수의 값만 덮어쓰면 전체 사이트의 색상이 한 번에 변경됩니다.
- `@media (prefers-color-scheme: dark)`나 HTML 속성 선택자(`[data-theme="dark"]`)를 변수와 결합하면 자바스크립트 의존도를 크게 낮추어 다크 모드를 구현할 수 있습니다.
