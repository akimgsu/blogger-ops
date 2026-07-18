# 6. 2차원 바둑판 레이아웃: CSS Grid (2D Layout)

Flexbox가 1차원(행 또는 열) 레이아웃의 지배자라면, **CSS Grid**는 2차원 레이아웃의 마스터입니다. Grid는 이름 그대로 바둑판 형태의 격자를 만들어 **행(Row)과 열(Column)을 동시에 제어**할 수 있는 현존하는 가장 강력한 CSS 레이아웃 시스템입니다.

## 2차원 제어: Row와 Column

Flexbox에서는 요소를 다음 줄로 넘기려면 `flex-wrap`을 쓰고 크기를 복잡하게 계산해야 했지만, Grid에서는 부모 컨테이너에 명시적으로 행과 열의 크기와 개수를 지정합니다.

```css
.grid-container {
  display: grid;
  grid-template-columns: 200px 1fr 1fr; /* 3개의 열: 첫 열은 200px, 나머지는 남은 공간 반분 */
  grid-template-rows: 100px auto;       /* 2개의 행: 첫 행은 100px, 두 번째는 콘텐츠 크기만큼 */
  gap: 20px;                            /* 아이템 사이의 간격 */
}
```

- **`1fr` (Fraction)**: Grid에서만 쓸 수 있는 마법의 단위로, "사용 가능한 남은 여백의 비율"을 의미합니다. 퍼센트(%) 계산의 고통에서 해방시켜 줍니다.
- **`gap`**: 요소 사이의 간격을 마진 겹침 걱정 없이 깔끔하게 띄워줍니다.

## 직관적인 영역 지정: grid-template-areas

Grid의 진정한 힘은 복잡한 대시보드나 매거진 스타일의 레이아웃을 짤 때 발휘됩니다. `grid-template-areas`를 사용하면 마치 코드 위에 그림을 그리듯 직관적으로 레이아웃 구조를 시각화할 수 있습니다.

```css
.dashboard {
  display: grid;
  grid-template-areas:
    "header header header"
    "sidebar main-content widget"
    "footer footer footer";
}

.header { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main { grid-area: main-content; }
.widget { grid-area: widget; }
.footer { grid-area: footer; }
```

이렇게 설정하면 복잡한 미디어 쿼리를 작성할 때도, 모바일 화면에서는 `grid-template-areas`의 문자열 구조만 세로로 길게 바꿔주면(`"header" "main" "sidebar" ...`) 마크업 순서를 건드리지 않고도 완벽하게 레이아웃을 재배치할 수 있습니다.

---
### Chapter Summary
- CSS Grid는 행과 열을 동시에 제어하여 복잡한 페이지 뼈대를 잡는 2차원 레이아웃 시스템입니다.
- `fr` 단위와 `gap` 속성을 통해 직관적인 공간 분할과 간격 조절이 가능합니다.
- `grid-template-areas`를 활용하면 코드만 보고도 전체 레이아웃 형태를 파악하고 쉽게 변경할 수 있습니다.
