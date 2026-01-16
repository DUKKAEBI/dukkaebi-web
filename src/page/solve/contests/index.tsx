import { useState, useRef, useEffect, type ChangeEvent } from "react";
import type * as monacoEditor from "monaco-editor";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Editor from "@monaco-editor/react";
import { useNavigate, useParams } from "react-router-dom";
import { EventSourcePolyfill } from "event-source-polyfill";
import * as Style from "./style";
import axiosInstance from "../../../api/axiosInstance";

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
  //문제별 코드를 저장할 객체
  const [codesByProblem, setCodesByProblem] = useState<Record<string, string>>(
    () => {
      try {
        const stored = localStorage.getItem(`dukkaebi_codes_${contestCode}`);
        return stored ? JSON.parse(stored) : {};
      } catch {
        return {};
      }
    }
  );
  // 상태 추가
  const [langsByProblem, setLangsByProblem] = useState<Record<string, string>>(
    () => {
      try {
        const stored = localStorage.getItem(`dukkaebi_langs_${contestCode}`);
        return stored ? JSON.parse(stored) : {};
      } catch {
        return {};
      }
    }
  );
  // 현재 에디터에 보여줄 단일 코드 상태
  const [currentCode, setCurrentCode] = useState("");
  const { contestCode, problemId } = useParams<{
    contestCode?: string;
    problemId?: string;
  }>();
  const navigate = useNavigate();

  // UI State
  const [sampleInput, setSampleInput] = useState("");
  const [sampleOutput, setSampleOutput] = useState("");
  const [terminalOutput, setTerminalOutput] =
    useState("실행 결과가 이곳에 표시됩니다.");
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState(LANGUAGE_OPTIONS[0].value);
  const [rightPanelWidth, setRightPanelWidth] = useState(65);
  const [isResizing, setIsResizing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeResultTab, setActiveResultTab] = useState<"result" | "tests">(
    "result"
  );

  // Problem State
  const [problem, setProblem] = useState<ProblemDetail | null>(null);
  const [problemStatus, setProblemStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [problemError, setProblemError] = useState("");

  // Course/Contest State
  const [courseProblems, setCourseProblems] = useState<CourseProblemItem[]>([]);
  const [courseLoading, setCourseLoading] = useState(false);
  const [contestInfo, setContestInfo] = useState<ContestInfo | null>(null);
  const [timeLeft, setTimeLeft] = useState("");

  // Grading State
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

  // Time tracking state
  const [timeSpentByProblem, setTimeSpentByProblem] = useState<
    Record<string, number>
  >(() => {
    try {
      const stored = localStorage.getItem(`dukkaebi_timeSpent_${contestCode}`);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  // Refs
  const containerRef = useRef<HTMLDivElement | null>(null);
  const exampleInputRef = useRef<HTMLTextAreaElement | null>(null);
  const sseConnectionRef = useRef<EventSourcePolyfill | null>(null);
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const currentLanguageOption =
    LANGUAGE_OPTIONS.find((option) => option.value === language) ||
    LANGUAGE_OPTIONS[0];
  // 언어 변경 핸들러 수정
  const handleLanguageChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const newLang = event.target.value;
    setLanguage(newLang);
    if (problemId) {
      setLangsByProblem((prev) => {
        const updated = { ...prev, [problemId]: newLang };
        // 언어 변경 시 localStorage에 저장
        try {
          localStorage.setItem(
            `dukkaebi_langs_${contestCode}`,
            JSON.stringify(updated)
          );
        } catch (e) {
          console.error("Failed to save language to localStorage:", e);
        }
        return updated;
      });
    }
  };

  // Terminal (floating) size & resize state
  const [terminalHeight, setTerminalHeight] = useState(200); // px
  const terminalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (event: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const relativeX = event.clientX - rect.left;

      const MIN_LEFT_WIDTH = 400;

      const MAX_LEFT_WIDTH = rect.width * 0.8;
      const clampedX = Math.max(
        MIN_LEFT_WIDTH,
        Math.min(MAX_LEFT_WIDTH, relativeX)
      );

      const rightWidthPercent = ((rect.width - clampedX) / rect.width) * 100;
      setRightPanelWidth(rightWidthPercent);
    };

    const stopResizing = () => setIsResizing(false);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [isResizing]);

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

  // 사이드바 외부 클릭 시 닫기
  useEffect(() => {
    if (!isSidebarOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      // 사이드바 외부를 클릭하고, 메뉴 버튼이 아닌 경우에만 닫기
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(target) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(target)
      ) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSidebarOpen]);

  // Time tracking: 매초마다 현재 문제의 소요 시간 증가
  useEffect(() => {
    if (!problemId || !contestCode) return;

    const timer = setInterval(() => {
      setTimeSpentByProblem((prev) => {
        const newTimes = { ...prev };
        const key = String(problemId);
        newTimes[key] = (prev[key] || 0) + 1;

        // 로컬스토리지에 저장
        try {
          localStorage.setItem(
            `dukkaebi_timeSpent_${contestCode}`,
            JSON.stringify(newTimes)
          );
        } catch (e) {
          console.error("Failed to save time spent to localStorage:", e);
        }

        return newTimes;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [problemId, contestCode]);

  useEffect(() => {
    if (!problemId) {
      setProblem(null);
      setProblemStatus("error");
      setProblemError("문제를 불러오기 위해 problemId가 필요합니다.");
      setSampleInput("");
      setSampleOutput("");
      return;
    }

    if (!API_BASE_URL) {
      setProblem(null);
      setProblemStatus("error");
      setProblemError(
        "서버 주소가 설정되어 있지 않습니다. .env의 VITE_API_URL 값을 확인하세요."
      );
      return;
    }

    const controller = new AbortController();
    const fetchProblem = async () => {
      setProblemStatus("loading");
      setProblemError("");
      try {
        const accessToken = localStorage.getItem("accessToken");
        const response = await axiosInstance(
          `${API_BASE_URL}problems/${problemId}`,
          {
            signal: controller.signal,
            headers: accessToken
              ? {
                  Authorization: `Bearer ${accessToken}`,
                }
              : undefined,
          }
        );
        const data: ProblemDetail = response.data;
        setProblem(data);
        setProblemStatus("success");
      } catch (error) {
        if (controller.signal.aborted) return;
        setProblem(null);
        setProblemStatus("error");
        setProblemError(
          error instanceof Error
            ? error.message
            : "문제 정보를 가져오는 중 오류가 발생했습니다."
        );
        setSampleInput("");
        setSampleOutput("");
      }
    };

    fetchProblem();
    return () => controller.abort();
  }, [problemId]);

  // Restore cached grading details when switching problems (or clear if none)
  useEffect(() => {
    const key = String(problemId ?? "");
    if (!key) {
      setGradingDetails([]);
      return;
    }
    setGradingDetails(gradingCacheByProblem[key] ?? []);
  }, [problemId, gradingCacheByProblem]);

  // Fetch course problems for sidebar
  useEffect(() => {
    if (!contestCode || !API_BASE_URL) return;
    const controller = new AbortController();
    const fetchCourse = async () => {
      try {
        setCourseLoading(true);
        const accessToken = localStorage.getItem("accessToken");
        const res = await axiosInstance(
          `${API_BASE_URL}contest/${contestCode}`,
          {
            signal: controller.signal,
            headers: accessToken
              ? { Authorization: `Bearer ${accessToken}` }
              : undefined,
          }
        );

        const data: any = await res.data;
        // store contest timing/status info if provided
        setContestInfo({
          startDate: data?.startDate,
          endDate: data?.endDate,
          status: data?.status,
        });

        const courseData: CourseDetail = {
          courseId: data?.courseId ?? 0,
          title: data?.title ?? "",
          problems: Array.isArray(data?.problems) ? data.problems : [],
        };
        const items = Array.isArray(courseData.problems)
          ? (courseData.problems as any[]).map((p, idx) => ({
              problemId: p?.problemId ?? idx + 1,
              name: p?.name ?? `문제 ${idx + 1}`,
              difficulty: p?.difficulty,
              solvedResult: p?.solvedResult,
            }))
          : [];
        setCourseProblems(items);
      } catch (e) {
        if (!controller.signal.aborted) {
          // keep silent on sidebar errors
          setCourseProblems([]);
        }
      } finally {
        setCourseLoading(false);
      }
    };
    fetchCourse();
    return () => controller.abort();
  }, [contestCode]);

  // SSE 연결을 통한 실시간 대회 정보 업데이트
  useEffect(() => {
    if (!contestCode || !API_BASE_URL) return;

    // 이미 연결되어 있으면 중복 연결 방지
    if (sseConnectionRef.current) {
      console.log("SSE 이미 연결되어 있음, 중복 연결 방지");
      return;
    }

    const sseUrl = `${API_BASE_URL}contest/${contestCode}/subscribe`;
    const accessToken = localStorage.getItem("accessToken");

    console.log("SSE 연결 시도:", sseUrl);

    const eventSource = new EventSourcePolyfill(sseUrl, {
      headers: accessToken
        ? {
            Authorization: `Bearer ${accessToken}`,
          }
        : {},
      withCredentials: false,
      heartbeatTimeout: 300000, // 5분 (300초)
    });

    sseConnectionRef.current = eventSource;

    eventSource.onopen = () => {
      console.log("SSE 연결 열림 (onopen)");
    };

    // 초기 연결 메시지 수신
    eventSource.addEventListener("connected", (event) => {
      console.log("SSE 연결 완료:", (event as MessageEvent).data);
    });

    // 대회 업데이트 메시지 수신 (서버에서 name("contest-update")로 보냄)
    eventSource.addEventListener("contest-update", (event) => {
      console.log("SSE 업데이트 수신:", event);

      try {
        const data = JSON.parse((event as MessageEvent).data);
        console.log("파싱된 데이터:", data);

        if (data.eventType === "CONTEST_UPDATED") {
          console.log("대회 정보 변경:", data);

          setContestInfo((prev) => ({
            ...prev,
            startDate: data.startDate ?? prev?.startDate,
            endDate: data.endDate ?? prev?.endDate,
            status: data.status ?? prev?.status,
          }));

          toast.info(data.message || "대회 정보가 업데이트되었습니다.");
        }
      } catch (error) {
        console.error("SSE 메시지 파싱 오류:", error);
      }
    });

    // 이름 없는 메시지용 (디버깅)
    eventSource.onmessage = (event) => {
      console.log("이름 없는 SSE 메시지:", event);
    };

    eventSource.onerror = (error) => {
      console.error("SSE 연결 오류:", error);
      eventSource?.close();
      sseConnectionRef.current = null;
    };

    // 컴포넌트 언마운트 시 연결 종료
    return () => {
      console.log("SSE 연결 종료 (cleanup)");
      eventSource?.close();
      sseConnectionRef.current = null;
    };
  }, [contestCode]);

  // Live update remaining time (start/end)
  useEffect(() => {
    if (!contestInfo) {
      setTimeLeft("");
      return;
    }
    const compute = () => {
      const now = new Date();
      const start = contestInfo.startDate
        ? new Date(contestInfo.startDate)
        : null;
      const end = contestInfo.endDate ? new Date(contestInfo.endDate) : null;
      const status = contestInfo.status;

      if (status === "ENDED" || (end && now > end)) {
        return "종료됨";
      }
      const fmt = (ms: number) => {
        const totalSec = Math.max(0, Math.floor(ms / 1000));
        const d = Math.floor(totalSec / 86400);
        const h = Math.floor((totalSec % 86400) / 3600);
        const m = Math.floor((totalSec % 3600) / 60);
        const s = totalSec % 60;
        const hh = String(h).padStart(2, "0");
        const mm = String(m).padStart(2, "0");
        const ss = String(s).padStart(2, "0");
        return d > 0 ? `D-${d} ${hh}:${mm}:${ss}` : `${hh}:${mm}:${ss}`;
      };
      if (start && now < start) {
        return `시작까지 ${fmt(start.getTime() - now.getTime())}`;
      }
      if (end && now < end) {
        return `종료까지 ${fmt(end.getTime() - now.getTime())}`;
      }
      return "";
    };
    setTimeLeft(compute());
    const id = window.setInterval(() => setTimeLeft(compute()), 1000);
    return () => window.clearInterval(id);
  }, [contestInfo]);

  useEffect(() => {
    if (!problem) return;
    setSampleInput(problem.exampleInput || "");
    setSampleOutput(problem.exampleOutput || "");
  }, [problem]);

  //문제(problemId)가 바뀔 때 에디터 코드 교체 로직
  useEffect(() => {
    if (!exampleInputRef.current) return;
    const textarea = exampleInputRef.current;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [sampleInput]);

  useEffect(() => {
    if (!problemId) return;

    // 캐시된 코드가 있으면 가져오고, 없으면 빈 문자열
    const savedCode = codesByProblem[problemId] || "";
    setCurrentCode(savedCode);
  }, [problemId]); // codesByProblem을 의존성에 넣지 않아야 전환 시점에만 작동함

  // 3. 에디터 내용 변경 시 호출될 핸들러
  const handleEditorChange = (value: string | undefined) => {
    const newCode = value || "";
    setCurrentCode(newCode); // 현재 화면 업데이트

    if (problemId) {
      // 전체 코드 저장소 업데이트 (각 문제별 코드 보존)
      setCodesByProblem((prev) => ({
        ...prev,
        [problemId]: newCode,
      }));
    }
  };

  // 코드를 localStorage에 저장하는 헬퍼 함수
  const saveCodeToLocalStorage = () => {
    try {
      localStorage.setItem(
        `dukkaebi_codes_${contestCode}`,
        JSON.stringify(codesByProblem)
      );
    } catch (e) {
      console.error("Failed to save code to localStorage:", e);
    }
  };

  // problemId 변경 시 효과 추가
  useEffect(() => {
    if (!problemId) return;
    const savedLang = langsByProblem[problemId] || LANGUAGE_OPTIONS[0].value;
    setLanguage(savedLang);
  }, [problemId]);

  const formatGradingResult = (result: {
    status?: string;
    passedTestCases?: number;
    totalTestCases?: number;
    executionTime?: number;
    errorMessage?: string | null;
    details?: Array<{
      testCaseNumber?: number;
      passed?: boolean;
      input?: string;
      expectedOutput?: string;
      actualOutput?: string;
    }>;
  }) => {
    if (!result) return "채점 결과를 불러오지 못했습니다.";

    const statusText = (result.status ?? "").toUpperCase();
    const isAccepted = statusText === "ACCEPTED";
    const lines: string[] = [
      isAccepted ? "정답입니다." : "오답입니다.",
      "",
      `채점 결과: ${statusText || "알 수 없음"}`,
      `통과한 테스트: ${result.passedTestCases ?? 0} / ${
        result.totalTestCases ?? 0
      }`,
      `실행 시간: ${result.executionTime ?? "-"}ms`,
    ];

    if (result.errorMessage) {
      lines.push("", `오류 메시지: ${result.errorMessage}`);
    }

    if (result.details && result.details.length > 0) {
      const detail = result.details[0];
      lines.push(
        "",
        `테스트 케이스 ${detail.testCaseNumber ?? "?"} : ${
          detail.passed ? "통과" : "실패"
        }`
      );
      lines.push(`입력값: ${(detail.input ?? "X").replace(/\s+$/, "") || "X"}`);
      if (detail.expectedOutput !== undefined) {
        lines.push(
          `기댓값: ${(detail.expectedOutput ?? "").replace(/\s+$/, "") || "X"}`
        );
      }
      lines.push(
        `실제값: ${(detail.actualOutput ?? "").replace(/\s+$/, "") || "X"}`
      );
    }

    return lines.join("\n");
  };

  const handleTestCode = async () => {
    if (!problemId) {
      setTerminalOutput("문제 ID가 없어 테스트할 수 없습니다.");
      return;
    }
    const numericProblemId = Number(problemId);
    if (Number.isNaN(numericProblemId)) {
      setTerminalOutput("유효한 문제 ID가 아닙니다.");
      return;
    }
    if (!API_BASE_URL) {
      setTerminalOutput("서버 주소가 설정되지 않았습니다.");
      return;
    }
    if (!currentCode.trim()) {
      setTerminalOutput("테스트할 코드를 작성해 주세요.");
      return;
    }

    setTerminalOutput("테스트 중입니다...");
    setIsTesting(true);
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await fetch(`${API_BASE_URL}solve/test`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          problemId: numericProblemId,
          code: currentCode,
          language,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "테스트 요청이 실패했습니다.");
      }

      const data = await response.json();
      setTerminalOutput(formatGradingResult(data));
      setGradingDetails(Array.isArray(data?.details) ? data.details : []);

      // Determine pass/fail based on details[].passed
      const passed = Array.isArray(data?.details)
        ? data.details.some((d: { passed?: boolean }) => d?.passed === true)
        : false;
      if (passed) {
        toast.success("테스트 통과", { autoClose: 2500 });
      } else {
        toast.error("테스트 실패", { autoClose: 2500 });
      }
    } catch (error) {
      setTerminalOutput(
        error instanceof Error
          ? error.message
          : "테스트 중 알 수 없는 오류가 발생했습니다."
      );
      toast.error(
        error instanceof Error ? error.message : "테스트 오류가 발생했습니다.",
        { autoClose: 3000 }
      );
    } finally {
      setIsTesting(false);
    }
  };

  const handleSubmitCode = async () => {
    if (!problemId) {
      setTerminalOutput("문제 ID가 없어 제출할 수 없습니다.");
      return;
    }
    const numericProblemId = Number(problemId);
    if (Number.isNaN(numericProblemId)) {
      setTerminalOutput("유효한 문제 ID가 아닙니다.");
      return;
    }
    if (!API_BASE_URL) {
      setTerminalOutput("서버 주소가 설정되지 않았습니다.");
      return;
    }
    if (!currentCode.trim()) {
      setTerminalOutput("제출할 코드를 작성해 주세요.");
      return;
    }

    // 제출 전에 코드 저장
    saveCodeToLocalStorage();

    setTerminalOutput("채점 중입니다...");
    setIsSubmitting(true);
    try {
      const accessToken = localStorage.getItem("accessToken");
      const timeSpent = timeSpentByProblem[String(problemId)] || 0;

      const response = await fetch(`${API_BASE_URL}solve/grading`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          problemId: numericProblemId,
          code: currentCode,
          language,
          timeSpentSeconds: timeSpent,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "채점 요청이 실패했습니다.");
      }

      const data = await response.json();
      setTerminalOutput(formatGradingResult(data));
      setGradingDetails(Array.isArray(data?.details) ? data.details : []);

      // Determine pass/fail based on details[].passed
      const passed = Array.isArray(data?.details)
        ? data.details.some((d: { passed?: boolean }) => d?.passed === true)
        : false;
      if (passed) {
        toast.success("정답입니다", { autoClose: 2500 });
      } else {
        toast.error("오답입니다.", { autoClose: 2500 });
      }
    } catch (error) {
      setTerminalOutput(
        error instanceof Error
          ? error.message
          : "채점 중 알 수 없는 오류가 발생했습니다."
      );
      toast.error(
        error instanceof Error ? error.message : "채점 오류가 발생했습니다.",
        { autoClose: 3000 }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextProblem = () => {
    // 다음 문제로 넘어가기 전에 코드 저장
    saveCodeToLocalStorage();

    const currentIndex = courseProblems.findIndex(
      (p) => String(p.problemId) === String(problemId)
    );
    const isLastProblem = currentIndex === courseProblems.length - 1;

    if (!isLastProblem && currentIndex !== -1 && contestCode) {
      const nextProblem = courseProblems[currentIndex + 1];
      navigate(`/contests/${contestCode}/solve/${nextProblem.problemId}`);
    }
  };

  const handleEndTest = () => {
    if (contestCode) {
      navigate(`/contests/${contestCode}`);
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

  const problemSections = problem
    ? [
        { title: "문제 설명", content: problem.description },
        { title: "입력", content: problem.input },
        { title: "출력", content: problem.output },
      ]
    : [];

  const statusMessage =
    problemStatus === "loading"
      ? "문제를 불러오는 중입니다..."
      : problemStatus === "error"
      ? problemError || "문제를 불러오지 못했습니다."
      : "";

  const handleExitSolvePage = () => {
    navigate(`/contests/${contestCode}`);
  };

  const handleSidebarItemClick = (pid: number) => {
    if (!contestCode) return;
    navigate(`/contests/${contestCode}/solve/${pid}`);
  };

  return (
    <Style.SolveContainer ref={containerRef}>
      <ToastContainer
        position="top-right"
        theme="dark"
        newestOnTop
        closeOnClick
      />
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
            (problemStatus === "loading"
              ? "문제를 불러오는 중..."
              : "문제 정보 없음")}
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
        <Style.LeftPanel>
          <Style.LeftPanelContent>
            {statusMessage && (
              <Style.Section>
                <Style.SectionTitle>알림</Style.SectionTitle>
                <Style.ProblemStatus
                  $variant={problemStatus === "error" ? "error" : "info"}
                >
                  {statusMessage}
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

        <Style.Divider
          onMouseDown={() => setIsResizing(true)}
          $isResizing={isResizing}
        />

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
                <Style.TerminalOutput>{terminalOutput}</Style.TerminalOutput>
              </Style.Terminal>
            ) : (
              <Style.Terminal ref={terminalRef} $height={terminalHeight}>
                <Style.TerminalHandle />
                <Style.TerminalOutput>
                  {gradingDetails.length === 0 ? (
                    <div style={{ color: "#a0aec0" }}>
                      테스트 케이스가 없습니다. 제출 후 다시 확인하세요.
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
                              width: "20%",
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
                              width: "20%",
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
                          <tr key={`${d.testCaseNumber ?? idx}-row`}>
                            <td
                              style={{
                                padding: "10px",
                                borderBottom:
                                  "1px solid rgba(255,255,255,0.06)",
                                color: "#9fb1bc",
                                width: "20%",
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
                                width: "20%",
                              }}
                            >
                              {d.input !== undefined ? (
                                <pre
                                  style={{
                                    margin: 0,
                                    whiteSpace: "pre-wrap",
                                    wordBreak: "break-word",
                                  }}
                                >
                                  {(d.input ?? "").replace(/\s+$/, "")}
                                </pre>
                              ) : (
                                <span style={{ color: "#6b7280" }}>-</span>
                              )}
                            </td>
                            <td
                              style={{
                                padding: "10px",
                                borderBottom:
                                  "1px solid rgba(255,255,255,0.06)",
                                width: "20%",
                              }}
                            >
                              <pre
                                style={{
                                  margin: 0,
                                  whiteSpace: "pre-wrap",
                                  wordBreak: "break-word",
                                }}
                              >
                                {(d.actualOutput ?? "").replace(/\s+$/, "")}
                              </pre>
                            </td>
                            <td
                              style={{
                                padding: "10px",
                                borderBottom:
                                  "1px solid rgba(255,255,255,0.06)",
                                width: "20%",
                              }}
                            >
                              <pre
                                style={{
                                  margin: 0,
                                  whiteSpace: "pre-wrap",
                                  wordBreak: "break-word",
                                }}
                              >
                                {(d.expectedOutput ?? "").replace(/\s+$/, "")}
                              </pre>
                            </td>
                            <td
                              style={{
                                padding: "10px",
                                borderBottom:
                                  "1px solid rgba(255,255,255,0.06)",
                                fontWeight: 700,
                                color: d.passed ? "#4ade80" : "#fca5a5",
                                width: "20%",
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

            <Style.SubmitWrapper
              style={{ marginRight: isSidebarOpen ? 268 : 0 }}
            >
              <div style={{ display: "flex", gap: "12px" }}>
                <Style.SubmitButton
                  onClick={handleEndTest}
                  disabled={!problemId}
                  style={{
                    backgroundColor: "#35454E",
                    border: "1px solid #495D68",
                  }}
                >
                  끝내기
                </Style.SubmitButton>
                <Style.SubmitButton
                  onClick={handleTestCode}
                  disabled={!problemId || isTesting}
                  style={{
                    backgroundColor: "#3E5C7A",
                    border: "1px solid #4A6B8F",
                  }}
                >
                  {isTesting ? "테스트 중..." : "테스트"}
                </Style.SubmitButton>
                <Style.SubmitButton
                  onClick={handleSubmitCode}
                  disabled={!problemId || isSubmitting}
                >
                  {isSubmitting ? "제출 중..." : "제출"}
                </Style.SubmitButton>
                <Style.SubmitButton
                  onClick={handleNextProblem}
                  disabled={
                    !problemId ||
                    courseProblems.findIndex(
                      (p) => String(p.problemId) === String(problemId ?? "")
                    ) ===
                      courseProblems.length - 1
                  }
                  style={{
                    backgroundColor: "#35454E",
                    border: "1px solid #495D68",
                  }}
                >
                  다음 문제
                </Style.SubmitButton>
              </div>
            </Style.SubmitWrapper>
          </Style.ResultContainer>
        </Style.RightPanel>
        {isSidebarOpen && (
          <>
            <Style.ThinDivider />
            <Style.RightSidebar ref={sidebarRef}>
              <Style.SidebarList>
                {courseLoading
                  ? null
                  : courseProblems.map((p, idx) => {
                      const active =
                        String(p.problemId) === String(problemId ?? "");
                      return (
                        <Style.SidebarItem
                          key={p.problemId}
                          $active={active}
                          onClick={() => handleSidebarItemClick(p.problemId)}
                        >
                          <Style.SidebarItemIndex>
                            {String(idx + 1).padStart(2, "0")}
                          </Style.SidebarItemIndex>
                          <Style.SidebarItemTitle>
                            {p.name}
                          </Style.SidebarItemTitle>
                        </Style.SidebarItem>
                      );
                    })}
              </Style.SidebarList>
            </Style.RightSidebar>
          </>
        )}
      </Style.PageContent>
    </Style.SolveContainer>
  );
}
