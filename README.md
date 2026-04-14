# Dukkaebi (두깨비) Web

A Korean-language competitive programming and coding-course platform frontend. Built as a Vite + React 19 + TypeScript SPA.

[한국어 README](./README.ko.md)

---

> **If you're reading this as a handoff document**
>
> This README is written less as a "feature tour" and more as a **handoff document**: the goal is for a newly onboarded developer to get the app running locally, understand the codebase's implicit conventions and landmines, and debug common issues on their own. If you're short on time, read these four sections first:
>
> 1. [Getting Started](#getting-started) — to run it locally
> 2. [Solve Page Composition](#solve-page-composition) — the most complex screen in the app
> 3. [Known Issues / Technical Debt](#known-issues--technical-debt) — the things that will explode when touched
> 4. [Common Problems](#common-problems) — error-message-indexed debugging checklist

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Architecture Notes](#architecture-notes)
  - [Routing](#routing)
  - [Auth Flow](#auth-flow)
  - [Solve Page Composition](#solve-page-composition)
  - [Data Fetching Styles (currently mixed)](#data-fetching-styles-currently-mixed)
  - [Styling](#styling)
  - [TypeScript Constraints](#typescript-constraints)
- [Backend API Summary](#backend-api-summary)
- [localStorage Keys](#localstorage-keys)
- [Known Issues / Technical Debt](#known-issues--technical-debt)
- [Common Tasks](#common-tasks)
- [Verification Checklist](#verification-checklist)
- [Common Problems](#common-problems)
- [Deployment](#deployment)

## Features

- **Problem solving** — browse the problem bank, write code in an in-browser Monaco editor, submit to the backend judge
- **Courses** — curated course tracks with their own problem sets and progress, sidebar-based navigation between sibling problems
- **Contests** — time-limited contests with dedicated problem sets. Receives contest state in real time via SSE and records per-problem time-on-task in 1-second intervals
- **Notifications** — announcements list / detail pages, with the 5 latest shown on the home screen
- **Profile** — tier (7 levels: 도깨비불 → 동 → 철 → 은 → 금 → 옥 → 신), streak, 160-day solved-problem heatmap, logout and account deletion
- **Auth** — email login / signup, JWT access + refresh tokens, automatic token refresh on 401

Three parallel solving flows share the same UI building blocks:

| Route                                       | Context                 | Container file                       |
| ------------------------------------------- | ----------------------- | ------------------------------------ |
| `/solve/:problemId`                         | Standalone problem      | `src/page/solve/problems/index.tsx`  |
| `/courses/:courseId/solve/:problemId`       | Inside a course         | `src/page/solve/course/index.tsx`    |
| `/contests/:contestCode/solve/:problemId`   | Inside a contest        | `src/page/solve/contests/index.tsx`  |

**⚠️ Note**: The shared hooks (`hooks/solve`) and shared components (`components/solve`) extract a lot of logic, but the three containers are effectively copy-pasted from one another. After fixing a bug in one, always check the other two. As examples of their divergence: `contests` has four action buttons (End / Test / Submit / Next), `course` has the problem sidebar open by default, and `problems` doesn't have a sidebar at all.

## Tech Stack

- **Build** — Vite 7, `@vitejs/plugin-react-swc`
- **Language** — TypeScript 5.9 (strict, `verbatimModuleSyntax: true`, `erasableSyntaxOnly: true`)
- **UI** — React 19, React Router 7 (BrowserRouter), styled-components 6
- **Forms / validation** — react-hook-form 7 + zod 4 (via `@hookform/resolvers`)
- **Data** — axios (with shared interceptors), `event-source-polyfill` (required dependency — used to inject the `Authorization` header into SSE connections). `@tanstack/react-query` is installed but **currently unused** (reserved for future adoption).
- **Editor** — `@monaco-editor/react` → Monaco Editor. Supports Python / C++ / Java. The custom `dukkaebi-dark` theme is defined in `src/components/solve/CodeEditor.tsx`.
- **Notifications** — react-toastify (mounted in two places — see [Known Issues](#known-issues--technical-debt))
- **Font** — Pretendard, loaded dynamically from a CDN in `src/page/styles/GlobalStyle.ts`
- **Deploy** — Vercel (SPA rewrite in `vercel.json`)

## Getting Started

### Prerequisites

- Node.js 20+ recommended (for Vite 7 compatibility)
- npm (no other lockfile in the repo)

### Install

```bash
npm install
```

### Environment variables

`.env` is in `.gitignore`, so you need to create one at the project root on first run:

```env
VITE_API_URL="https://your-api-host"
# The two variables below are reserved for a Gemini integration that isn't wired
# up yet. They aren't referenced by any code under src/ and the app runs fine
# without them.
VITE_GOOGLE_API_KEY="..."
VITE_GOOGLE_MODEL="gemini-2.0-flash"
```

- Any variable exposed to the client **must** start with `VITE_` — otherwise `import.meta.env` won't read it.
- `VITE_API_URL` works **whether or not it ends with a slash**, because two different code paths defensively handle it:
  - `axiosInstance.baseURL` uses the value as-is.
  - The solve hooks (`useProblem`, `useCourse`, `useContest`, `useGrading`) internally normalize with `replace(/\/?$/, "/")` to always have a trailing slash.
- Both code paths currently coexist, so **leaving off the trailing slash is the safest choice** (the only value that doesn't break either path).
- `.env` values are baked into the client bundle at build time. Never put server-side secrets here.

### Scripts

```bash
npm run dev       # Vite dev server (defaults to http://localhost:5173)
npm run build     # tsc -b (type-check) then vite build → dist/
npm run lint      # ESLint (flat config, eslint.config.js)
npm run preview   # preview the production build locally
```

**There is no test runner configured.** The project has no automated tests and relies on manual regression testing. See [Verification Checklist](#verification-checklist) for the scenarios to exercise before merging.

### Git conventions (observed)

Looking at the remote branches, the project uses `feat/<name>` and `refactor/<name>` (`feat/auth`, `feat/solve`, `refactor/contest`, `refactor/notifications-new`, etc.). Merges go into `main` via PRs. Commit messages are mostly Korean and mix prefixes like `fix ::`, `refactor:` — not strict Conventional Commits.

## Project Structure

```
src/
├── api/
│   └── axiosInstance.ts        # auth interceptor + 401 auto-refresh
├── assets/                     # images, icons (grouped by feature)
├── components/                 # feature-scoped presentational components
│   ├── contests/               # ContestCard, ContestsGrid, HeroBanner, ...
│   ├── courses/                # CourseGrid/, ProfileSection/, Tabs/, ...
│   ├── footer/
│   ├── header/                 # shared top nav
│   ├── login/ signup/          # auth form pieces
│   ├── main/                   # home page sections (HeroSection, StatsCard, NoticeSection)
│   ├── notifications/
│   ├── problems/               # problem list / filter / pagination
│   ├── profile/                # TierCard, StreakCard, HeatmapCard, ProfileSidebar
│   └── solve/                  # solve screen shared pieces — used by all 3 routes
│       ├── SolveHeader.tsx
│       ├── ProblemDescription.tsx
│       ├── CodeEditor.tsx
│       ├── ResultPanel.tsx
│       ├── ProblemSidebar.tsx
│       └── index.ts            # barrel export
├── hooks/
│   └── solve/                  # feature-scoped hooks (currently the only hooks folder)
│       ├── useSolveForm.ts
│       ├── useProblem.ts
│       ├── useCourse.ts
│       ├── useContest.ts
│       ├── useGrading.ts
│       ├── useResizePanel.ts
│       └── index.ts            # public API + inferred-type re-exports
├── page/                       # route-level screen containers
│   ├── contests/{list,info}/
│   ├── courses/                # index.tsx + explore/, info/
│   ├── login/ signup/
│   ├── main/                   # home ("/")
│   ├── notifications/{list,info}/
│   ├── problems/               # problem list ("/problems")
│   ├── profile/
│   ├── solve/{problems,course,contests}/   # the three solve screens
│   └── styles/GlobalStyle.ts   # global font / toast styling
├── router/
│   └── router.tsx              # all routes declared in one flat <Routes> block (no nested routing)
├── App.tsx                     # mounts GlobalStyle + ToastContainer + BrowserRouter
├── main.tsx                    # createRoot
├── App.css / index.css         # very minimal resets only
```

The codebase follows a **strict feature-folder mirror**: every feature exists in all three of `page/`, `components/`, and (when it has enough logic to warrant one) `hooks/`, always under the same feature name.

- `page/<feature>/` — route-level screen containers. Usually `index.tsx` + `style.ts` or `styles.ts` (the filename is **inconsistent** — check what the folder actually has before editing).
- `components/<feature>/` — presentational pieces, re-exported from an `index.ts` barrel.
- `hooks/<feature>/` — feature-scoped hooks. Only `hooks/solve/` exists today.

When adding a new feature, follow this three-folder split instead of dumping everything under `page/`.

## Architecture Notes

### Routing

Every route is declared in a single flat `<Routes>` block in `src/router/router.tsx`. There is no nested routing, no layout route, and no auth guard. Each page determines "is the user logged in" on its own, either by checking `localStorage.getItem("accessToken")` or by hitting `/user` and reacting to the result.

To add a new page:

1. Create `src/page/<feature>/index.tsx` and `styles.ts`.
2. If you need presentational pieces, add them under `src/components/<feature>/` and export them from an `index.ts` barrel.
3. Add a single `<Route>` line to the `<Routes>` block in `src/router/router.tsx`.

### Auth Flow

#### Login / signup

Login and signup **do not go through `axiosInstance`** — they import `axios` directly (an intentional exception, to avoid interceptor loops).

| Location                     | Method | Path              | Request body                                  |
| ---------------------------- | ------ | ----------------- | --------------------------------------------- |
| `src/page/login/index.tsx`   | POST   | `/auth/sign-in`   | `{ loginId, password }`                       |
| `src/page/signup/index.tsx`  | POST   | `/auth/sign-up`   | `{ loginId, password, nickname }`             |
| `src/api/axiosInstance.ts`   | POST   | `/auth/refresh`   | `{ token: refreshToken }` (invoked internally on 401) |

On success, `accessToken` and `refreshToken` are stored in `localStorage` and the page navigates to `/`.

#### Shared axios instance (`src/api/axiosInstance.ts`)

Every other authenticated request must go through `axiosInstance`.

**Request interceptor**
- Reads `localStorage.accessToken` and injects `Authorization: Bearer <token>`.

**Response interceptor**
- On `error.response?.status === 401 && !originalRequest._retry`:
  1. Set `_retry = true` to prevent infinite loops.
  2. Call `POST {VITE_API_URL}/auth/refresh` with `{ token: refreshToken }` (using raw `axios`, so this request does not re-enter the same interceptor).
  3. Update `localStorage.accessToken` from the response and retry the original request once.
  4. On refresh failure, remove both tokens and **hard-redirect** to `/login` via `window.location.assign` (intentional — fully resets SPA state).

**Watch out**: if the backend expects a different field name in the refresh body (e.g. `refreshToken` instead of `token`), the current `{ token: ... }` shape will silently break. This is the first place to check when auth suddenly breaks end-to-end.

#### Logout

Calls `POST /user/logout` (ignoring the response), clears both tokens from localStorage, and hard-redirects to `/login` after a 500ms delay. Implemented in `src/page/profile/index.tsx`.

### Solve Page Composition

The solve screen is the most structurally complex part of the app. Here's the composition at a glance:

```
page/solve/{problems|course|contests}/index.tsx   ← containers (three of them)
  │
  ├─ useSolveForm      (code/language state, localStorage cache)
  ├─ useProblem        (GET /problems/:id)
  ├─ useCourse         (GET /course/:courseId)       ← course only
  ├─ useContest        (GET /contest/:code + SSE)    ← contest only
  ├─ useGrading        (POST /solve/grading, /solve/test)
  └─ useResizePanel    (drag-to-resize split)
  │
  └── components/solve/*
        ├─ SolveHeader        (back button, problem name, language select, rightContent slot)
        ├─ ProblemDescription (problem statement + sample I/O)
        ├─ CodeEditor         (Monaco + react-hook-form Controller)
        ├─ ResultPanel        (terminal output + actionButtons slot)
        └─ ProblemSidebar     (course/contest only — sibling problems)
```

#### Hook reference

- **`useSolveForm({ storageKey?, problemId? })`** — react-hook-form + zod form holding `{ code, language, chatInput }`. Persists per-problem code and language to localStorage under `<storageKey>_codes` and `<storageKey>_langs` (only when `storageKey` is passed). Exposes `LANGUAGE_OPTIONS` (Python / C++ / Java) as an `as const` tuple where each entry has a Monaco language ID (`monaco` field) and a backend language identifier (`value` field). The `chatInput` field is in the schema but not bound to any UI — dead field.

- **`useProblem({ problemId })`** — calls `GET {API}/problems/:problemId`, validates with zod (`problemDetailSchema`), and returns `{ name, description, input, output, exampleInput, exampleOutput }`. Derives `problemSections = [{ title: "문제 설명", ...}, { title: "입력", ...}, { title: "출력", ...}]` for the description panel and splits out `sampleInput` / `sampleOutput`. Status is `"idle" | "loading" | "success" | "error"`. Uses an `AbortController` for cleanup.

- **`useCourse({ courseId })`** — calls `GET {API}/course/:courseId`, receives `{ courseId, title, problems[] }`, and returns the problem array. Each item is `{ problemId, name, difficulty?, solvedResult? }`.

- **`useContest({ contestCode, problemId })`** — does three jobs:
  1. `GET {API}/contest/:contestCode` for contest info and problem list (the only solve hook that uses `axiosInstance`).
  2. Connects to `{API}/contest/:contestCode/subscribe` as an SSE stream using `EventSourcePolyfill` and listens for `contest-update` events. If the payload has `eventType: "CONTEST_UPDATED"`, it updates `startDate` / `endDate` / `status` and shows a toast. The native browser `EventSource` cannot inject an Authorization header, which is why `event-source-polyfill` is required. `heartbeatTimeout` is set to 300s.
  3. Tracks per-problem time-on-task in 1-second intervals, persisted to `dukkaebi_timeSpent_<contestCode>`. Also updates a live countdown string (`timeLeft`) every second based on `startDate`/`endDate`.
  - **There is no SSE reconnection.** `onerror` closes the connection and never reconnects, so a brief network blip will permanently stop contest state updates.

- **`useGrading({ problemId })`** — posts to `/solve/grading` (submit) and `/solve/test` (sample run). `formatGradingResult` formats the response into a Korean terminal string: "정답입니다. / 오답입니다.", `채점 결과: ...`, `통과한 테스트: X / Y`, `실행 시간: Nms`, plus the input / expected / actual from the first failing test case. Results are cached per problem via `gradingCacheByProblem` so they survive cross-problem navigation.
  - **Correct/incorrect decision logic**: currently `details.some(d => d.passed === true)` (useGrading.ts lines 125–127) — that's "any test passed?", not "all tests passed?". This may cause the toast to disagree with the actual verdict — see the technical debt section.
  - **This hook does not use `axiosInstance`** — it calls raw `fetch`. The 401 auto-refresh interceptor **does not apply** here. If the access token expires mid-solve, grading requests will simply fail.

- **`useResizePanel({ isSidebarOpen?, sidebarWidth? })`** — drag-resize between the editor and result panels. `rightPanelWidth` is clamped between 20% and 80% of available width; `terminalHeight` is computed as `Math.max(180, Math.min(height * 0.3, height - 160))` based on container height. When the sidebar is open, it subtracts `sidebarWidth` from the available width before computing ratios.

#### The shared-style gotcha

Every file in `components/solve/*.tsx` imports its styles from **`page/solve/problems/style.ts`**:

```ts
// src/components/solve/CodeEditor.tsx
import * as Style from "../../page/solve/problems/style";
```

In other words, `problems/style.ts` is not just "the style file for one page" — it is **the style source for every shared piece used by all three solve pages**. Editing `Style.Header`, `Style.EditorContainer`, `Style.ResultContainer`, etc. here affects all three solve routes immediately. Meanwhile, `page/solve/course/style.ts` and `page/solve/contests/style.ts` mostly only contain container-level layout and page-specific pieces (e.g. `MenuButton`, `ThinDivider`).

The folder names don't make this obvious — so whenever you touch solve-screen styles, start with `problems/style.ts`.

#### `ResultPanel.actionButtons` slot

`ResultPanel` takes a `ReactNode` slot called `actionButtons` so each solve page can inject its own buttons:

- `problems` — `[제출 후 채점하기]` (single button)
- `course` — `[제출 후 채점하기]` (same as `problems` today)
- `contests` — `[끝내기]` `[테스트]` `[제출]` `[다음 문제]` (four buttons) + a margin adjustment based on whether the sidebar is open

When adding buttons to a solve page, use this slot — don't modify `ResultPanel` itself.

### Data Fetching Styles (currently mixed)

The codebase has three coexisting data-fetching styles. **Prefer style (1) for new code.**

1. **`axiosInstance` + local `useEffect` + local `status` state** — most of `src/page/**/*.tsx` and `hooks/solve/useContest.ts`. This is the safest path because it inherits the auth interceptor and 401 refresh. Validate responses with zod where possible.
2. **Raw `fetch` + manual `accessToken` reads** — `hooks/solve/useProblem.ts`, `useCourse.ts`, `useGrading.ts`. Legacy code from before the interceptor was introduced. **Token refresh does not work for these calls.** When editing these files, prioritize migrating them to `axiosInstance`.
3. **Raw `axios`** — `src/page/login/index.tsx`, `src/page/signup/index.tsx`. The user has no token before logging in, and the login response shouldn't re-enter the 401 handler, so these intentionally bypass the interceptor. Leave them alone.

`@tanstack/react-query` is in `package.json` but **isn't actually used** (`QueryClientProvider` is not mounted in `App.tsx`). It's a candidate for either removal during a dependency cleanup, or as the seed for a gradual migration.

Loading state is expressed in two different ways across hooks:
- `status: "idle" | "loading" | "success" | "error"` (`useProblem`)
- A simple `isLoading: boolean` (`useCourse`, `useContest`, most page containers)

Neither is "correct"; match the surrounding file.

All API responses are validated with a `z.object({...})` schema declared at the top of each hook file, and the inferred types (`z.infer<...>`) are re-exported through the feature barrel (`hooks/solve/index.ts`). If the backend response shape changes and you hit a runtime error, the zod schema at the top of the relevant hook is the first place to check.

### Styling

- **styled-components only.** No CSS Modules, no Tailwind, no global CSS (`App.css` and `index.css` only contain minimal resets).
- Each page/component folder has its own `styles.ts` or `style.ts` — **the filename is inconsistent**, so double-check the actual filename before importing. New files should be named `styles.ts`, but don't rename existing files (that breaks many imports).
- Global styles live in `src/page/styles/GlobalStyle.ts` and are mounted once in `App.tsx`. It loads 9 weights of the Pretendard font from a jsdelivr CDN — in offline environments, expect the font to fall back.
- Transient props that should not be forwarded to the DOM are prefixed with `$` (e.g. `$width`, `$isResizing`, `$active`, `$danger`). If you see a `React does not recognize the X prop on a DOM element` warning in the console, it's a missing `$`.
- Solve-screen palette: dark background `#263238`, header `#35454E`, border `#495D68`, aqua accent `#3E5C7A`. These are hardcoded throughout — there is no design-token system.

### TypeScript Constraints

`tsconfig.app.json` turns on the following flags you need to be aware of:

- **`verbatimModuleSyntax: true`** — type-only imports must use `import type { ... }`. Mixed value/type imports have to be split into separate import statements or written inline as `import { useEffect, type RefObject } from "react"`.
- **`erasableSyntaxOnly: true`** — TypeScript-only runtime constructs (`enum`, `namespace`, parameter properties) are forbidden. Use `const` objects + `as const` tuples instead (see `LANGUAGE_OPTIONS` for an example).
- **`noUnusedLocals: false`, `noUnusedParameters: false`** — the compiler will NOT catch unused variables; rely on ESLint for that.
- **`strict: true`** — null/undefined checks are strict.

## Backend API Summary

Below is the list of endpoints the frontend actually calls (relative to `VITE_API_URL`). This is **reverse-engineered from the code**, not an official spec — for exact schemas, ask the backend team or check the relevant zod schema in the hook / page file.

### Auth
| Method | Path              | Used by                                | Notes                                             |
| ------ | ----------------- | -------------------------------------- | ------------------------------------------------- |
| POST   | `/auth/sign-in`   | `page/login`                           | `{ loginId, password }` → `{ accessToken, refreshToken }` |
| POST   | `/auth/sign-up`   | `page/signup`                          | `{ loginId, password, nickname }`                 |
| POST   | `/auth/refresh`   | `api/axiosInstance` (401 interceptor)  | `{ token: refreshToken }` → `{ accessToken }`     |

### User / activity
| Method | Path                              | Used by                        |
| ------ | --------------------------------- | ------------------------------ |
| GET    | `/user`                           | `page/profile`, `page/courses` |
| GET    | `/user/activity/contributions`    | `page/main`, `page/profile` (query: `start`, `end` — `YYYY-MM-DD`) |
| GET    | `/user/activity/streak`           | `page/main`, `page/profile`    |
| POST   | `/user/logout`                    | `page/profile`                 |
| DELETE | `/user/delete`                    | `page/profile` (account deletion) |

### Problems
| Method | Path                       | Used by                   | Notes                                                                  |
| ------ | -------------------------- | ------------------------- | ---------------------------------------------------------------------- |
| GET    | `/problems`                | `page/problems`           | query: `page`, `size`, `difficulty`, `correctRate`, `time`, `name`. Response is Spring Data Pageable shape: `{ content[], totalPages, first, last }` |
| GET    | `/problems/:problemId`     | `hooks/solve/useProblem`  | Response: `{ name, description, input, output, exampleInput, exampleOutput }` |

### Grading
| Method | Path              | Used by                    | Body                                             |
| ------ | ----------------- | -------------------------- | ------------------------------------------------ |
| POST   | `/solve/grading`  | `hooks/solve/useGrading`   | `{ problemId, code, language, timeSpentSeconds? }` |
| POST   | `/solve/test`     | `hooks/solve/useGrading`   | `{ problemId, code, language }`                  |

Response schema:
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

### Courses
| Method | Path                                 | Used by                     |
| ------ | ------------------------------------ | --------------------------- |
| GET    | `/course/:courseId`                  | `hooks/solve/useCourse`     |
| GET    | `/student/course/joinable`           | `page/courses/explore`      |
| GET    | `/student/course/in-progress`        | `page/courses`              |
| GET    | `/student/course/completed`          | `page/courses`              |
| POST   | `/student/course/:courseId/join`     | `page/courses/info`         |

### Contests
| Method | Path                                   | Used by                  |
| ------ | -------------------------------------- | ------------------------ |
| GET    | `/contest/list`                        | `page/contests/list`     |
| GET    | `/contest/:contestCode`                | `hooks/solve/useContest` |
| SSE    | `/contest/:contestCode/subscribe`      | `hooks/solve/useContest` (event: `contest-update`) |

### Notifications
| Method | Path             | Used by                         |
| ------ | ---------------- | ------------------------------- |
| GET    | `/notice/home`   | `page/main` (5 most recent)     |
| GET    | `/notice/:id`    | `page/notifications/info`       |

## localStorage Keys

Every localStorage key the client touches:

| Key                                         | Value                                | Written / cleared by                                           |
| ------------------------------------------- | ------------------------------------ | -------------------------------------------------------------- |
| `accessToken`                               | JWT access token (string)            | `page/login`, `api/axiosInstance`; cleared on logout / delete / refresh failure |
| `refreshToken`                              | JWT refresh token (string)           | `page/login`; cleared on logout / delete / refresh failure     |
| `<storageKey>_codes`                        | `{ [problemId]: code }` JSON         | `hooks/solve/useSolveForm` (only if `storageKey` is provided)  |
| `<storageKey>_langs`                        | `{ [problemId]: language }` JSON     | `hooks/solve/useSolveForm` (only if `storageKey` is provided)  |
| `dukkaebi_timeSpent_<contestCode>`          | `{ [problemId]: seconds }` JSON      | `hooks/solve/useContest` — updated every second                |
| `dukkaebi_codes_*` / `dukkaebi_submitted_*` | legacy (no current writer)           | `page/main` / `page/profile` **delete only** — cleanup of leftover data from older versions |

`page/main` and `page/profile` clear every key prefixed with `dukkaebi_codes_`, `dukkaebi_timeSpent_`, and `dukkaebi_submitted_` on mount. This means **navigating to the home or profile page wipes contest-time-on-task data** — it appears intentional, but if a user accidentally returns to the home screen mid-contest, their time tracking is gone. Edge case worth knowing about.

`storageKey` is a caller-chosen string. Current usage:

- `page/solve/problems/index.tsx` — does not pass `storageKey` (no localStorage cache for standalone problems)
- `page/solve/course/index.tsx` — `course_${courseId}`
- `page/solve/contests/index.tsx` — `dukkaebi_contest_${contestCode}`

## Known Issues / Technical Debt

Things you absolutely need to know when taking over. Ordered by priority.

1. **Three `hooks/solve` files use raw `fetch`** — `useProblem.ts`, `useCourse.ts`, `useGrading.ts`. These requests don't go through `axiosInstance`'s 401 refresh interceptor, so **if the access token expires mid-solve, problem loading / grading / testing will fail and the user will be bounced to `/login`**. Migrating these to `axiosInstance` is the highest-priority technical debt. `useContest` has already been migrated and makes a good reference.

2. **`useGrading`'s "correct" decision is wrong** — lines 125–127 of `useGrading.ts` decide the verdict via `details.some(d => d.passed === true)`. `details` appears to contain only the first failing test case, and the real verdict should be `passedTestCases === totalTestCases`. Today, "any test passed" will trigger the success toast, so the UI can disagree with the actual verdict.

3. **No SSE reconnection** — `useContest.ts`'s `eventSource.onerror` closes the connection without retrying. A brief network blip during a contest permanently stops state updates. Add exponential backoff reconnection.

4. **Three solve pages are structurally duplicated** — `page/solve/{problems,course,contests}/index.tsx` wire the same hooks in essentially the same shape but are maintained in parallel. Long term, consolidate into one container with context-specific props (standalone / course / contest). Short term, always check whether a change needs to land in all three files.

5. **`@tanstack/react-query` is installed but unused** — there is no `QueryClientProvider` in `App.tsx`, so nothing actually works. Either wire up a provider and start migrating, or remove it from `package.json`.

6. **`styles.ts` vs `style.ts` filename inconsistency** — not intentional, just accidental drift. Name new files `styles.ts`, but don't rename existing ones (you'll break a lot of imports).

7. **`ToastContainer` is mounted twice** — once globally in `App.tsx`, once per solve page. So solve pages have two overlapping toast containers. This is probably a side effect of wanting a `theme="dark"` config just for solve pages. Notifications don't actually duplicate, but the setup is almost certainly not intentional.

8. **Auth state lives in localStorage only** — there is no React Context or state manager. Each page reads `localStorage.getItem("accessToken")` or hits `/user` on its own to determine login state. This causes regular bugs where the header UI lags behind actual auth state. There is also no "protected route" concept — unauthenticated users can navigate to `/profile` and only bounce out once the first 401 comes back.

9. **`useSolveForm.chatInput` is a dead field** — it exists in the form schema but is not bound to any UI component. It's a placeholder for an AI chatbot feature that was planned but never shipped. The unused `VITE_GOOGLE_API_KEY` / `VITE_GOOGLE_MODEL` env vars are the matching server-side placeholder.

10. **Pagination state has to be manually reset on filter change** — `page/problems/index.tsx` calls `setCurrentPage(0)` by hand from every filter/search handler. Forgetting this when adding a new filter causes the symptom of seeing a blank page after filtering.

## Common Tasks

### Adding a new page

1. Create `src/page/<feature>/index.tsx` and `styles.ts`.
2. If you need presentational pieces, add them under `src/components/<feature>/` and export them from an `index.ts` barrel.
3. Add a `<Route>` line to `<Routes>` in `src/router/router.tsx`.
4. If it needs to appear in the top nav, add a `<NavLink>` in `src/components/header/index.tsx` and extend the `pathname.startsWith(...)` active-state logic.

### Adding a new authenticated API call

Import `axiosInstance` and use the method helpers. **There is no path alias (`@/...`)** — use relative imports.

```ts
import axiosInstance from "../../api/axiosInstance";
import { z } from "zod";

const profileSchema = z.object({ id: z.number(), name: z.string() });

const { data } = await axiosInstance.get("/user");
const profile = profileSchema.parse(data);
```

### Adding a supported language

Edit `LANGUAGE_OPTIONS` in `src/hooks/solve/useSolveForm.ts`:

```ts
export const LANGUAGE_OPTIONS = [
  { value: "python", label: "Python", monaco: "python" },
  { value: "cpp",    label: "C++",    monaco: "cpp" },
  { value: "java",   label: "Java",   monaco: "java" },
  { value: "go",     label: "Go",     monaco: "go" }, // ← new
] as const;
```

- `value` must match the language identifier accepted by the backend's `/solve/grading` — confirm with the backend team first.
- `monaco` must match Monaco Editor's language ID — see the [monaco-editor docs](https://microsoft.github.io/monaco-editor/).
- `label` is purely UI.

### Modifying solve page behavior

First, figure out whether the logic lives in a hook or in a container:

- Hook (`hooks/solve/*`) — one edit propagates to all three pages.
- Shared component (`components/solve/*`) — one edit propagates to all three pages.
- Container (`page/solve/{problems,course,contests}/index.tsx`) — only affects that route.

When editing container logic, open all three files side by side and apply the change only where needed.

### Adding a new hook category

Only `hooks/solve/` exists today. If you want to add, say, `hooks/contests/`:

1. Create the `src/hooks/contests/` directory.
2. Put each hook in its own file, with a zod schema + inferred type at the top.
3. Re-export hooks and types from `src/hooks/contests/index.ts`.
4. Consume with `import { useXxx, type XxxItem } from "../../hooks/contests"`.

### Adding or changing types

- Use `import type` for type-only imports.
- If you need an enum, use a `const` object + `as const` + `typeof` for the union type.
- For API response types, derive from the zod schema via `z.infer` — don't hand-write them.

## Verification Checklist

Since there's no automated test suite, run through this list **manually** before merging.

**Build / lint**
- [ ] `npm run build` passes (type check included)
- [ ] `npm run lint` clean

**Auth / flow**
- [ ] Signup → login → home works
- [ ] After logout, `/` is accessible and doesn't crash in a token-less state
- [ ] Manually corrupt `localStorage.accessToken`, then trigger any API call — `/auth/refresh` should be called and the original request retried (check the DevTools Network tab)
- [ ] Corrupt `refreshToken` too — the app should hard-redirect to `/login`

**Solve screens (all three routes)**
- [ ] `/solve/:problemId` — write code → submit → "정답" or "오답" shown
- [ ] `/courses/:courseId/solve/:problemId` — sidebar is visible; clicking a sibling problem navigates
- [ ] `/contests/:contestCode/solve/:problemId` — `timeLeft` countdown ticks every second; "다음 문제" is disabled on the last problem; an SSE `contest-update` triggers a toast
- [ ] Refresh the page mid-solve → code is restored (course / contests only — standalone doesn't cache)
- [ ] Navigate between problems → language selection persists per-problem

**UI / styling**
- [ ] No `React does not recognize the $X prop on a DOM element` warnings in the console (= no missing `$` on transient props)
- [ ] Shrinking the window keeps the editor/result split clamped between 20% and 80%
- [ ] Pretendard font loads (check the jsdelivr request in the Network tab)

## Common Problems

### `npm run dev` works, but `npm run build` fails

Almost always a type-check (`tsc -b`) failure caused by `verbatimModuleSyntax` or `erasableSyntaxOnly`.

- `error TS1484: '...' is a type and must be imported using a type-only import` → change to `import type { ... }` or split the import.
- `error TS1294: This syntax is not allowed when 'erasableSyntaxOnly' is enabled` → remove any `enum`, `namespace`, or parameter property, and use `const` objects instead.
- `TS2307: Cannot find module './styles'` → you confused `style.ts` with `styles.ts`. Check the actual filename in that folder.

### Every API call fails with 401

1. Check `VITE_API_URL` in `.env`.
2. Check that `localStorage.accessToken` is present and not expired.
3. Make sure the backend is up and CORS is configured correctly.
4. If it's still failing, add temporary `console.log`s to both interceptors in `src/api/axiosInstance.ts` to reproduce.

### Infinite redirect to `/login` after logging in

`POST /auth/refresh` is failing. Likely causes:

- The backend changed the refresh body shape from `{ token: ... }` to something like `{ refreshToken: ... }` → fix line 33 of `axiosInstance.ts`.
- The refresh endpoint itself is returning 401 → the `_retry` flag prevents an infinite loop, but you should add a defensive exception for the refresh URL itself in the interceptor condition.
- `refreshToken` isn't in localStorage → verify the field name on the login response body.

### Monaco editor doesn't render

- `@monaco-editor/react` pulls its worker from a CDN by default. In offline / intranet environments this is blocked. To bundle the worker with Vite, configure `@monaco-editor/loader` with a local path.
- If the `dukkaebi-dark` theme isn't registered before the editor mounts, it shows up with a white background — make sure the `beforeMount` hook is still wired up.

### "채점 중 오류가 발생했습니다" toast during solving

`useGrading` doesn't distinguish failure reasons — it shows the same toast for everything. Check the `/solve/grading` or `/solve/test` response directly in the DevTools Network tab. If the response shape doesn't match the zod schema, a `ZodError` will land in the catch block.

### Contest timer has frozen

- The SSE connection may have dropped and not reconnected (see technical debt #3).
- If `contestInfo.endDate` has passed or `status === "ENDED"`, the UI shows "종료됨".
- Check the state of `/contest/:code/subscribe` in DevTools → Network → EventStream.

### The heatmap starts at a weird date

`page/profile`'s `generateHeatmapData` draws a 23-week × 7-day grid spanning +2 days to −158 days from today. `page/main` uses a different 17-week × 7-day window. The two screens intentionally use different windows, so editing only one will cause them to disagree.

## Deployment

Deployed on Vercel.

- **Framework**: Vite (auto-detected)
- **Build command**: `npm run build`
- **Output directory**: `dist`
- **SPA rewrite**: the `{ "source": "/(.*)", "destination": "/" }` rule in `vercel.json` falls back to `index.html` on direct URL access and page refreshes. Without it, hitting `/problems` directly returns a 404.

**Environment variables** must be set in the Vercel project's Environment Variables panel — at minimum `VITE_API_URL`. The local `.env` file is not used at Vercel build time. `VITE_GOOGLE_*` variables are not referenced by any code and can be omitted.

**Deployment triggers** are the Vercel defaults: merges to `main` deploy to production, and pushes to other branches create preview deployments.
