//대회 부분에서는 기능 잘 들어가 있음
//대회에서 각 문제 제출 하는거(+ 타임 설정 ), 제출할때 결과 나오는거, 문제 테스트 하는거, 타임 설정한거 로컬에서 삭제

//코스 부분도 잘 되어있음

import { useState, useRef, useEffect, type ChangeEvent } from "react";
import type * as monacoEditor from "monaco-editor";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Editor from "@monaco-editor/react";
import { useNavigate, useParams } from "react-router-dom";
import { EventSourcePolyfill } from "event-source-polyfill";
import * as Style from "./style";
import axiosInstance from "../../../api/axiosInstance";

// --- Types ---
type ProblemDetail = {
  name: string;
  description: string;
  input: string;
  output: string;
  exampleInput: string;
  exampleOutput: string;
};

type CourseProblemItem = {
  problemId: number;
  name: string;
  difficulty?: string;
  solvedResult?: string;
};

type CourseDetail = {
  courseId: number;
  title: string;
  problems: CourseProblemItem[];
};

type ContestInfo = {
  startDate?: string;
  endDate?: string;
  status?: string;
};

type LanguageOption = {
  value: string;
  label: string;
  monaco: string;
};

// --- Constants ---
const API_BASE_URL = (() => {
  const raw = import.meta.env.VITE_API_URL;
  if (!raw || typeof raw !== "string") return "";
  return raw.trim().replace(/\/?$/, "/");
})();

const LANGUAGE_OPTIONS: LanguageOption[] = [
  { value: "python", label: "Python", monaco: "python" },
  { value: "cpp", label: "C++", monaco: "cpp" },
  { value: "java", label: "Java", monaco: "java" },
];

export default function SolvePage() {
  const { contestCode, problemId } = useParams<{
    contestCode?: string;
    problemId?: string;
  }>();
  const navigate = useNavigate();

  // 1. [상태 관리] 문제별 데이터 보관소 (LocalStorage 연동)
  const [codesByProblem, setCodesByProblem] = useState<Record<string, string>>(
    () => {
      try {
        const saved = localStorage.getItem(`contest_${contestCode}_codes`);
        return saved ? JSON.parse(saved) : {};
      } catch {
        return {};
      }
    }
  );

  const [langsByProblem, setLangsByProblem] = useState<Record<string, string>>(
    () => {
      try {
        const saved = localStorage.getItem(`contest_${contestCode}_langs`);
        return saved ? JSON.parse(saved) : {};
      } catch {
        return {};
      }
    }
  );

  const [timesByProblem, setTimesByProblem] = useState<Record<string, number>>(
    () => {
      try {
        const saved = localStorage.getItem(`contest_${contestCode}_times`);
        return saved ? JSON.parse(saved) : {};
      } catch {
        return {};
      }
    }
  );

  // 2. [현재 상태] 에디터 및 제출 관련
  const [currentCode, setCurrentCode] = useState("");
  const [language, setLanguage] = useState(LANGUAGE_OPTIONS[0].value);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 3. UI 상태
  const [sampleInput, setSampleInput] = useState("");
  const [sampleOutput, setSampleOutput] = useState("");
  const [rightPanelWidth, setRightPanelWidth] = useState(65);
  const [isResizing, setIsResizing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeResultTab, setActiveResultTab] = useState<"result" | "tests">(
    "result"
  );
  const [terminalHeight, setTerminalHeight] = useState(200);

  // 4. 문제 및 대회 데이터 상태
  const [problem, setProblem] = useState<ProblemDetail | null>(null);
  const [problemStatus, setProblemStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [problemError, setProblemError] = useState("");
  const [courseProblems, setCourseProblems] = useState<CourseProblemItem[]>([]);
  const [courseLoading, setCourseLoading] = useState(false);
  const [contestInfo, setContestInfo] = useState<ContestInfo | null>(null);
  const [timeLeft, setTimeLeft] = useState("");

  // 5. 채점 결과 상태
  const [gradingDetails, setGradingDetails] = useState<any[]>([]);
  const [gradingCacheByProblem, setGradingCacheByProblem] = useState<
    Record<string, any[]>
  >({});

  // Refs
  const containerRef = useRef<HTMLDivElement | null>(null);
  const exampleInputRef = useRef<HTMLTextAreaElement | null>(null);
  const sseConnectionRef = useRef<EventSourcePolyfill | null>(null);
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const terminalRef = useRef<HTMLDivElement | null>(null);

  const currentLanguageOption =
    LANGUAGE_OPTIONS.find((option) => option.value === language) ||
    LANGUAGE_OPTIONS[0];

  // ---------------------------------------------------------
  // [Effect] 1. 타이머: 1초마다 현재 문제의 시간 누적
  // ---------------------------------------------------------
  useEffect(() => {
    if (!problemId) return;
    const timer = setInterval(() => {
      setTimesByProblem((prev) => ({
        ...prev,
        [problemId]: (prev[problemId] || 0) + 1,
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, [problemId]);

  // ---------------------------------------------------------
  // [Effect] 2. 로컬 스토리지 자동 저장
  // ---------------------------------------------------------
  const saveToLocal = () => {
    localStorage.setItem(
      `contest_${contestCode}_codes`,
      JSON.stringify(codesByProblem)
    );
    localStorage.setItem(
      `contest_${contestCode}_langs`,
      JSON.stringify(langsByProblem)
    );
    localStorage.setItem(
      `contest_${contestCode}_times`,
      JSON.stringify(timesByProblem)
    );
  };

  useEffect(() => {
    saveToLocal();
  }, [codesByProblem, langsByProblem, timesByProblem]);

  useEffect(() => {
    window.addEventListener("beforeunload", saveToLocal);
    return () => window.removeEventListener("beforeunload", saveToLocal);
  }, [codesByProblem, langsByProblem, timesByProblem]);

  // ---------------------------------------------------------
  // [Effect] 3. 문제 변경 시 데이터 복구 (코드, 언어, 채점 결과)
  // ---------------------------------------------------------
  useEffect(() => {
    if (!problemId) return;
    setCurrentCode(codesByProblem[problemId] || "");
    setLanguage(langsByProblem[problemId] || LANGUAGE_OPTIONS[0].value);
    setGradingDetails(gradingCacheByProblem[problemId] || []);
  }, [problemId]);

  // ---------------------------------------------------------
  // [Effect] 4. 패널 리사이징 로직
  // ---------------------------------------------------------
  useEffect(() => {
    if (!isResizing) return;
    const handleMouseMove = (event: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const relativeX = event.clientX - rect.left;
      const clampedX = Math.max(400, Math.min(rect.width * 0.8, relativeX));
      setRightPanelWidth(((rect.width - clampedX) / rect.width) * 100);
    };
    const stopResizing = () => setIsResizing(false);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [isResizing]);

  // ---------------------------------------------------------
  // [Effect] 5. 문제 상세 정보 Fetch
  // ---------------------------------------------------------
  useEffect(() => {
    if (!problemId) return;
    const controller = new AbortController();
    const fetchProblem = async () => {
      setProblemStatus("loading");
      try {
        const response = await axiosInstance(
          `${API_BASE_URL}problems/${problemId}`,
          {
            signal: controller.signal,
          }
        );
        setProblem(response.data);
        setSampleInput(response.data.exampleInput || "");
        setSampleOutput(response.data.exampleOutput || "");
        setProblemStatus("success");
      } catch (error) {
        if (controller.signal.aborted) return;
        setProblemStatus("error");
        setProblemError("문제 로딩 중 오류가 발생했습니다.");
      }
    };
    fetchProblem();
    return () => controller.abort();
  }, [problemId]);

  // ---------------------------------------------------------
  // [Effect] 6. 대회 정보 및 사이드바 목록 Fetch
  // ---------------------------------------------------------
  useEffect(() => {
    if (!contestCode) return;
    const fetchCourse = async () => {
      setCourseLoading(true);
      try {
        const res = await axiosInstance(
          `${API_BASE_URL}contest/${contestCode}`
        );
        setContestInfo({
          startDate: res.data.startDate,
          endDate: res.data.endDate,
          status: res.data.status,
        });
        setCourseProblems(res.data.problems || []);
      } catch {
        setCourseProblems([]);
      } finally {
        setCourseLoading(false);
      }
    };
    fetchCourse();
  }, [contestCode]);

  // ---------------------------------------------------------
  // [Effect] 7. SSE 실시간 업데이트
  // ---------------------------------------------------------
  useEffect(() => {
    if (!contestCode || !API_BASE_URL || sseConnectionRef.current) return;

    const sseUrl = `${API_BASE_URL}contest/${contestCode}/subscribe`;
    const eventSource = new EventSourcePolyfill(sseUrl, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
      heartbeatTimeout: 300000,
    });
    sseConnectionRef.current = eventSource;

    eventSource.addEventListener("contest-update", (event) => {
      try {
        const data = JSON.parse((event as MessageEvent).data);
        if (data.eventType === "CONTEST_UPDATED") {
          setContestInfo((prev) => ({ ...prev, ...data }));
          toast.info(data.message || "대회 정보가 업데이트되었습니다.");
        }
      } catch (e) {
        console.error("SSE 파싱 에러", e);
      }
    });

    return () => {
      eventSource.close();
      sseConnectionRef.current = null;
    };
  }, [contestCode]);

  // ---------------------------------------------------------
  // [Effect] 8. 대회 잔여 시간 계산 (Timer)
  // ---------------------------------------------------------
  useEffect(() => {
    if (!contestInfo) return;
    const compute = () => {
      const now = new Date();
      const end = contestInfo.endDate ? new Date(contestInfo.endDate) : null;
      if (contestInfo.status === "ENDED" || (end && now > end)) return "종료됨";

      const totalSec = end
        ? Math.max(0, Math.floor((end.getTime() - now.getTime()) / 1000))
        : 0;
      const h = Math.floor(totalSec / 3600);
      const m = Math.floor((totalSec % 3600) / 60);
      const s = totalSec % 60;
      return `${String(h).padStart(2, "0")}:${String(m).padStart(
        2,
        "0"
      )}:${String(s).padStart(2, "0")}`;
    };
    setTimeLeft(compute());
    const id = setInterval(() => setTimeLeft(compute()), 1000);
    return () => clearInterval(id);
  }, [contestInfo]);

  // ---------------------------------------------------------
  // [Handlers] 핸들러 함수들
  // ---------------------------------------------------------
  const handleEditorChange = (value: string | undefined) => {
    const newCode = value || "";
    setCurrentCode(newCode);
    if (problemId)
      setCodesByProblem((prev) => ({ ...prev, [problemId]: newCode }));
  };

  const handleLanguageChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const newLang = event.target.value;
    setLanguage(newLang);
    if (problemId)
      setLangsByProblem((prev) => ({ ...prev, [problemId]: newLang }));
  };

  const handleGradeSubmit = async () => {
    if (!problemId || isSubmitting) return;
    if (!window.confirm("작성한 코드를 제출하시겠습니까?")) return;

    setIsSubmitting(true);
    try {
      const payload = {
        problemId: Number(problemId),
        code: currentCode,
        language: language.toUpperCase(),
        timeSpentSeconds: timesByProblem[problemId] || 0,
      };
      await axiosInstance.post(`${API_BASE_URL}solve/grading`, payload);
      toast.success("제출 완료!");
    } catch {
      toast.error("제출 실패");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditorBeforeMount = (monaco: typeof monacoEditor) => {
    monaco.editor.defineTheme("dukkaebi-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#263238",
        "editor.lineHighlightBackground": "#2f3a40",
      },
    });
  };

  const formatAccumulatedTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const handleExitSolvePage = () => navigate(`/contests/${contestCode}`);
  const toggleSidebar = () => setIsSidebarOpen((v) => !v);
  const handleSidebarItemClick = (pid: number) =>
    navigate(`/contests/${contestCode}/solve/${pid}`);

  const handleNextProblem = () => {
    const idx = courseProblems.findIndex(
      (p) => String(p.problemId) === String(problemId)
    );
    if (idx !== -1 && idx < courseProblems.length - 1) {
      handleSidebarItemClick(courseProblems[idx + 1].problemId);
    }
  };

  const problemSections = problem
    ? [
        { title: "문제 설명", content: problem.description },
        { title: "입력", content: problem.input },
        { title: "출력", content: problem.output },
      ]
    : [];

  return (
    <Style.SolveContainer ref={containerRef}>
      <ToastContainer
        position="top-right"
        theme="dark"
        newestOnTop
        closeOnClick
        autoClose={2000}
      />

      {/* 상단 헤더 영역 */}
      <Style.Header>
        <Style.BackButton
          type="button"
          aria-label="문제 풀고 나가기"
          onClick={handleExitSolvePage}
        >
          ‹
        </Style.BackButton>
        <Style.HeaderTitle>
          {problem?.name ??
            (problemStatus === "loading" ? "로딩 중..." : "문제 정보 없음")}
          {/* 실시간 누적 풀이 시간 표시 */}
          <span
            style={{
              marginLeft: 16,
              fontSize: 14,
              color: "#4ade80",
              fontWeight: "normal",
            }}
          >
            ⏱ 풀이 시간:{" "}
            {formatAccumulatedTime(timesByProblem[problemId || ""] || 0)}
          </span>
        </Style.HeaderTitle>
        <Style.HeaderActions>
          {timeLeft && (
            <span style={{ color: "#9fb1bc", marginRight: 12 }}>
              {timeLeft}
            </span>
          )}
          <Style.LanguageSelect
            value={language}
            onChange={handleLanguageChange}
          >
            {LANGUAGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Style.LanguageSelect>
          <Style.MenuButton
            ref={menuButtonRef}
            type="button"
            aria-label="문제 목록 열기/닫기"
            onClick={toggleSidebar}
          >
            ☰
          </Style.MenuButton>
        </Style.HeaderActions>
      </Style.Header>

      <Style.PageContent>
        {/* 왼쪽: 문제 설명 패널 */}
        <Style.LeftPanel>
          <Style.LeftPanelContent>
            {problemStatus === "error" && (
              <Style.Section>
                <Style.SectionTitle>알림</Style.SectionTitle>
                <Style.ProblemStatus $variant="error">
                  {problemError}
                </Style.ProblemStatus>
              </Style.Section>
            )}

            {problemSections.map(({ title, content }) => (
              <Style.Section key={title}>
                <Style.SectionTitle>{title}</Style.SectionTitle>
                <Style.SectionText>{content}</Style.SectionText>
              </Style.Section>
            ))}

            <Style.Section>
              <Style.SectionTitle>예시 입력:</Style.SectionTitle>
              <Style.ExampleTextarea
                readOnly
                tabIndex={-1}
                aria-readonly="true"
                ref={exampleInputRef}
                value={sampleInput}
              />
            </Style.Section>

            <Style.Section>
              <Style.SectionTitle>예시 출력:</Style.SectionTitle>
              <Style.ExampleOutput>{sampleOutput}</Style.ExampleOutput>
            </Style.Section>
          </Style.LeftPanelContent>
        </Style.LeftPanel>

        {/* 중앙: 리사이즈 바 */}
        <Style.Divider
          onMouseDown={() => setIsResizing(true)}
          $isResizing={isResizing}
        />

        {/* 오른쪽: 에디터 및 결과 패널 */}
        <Style.RightPanel $width={rightPanelWidth}>
          <Style.EditorContainer>
            <Editor
              height="100%"
              width="100%"
              language={currentLanguageOption.monaco}
              value={currentCode}
              onChange={handleEditorChange}
              beforeMount={handleEditorBeforeMount}
              theme="dukkaebi-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineHeight: 1.6,
                wordWrap: "on",
                tabSize: 2,
                scrollBeyondLastLine: false,
              }}
            />
          </Style.EditorContainer>

          <Style.ResultContainer>
            <Style.ResultTabs>
              <Style.ResultTab
                type="button"
                $active={activeResultTab === "result"}
                onClick={() => setActiveResultTab("result")}
              >
                실행 결과
              </Style.ResultTab>
              <Style.ResultTab
                type="button"
                $active={activeResultTab === "tests"}
                onClick={() => setActiveResultTab("tests")}
              >
                테스트 케이스
              </Style.ResultTab>
            </Style.ResultTabs>

            {activeResultTab === "result" ? (
              <Style.Terminal ref={terminalRef} $height={terminalHeight}>
                <Style.TerminalHandle />
                <Style.TerminalOutput>
                  <div style={{ color: "#a0aec0" }}>
                    {isSubmitting
                      ? "코드를 제출 중입니다..."
                      : "실행 결과가 여기에 표시됩니다."}
                  </div>
                </Style.TerminalOutput>
              </Style.Terminal>
            ) : (
              <Style.Terminal ref={terminalRef} $height={terminalHeight}>
                <Style.TerminalHandle />
                <Style.TerminalOutput>
                  {gradingDetails.length === 0 ? (
                    <div style={{ color: "#a0aec0" }}>
                      테스트 결과가 없습니다. 코드를 제출하여 확인하세요.
                    </div>
                  ) : (
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        fontSize: 14,
                        tableLayout: "fixed",
                      }}
                    >
                      <thead>
                        <tr style={{ color: "#a0aec0", textAlign: "left" }}>
                          <th
                            style={{
                              padding: "8px 10px",
                              borderBottom: "1px solid rgba(255,255,255,0.08)",
                              width: "15%",
                            }}
                          >
                            번호
                          </th>
                          <th
                            style={{
                              padding: "8px 10px",
                              borderBottom: "1px solid rgba(255,255,255,0.08)",
                              width: "20%",
                            }}
                          >
                            입력값
                          </th>
                          <th
                            style={{
                              padding: "8px 10px",
                              borderBottom: "1px solid rgba(255,255,255,0.08)",
                              width: "20%",
                            }}
                          >
                            출력값
                          </th>
                          <th
                            style={{
                              padding: "8px 10px",
                              borderBottom: "1px solid rgba(255,255,255,0.08)",
                              width: "25%",
                            }}
                          >
                            예상 출력값
                          </th>
                          <th
                            style={{
                              padding: "8px 10px",
                              borderBottom: "1px solid rgba(255,255,255,0.08)",
                              width: "20%",
                            }}
                          >
                            실행결과
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {gradingDetails.map((d, idx) => (
                          <tr key={idx}>
                            <td
                              style={{
                                padding: "10px",
                                borderBottom:
                                  "1px solid rgba(255,255,255,0.06)",
                                color: "#9fb1bc",
                              }}
                            >
                              {String(d.testCaseNumber ?? idx + 1).padStart(
                                2,
                                "0"
                              )}
                            </td>
                            <td
                              style={{
                                padding: "10px",
                                borderBottom:
                                  "1px solid rgba(255,255,255,0.06)",
                              }}
                            >
                              <pre
                                style={{ margin: 0, whiteSpace: "pre-wrap" }}
                              >
                                {d.input || "-"}
                              </pre>
                            </td>
                            <td
                              style={{
                                padding: "10px",
                                borderBottom:
                                  "1px solid rgba(255,255,255,0.06)",
                              }}
                            >
                              <pre
                                style={{ margin: 0, whiteSpace: "pre-wrap" }}
                              >
                                {d.actualOutput || "-"}
                              </pre>
                            </td>
                            <td
                              style={{
                                padding: "10px",
                                borderBottom:
                                  "1px solid rgba(255,255,255,0.06)",
                              }}
                            >
                              <pre
                                style={{ margin: 0, whiteSpace: "pre-wrap" }}
                              >
                                {d.expectedOutput || "-"}
                              </pre>
                            </td>
                            <td
                              style={{
                                padding: "10px",
                                borderBottom:
                                  "1px solid rgba(255,255,255,0.06)",
                                fontWeight: 700,
                                color: d.passed ? "#4ade80" : "#fca5a5",
                              }}
                            >
                              {d.passed ? "통과" : "실패"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </Style.TerminalOutput>
              </Style.Terminal>
            )}

            {/* 하단 버튼 영역 */}
            <Style.SubmitWrapper
              style={{ marginRight: isSidebarOpen ? 268 : 0 }}
            >
              <div style={{ display: "flex", gap: "24px" }}>
                <Style.SubmitButton
                  onClick={() => navigate(`/contests/${contestCode}`)}
                  style={{
                    backgroundColor: "#35454E",
                    border: "1px solid #495D68",
                  }}
                >
                  테스트 끝내기
                </Style.SubmitButton>

                <Style.SubmitButton
                  onClick={handleGradeSubmit}
                  disabled={isSubmitting || !problemId}
                  style={{
                    backgroundColor: isSubmitting ? "#444" : "#007bff",
                    opacity: isSubmitting ? 0.7 : 1,
                  }}
                >
                  {isSubmitting ? "제출 중..." : "코드 제출"}
                </Style.SubmitButton>

                <Style.SubmitButton
                  onClick={handleNextProblem}
                  disabled={!problemId}
                >
                  다음 문제
                </Style.SubmitButton>
              </div>
            </Style.SubmitWrapper>
          </Style.ResultContainer>
        </Style.RightPanel>

        {/* 사이드바: 문제 목록 */}
        {isSidebarOpen && (
          <>
            <Style.ThinDivider />
            <Style.RightSidebar ref={sidebarRef}>
              <Style.SidebarList>
                {courseLoading ? (
                  <div style={{ padding: 20, color: "#9fb1bc" }}>
                    목록 로딩 중...
                  </div>
                ) : (
                  courseProblems.map((p, idx) => (
                    <Style.SidebarItem
                      key={p.problemId}
                      $active={String(p.problemId) === String(problemId)}
                      onClick={() => handleSidebarItemClick(p.problemId)}
                    >
                      <Style.SidebarItemIndex>
                        {String(idx + 1).padStart(2, "0")}
                      </Style.SidebarItemIndex>
                      <Style.SidebarItemTitle>{p.name}</Style.SidebarItemTitle>
                    </Style.SidebarItem>
                  ))
                )}
              </Style.SidebarList>
            </Style.RightSidebar>
          </>
        )}
      </Style.PageContent>
    </Style.SolveContainer>
  );
}
