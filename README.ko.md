# 두깨비 (Dukkaebi) Web

알고리즘 문제 풀이와 코딩 강의를 제공하는 한국어 플랫폼의 프론트엔드입니다. Vite + React 19 + TypeScript SPA로 구축되어 있습니다.

[English README](./README.md)

---

> **인수인계 문서로 읽는 경우**
>
> 이 문서는 "기능 소개"가 아니라 **인수인계 받는 개발자가 로컬에서 앱을 띄우고, 코드베이스의 관례와 지뢰를 파악하고, 흔히 마주치는 문제를 스스로 해결할 수 있게 되는 것**을 목표로 작성되어 있습니다. 시간이 없다면 다음 네 개 섹션만 먼저 읽으세요.
>
> 1. [시작하기](#시작하기) — 로컬 실행까지
> 2. [풀이 페이지 구성](#풀이-페이지-구성) — 가장 복잡한 화면의 구조
> 3. [알려진 이슈 / 기술 부채](#알려진-이슈--기술-부채) — 건드릴 때 폭발하는 지점들
> 4. [자주 겪는 문제](#자주-겪는-문제) — 에러 메시지로 바로 찾아가는 디버깅 체크리스트

---

## 목차

- [주요 기능](#주요-기능)
- [기술 스택](#기술-스택)
- [시작하기](#시작하기)
- [프로젝트 구조](#프로젝트-구조)
- [아키텍처 노트](#아키텍처-노트)
  - [라우팅](#라우팅)
  - [인증 흐름](#인증-흐름)
  - [풀이 페이지 구성](#풀이-페이지-구성)
  - [데이터 페칭 스타일 (현재 혼재)](#데이터-페칭-스타일-현재-혼재)
  - [스타일링](#스타일링)
  - [TypeScript 설정상의 제약](#typescript-설정상의-제약)
- [백엔드 API 요약](#백엔드-api-요약)
- [localStorage 키 목록](#localstorage-키-목록)
- [알려진 이슈 / 기술 부채](#알려진-이슈--기술-부채)
- [자주 하는 작업](#자주-하는-작업)
- [디버깅 / 검증 체크리스트](#디버깅--검증-체크리스트)
- [자주 겪는 문제](#자주-겪는-문제)
- [배포](#배포)

## 주요 기능

- **문제 풀이** — 문제 목록 탐색, 브라우저 내 Monaco 에디터에서 코드 작성, 백엔드 채점 서버에 제출
- **강의(코스)** — 강의별 커리큘럼과 문제 세트, 진행률 관리, 사이드바에서 형제 문제로 바로 이동
- **대회(콘테스트)** — 시간 제한이 있는 대회와 전용 문제 세트. SSE로 대회 상태를 실시간 수신하고, 문제별 체류 시간을 1초 단위로 누적 저장
- **공지사항** — 공지 목록 / 상세 페이지, 홈 화면에 최근 5건 노출
- **프로필** — 티어(7단계: 도깨비불 → 동 → 철 → 은 → 금 → 옥 → 신), 연속 학습 기록(streak), 최근 160일 푼 문제 히트맵, 로그아웃 / 회원탈퇴
- **인증** — 이메일 로그인 / 회원가입, JWT access + refresh 토큰, 401 응답 시 토큰 자동 재발급

세 개의 풀이 경로가 동일한 UI 구성 요소를 공유합니다.

| 경로                                         | 컨텍스트            | 컨테이너 파일                        |
| -------------------------------------------- | ------------------- | ------------------------------------ |
| `/solve/:problemId`                          | 일반 문제 풀이      | `src/page/solve/problems/index.tsx`  |
| `/courses/:courseId/solve/:problemId`        | 강의 내 문제 풀이   | `src/page/solve/course/index.tsx`    |
| `/contests/:contestCode/solve/:problemId`    | 대회 내 문제 풀이   | `src/page/solve/contests/index.tsx`  |

**⚠️ 주의**: 공통 훅(`hooks/solve`)과 공통 컴포넌트(`components/solve`)로 많은 로직이 추출되어 있지만, 세 컨테이너는 실질적으로 서로 복사-붙여넣기 관계에 가깝습니다. 한 곳의 버그를 고쳤다면 나머지 두 곳도 반드시 확인하세요. 예컨대 `contests`에는 "끝내기 / 테스트 / 제출 / 다음 문제" 네 개의 액션 버튼이 있고, `course`에는 사이드바 토글이 기본으로 열려 있으며, `problems`에는 사이드바 자체가 없습니다.

## 기술 스택

- **빌드** — Vite 7, `@vitejs/plugin-react-swc`
- **언어** — TypeScript 5.9 (strict, `verbatimModuleSyntax: true`, `erasableSyntaxOnly: true`)
- **UI** — React 19, React Router 7 (BrowserRouter), styled-components 6
- **폼 / 검증** — react-hook-form 7 + zod 4 (`@hookform/resolvers` 사용)
- **데이터** — axios (공통 인터셉터 포함), `event-source-polyfill` (SSE에 `Authorization` 헤더를 주입하기 위한 필수 의존성). `@tanstack/react-query`가 설치되어 있지만 **현재 코드에서는 쓰이지 않습니다**(도입 예정 의존성).
- **에디터** — `@monaco-editor/react` → Monaco Editor. 지원 언어는 Python / C++ / Java (3종). 커스텀 테마 `dukkaebi-dark`는 `src/components/solve/CodeEditor.tsx`에서 정의됩니다.
- **알림** — react-toastify (두 곳에서 마운트됨 — 자세한 내용은 [알려진 이슈](#알려진-이슈--기술-부채) 참고)
- **폰트** — Pretendard (CDN에서 다이내믹 로드, `src/page/styles/GlobalStyle.ts`)
- **배포** — Vercel (SPA rewrite는 `vercel.json`)

## 시작하기

### 사전 요구사항

- Node.js 20+ 권장 (Vite 7 호환)
- npm (다른 패키지 매니저용 lockfile 없음)

### 설치

```bash
npm install
```

### 환경 변수

`.env`는 `.gitignore`에 포함되어 있으므로 최초 실행 시 루트에 직접 생성해야 합니다.

```env
VITE_API_URL="https://your-api-host"
# 아래 두 변수는 Gemini 연동 기능이 차후 추가될 예정으로 선언만 되어 있고,
# 현재 src/ 내부 코드에서 직접 참조하지 않습니다. 없어도 앱은 정상 동작합니다.
VITE_GOOGLE_API_KEY="..."
VITE_GOOGLE_MODEL="gemini-2.0-flash"
```

- 클라이언트에 노출될 변수는 Vite 규칙에 따라 `VITE_` 접두사가 **반드시** 필요합니다. 접두사가 없으면 `import.meta.env`로 읽히지 않습니다.
- `VITE_API_URL` 값은 **끝의 슬래시 유무에 상관없이 동작**하도록 두 경로 모두에서 방어적으로 처리되어 있습니다.
  - `axiosInstance.baseURL`에는 그대로 사용됩니다.
  - 풀이 훅들(`useProblem`, `useCourse`, `useContest`, `useGrading`)은 내부에서 `replace(/\/?$/, "/")`로 끝 슬래시를 항상 붙여 사용합니다.
- 현재 두 코드 경로가 공존하므로, URL 끝에 슬래시를 **붙이지 않는 것**이 가장 안전합니다(둘 다 깨지지 않는 유일한 값).
- `.env` 값은 클라이언트 번들에 그대로 박힙니다. 절대 서버 전용 비밀키를 넣지 마세요.

### 스크립트

```bash
npm run dev       # Vite 개발 서버 (기본 http://localhost:5173)
npm run build     # tsc -b로 타입 체크 후 vite build → dist/
npm run lint      # ESLint (flat config, eslint.config.js)
npm run preview   # 프로덕션 빌드를 로컬에서 미리보기
```

**테스트 러너는 설정되어 있지 않습니다.** 자동화 테스트가 없으므로 수동 회귀 테스트에 의존합니다. 머지 전 확인할 시나리오는 [디버깅 / 검증 체크리스트](#디버깅--검증-체크리스트)를 참고하세요.

### Git 브랜치 컨벤션 (현재 관찰된 패턴)

리모트 브랜치 이름을 보면 `feat/<기능명>`과 `refactor/<기능명>`을 사용하고 있습니다 (`feat/auth`, `feat/solve`, `refactor/contest`, `refactor/notifications-new` 등). 머지는 main으로의 PR 기반입니다. 커밋 메시지는 주로 한국어이며 `fix ::`, `refactor:` 같은 접두사가 혼재합니다 — 엄격한 Conventional Commits는 아닙니다.

## 프로젝트 구조

```
src/
├── api/
│   └── axiosInstance.ts        # 인증 인터셉터 + 401 자동 재발급
├── assets/                     # 이미지, 아이콘 (피처별 하위 폴더)
├── components/                 # 기능별 프레젠테이션 컴포넌트
│   ├── contests/               # ContestCard, ContestsGrid, HeroBanner, ...
│   ├── courses/                # CourseGrid/, ProfileSection/, Tabs/, ...
│   ├── footer/
│   ├── header/                 # 공통 상단 네비게이션
│   ├── login/ signup/          # 인증 폼 조각
│   ├── main/                   # 홈 페이지 섹션들 (HeroSection, StatsCard, NoticeSection)
│   ├── notifications/
│   ├── problems/               # 문제 리스트 / 필터 / 페이지네이션
│   ├── profile/                # TierCard, StreakCard, HeatmapCard, ProfileSidebar
│   └── solve/                  # 풀이 화면 공통 조각 — 세 라우트가 공유
│       ├── SolveHeader.tsx
│       ├── ProblemDescription.tsx
│       ├── CodeEditor.tsx
│       ├── ResultPanel.tsx
│       ├── ProblemSidebar.tsx
│       └── index.ts            # 배럴 export
├── hooks/
│   └── solve/                  # 풀이 페이지에서만 쓰는 feature 훅 (현재는 이 폴더만 존재)
│       ├── useSolveForm.ts
│       ├── useProblem.ts
│       ├── useCourse.ts
│       ├── useContest.ts
│       ├── useGrading.ts
│       ├── useResizePanel.ts
│       └── index.ts            # 공개 API + 추론 타입 re-export
├── page/                       # 라우트 단위 화면 컨테이너
│   ├── contests/{list,info}/
│   ├── courses/                # index.tsx + explore/, info/
│   ├── login/ signup/
│   ├── main/                   # 홈 ("/")
│   ├── notifications/{list,info}/
│   ├── problems/               # 문제 리스트 ("/problems")
│   ├── profile/
│   ├── solve/{problems,course,contests}/   # 세 풀이 화면
│   └── styles/GlobalStyle.ts   # 전역 폰트 / Toast 스타일
├── router/
│   └── router.tsx              # 모든 라우트가 단일 <Routes>에 선언됨 (중첩 라우팅 없음)
├── App.tsx                     # GlobalStyle + ToastContainer + BrowserRouter 마운트
├── main.tsx                    # createRoot
├── App.css / index.css         # 아주 얇은 기본 리셋만
```

이 코드베이스는 **기능 폴더 미러링** 원칙을 따릅니다. 모든 기능은 `page/`, `components/`, (훅이 필요하면) `hooks/` 세 폴더에 같은 이름으로 존재합니다.

- `page/<feature>/` — 라우트 단위 화면 컨테이너. 보통 `index.tsx` + `style.ts` 또는 `styles.ts` (파일명은 **일관되지 않음** — 수정할 파일은 직접 확인하세요).
- `components/<feature>/` — 프레젠테이션 조각. 각 폴더의 `index.ts` 배럴로 re-export 됩니다.
- `hooks/<feature>/` — 기능별 훅. 현재는 `hooks/solve/`만 존재.

새 기능을 추가할 때는 모든 것을 `page/`에 몰아넣지 말고 이 세 폴더 분리를 따라주세요.

## 아키텍처 노트

### 라우팅

모든 라우트는 `src/router/router.tsx`의 단일 flat `<Routes>` 블록에 선언되어 있습니다. 중첩 라우팅이나 레이아웃 라우트를 사용하지 않으며, 인증 가드 또한 없습니다. "로그인 여부" 판단은 각 페이지가 직접 `localStorage.getItem("accessToken")`의 존재 여부나 `/user` 호출 결과로 처리합니다.

새 페이지를 추가하려면:

1. `src/page/<feature>/index.tsx`와 `styles.ts`를 생성
2. 필요하면 `src/components/<feature>/`에 조각을 만들고 `index.ts` 배럴로 export
3. `src/router/router.tsx`의 `<Routes>` 블록에 `<Route>` 한 줄 추가

### 인증 흐름

#### 로그인 / 회원가입

로그인과 회원가입은 `axiosInstance`를 **거치지 않고** `axios`를 직접 import해서 호출합니다(인터셉터 루프를 피하기 위한 의도된 예외).

| 위치                        | 메서드 | 경로              | 요청 body                                   |
| --------------------------- | ------ | ----------------- | ------------------------------------------- |
| `src/page/login/index.tsx`  | POST   | `/auth/sign-in`   | `{ loginId, password }`                     |
| `src/page/signup/index.tsx` | POST   | `/auth/sign-up`   | `{ loginId, password, nickname }`           |
| `src/api/axiosInstance.ts`  | POST   | `/auth/refresh`   | `{ token: refreshToken }` (401 시 내부 호출) |

성공 시 `accessToken`과 `refreshToken`을 `localStorage`에 저장하고 `navigate("/")`로 이동합니다.

#### 공통 axios 인스턴스 (`src/api/axiosInstance.ts`)

인증이 필요한 나머지 모든 요청은 반드시 `axiosInstance`를 통해 호출해야 합니다.

**요청 인터셉터**
- `localStorage.accessToken`을 읽어 `Authorization: Bearer <token>` 헤더를 자동 주입.

**응답 인터셉터**
- `error.response?.status === 401 && !originalRequest._retry` 조건일 때:
  1. `_retry` 플래그를 `true`로 세팅하여 무한 루프 방지.
  2. `POST {VITE_API_URL}/auth/refresh`에 `{ token: refreshToken }` body로 재발급 요청 (raw `axios` 사용 — 본인의 인터셉터를 다시 타지 않기 위해).
  3. 응답 `{ accessToken }`으로 `localStorage` 업데이트 후 원래 요청을 한 번 재시도.
  4. 재발급 실패 시 `accessToken` / `refreshToken` 둘 다 제거하고 `window.location.assign("/login")`으로 **하드 리다이렉트** (SPA 상태를 완전히 초기화하기 위한 의도된 선택).

**주의**: 서버가 reset body에 다른 필드명을 기대한다면 `{ token: ... }`이 맞지 않을 수 있습니다. 백엔드 스펙 변경 시 가장 먼저 깨지는 지점입니다.

#### 로그아웃

`POST /user/logout`을 호출하고(응답 여부와 관계없이) localStorage에서 토큰을 제거한 뒤 500ms 딜레이 후 `/login`으로 하드 리다이렉트합니다. `src/page/profile/index.tsx`에서 구현됩니다.

### 풀이 페이지 구성

풀이 화면은 이 앱에서 구조적으로 가장 복잡한 부분입니다. 아래 다이어그램이 전체 구성의 축약본입니다.

```
page/solve/{problems|course|contests}/index.tsx   ← 컨테이너 (세 개)
  │
  ├─ useSolveForm      (코드/언어 상태, localStorage 캐시)
  ├─ useProblem        (GET /problems/:id)
  ├─ useCourse         (GET /course/:courseId)       ← course 전용
  ├─ useContest        (GET /contest/:code + SSE)    ← contest 전용
  ├─ useGrading        (POST /solve/grading, /solve/test)
  └─ useResizePanel    (드래그 리사이즈)
  │
  └── components/solve/*
        ├─ SolveHeader        (뒤로가기, 문제명, 언어 셀렉트, rightContent 슬롯)
        ├─ ProblemDescription (문제 설명 + 샘플 I/O)
        ├─ CodeEditor         (Monaco + react-hook-form Controller)
        ├─ ResultPanel        (터미널 출력 + actionButtons 슬롯)
        └─ ProblemSidebar     (course/contest 전용, 형제 문제 리스트)
```

#### 훅 상세

- **`useSolveForm({ storageKey?, problemId? })`** — `{ code, language, chatInput }`을 담는 react-hook-form + zod 폼. 문제별 코드와 언어 선택을 `<storageKey>_codes`, `<storageKey>_langs` 키로 localStorage에 저장합니다(`storageKey`가 있을 때만). `LANGUAGE_OPTIONS`(Python / C++ / Java)를 `as const` 튜플로 노출하며, 각 항목은 Monaco 언어 ID(`monaco` 필드)와 백엔드 전송 값(`value` 필드)을 함께 가집니다. `chatInput` 필드는 폼에 존재하지만 아직 어떤 컴포넌트에도 바인딩되지 않은 dead field입니다.

- **`useProblem({ problemId })`** — `GET {API}/problems/:problemId`를 호출, zod(`problemDetailSchema`)로 검증 후 `{ name, description, input, output, exampleInput, exampleOutput }` 구조로 저장합니다. 설명 패널용으로 `problemSections = [{ title: "문제 설명", ...}, { title: "입력", ...}, { title: "출력", ...}]`을 파생시키고, `sampleInput` / `sampleOutput`을 분리 반환합니다. 상태는 `"idle" | "loading" | "success" | "error"`. `AbortController`로 cleanup 처리되어 있습니다.

- **`useCourse({ courseId })`** — `GET {API}/course/:courseId`를 호출해 `{ courseId, title, problems[] }`를 받고, 문제 배열을 그대로 반환합니다. 각 항목은 `{ problemId, name, difficulty?, solvedResult? }`.

- **`useContest({ contestCode, problemId })`** — 세 가지 일을 합니다.
  1. `GET {API}/contest/:contestCode`로 대회 정보와 문제 리스트 로드 (`axiosInstance`를 통해 호출하는 유일한 solve 훅).
  2. `EventSourcePolyfill`로 `{API}/contest/:contestCode/subscribe` SSE 스트림에 연결해 `contest-update` 이벤트를 수신합니다. 이벤트 페이로드에 `eventType: "CONTEST_UPDATED"`가 있으면 `startDate`/`endDate`/`status`를 갱신하고 toast를 띄웁니다. 브라우저 기본 `EventSource`는 Authorization 헤더 주입이 불가능해 `event-source-polyfill`을 사용합니다. `heartbeatTimeout`은 300초로 설정.
  3. 현재 풀고 있는 문제의 체류 시간을 1초 단위로 누적해 `dukkaebi_timeSpent_<contestCode>` 키에 저장하고, 대회 시작/종료까지의 카운트다운 문자열(`timeLeft`)도 1초마다 갱신합니다.
  - **SSE 재연결은 없습니다.** `onerror`는 연결을 닫기만 하고 재시도를 하지 않으므로, 네트워크가 잠깐 끊기면 대회 상태 업데이트가 멈춥니다.

- **`useGrading({ problemId })`** — `POST /solve/grading`(제출 후 채점)과 `POST /solve/test`(예제 실행) 두 API를 호출합니다. `formatGradingResult`가 응답을 "정답입니다. / 오답입니다.", `채점 결과: ...`, `통과한 테스트: X / Y`, `실행 시간: Nms`, 첫 실패 테스트 케이스의 입력/기댓값/실제값까지 한국어로 포맷팅합니다. 결과는 `gradingDetails`로 캐시되고, 페이지 네비게이션 간에 `gradingCacheByProblem` 맵으로 유지됩니다.
  - **정답/오답 판정 로직**: 현재 `details.some(d => d.passed === true)`로 판정합니다(전체 통과 여부가 아니라 단 하나라도 통과했는지). 실제 "정답"과 다를 수 있습니다 — 기술 부채 항목 참고.
  - **이 훅은 `axiosInstance`를 쓰지 않고 raw `fetch`를 사용합니다**. 즉 401 자동 재발급 인터셉터가 **동작하지 않습니다**. 풀이 도중 토큰이 만료되면 채점 요청이 그대로 실패합니다.

- **`useResizePanel({ isSidebarOpen?, sidebarWidth? })`** — 에디터와 결과 패널 사이의 드래그 리사이즈. `rightPanelWidth`는 전체의 20~80% 사이로 clamp되며, `terminalHeight`는 컨테이너 높이에 따라 `Math.max(180, Math.min(height * 0.3, height - 160))`으로 계산됩니다. 사이드바가 열려 있으면 그만큼 뺀 공간 기준으로 비율을 계산합니다.

#### 공통 컴포넌트와 스타일의 함정

`components/solve/*.tsx`의 모든 파일은 스타일을 **`page/solve/problems/style.ts`에서 import**합니다.

```ts
// src/components/solve/CodeEditor.tsx
import * as Style from "../../page/solve/problems/style";
```

즉 `problems`의 style 파일은 단순한 "한 페이지의 스타일"이 아니라 **세 풀이 페이지에서 공통으로 쓰는 구성 요소의 스타일 소스**입니다. 이 파일에서 `Style.Header`, `Style.EditorContainer`, `Style.ResultContainer` 같은 이름을 수정하면 세 풀이 페이지 전부에 즉시 반영됩니다. 반면 `page/solve/course/style.ts`와 `page/solve/contests/style.ts`는 주로 컨테이너 레이아웃과 페이지별 고유 요소(예: `MenuButton`, `ThinDivider`)만 담고 있습니다.

이 구조는 폴더 이름으로는 명확하지 않으니, 풀이 화면 스타일을 건드릴 때는 반드시 `problems/style.ts`부터 확인하세요.

#### `ResultPanel.actionButtons` 슬롯

`ResultPanel`은 `actionButtons`라는 `ReactNode` 슬롯을 받아, 각 풀이 페이지가 자신만의 버튼 묶음을 주입할 수 있게 합니다.

- `problems` — `[제출 후 채점하기]` 하나
- `course` — `[제출 후 채점하기]` 하나 (현재는 `problems`와 동일)
- `contests` — `[끝내기]` `[테스트]` `[제출]` `[다음 문제]` 네 개 + 사이드바 열림 여부에 따른 마진 보정

풀이 페이지에 버튼을 추가할 때는 이 슬롯을 통해서만 주입하세요. `ResultPanel` 자체는 건드리지 않는 것이 깨끗합니다.

### 데이터 페칭 스타일 (현재 혼재)

코드베이스에는 세 가지 데이터 페칭 스타일이 공존합니다. **새 코드는 (1)번 스타일로 작성하세요.**

1. **`axiosInstance` + 로컬 `useEffect` + 로컬 `status` 상태** — `src/page/**/*.tsx` 대부분과 `hooks/solve/useContest.ts`. 인증 인터셉터와 401 재발급을 상속받는 가장 안전한 경로입니다. 응답은 가급적 zod로 검증하세요.
2. **raw `fetch` + 수동 `accessToken` 읽기** — `hooks/solve/useProblem.ts`, `useCourse.ts`, `useGrading.ts`. 인터셉터 도입 이전에 작성된 코드로, **토큰 재발급이 동작하지 않습니다**. 수정할 일이 생기면 `axiosInstance`로 마이그레이션을 우선 검토하세요.
3. **raw `axios`** — `src/page/login/index.tsx`, `src/page/signup/index.tsx`. 로그인 전에는 토큰이 없고, 로그인 응답은 401 핸들러를 거칠 이유가 없으므로 의도적으로 인터셉터를 우회합니다. 이 두 곳은 그대로 두어도 됩니다.

`@tanstack/react-query`는 `package.json`에 있지만 **실제로는 사용되지 않습니다**(`QueryClientProvider`도 마운트되어 있지 않음). 의존성 정리 시 검토 대상이거나, 단계적 도입의 출발점으로 사용할 수 있습니다.

로딩 상태는 훅마다 두 가지 중 하나를 씁니다:
- `status: "idle" | "loading" | "success" | "error"` (`useProblem`)
- 단순 `isLoading: boolean` (`useCourse`, `useContest`, 페이지 컨테이너들)

어느 쪽도 "정답"은 아니며, 주변 파일에 맞추세요.

모든 API 응답은 각 훅 파일 최상단의 `z.object({...})` 스키마로 검증하고, 추론된 타입(`z.infer<...>`)을 기능 배럴(`hooks/solve/index.ts`)로 re-export합니다. 백엔드 응답 구조가 바뀌어 런타임 에러가 나면, 해당 훅 파일의 zod 정의부터 확인하세요.

### 스타일링

- **styled-components** 전용. CSS Modules, Tailwind, 전역 CSS는 사용하지 않습니다(`App.css`와 `index.css`는 아주 얇은 기본 리셋만 담고 있습니다).
- 각 page/component 폴더에 자체 `styles.ts` 또는 `style.ts`가 있습니다 — **파일명이 일관되지 않으니** import 경로를 직접 확인하세요. 새 파일은 `styles.ts`로 통일하는 것을 권장하지만, 기존 파일명을 억지로 고치지 마세요 (많은 import가 깨집니다).
- 전역 스타일은 `src/page/styles/GlobalStyle.ts`에 있으며 `App.tsx`에서 한 번 마운트됩니다. Pretendard 폰트 9개 weight를 CDN(`jsdelivr`)에서 로드합니다 — 오프라인 환경에서는 폰트가 fallback으로 떨어집니다.
- DOM으로 전달되면 안 되는 transient props는 `$` 접두사를 사용합니다 (예: `$width`, `$isResizing`, `$active`, `$danger`). `React does not recognize the X prop on a DOM element` 콘솔 경고가 나오면 `$`가 빠진 것입니다.
- 풀이 화면의 팔레트: 다크 배경 `#263238`, 헤더 `#35454E`, 보더 `#495D68`, 아쿠아 포인트 `#3E5C7A` 같은 색이 하드코딩으로 자주 등장합니다. 디자인 토큰 시스템은 없습니다.

### TypeScript 설정상의 제약

`tsconfig.app.json`에 다음 플래그가 켜져 있습니다.

- **`verbatimModuleSyntax: true`** — 타입 전용 import는 반드시 `import type { ... } from "..."`로 작성해야 합니다. 값과 타입을 섞으면 별도 import 문으로 분리하거나 `import { useEffect, type RefObject } from "react"` 같은 인라인 형태로 작성해야 합니다.
- **`erasableSyntaxOnly: true`** — TypeScript 전용 런타임 구성물(`enum`, `namespace`, `parameter properties`)은 사용할 수 없습니다. `const` 객체 + `as const` 튜플로 대체하세요 (예: `LANGUAGE_OPTIONS`).
- **`noUnusedLocals: false`, `noUnusedParameters: false`** — 컴파일러가 미사용 변수를 잡아주지 않습니다. ESLint에 의존하세요.
- **`strict: true`** — null/undefined 체크는 엄격합니다.

## 백엔드 API 요약

프론트엔드가 실제로 호출하는 엔드포인트 목록입니다(`VITE_API_URL` 기준). 정식 스펙이 아니라 **코드 리버스 엔지니어링 결과**이므로, 정확한 스키마는 백엔드 팀에 문의하거나 각 훅 / 페이지의 zod 스키마를 참고하세요.

### 인증
| 메서드 | 경로              | 사용처                              | 비고                                |
| ------ | ----------------- | ----------------------------------- | ----------------------------------- |
| POST   | `/auth/sign-in`   | `page/login`                        | `{ loginId, password }` → `{ accessToken, refreshToken }` |
| POST   | `/auth/sign-up`   | `page/signup`                       | `{ loginId, password, nickname }`   |
| POST   | `/auth/refresh`   | `api/axiosInstance` (401 인터셉터)  | `{ token: refreshToken }` → `{ accessToken }` |

### 사용자 / 활동
| 메서드 | 경로                              | 사용처                     |
| ------ | --------------------------------- | -------------------------- |
| GET    | `/user`                           | `page/profile`, `page/courses` |
| GET    | `/user/activity/contributions`    | `page/main`, `page/profile` (query: `start`, `end` — `YYYY-MM-DD`) |
| GET    | `/user/activity/streak`           | `page/main`, `page/profile` |
| POST   | `/user/logout`                    | `page/profile`             |
| DELETE | `/user/delete`                    | `page/profile` (회원 탈퇴) |

### 문제
| 메서드 | 경로                       | 사용처                   | 비고                              |
| ------ | -------------------------- | ------------------------ | --------------------------------- |
| GET    | `/problems`                | `page/problems`          | query: `page`, `size`, `difficulty`, `correctRate`, `time`, `name`. 응답: `{ content[], totalPages, first, last }` (Spring Data Pageable 형태) |
| GET    | `/problems/:problemId`     | `hooks/solve/useProblem` | 응답: `{ name, description, input, output, exampleInput, exampleOutput }` |

### 채점
| 메서드 | 경로              | 사용처                   | body                                            |
| ------ | ----------------- | ------------------------ | ----------------------------------------------- |
| POST   | `/solve/grading`  | `hooks/solve/useGrading` | `{ problemId, code, language, timeSpentSeconds? }` |
| POST   | `/solve/test`     | `hooks/solve/useGrading` | `{ problemId, code, language }`                 |

응답 스키마:
```ts
{
  status?: "ACCEPTED" | string,
  passedTestCases?: number,
  totalTestCases?: number,
  executionTime?: number,
  errorMessage?: string | null,
  details?: Array<{
    testCaseNumber?: number,
    passed?: boolean,
    input?: string,
    expectedOutput?: string,
    actualOutput?: string,
  }>
}
```

### 강의 (코스)
| 메서드 | 경로                                 | 사용처                     |
| ------ | ------------------------------------ | -------------------------- |
| GET    | `/course/:courseId`                  | `hooks/solve/useCourse`    |
| GET    | `/student/course/joinable`           | `page/courses/explore`     |
| GET    | `/student/course/in-progress`        | `page/courses`             |
| GET    | `/student/course/completed`          | `page/courses`             |
| POST   | `/student/course/:courseId/join`     | `page/courses/info`        |

### 대회 (콘테스트)
| 메서드 | 경로                                   | 사용처                   |
| ------ | -------------------------------------- | ------------------------ |
| GET    | `/contest/list`                        | `page/contests/list`     |
| GET    | `/contest/:contestCode`                | `hooks/solve/useContest` |
| SSE    | `/contest/:contestCode/subscribe`      | `hooks/solve/useContest` (event: `contest-update`) |

### 공지사항
| 메서드 | 경로             | 사용처                    |
| ------ | ---------------- | ------------------------- |
| GET    | `/notice/home`   | `page/main` (홈 최근 5건) |
| GET    | `/notice/:id`    | `page/notifications/info` |

## localStorage 키 목록

현재 클라이언트에서 사용하는 모든 localStorage 키입니다.

| 키                                          | 값                                   | 설정 / 삭제 위치                                              |
| ------------------------------------------- | ------------------------------------ | ------------------------------------------------------------- |
| `accessToken`                               | JWT access token (문자열)            | `page/login`, `api/axiosInstance`, 로그아웃/탈퇴/refresh 실패 시 제거 |
| `refreshToken`                              | JWT refresh token (문자열)           | `page/login`, 로그아웃/탈퇴/refresh 실패 시 제거              |
| `<storageKey>_codes`                        | `{ [problemId]: code }` JSON         | `hooks/solve/useSolveForm` — `storageKey`가 전달된 경우만     |
| `<storageKey>_langs`                        | `{ [problemId]: language }` JSON     | `hooks/solve/useSolveForm` — `storageKey`가 전달된 경우만     |
| `dukkaebi_timeSpent_<contestCode>`          | `{ [problemId]: seconds }` JSON      | `hooks/solve/useContest` — 1초마다 갱신                       |
| `dukkaebi_codes_*` / `dukkaebi_submitted_*` | 레거시 (현재 세터 없음)              | `page/main` / `page/profile`가 **삭제만** 하므로 과거 버전의 잔존 데이터 청소 용도 |

`page/main`과 `page/profile`은 마운트 시 `dukkaebi_codes_*`, `dukkaebi_timeSpent_*`, `dukkaebi_submitted_*` 접두사의 키를 모두 제거합니다. 즉 **홈이나 프로필 페이지를 거치면 대회 문제의 체류 시간이 날아갑니다** — 의도된 동작으로 보이지만, 사용자가 실수로 홈으로 돌아가면 기록이 사라지는 경계 조건입니다.

`storageKey`는 호출자가 정하는 문자열로, 현재 실제 사용 예는 아래와 같습니다.

- `page/solve/problems/index.tsx` — `storageKey`를 전달하지 않음 (일반 풀이는 localStorage 캐시 없음)
- `page/solve/course/index.tsx` — `course_${courseId}`
- `page/solve/contests/index.tsx` — `dukkaebi_contest_${contestCode}`

## 알려진 이슈 / 기술 부채

인수인계 시 반드시 알고 있어야 하는 항목들입니다. 우선순위 순서로 배치했습니다.

1. **`hooks/solve`의 세 파일이 raw `fetch`를 사용합니다** — `useProblem.ts`, `useCourse.ts`, `useGrading.ts`. 이 요청들은 `axiosInstance`의 401 재발급 인터셉터를 거치지 않아 **풀이 도중 토큰이 만료되면 문제 로드/채점/실행이 실패하고 사용자는 로그인 페이지로 튕깁니다**. 가장 먼저 `axiosInstance`로 마이그레이션할 대상입니다. `useContest`는 이미 `axiosInstance`로 옮겨져 있으니 같은 패턴을 참고하면 됩니다.

2. **`useGrading`의 "정답" 판정이 부정확합니다** — `useGrading.ts` 125~127줄에서 `details.some(d => d.passed === true)`로 판정하고 있습니다. `details`에는 첫 실패 테스트 케이스만 담겨 오는 것으로 보이고, 전체 통과 여부는 `passedTestCases === totalTestCases`로 봐야 합니다. 현재는 "하나라도 통과한 테스트가 있으면 정답 toast"가 떠서 실제 정답/오답과 UI가 다를 수 있습니다.

3. **SSE 재연결이 없습니다** — `useContest.ts`의 `eventSource.onerror`는 연결을 닫기만 하고 재시도를 하지 않습니다. 대회 중 네트워크가 잠깐 끊기면 상태 업데이트가 영구적으로 멈춥니다. 지수 백오프 재연결을 붙이는 것이 안전합니다.

4. **세 개의 풀이 페이지가 구조적으로 중복됩니다** — `page/solve/{problems,course,contests}/index.tsx`는 훅 조합이 거의 동일하지만 각자 유지보수됩니다. 장기적으로는 하나의 컨테이너로 합치고 컨텍스트(일반/코스/대회) 별 옵션을 prop으로 주입하는 리팩터링이 필요합니다. 단기적으로는 풀이 UX 변경 시 세 파일 모두 손봤는지 항상 확인하세요.

5. **`@tanstack/react-query`가 설치만 되고 사용되지 않습니다** — `App.tsx`에 `QueryClientProvider`가 없어 실제로 동작하지 않습니다. 단계적 도입을 원한다면 provider부터 감싸고, 아니면 `package.json`에서 제거하세요.

6. **`styles.ts` vs `style.ts` 파일명 혼재** — 의도적인 구분이 아닌 단순한 불일치입니다. 새 파일은 `styles.ts`로 통일하되 기존 파일명은 건드리지 마세요.

7. **`ToastContainer`가 두 곳에서 마운트됩니다** — `App.tsx`에 전역 하나, 각 풀이 페이지에 또 하나. 덕분에 풀이 페이지에서는 두 개의 toast container가 동시에 떠 있습니다. 풀이 페이지 전용 설정(`theme="dark"`)을 원해서 생긴 구조인데, 알림이 중복 표시되지는 않지만 의도된 설계가 아닐 수 있습니다.

8. **인증 상태를 localStorage 문자열에만 의존합니다** — React Context나 상태 관리 라이브러리가 없습니다. 페이지별로 `localStorage.getItem("accessToken")` 또는 `/user` 호출로 로그인 여부를 판단합니다. 헤더 UI와 실제 상태가 어긋나는 버그가 자주 발생할 수 있습니다. 또한 "보호된 라우트" 개념이 없어 비로그인 사용자도 `/profile`에 진입할 수 있으며, 진입 후 401로 빠지는 흐름에 의존합니다.

9. **`useSolveForm`의 `chatInput` 필드가 사용되지 않습니다** — 폼 스키마에 존재하지만 어떤 UI에도 바인딩되어 있지 않습니다. AI 챗봇 도입을 염두에 둔 흔적으로 보이며, `.env`의 `VITE_GOOGLE_API_KEY` / `VITE_GOOGLE_MODEL`도 마찬가지로 예약된 상태입니다.

10. **페이지네이션 상태가 필터 변경 시 수동 리셋됩니다** — `page/problems/index.tsx`는 필터/검색이 바뀔 때마다 `setCurrentPage(0)`을 직접 호출합니다. 새 필터를 추가할 때 깜박하고 빠뜨리면 빈 페이지가 뜨는 증상이 발생합니다.

## 자주 하는 작업

### 새 페이지 추가하기

1. `src/page/<feature>/index.tsx`와 `styles.ts`를 만듭니다.
2. 프레젠테이션 조각이 필요하면 `src/components/<feature>/`에 만들고 `index.ts` 배럴로 export.
3. `src/router/router.tsx`의 `<Routes>` 블록에 `<Route>` 한 줄 추가.
4. 헤더 네비게이션에 노출이 필요하면 `src/components/header/index.tsx`에 `<NavLink>`를 추가하고 `pathname.startsWith(...)` 조건도 함께 추가.

### 새 인증 필요 API 호출 추가하기

`axiosInstance`를 import해서 메서드 헬퍼를 사용합니다. **경로 별칭(`@/...`)은 설정되어 있지 않으니** 상대 경로를 쓰세요.

```ts
import axiosInstance from "../../api/axiosInstance";
import { z } from "zod";

const profileSchema = z.object({ id: z.number(), name: z.string() });

const { data } = await axiosInstance.get("/user");
const profile = profileSchema.parse(data);
```

### 지원 언어 추가하기

`src/hooks/solve/useSolveForm.ts`의 `LANGUAGE_OPTIONS`에 항목을 추가합니다.

```ts
export const LANGUAGE_OPTIONS = [
  { value: "python", label: "Python", monaco: "python" },
  { value: "cpp",    label: "C++",    monaco: "cpp" },
  { value: "java",   label: "Java",   monaco: "java" },
  { value: "go",     label: "Go",     monaco: "go" }, // ← 추가
] as const;
```

- `value`는 백엔드 `/solve/grading`이 받는 언어 식별자와 일치해야 합니다 → 백엔드 팀 확인 필수.
- `monaco`는 Monaco Editor의 언어 ID와 일치해야 합니다 → [monaco-editor 문서](https://microsoft.github.io/monaco-editor/) 참고.
- `label`은 UI 표시용.

### 풀이 페이지 동작 수정하기

작업 전에 로직이 훅에 있는지 컨테이너에 있는지부터 파악하세요.

- 훅 (`hooks/solve/*`) 수정 → 한 번의 수정으로 세 페이지 모두에 반영됨
- 공통 컴포넌트 (`components/solve/*`) 수정 → 세 페이지 모두에 반영됨
- 컨테이너 (`page/solve/{problems,course,contests}/index.tsx`) 수정 → 해당 라우트에만 영향

컨테이너에 있는 로직을 수정할 때는 세 파일을 나란히 열어놓고 필요한 곳에만 반영하세요.

### 새 훅 카테고리 추가하기

현재는 `hooks/solve/`만 존재합니다. 예컨대 `hooks/contests/`를 새로 만들고 싶다면:

1. `src/hooks/contests/` 디렉터리 생성
2. 각 훅을 개별 파일로 만들고 상단에 zod 스키마 + 추론 타입 선언
3. `src/hooks/contests/index.ts`에서 훅과 타입을 모두 re-export
4. 사용처에서 `import { useXxx, type XxxItem } from "../../hooks/contests"`로 가져오기

### 타입 추가 / 변경

- 타입 전용 import는 반드시 `import type`을 쓰세요.
- enum이 필요하면 `const` 객체 + `as const` + `typeof`로 union 타입을 만드세요.
- 응답 타입은 가급적 zod 스키마에서 `z.infer`로 도출하세요(수동 선언 금지).

## 디버깅 / 검증 체크리스트

테스트 자동화가 없으므로, PR을 머지하기 전 최소한 다음을 **수동으로** 확인하세요.

**빌드 / 린트**
- [ ] `npm run build` 통과 (타입 체크 포함)
- [ ] `npm run lint` 무경고

**인증 / 흐름**
- [ ] 회원가입 → 로그인 → 홈 진입
- [ ] 로그아웃 후 `/`에 접근해 토큰이 없는 상태에서도 페이지가 깨지지 않는지
- [ ] `localStorage.accessToken`을 수동으로 망가뜨린 후 어떤 API 호출이든 날리면 `/auth/refresh`가 호출되고 원래 요청이 재시도되는지 (DevTools Network 탭에서 확인)
- [ ] `localStorage.refreshToken`도 함께 망가뜨리면 `/login`으로 하드 리다이렉트되는지

**풀이 화면 (세 라우트 모두)**
- [ ] `/solve/:problemId` 에서 코드 작성 → 제출 → "정답" 또는 "오답" 표시까지
- [ ] `/courses/:courseId/solve/:problemId` 에서 사이드바가 열려 있고 형제 문제 클릭 시 네비게이션되는지
- [ ] `/contests/:contestCode/solve/:problemId` 에서 상단의 `timeLeft` 카운트다운이 매초 갱신되는지, "다음 문제" 버튼이 마지막 문제에서 비활성화되는지, SSE 메시지가 들어왔을 때 toast가 뜨는지
- [ ] 풀이 중 브라우저 새로고침 → 코드가 복구되는지 (course / contests만 해당, 일반 문제는 캐시 안 함)
- [ ] 문제 간 이동 → 언어 선택이 문제별로 독립적으로 유지되는지

**UI / 스타일**
- [ ] `React does not recognize the $X prop on a DOM element` 콘솔 경고 없음 (= transient prop에 `$` 빠진 것 없음)
- [ ] 창 크기를 줄였을 때 에디터/결과 패널의 비율이 20~80% 사이로 clamp되는지
- [ ] Pretendard 폰트가 로드되는지 (DevTools Network 탭에서 jsdelivr 요청 확인)

## 자주 겪는 문제

### `npm run dev`는 되는데 `npm run build`가 실패한다

`verbatimModuleSyntax`나 `erasableSyntaxOnly` 때문에 타입 체크(`tsc -b`)에서 걸렸을 가능성이 큽니다.

- `error TS1484: '...' is a type and must be imported using a type-only import` → `import type { ... }`로 고치거나, 값/타입을 분리 import.
- `error TS1294: This syntax is not allowed when 'erasableSyntaxOnly' is enabled` → `enum`, `namespace`, parameter property를 제거하고 `const` 객체로 대체.
- `TS2307: Cannot find module './styles'` → `style.ts` vs `styles.ts`를 헷갈린 경우입니다. 해당 폴더의 실제 파일명을 확인하세요.

### 모든 API가 401로 실패한다

1. `.env`의 `VITE_API_URL`이 올바른지 확인.
2. `localStorage.accessToken`이 비어 있거나 만료되지 않았는지 확인.
3. 백엔드가 떠 있고 CORS 허용 설정이 되어 있는지 확인.
4. 그래도 안 되면 `src/api/axiosInstance.ts`의 두 인터셉터에 임시 `console.log`를 붙이고 재현.

### 로그인 후 `/login`으로 무한 리다이렉트된다

`POST /auth/refresh`가 실패하고 있다는 신호입니다. 가능한 원인:

- 백엔드가 refresh body 형식을 `{ token: ... }`에서 `{ refreshToken: ... }` 등으로 바꿨다 → `axiosInstance.ts` 33줄 수정 필요.
- refresh 엔드포인트 자체가 401을 반환하고 있다 → 인터셉터가 재귀적으로 호출하려 할 수 있으나 `_retry` 플래그로 한 번만 시도됩니다. 그래도 안전을 위해 `refresh` URL 자체를 인터셉터 조건에서 예외 처리하는 방어 코드를 추가하는 것을 권장.
- `refreshToken`이 localStorage에 저장되지 않았다 → 로그인 응답 body 필드명을 확인.

### Monaco 에디터가 안 뜬다

- 사내망 / 오프라인에서는 `@monaco-editor/react`가 워커를 CDN에서 가져오는 기본 동작이 막힐 수 있습니다. Vite로 워커를 번들에 포함시키려면 `@monaco-editor/loader`에 로컬 경로를 설정해야 합니다.
- 다크 테마(`dukkaebi-dark`)가 렌더 전에 등록되지 않으면 흰 배경으로 표시됩니다 — `beforeMount` 훅이 있는지 확인.

### 풀이 중 "채점 중 오류가 발생했습니다" 토스트가 뜬다

`useGrading`은 실패 원인을 구분하지 않고 동일한 메시지를 띄웁니다. 원인 파악은 DevTools Network 탭에서 `/solve/grading` 또는 `/solve/test` 응답을 직접 확인하세요. 응답이 zod 스키마와 불일치하면 `ZodError`가 catch 블록으로 떨어집니다.

### 대회 타이머가 멈췄다

- SSE 연결이 끊기고 재연결되지 않은 상태일 수 있습니다(기술 부채 3번).
- `contestInfo.endDate`가 이미 지났거나 `status === "ENDED"`면 "종료됨"으로 표시됩니다.
- DevTools → Network → EventStream 탭에서 `/contest/:code/subscribe` 스트림의 상태를 확인.

### 히트맵이 엉뚱한 날짜부터 시작한다

`page/profile`의 `generateHeatmapData`는 오늘 기준 +2일~−158일 범위를 23주 × 7일 그리드로 그립니다. `page/main`은 17주 × 7일로 다릅니다. 두 곳이 의도적으로 서로 다른 창을 사용하므로, 한 곳만 수정하면 불일치가 생깁니다.

## 배포

Vercel에 배포되어 있습니다.

- **프레임워크**: Vite (자동 감지)
- **빌드 명령**: `npm run build`
- **출력 디렉터리**: `dist`
- **SPA Rewrite**: `vercel.json`의 `{ "source": "/(.*)", "destination": "/" }` 규칙이 직접 URL 접근과 새로고침 시 `index.html`로 fallback하게 해줍니다. 이게 없으면 `/problems`로 바로 들어갔을 때 404가 납니다.

**환경 변수**는 Vercel 프로젝트 대시보드의 Environment Variables에 `VITE_API_URL`을 등록해야 합니다. 로컬 `.env`는 빌드에 반영되지 않습니다. `VITE_GOOGLE_*`은 현재 코드에서 사용하지 않으므로 등록하지 않아도 됩니다.

**배포 트리거**는 기본 동작을 따릅니다: `main` 브랜치로 머지되면 프로덕션 배포, 나머지 브랜치는 프리뷰 배포가 생성됩니다.
