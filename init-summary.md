# 두깨비 (Dukkaebi) Web

알고리즘 문제 풀이와 코딩 강의를 제공하는 한국어 플랫폼의 프론트엔드입니다. Vite + React 19 + TypeScript SPA로 구축되어 있습니다.

[English README](./README.md)

## 주요 기능

- **문제 풀이** — 문제 목록 탐색, 브라우저 내 Monaco 에디터에서 코드 작성, 백엔드 채점 서버에 제출
- **강의** — 강의별 커리큘럼과 문제 세트, 진행률 관리
- **대회** — 시간 제한이 있는 대회와 전용 문제 세트, 순위표
- **공지사항** — 공지 목록 및 상세 페이지
- **프로필** — 티어, 연속 학습 기록(streak), 푼 문제 히트맵
- **인증** — 이메일 로그인/회원가입, JWT access + refresh 토큰, 401 응답 시 자동 토큰 재발급

세 개의 풀이 경로가 동일한 UI 구성 요소를 공유합니다.

| 경로                                      | 컨텍스트          |
| ----------------------------------------- | ----------------- |
| `/solve/:problemId`                       | 일반 문제 풀이    |
| `/courses/:courseId/solve/:problemId`     | 강의 내 문제 풀이 |
| `/contests/:contestCode/solve/:problemId` | 대회 내 문제 풀이 |

## 기술 스택

- **빌드** — Vite 7, `@vitejs/plugin-react-swc`
- **언어** — TypeScript 5.9 (strict, `verbatimModuleSyntax`, `erasableSyntaxOnly`)
- **UI** — React 19, React Router 7, styled-components 6
- **폼과 검증** — react-hook-form + zod (`@hookform/resolvers` 사용)
- **데이터** — axios (인증 인터셉터 포함)와 `@tanstack/react-query`
- **에디터** — `@monaco-editor/react`를 통한 Monaco Editor (Python, C++, Java)
- **알림** — react-toastify
- **배포** — Vercel (`vercel.json`에 SPA rewrite 설정)

## 시작하기

### 사전 요구사항

- Node.js (Vite 7 호환 버전, Node 20+ 권장)
- npm

### 설치

```bash
npm install
```

### 환경 변수

프로젝트 루트에 `.env` 파일을 생성합니다.

```env
VITE_API_URL="https://your-api-host"
```

클라이언트에 노출되는 모든 환경 변수는 Vite 규칙에 따라 `VITE_` 접두사가 필요합니다. `VITE_API_URL`은 백엔드 기본 URL이며, 풀이 관련 훅에서 항상 `/`로 끝나도록 정규화됩니다.

### 스크립트

```bash
npm run dev       # Vite 개발 서버 실행
npm run build     # 타입 체크(tsc -b) 후 프로덕션 빌드
npm run lint      # ESLint 실행 (flat config)
npm run preview   # 빌드 결과물 로컬 미리보기
```

현재 이 프로젝트에는 테스트 러너가 설정되어 있지 않습니다.

## 프로젝트 구조

```
src/
├── api/              # 인증 인터셉터가 포함된 axios 인스턴스
├── assets/           # 정적 리소스
├── components/       # 기능별 프레젠테이션 컴포넌트
│   ├── contests/
│   ├── courses/
│   ├── footer/
│   ├── header/
│   ├── login/
│   ├── main/
│   ├── notifications/
│   ├── problems/
│   ├── profile/
│   ├── signup/
│   └── solve/        # CodeEditor, ProblemDescription, ResultPanel 등
├── hooks/
│   └── solve/        # useSolveForm, useProblem, useCourse, useContest,
│                     # useGrading, useResizePanel
├── page/             # 라우트 단위 화면 컨테이너
│   ├── contests/
│   ├── courses/
│   ├── login/
│   ├── main/
│   ├── notifications/
│   ├── problems/
│   ├── profile/
│   ├── signup/
│   ├── solve/        # problems/, course/, contests/
│   └── styles/       # GlobalStyle
├── router/
│   └── router.tsx    # 모든 라우트가 하나의 <Routes> 블록에 선언됨
├── App.tsx
└── main.tsx
```

이 코드베이스는 기능 폴더 미러링 원칙을 따릅니다. 모든 기능은 `page/`, `components/`, (훅이 필요한 경우) `hooks/` 세 곳에 동일한 이름으로 존재합니다. 라우트 단위 화면은 `page/`, 프레젠테이션 조각은 `components/` (각 폴더의 `index.ts` 배럴에서 재export), 기능별 훅은 `hooks/`에 둡니다.

## 아키텍처 노트

### 라우팅

모든 라우트는 `src/router/router.tsx`의 단일 `<Routes>` 블록에 선언되어 있습니다. 별도의 인증 가드나 레이아웃 래퍼가 없으며, 각 페이지가 직접 인증 상태를 처리합니다. 새 페이지를 추가하려면 `src/page/<feature>/`에 생성한 뒤 `router.tsx`에 등록하면 됩니다.

### 인증과 API 클라이언트

`src/api/axiosInstance.ts`는 공통 axios 클라이언트이며 다음을 처리합니다.

1. **요청 인터셉터** — 모든 요청에 `localStorage`의 `accessToken`을 `Authorization: Bearer <accessToken>` 헤더로 주입합니다.
2. **응답 인터셉터** — 401 응답 시 저장된 `refreshToken`으로 `POST /auth/refresh`를 호출해 `accessToken`을 갱신하고 원래 요청을 한 번 재시도합니다. 재발급에 실패하면 두 토큰을 모두 삭제하고 `window.location.assign`으로 `/login`에 하드 리다이렉트합니다(SPA 상태를 완전히 초기화하기 위한 의도된 동작).

인증이 필요한 새 기능은 자동 토큰 갱신 동작을 상속받기 위해 반드시 `src/api/axiosInstance.ts`를 사용해야 합니다.

### 풀이 페이지 구성

세 개의 풀이 라우트는 모두 동일한 패턴을 따릅니다. 각 페이지 컨테이너는 `components/solve`에서 export된 프레젠테이션 컴포넌트에 단일 책임을 가진 훅들을 조합합니다.

- `useSolveForm` — `{ code, language, chatInput }`을 담는 react-hook-form + zod 폼. 문제별 코드와 언어 선택을 localStorage에 저장하며, `LANGUAGE_OPTIONS`(Python / C++ / Java, Monaco 언어 ID 매핑)를 노출합니다.
- `useProblem` — `GET /problems/:problemId`를 호출하고 zod로 검증한 뒤, 설명 패널에 사용할 `problemSections`와 샘플 입출력을 만들어 줍니다.
- `useCourse` / `useContest` — 해당 강의 또는 대회의 문제 목록을 불러오고, 형제 문제 간 네비게이션을 제공합니다.
- `useGrading` — `/solve/grading`(제출) 및 `/solve/test`(실행)에 POST 요청을 보냅니다. 한국어 터미널 출력을 포맷팅하고, 문제별 채점 상세를 캐시하며, toast 알림을 띄웁니다.
- `useResizePanel` — 에디터와 결과 패널 사이 드래그 리사이즈 로직.

`ResultPanel`은 `actionButtons` 슬롯을 받아 각 풀이 페이지가 자신만의 제출/실행 버튼을 주입할 수 있게 합니다.

### 데이터 페칭 스타일

`@tanstack/react-query`가 설치되어 있지만, 현재 대부분의 코드는 로컬 `status` 상태(`"idle" | "loading" | "success" | "error"`)와 함께 `useEffect` + `fetch`/`axios`를 직접 사용합니다. 두 스타일이 공존하므로 수정할 때는 주변 파일의 스타일에 맞춰 주세요. 모든 API 응답은 각 훅 파일 상단에 정의된 zod 스키마로 검증하며, 추론된 타입은 기능 배럴을 통해 재export됩니다.

### 스타일링

모든 스타일은 styled-components로 작성되어 있습니다. 각 page/component 폴더에는 자체 `styles.ts` (또는 `style.ts`)가 있습니다. 전역 스타일은 `src/page/styles/GlobalStyle.ts`에 있으며 `App.tsx`에서 한 번 마운트됩니다. DOM으로 전달되지 않아야 하는 transient props는 `$` 접두사를 사용합니다(예: `$width`, `$isResizing`).

## 배포

Vercel에 배포되어 있습니다. `vercel.json`에는 catch-all rewrite가 설정되어 있어 직접 URL로 접근하거나 새로고침할 때에도 React Router의 클라이언트 라우팅이 정상 동작합니다.
