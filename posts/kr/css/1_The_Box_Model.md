# 1. 박스 모델과 box-sizing (The Box Model)

웹 브라우저가 화면에 요소를 그릴 때, 모든 HTML 요소는 사실 눈에 보이지 않는 **네모난 상자(Box)**로 취급됩니다. 이것이 바로 CSS의 가장 기본이자 핵심인 **박스 모델(Box Model)**입니다.

## 박스 모델의 4가지 영역

각각의 요소는 다음 네 가지 영역으로 구성됩니다:

1. **Content (콘텐츠)**: 텍스트나 이미지 등 실제 내용이 표시되는 핵심 영역입니다.
2. **Padding (패딩)**: 콘텐츠와 테두리(Border) 사이의 안쪽 여백입니다. 요소의 배경색이 이 영역까지 적용됩니다.
3. **Border (테두리)**: 패딩 밖을 감싸는 선입니다. 두께와 스타일, 색상을 지정할 수 있습니다.
4. **Margin (마진)**: 테두리 밖의 바깥쪽 여백으로, 다른 요소와의 간격을 띄울 때 사용합니다. 배경색이 적용되지 않는 투명한 영역입니다.

## 기본 박스 모델의 함정 (content-box)

CSS의 기본 `box-sizing` 값은 `content-box`입니다. 이 상태에서는 요소에 설정한 `width`와 `height`가 오직 **Content 영역**에만 적용됩니다.

```css
.box {
  width: 200px;
  padding: 20px;
  border: 5px solid black;
}
```

위 코드를 보면 눈에 보이는 상자의 실제 너비는 `200px`일까요? 그렇지 않습니다.
실제 렌더링되는 너비는 `200px(Content) + 40px(Padding 양옆) + 10px(Border 양옆) = 250px`가 됩니다.
이로 인해 레이아웃을 짤 때 계산이 매우 복잡해지고, 의도치 않게 요소가 부모 영역을 삐져나가는 문제가 발생합니다.

## 구원자: box-sizing: border-box;

이러한 불편함을 해결하기 위해 현대 웹 개발에서는 프로젝트 초기화 단계에서 항상 다음 코드를 삽입합니다.

```css
*, *::before, *::after {
  box-sizing: border-box;
}
```

`border-box`를 적용하면 우리가 설정한 `width`와 `height`가 **Content + Padding + Border**를 모두 합친 크기가 됩니다.
즉, `width: 200px;`로 설정하면 패딩과 테두리 두께가 아무리 늘어나도 상자의 전체 너비는 `200px`로 고정되며, 그 안에서 Content 영역이 자동으로 줄어들어 비율을 맞춥니다. 직관적이고 예측 가능한 레이아웃을 만들 수 있게 되는 것이죠.

---
### Chapter Summary
- 웹의 모든 요소는 Content, Padding, Border, Margin으로 이루어진 네모난 상자입니다.
- 기본값인 `content-box`는 지정한 너비에 Padding과 Border가 추가로 더해져 레이아웃 계산을 어렵게 만듭니다.
- `box-sizing: border-box;`를 사용하면 Padding과 Border를 포함하여 직관적인 크기 제어가 가능해집니다.
