# 10. CSS 렌더링 성능 최적화 (Reflow & Repaint)

CSS를 예쁘게 짜는 것을 넘어, 브라우저가 화면을 부드럽게 그리도록 최적화하는 것은 중/고급 개발자의 필수 덕목입니다. 특히 애니메이션이 버벅이는(Jank) 현상을 막으려면 브라우저의 렌더링 과정을 이해해야 합니다.

## 브라우저의 렌더링 과정 (Critical Rendering Path)

브라우저가 화면을 그리는 핵심 과정은 크게 3단계로 나뉩니다.

1. **Layout (또는 Reflow)**: 요소들의 크기와 위치(좌표)를 계산하여 레이아웃을 잡는 단계입니다. (`width`, `height`, `margin`, `top`, `left` 등 변경 시 발생)
2. **Paint (또는 Repaint)**: 계산된 영역에 색상이나 그림자를 채워 넣는 픽셀 렌더링 단계입니다. (`color`, `background-color`, `box-shadow` 등 변경 시 발생)
3. **Composite (합성)**: 그려진 여러 개의 레이어를 차곡차곡 합쳐서 최종 화면을 완성하는 단계입니다. (`transform`, `opacity` 변경 시 발생)

## 애니메이션 성능 최적화: transform의 마법

초보자들은 요소를 이동시키는 애니메이션을 만들 때 `top`이나 `left` 속성을 자주 사용합니다.

```css
/* ❌ 나쁜 예: Reflow 발생 */
.box {
  transition: left 0.3s ease;
  left: 0;
}
.box:hover {
  left: 100px;
}
```

하지만 `top`이나 `left`가 변하면 브라우저는 요소의 위치를 다시 계산하는 **Reflow** 과정을 애니메이션의 매 프레임마다 발생시켜 엄청난 연산 부하를 일으킵니다. 이를 해결하는 구원자가 바로 `transform`입니다.

```css
/* ✅ 좋은 예: Composite만 발생 (GPU 가속) */
.box {
  transition: transform 0.3s ease;
  transform: translateX(0);
}
.box:hover {
  transform: translateX(100px);
}
```

`transform`과 `opacity` 속성은 Reflow와 Paint 단계를 건너뛰고 오직 **Composite 단계**만 트리거합니다. 게다가 브라우저는 이 속성들의 연산을 CPU가 아닌 **GPU(그래픽 카드)**로 넘겨버립니다(하드웨어 가속). 결과적으로 모바일 기기에서도 60fps를 유지하는 부드러운 애니메이션을 만들 수 있습니다.

---
### Chapter Summary
- 브라우저는 렌더링 시 **Layout(크기/위치) -> Paint(색상) -> Composite(합성)** 단계를 거칩니다.
- 위치나 크기를 바꾸는 속성(`top`, `width` 등)을 애니메이션 처리하면 매 프레임 Reflow가 발생해 성능이 크게 저하됩니다.
- 애니메이션을 줄 때는 항상 `transform`과 `opacity`를 사용하여 연산을 GPU로 넘기고 부드러운 렌더링을 유도해야 합니다.
