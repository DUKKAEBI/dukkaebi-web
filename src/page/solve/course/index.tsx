import {
  useState,
  useRef,
  useEffect,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";
import type * as monacoEditor from "monaco-editor";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Editor from "@monaco-editor/react";
import { useNavigate, useParams } from "react-router-dom";
import * as Style from "./style";

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

type ChatMessage = {
  id: number;
  sender: "bot" | "user";
  text: string;
};

const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 1,
    sender: "bot",
    text: "모르는 개념이 있다면 저 두비에게 물어보세요!",
  },
];

const API_BASE_URL = (() => {
  const raw = import.meta.env.VITE_API_URL;
  if (!raw || typeof raw !== "string") return "";
  return raw.trim().replace(/\/?$/, "/");
})();

type LanguageOption = {
  value: string;
  label: string;
  monaco: string;
};

const LANGUAGE_OPTIONS: LanguageOption[] = [
  { value: "python", label: "Python", monaco: "python" },
  { value: "cpp", label: "C++", monaco: "cpp" },
  { value: "java", label: "Java", monaco: "java" },
];

export default function SolvePage() {
  const { courseId, problemId } = useParams<{
    courseId?: string;
    problemId?: string;
  }>();
  const navigate = useNavigate();
  const [sampleInput, setSampleInput] = useState("");
  const [sampleOutput, setSampleOutput] = useState("");
  const [terminalOutput, setTerminalOutput] =
    useState("실행 결과가 이곳에 표시됩니다.");
  const [code, setCode] = useState(``);
  const [language, setLanguage] = useState(LANGUAGE_OPTIONS[0].value);
  const [rightPanelWidth, setRightPanelWidth] = useState(65);
  const [isResizing, setIsResizing] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(
    INITIAL_CHAT_MESSAGES
  );
  const [problem, setProblem] = useState<ProblemDetail | null>(null);
  const [problemStatus, setProblemStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [problemError, setProblemError] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [courseProblems, setCourseProblems] = useState<CourseProblemItem[]>([]);
  const [courseLoading, setCourseLoading] = useState(false);
  const [activeResultTab, setActiveResultTab] = useState<"result" | "tests">(
    "result"
  );
  const [gradingDetails, setGradingDetails] = useState<
    Array<{
      testCaseNumber?: number;
      passed?: boolean;
      input?: string;
      expectedOutput?: string;
      actualOutput?: string;
    }>
  >([]);
  const [gradingCacheByProblem, setGradingCacheByProblem] = useState<
    Record<
      string,
      Array<{
        testCaseNumber?: number;
        passed?: boolean;
        input?: string;
        expectedOutput?: string;
        actualOutput?: string;
      }>
    >
  >({});

  const containerRef = useRef<HTMLDivElement | null>(null);
  const messageIdRef = useRef(INITIAL_CHAT_MESSAGES.length);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const exampleInputRef = useRef<HTMLTextAreaElement | null>(null);
  const currentLanguageOption =
    LANGUAGE_OPTIONS.find((option) => option.value === language) ||
    LANGUAGE_OPTIONS[0];

  const handleLanguageChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setLanguage(event.target.value);
  };

  // Terminal height state
  const [terminalHeight, setTerminalHeight] = useState(200);
  const terminalRef = useRef<HTMLDivElement | null>(null);

  /**
   * 1. 리사이징 로직 수정:
   * 사이드바가 fixed이므로 전체 너비에서 사이드바 너비를 뺀 가용 영역 내에서만 드래그 비율을 계산합니다.
   */
  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (event: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();

      // 사이드바가 열려있으면 250px만큼 가용 너비가 줄어듦
      const sidebarWidth = isSidebarOpen ? 250 : 0;
      const availableWidth = rect.width - sidebarWidth;

      // 가용 너비 대비 마우스의 상대적 위치 계산
      const relativeX = event.clientX - rect.left;
      const rightWidthPercent =
        ((availableWidth - relativeX) / availableWidth) * 100;

      // 최소 20%, 최대 80% 제한
      const clampedWidth = Math.min(80, Math.max(20, rightWidthPercent));
      setRightPanelWidth(clampedWidth);
    };

    const stopResizing = () => setIsResizing(false);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [isResizing, isSidebarOpen]);

  useEffect(() => {
    const updateTerminalHeight = () => {
      if (!containerRef.current) return;
      const { height } = containerRef.current.getBoundingClientRect();
      const desiredHeight = Math.max(180, Math.min(height * 0.3, height - 160));
      setTerminalHeight(desiredHeight);
    };

    updateTerminalHeight();
    window.addEventListener("resize", updateTerminalHeight);
    return () => window.removeEventListener("resize", updateTerminalHeight);
  }, []);

  // Fetch Problem Data
  useEffect(() => {
    if (!problemId) {
      setProblem(null);
      setProblemStatus("error");
      setProblemError("문제를 불러오기 위해 problemId가 필요합니다.");
      return;
    }

    if (!API_BASE_URL) {
      setProblemStatus("error");
      setProblemError("서버 주소가 설정되어 있지 않습니다.");
      return;
    }

    const controller = new AbortController();
    const fetchProblem = async () => {
      setProblemStatus("loading");
      setProblemError("");
      try {
        const accessToken = localStorage.getItem("accessToken");
        const response = await fetch(`${API_BASE_URL}problems/${problemId}`, {
          signal: controller.signal,
          headers: accessToken
            ? { Authorization: `Bearer ${accessToken}` }
            : undefined,
        });
        if (!response.ok) throw new Error("문제 정보를 불러오지 못했습니다.");
        const data: ProblemDetail = await response.json();
        setProblem(data);
        setProblemStatus("success");
      } catch (error) {
        if (controller.signal.aborted) return;
        setProblemStatus("error");
        setProblemError(error instanceof Error ? error.message : "오류 발생");
      }
    };

    fetchProblem();
    return () => controller.abort();
  }, [problemId]);

  // Restore Grading Cache
  useEffect(() => {
    const key = String(problemId ?? "");
    setGradingDetails(gradingCacheByProblem[key] ?? []);
  }, [problemId, gradingCacheByProblem]);

  // Fetch Sidebar Course List
  useEffect(() => {
    if (!courseId || !API_BASE_URL) return;
    const controller = new AbortController();
    const fetchCourse = async () => {
      try {
        setCourseLoading(true);
        const accessToken = localStorage.getItem("accessToken");
        const res = await fetch(`${API_BASE_URL}course/${courseId}`, {
          signal: controller.signal,
          headers: accessToken
            ? { Authorization: `Bearer ${accessToken}` }
            : undefined,
        });
        if (!res.ok) throw new Error("코스 정보 로드 실패");
        const data: CourseDetail = await res.json();
        const items = Array.isArray(data?.problems)
          ? data.problems.map((p, idx) => ({
              problemId: p?.problemId ?? idx + 1,
              name: p?.name ?? `문제 ${idx + 1}`,
              difficulty: p?.difficulty,
              solvedResult: p?.solvedResult,
            }))
          : [];
        setCourseProblems(items);
      } catch (e) {
        if (!controller.signal.aborted) setCourseProblems([]);
      } finally {
        setCourseLoading(false);
      }
    };
    fetchCourse();
    return () => controller.abort();
  }, [courseId]);

  useEffect(() => {
    if (!problem) return;
    setSampleInput(problem.exampleInput || "");
    setSampleOutput(problem.exampleOutput || "");
  }, [problem]);

  useEffect(() => {
    if (!exampleInputRef.current) return;
    const textarea = exampleInputRef.current;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [sampleInput]);

  const handleSubmitCode = async () => {
    if (!problemId || !code.trim()) return;
    setIsSubmitting(true);
    setTerminalOutput("채점 중입니다...");
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await fetch(`${API_BASE_URL}solve/grading`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({ problemId: Number(problemId), code, language }),
      });

      if (!response.ok) throw new Error("채점 요청 실패");
      const data = await response.json();

      // 결과 처리 및 토스트 알림 로직 (생략/유지)
      setGradingDetails(data.details || []);
      setGradingCacheByProblem((prev) => ({
        ...prev,
        [String(problemId)]: data.details || [],
      }));
      toast.success("제출 완료");
    } catch (error) {
      setTerminalOutput("오류 발생");
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

  const toggleSidebar = () => setIsSidebarOpen((v) => !v);
  const handleExitSolvePage = () => navigate(`/course/${courseId}`);
  const handleSidebarItemClick = (pid: number) =>
    navigate(`/courses/${courseId}/solve/${pid}`);

  const problemSections = problem
    ? [
        { title: "문제 설명", content: problem.description },
        { title: "입력", content: problem.input },
        { title: "출력", content: problem.output },
      ]
    : [];

  return (
    <Style.SolveContainer ref={containerRef}>
      <ToastContainer position="top-right" theme="dark" autoClose={2500} />

      <Style.Header>
        <Style.BackButton onClick={handleExitSolvePage}>‹</Style.BackButton>
        <Style.HeaderTitle>
          {problem?.name ??
            (problemStatus === "loading" ? "로딩 중..." : "문제 정보 없음")}
        </Style.HeaderTitle>
        <Style.HeaderActions>
          <Style.LanguageSelect
            value={language}
            onChange={handleLanguageChange}
          >
            {LANGUAGE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Style.LanguageSelect>
          <Style.MenuButton onClick={toggleSidebar}>☰</Style.MenuButton>
        </Style.HeaderActions>
      </Style.Header>

      {/** * 2. PageContent 수정:
       * 사이드바 공간(250px)을 패딩으로 확보하여 내부 패널들이 사이드바 아래로 깔리지 않게 합니다.
       */}
      <Style.PageContent
        style={{ paddingRight: isSidebarOpen ? "250px" : "0" }}
      >
        <Style.LeftPanel>
          <Style.LeftPanelContent>
            {problemStatus === "error" && (
              <Style.ProblemStatus $variant="error">
                {problemError}
              </Style.ProblemStatus>
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

        <Style.Divider
          onMouseDown={() => setIsResizing(true)}
          $isResizing={isResizing}
        />

        <Style.RightPanel $width={rightPanelWidth}>
          <Style.EditorContainer>
            <Editor
              height="100%"
              language={currentLanguageOption.monaco}
              value={code}
              onChange={(val) => setCode(val || "")}
              beforeMount={handleEditorBeforeMount}
              theme="dukkaebi-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                wordWrap: "on",
              }}
            />
          </Style.EditorContainer>

          <Style.ResultContainer>
            <Style.ResultTabs>
              <Style.ResultTab
                $active={activeResultTab === "result"}
                onClick={() => setActiveResultTab("result")}
              >
                실행 결과
              </Style.ResultTab>
              <Style.ResultTab
                $active={activeResultTab === "tests"}
                onClick={() => setActiveResultTab("tests")}
              >
                테스트 케이스
              </Style.ResultTab>
            </Style.ResultTabs>

            <Style.Terminal $height={terminalHeight}>
              <Style.TerminalHandle />
              <Style.TerminalOutput>
                {activeResultTab === "result"
                  ? terminalOutput
                  : "테스트 결과 정보..."}
              </Style.TerminalOutput>
            </Style.Terminal>

            <Style.SubmitWrapper>
              {/** * 3. SubmitButton 수정:
               * 별도의 조건부 marginRight 없이 부모의 padding이 위치를 잡아줍니다.
               */}
              <Style.SubmitButton
                onClick={handleSubmitCode}
                disabled={isSubmitting || !problemId}
              >
                {isSubmitting ? "채점 중..." : "제출 후 채점하기"}
              </Style.SubmitButton>
            </Style.SubmitWrapper>
          </Style.ResultContainer>
        </Style.RightPanel>

        {/** * 4. RightSidebar:
         * 스타일에서 fixed로 정의되어 있으므로 PageContent의 자식이어도 다른 요소에 간섭하지 않습니다.
         */}
        {isSidebarOpen && (
          <Style.RightSidebar>
            <Style.SidebarHeader>문제 목록</Style.SidebarHeader>
            <Style.SidebarList>
              {courseProblems.map((p, idx) => (
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
              ))}
            </Style.SidebarList>
          </Style.RightSidebar>
        )}
      </Style.PageContent>
    </Style.SolveContainer>
  );
}
