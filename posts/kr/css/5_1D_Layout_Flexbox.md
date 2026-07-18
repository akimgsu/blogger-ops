# 5. 1차원 레이아웃의 지배자: Flexbox (1D Layout)

과거 웹 개발자들은 요소를 가로로 배치하기 위해 `float`이나 `display: inline-block` 같은 꼼수(Hack)를 사용해야 했습니다. 하지만 **Flexbox(Flexible Box Layout)**가 등장하면서 CSS 레이아웃의 역사가 바뀌었습니다. Flexbox는 행(Row)이나 열(Column) 중 **하나의 방향(1차원)**으로 요소들을 효율적으로 정렬하고 분배하는 데 특화되어 있습니다.

## 주축(Main-axis)과 교차축(Cross-axis)

Flexbox를 마스터하기 위한 핵심은 **두 개의 축(Axis)**을 이해하는 것입니다.

- **Main-axis (주축)**: 요소들이 배치되는 주된 방향입니다. `flex-direction` 속성에 의해 결정됩니다. (기본값인 `row`일 경우 가로 방향, `column`일 경우 세로 방향)
- **Cross-axis (교차축)**: 주축에 수직으로 교차하는 방향입니다. 주축이 가로면 교차축은 세로가 됩니다.

Flexbox의 정렬 속성들은 이 두 축을 기준으로 작동합니다.

## 완벽한 중앙 정렬의 마법

과거에는 요소를 화면 정중앙에 배치하는 것이 수많은 계산과 `transform`을 요구하는 어려운 과제였습니다. 하지만 Flexbox를 사용하면 단 3줄의 코드로 완벽한 수직/수평 중앙 정렬이 가능합니다.

```css
.container {
  display: flex;
  justify-content: center; /* 주축(가로) 기준 중앙 정렬 */
  align-items: center;     /* 교차축(세로) 기준 중앙 정렬 */
  height: 100vh;           /* 화면 전체 높이 확보 */
}
```

- **`justify-content`**: 아이템들을 **주축(Main-axis)**을 따라 어떻게 분배할지 결정합니다. (`flex-start`, `center`, `space-between`, `space-around` 등)
- **`align-items`**: 아이템들을 **교차축(Cross-axis)**을 따라 어떻게 정렬할지 결정합니다. (`stretch`, `center`, `flex-start`, `flex-end` 등)

Flexbox는 요소의 크기를 유연하게 늘리거나 줄일 수 있는 `flex-grow`, `flex-shrink` 등의 속성과 결합하여, 모바일 환경에 적합한 유연한 네비게이션 바나 버튼 그룹을 만드는 데 최고의 성능을 발휘합니다.

---
### Chapter Summary
- Flexbox는 1차원(행 또는 열) 기반의 레이아웃을 구성하는 가장 강력한 최신 도구입니다.
- 요소 배치는 `flex-direction`으로 결정되는 **주축(Main-axis)**과 이에 수직인 **교차축(Cross-axis)**을 기준으로 이루어집니다.
- 부모 컨테이너에 `display: flex; justify-content: center; align-items: center;`를 주면 완벽한 정중앙 정렬이 가능합니다.
