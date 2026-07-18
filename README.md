# Blogger Auto-Publish Operations (blogger-ops)

GitHub Actions를 통해 로컬에서 작성한 HTML 포스트를 구글 블로그(Blogger)로 자동 업로드하고 스타일링을 적용하는 자동화 프로젝트입니다.

---

## 📂 디렉토리 구조

```text
blogger-ops/
├── .github/
│   └── workflows/
│       └── publish.yml      # GitHub Actions 워크플로우 설정 파일
├── posts/
│   └── en/
│       └── css/            # 포스트 파일들이 들어가는 경로 (.html)
├── scripts/
│   └── publish.js          # Blogger API 포스팅 핵심 스크립트
├── styles/
│   └── post-style.css      # 포스트 본문에 자동 주입되는 CSS 스타일시트
└── README.md               # 프로젝트 사용 가이드 (본 파일)
```

---

## 🚀 사용 방법

### 1. 환경 변수 및 GitHub Secrets 설정
스크립트를 실행하거나 GitHub Actions가 정상 작동하려면 아래 4가지 보안 인증 정보가 필요합니다. Local 환경(`.env` 등) 또는 **GitHub Repository -> Settings -> Secrets and variables -> Actions**에 Secrets로 등록해야 합니다.

*   `CLIENT_ID`: Google Cloud Console에서 생성한 OAuth 2.0 클라이언트 ID
*   `CLIENT_SECRET`: OAuth 2.0 클라이언트 보안 비밀번호
*   `REFRESH_TOKEN`: Blogger API 호출을 위한 OAuth Refresh Token
*   `BLOG_ID`: 포스팅할 구글 블로그의 고유 ID

### 2. 새 글 작성하기
`posts/en/` 하위 카테고리 폴더(예: `css/`)에 HTML 형식으로 글을 작성합니다.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <!-- 블로그 포스트의 제목이 될 부분입니다 -->
    <title>[Part 1] HTML Post Title</title>
</head>
<body>
    <article>
        <h1>포스트 대제목</h1>
        <p>여기에 본문 내용을 작성합니다. html 태그를 자유롭게 사용하세요.</p>
        
        <h2>소제목</h2>
        <p>인라인 코드 <code>const a = 1;</code> 사용 예시입니다.</p>
        
        <pre><code>// 코드 블록 예시
function hello() {
  console.log("Hello Blogger!");
}</code></pre>
    </article>
</body>
</html>
```

*   **제목 추출:** `<title>` 태그 안의 텍스트가 자동으로 블로그 글의 제목이 됩니다.
*   **태그(Label) 추출:** 파일 경로(예: `posts/en/css/...`)에서 카테고리 이름(`css`)을 분석하여 블로그 태그(Label)로 자동 등록합니다.
*   **본문 추출:** `<body>` 태그 안의 내용만 추출하여 업로드합니다.

### 3. 포스트 스타일링 변경하기
본 프로젝트의 스타일은 구글 블로그(Blogger) 테마 설정에 직접 CSS 코드를 등록하여 일괄 적용하는 방식을 권장합니다.

1. `styles/post-style.css`에 백업되어 있는 스타일 코드를 전체 복사합니다.
2. Blogger 관리자 페이지 -> **테마(Theme)** -> **맞춤설정(Customize)**으로 이동합니다.
3. 좌측 메뉴의 **고급(Advanced)** -> **Add CSS** 드롭다운 메뉴를 선택하고 복사한 코드를 붙여넣은 뒤 우측 하단 **저장** 버튼을 누릅니다.

> [!NOTE]
> 만약 각 포스트 본문에 개별적으로 스타일 코드를 내장하여 업로드하고 싶다면, `scripts/publish.js` 파일 내의 `Inject CSS styling` 주석 처리된 부분을 해제해 주시면 됩니다.

### 4. 배포(Publishing) 실행하기

#### 방법 A: Git Push를 통한 자동 배포 (일반적인 방법)
`main` 브랜치에 변경한 HTML 파일을 푸시하면, GitHub Actions가 **실제 변경된(수정되거나 추가된) 파일만 감지**하여 자동으로 Blogger에 게시합니다.

```bash
git add .
git commit -m "docs: add new post about flexbox"
git push origin main
```

#### 방법 B: GitHub Actions에서 수동 전체 배포 (수동 실행)
만약 기존의 모든 포스트를 한 번에 다시 업로드(또는 스타일 업데이트 반영)하고 싶다면 수동 실행을 이용할 수 있습니다.
1. GitHub 저장소의 **Actions** 탭으로 이동합니다.
2. **Publish Post to Blogger** 워크플로우를 선택합니다.
3. 우측의 **Run workflow** 드롭다운을 클릭합니다.
4. `Publish all files (ignore changed-files check)` 체크박스를 **체크(✅)**한 뒤 **Run workflow** 버튼을 실행합니다.

---

## 🛠️ 핵심 파일 설명

### `scripts/publish.js`
*   Node.js 환경에서 작동하며, 구글 Blogger API 클라이언트를 연결합니다.
*   파일 경로를 인자로 받아 HTML 문서를 읽어옵니다.
*   `<title>`, `<body>` 태그를 파싱하고 `styles/post-style.css` 스타일시트를 가져와 하나의 완성된 HTML 본문으로 조립합니다.
*   API 호출을 통해 글을 작성합니다.

### `.github/workflows/publish.yml`
*   GitHub Actions CI/CD 파일입니다.
*   구글 API의 트래픽 제한(429 Rate Limit) 및 스팸 오인 방지를 위해 각 파일 업로드 사이에 **30초의 지연 시간(sleep 30)**을 가지도록 구성되어 있습니다.
