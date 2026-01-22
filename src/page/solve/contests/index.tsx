import { useState, useRef, useEffect, type ChangeEvent } from "react";
import type * as monacoEditor from "monaco-editor";
import { toast } from "react-toastify";
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

type CodeSnapshot = {
  savedCode: string;
  savedLanguage: string;
  currentCode: string;
  currentLanguage: string;
};

const LANGUAGE_OPTIONS: LanguageOption[] = [
  { value: "python", label: "Python", monaco: "python" },
  { value: "cpp", label: "C++", monaco: "cpp" },
  { value: "java", label: "Java", monaco: "java" },
];

const DEFAULTLANGUAGE = "python";

export default function SolvePage() {
  const { contestCode, problemId } = useParams<{
    contestCode?: string;
    problemId?: string;
  }>();
  const navigate = useNavigate();
  // UI State
  const [sampleInput, setSampleInput] = useState("");
  const [sampleOutput, setSampleOutput] = useState("");
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState(LANGUAGE_OPTIONS[0].value);
  const [rightPanelWidth, setRightPanelWidth] = useState(65);
  const [isResizing, setIsResizing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeResultTab, setActiveResultTab] = useState<"result" | "tests">(
    "result",
  );

  //코드 저장 여부
  const [codeStateByProblem, setCodeStateByProblem] = useState<
    Record<string, CodeSnapshot>
  >({});
  //코드 제출 여부
  const [submittedProblems, setSubmittedProblems] = useState<Set<string>>(
    new Set(),
  );

  // Problem State
  const [problem, setProblem] = useState<ProblemDetail | null>(null);
  const [problemStatus, setProblemStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [problemError, setProblemError] = useState("");
  // 문제별 누적 시간
  const [timeSpentByProblem, setTimeSpentByProblem] = useState<
    Record<string, number>
  >({});
  // 현재 문제에서 경과 중인 시간 (초)
  const [liveElapsedSec, setLiveElapsedSec] = useState(0);
  const [isTesting, setIsTesting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState<string>("");

  // Course/Contest State
  const [courseProblems, setCourseProblems] = useState<CourseProblemItem[]>([]);
  const [courseLoading, setCourseLoading] = useState(false);
  const [contestInfo, setContestInfo] = useState<ContestInfo | null>(null);
  const [timeLeft, setTimeLeft] = useState("");

  const getLocalCodeKey = (contestCode?: string) =>
    contestCode ? `dukkaebi_codes_${contestCode}` : "";
  const getLocalTimeKey = (contestCode?: string) =>
    contestCode ? `dukkaebi_timeSpent_${contestCode}` : "";
  const getSubmittedKey = (contestCode?: string) =>
    contestCode ? `dukkaebi_submitted_${contestCode}` : "";

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

  // Refs
  const containerRef = useRef<HTMLDivElement | null>(null);
  const exampleInputRef = useRef<HTMLTextAreaElement | null>(null);
  const sseConnectionRef = useRef<EventSourcePolyfill | null>(null);
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const currentLanguageOption =
    LANGUAGE_OPTIONS.find((option) => option.value === language) ||
    LANGUAGE_OPTIONS[0];
  const handleLanguageChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setLanguage(event.target.value);
  };
  const problemEnterTimeRef = useRef<number | null>(null);

  // Terminal (floating) size & resize state
  const [terminalHeight, setTerminalHeight] = useState(200); // px
  const terminalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!contestCode) return;

    const key = getSubmittedKey(contestCode);
    const raw = localStorage.getItem(key);
    if (raw) {
      setSubmittedProblems(new Set(JSON.parse(raw)));
    }
  }, [contestCode]);

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
        Math.min(MAX_LEFT_WIDTH, relativeX),
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
        "서버 주소가 설정되어 있지 않습니다. .env의 VITE_API_URL 값을 확인하세요.",
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
          },
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
            : "문제 정보를 가져오는 중 오류가 발생했습니다.",
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
          },
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

  // 모든 문제의 상태를 로드하는 useEffect
  useEffect(() => {
    if (!contestCode || !API_BASE_URL || courseProblems.length === 0) return;

    const controller = new AbortController();

    const fetchAllProblemStates = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");

        // 모든 문제의 저장된 코드 상태를 한 번에 가져오기
        const promises = courseProblems.map(async (p) => {
          try {
            const res = await axiosInstance(
              `${API_BASE_URL}solve/saved/${p.problemId}`,
              {
                signal: controller.signal,
                headers: accessToken
                  ? { Authorization: `Bearer ${accessToken}` }
                  : undefined,
              },
            );

            if (res.data) {
              const { code, language } = res.data;
              return {
                problemId: p.problemId,
                savedCode: code,
                savedLanguage: language,
              };
            }
            return null;
          } catch (error) {
            // 저장된 코드가 없는 경우는 무시
            return null;
          }
        });

        const results = await Promise.all(promises);

        // 저장된 코드가 있는 문제들의 상태 업데이트
        const newCodeStates: Record<string, CodeSnapshot> = {};
        results.forEach((result) => {
          if (result) {
            newCodeStates[String(result.problemId)] = {
              savedCode: result.savedCode,
              savedLanguage: result.savedLanguage,
              currentCode: result.savedCode,
              currentLanguage: result.savedLanguage,
            };
          }
        });

        setCodeStateByProblem((prev) => ({
          ...prev,
          ...newCodeStates,
        }));
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("문제 상태 불러오기 실패:", error);
        }
      }
    };

    fetchAllProblemStates();
    return () => controller.abort();
  }, [contestCode, courseProblems]);

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

  //현재 문제 진입 시 타이머 시작
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

  //새로운 문제 이동시 코드 적용
  useEffect(() => {
    if (!problemId || !contestCode) return;

    const pid = String(problemId);
    const localKey = getLocalCodeKey(contestCode);

    const localRaw = localStorage.getItem(localKey);
    const localCodes: Record<string, string> = localRaw
      ? JSON.parse(localRaw)
      : {};

    if (localCodes[pid] !== undefined) {
      const localCode = localCodes[pid];

      setCode(localCode);
      setLanguage(DEFAULTLANGUAGE);

      setCodeStateByProblem((prev) => ({
        ...prev,
        [pid]: {
          savedCode: prev[pid]?.savedCode ?? "",
          savedLanguage: prev[pid]?.savedLanguage ?? DEFAULTLANGUAGE,
          currentCode: localCode,
          currentLanguage: DEFAULTLANGUAGE,
        },
      }));

      return;
    }

    const state = codeStateByProblem[pid];
    if (state) {
      setCode(state.currentCode);
      setLanguage(state.currentLanguage);
      return;
    }

    setCode("");
    setLanguage(DEFAULTLANGUAGE);
  }, [problemId, contestCode]);

  useEffect(() => {
    if (!problemId || !contestCode) return;

    const key = getLocalTimeKey(contestCode);

    const raw = localStorage.getItem(key);
    const parsed: Record<string, number> = raw ? JSON.parse(raw) : {};
    setTimeSpentByProblem(parsed);

    problemEnterTimeRef.current = Date.now();
    setLiveElapsedSec(0);

    return () => {
      if (!problemEnterTimeRef.current) return;

      const spentSec = Math.floor(
        (Date.now() - problemEnterTimeRef.current) / 1000,
      );

      const rawLatest = localStorage.getItem(key);
      const latest: Record<string, number> = rawLatest
        ? JSON.parse(rawLatest)
        : {};

      const next = {
        ...latest,
        [String(problemId)]: (latest[String(problemId)] ?? 0) + spentSec,
      };

      localStorage.setItem(key, JSON.stringify(next));
      setTimeSpentByProblem(next);
    };
  }, [problemId, contestCode]);

  //저장된 코드 가져오기
  useEffect(() => {
    const localKey = getLocalCodeKey(contestCode);
    const localRaw = localStorage.getItem(localKey);
    const localCodes = localRaw ? JSON.parse(localRaw) : {};

    if (localCodes[String(problemId)] !== undefined) {
      return;
    }

    if (!problemId || !API_BASE_URL) return;

    const controller = new AbortController();

    const fetchSavedCode = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");

        const res = await axiosInstance(
          `${API_BASE_URL}solve/saved/${problemId}`,
          {
            signal: controller.signal,
            headers: accessToken
              ? { Authorization: `Bearer ${accessToken}` }
              : undefined,
          },
        );

        // 저장된 코드 없으면 null
        if (!res.data) return;

        const { code, language } = res.data;

        setCode(code);
        setLanguage(language);

        setCodeStateByProblem((prev) => ({
          ...prev,
          [problemId]: {
            savedCode: code,
            savedLanguage: language,
            currentCode: code,
            currentLanguage: language,
          },
        }));
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error("저장된 코드 불러오기 실패:", error);
      }
    };

    fetchSavedCode();
    return () => controller.abort();
  }, [problemId]);

  //브라우저 닫기 / 새로고침 방지
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // 🔹 코드 dirty 체크
      const hasAnyDirty = Object.values(codeStateByProblem).some(
        (s) =>
          s.currentCode !== s.savedCode ||
          s.currentLanguage !== s.savedLanguage,
      );

      if (hasAnyDirty) {
        e.preventDefault();
        e.returnValue = "";
      }

      // 🔹 시간 저장
      if (!problemId || !contestCode || !problemEnterTimeRef.current) return;

      const spentSec = Math.floor(
        (Date.now() - problemEnterTimeRef.current) / 1000,
      );

      const key = getLocalTimeKey(contestCode);
      const raw = localStorage.getItem(key);
      const parsed = raw ? JSON.parse(raw) : {};

      localStorage.setItem(
        key,
        JSON.stringify({
          ...parsed,
          [String(problemId)]: (parsed[String(problemId)] ?? 0) + spentSec,
        }),
      );
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [codeStateByProblem, problemId, contestCode]);

  //문제 이동 시 liveElapsedSec 증가
  useEffect(() => {
    if (!problemId) return;

    const interval = setInterval(() => {
      setLiveElapsedSec((v) => v + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [problemId]);

  //헤더에 현재 문제 풀이 시간 표시용 함수
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  //결과 문자열 만들어주는 함수
  const formatJudgeResult = (data: any) => {
    const lines: string[] = [];

    // 1. 상단 요약
    lines.push("오답입니다.", "");
    lines.push(`채점 결과: ${data.status}`);
    lines.push(
      `통과한 테스트: ${data.passedTestCases} / ${data.totalTestCases}`,
    );
    lines.push(`실행 시간: ${data.executionTime}ms`, "");

    // 2. 오류 메시지
    if (data.errorMessage) {
      lines.push("오류 메시지:");
      lines.push(data.errorMessage.trim(), "");
    }

    // 3. 테스트 케이스 상세
    if (Array.isArray(data.details)) {
      data.details.forEach((tc: any) => {
        lines.push(
          `테스트 케이스 ${tc.testCaseNumber} : ${tc.passed ? "성공" : "실패"}`,
        );
        lines.push(`입력값: ${tc.input || "X"}`);
        lines.push(`기댓값: ${tc.expectedOutput}`);
        lines.push(
          `실제값: ${tc.actualOutput || data.errorMessage?.trim() || ""}`,
        );
        lines.push("");
      });
    }

    return lines.join("\n");
  };

  const handleTestCode = async () => {
    if (!problemId || !API_BASE_URL) return;
    if (!code.trim()) {
      toast.error("테스트할 코드를 작성해 주세요.");
      return;
    }
    setIsTesting(true);

    try {
      const accessToken = localStorage.getItem("accessToken");

      const res = await fetch(`${API_BASE_URL}solve/test`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          problemId: Number(problemId),
          code,
          language,
        }),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      const data = await res.json();

      // 에러 메시지가 있으면 실행 결과에 바로 출력
      if (data.errorMessage) {
        toast.error("실행에 실패하였습니다.");
        setTerminalOutput(formatJudgeResult(data));
        setActiveResultTab("result");
        // 테스트 케이스 탭에도 결과 저장
        if (data.details && Array.isArray(data.details)) {
          setGradingDetails(data.details);
          setGradingCacheByProblem((prev) => ({
            ...prev,
            [String(problemId)]: data.details,
          }));
        }
        return;
      }

      // 정상일 때
      setTerminalOutput("테스트가 완료되었습니다.");
      setGradingDetails(data.details ?? []);

      setGradingDetails(data.details ?? []);
      setGradingCacheByProblem((prev) => ({
        ...prev,
        [String(problemId)]: data.details ?? [],
      }));
      toast.success("테스트가 완료되었습니다");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "테스트 중 오류 발생");
    } finally {
      setIsTesting(false);
    }
  };

  const handleSubmitCode = async () => {
    if (!problemId || !API_BASE_URL) return;
    if (!code.trim()) {
      toast.error("제출할 코드를 작성해 주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      const accessToken = localStorage.getItem("accessToken");
      const timeSpent = timeSpentByProblem[String(problemId)] ?? 0;

      const res = await fetch(`${API_BASE_URL}solve/grading`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          problemId: Number(problemId),
          code,
          language,
          timeSpentSeconds: timeSpent,
        }),
      });

      //코드 저장
      await axiosInstance.post(
        `${API_BASE_URL}solve/save`,
        {
          problemId: Number(problemId),
          code,
          language,
        },
        {
          headers: accessToken
            ? { Authorization: `Bearer ${accessToken}` }
            : undefined,
        },
      );

      const data = await res.json();

      if (data.errorMessage || data.status !== "ACCEPTED") {
        setTerminalOutput(formatJudgeResult(data));
        toast.warning("제출이 완료되었습니다.");
      } else if (data.status === "ACCEPTED") {
        toast.success("제출이 완료되었습니다.");
      }

      setSubmittedProblems((prev) => {
        const next = new Set(prev);
        next.add(String(problemId));
        localStorage.setItem(
          getSubmittedKey(contestCode),
          JSON.stringify([...next]),
        );
        return next;
      });

      // 제출 성공 시 저장도 자동으로 수행
      setCodeStateByProblem((prev) => ({
        ...prev,
        [problemId]: {
          savedCode: code,
          savedLanguage: language,
          currentCode: code,
          currentLanguage: language,
        },
      }));

      // localStorage에서 미저장 코드 제거
      if (contestCode) {
        const key = getLocalCodeKey(contestCode);
        if (key) {
          const raw = localStorage.getItem(key);
          if (raw) {
            const parsed = JSON.parse(raw);
            delete parsed[String(problemId)];
            localStorage.setItem(key, JSON.stringify(parsed));
          }
        }
      }

      setTerminalOutput("채점이 완료되었습니다.");
      setGradingDetails(data.details ?? []);

      setGradingCacheByProblem((prev) => ({
        ...prev,
        [String(problemId)]: data.details ?? [],
      }));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "제출 중 오류 발생");
    } finally {
      setIsSubmitting(false);
    }
  };

  //이후 문제로 가는 함수
  const handleNextProblem = () => {
    const currentIndex = courseProblems.findIndex(
      (p) => String(p.problemId) === String(problemId),
    );
    const isLastProblem = currentIndex === courseProblems.length - 1;

    if (!isLastProblem && currentIndex !== -1 && contestCode) {
      const nextProblem = courseProblems[currentIndex + 1];
      navigate(`/contests/${contestCode}/solve/${nextProblem.problemId}`);
    }
  };

  // 이전 문제로 가는 함수
  const handlePrevProblem = () => {
    const currentIndex = courseProblems.findIndex(
      (p) => String(p.problemId) === String(problemId),
    );
    const isFirstProblem = currentIndex === 0;

    if (!isFirstProblem && currentIndex !== -1 && contestCode) {
      const prevProblem = courseProblems[currentIndex - 1];
      navigate(`/contests/${contestCode}/solve/${prevProblem.problemId}`);
    }
  };

  const handleEndTest = () => {
    const hasAnyDirty = Object.values(codeStateByProblem).some(
      (s) =>
        s.currentCode !== s.savedCode || s.currentLanguage !== s.savedLanguage,
    );

    if (hasAnyDirty) {
      const ok = window.confirm(
        "저장되지 않은 코드가 있습니다.\n정말 종료하시겠습니까?",
      );

      if (!ok) return;
    }

    navigate(`/contests/${contestCode}`);
  };

  const handleSaveTest = async () => {
    if (!problemId || !API_BASE_URL || !contestCode) return;

    try {
      const accessToken = localStorage.getItem("accessToken");

      await axiosInstance.post(
        `${API_BASE_URL}solve/save`,
        {
          problemId: Number(problemId),
          code,
          language,
        },
        {
          headers: accessToken
            ? { Authorization: `Bearer ${accessToken}` }
            : undefined,
        },
      );

      // 저장 성공 → saved 상태 갱신
      setCodeStateByProblem((prev) => ({
        ...prev,
        [problemId]: {
          savedCode: code,
          savedLanguage: language,
          currentCode: code,
          currentLanguage: language,
        },
      }));

      const key = getLocalCodeKey(contestCode);
      if (key) {
        const raw = localStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          delete parsed[String(problemId)];
          localStorage.setItem(key, JSON.stringify(parsed));
        }
      }

      toast.success("코드가 저장되었습니다.");
    } catch (error) {
      console.error("코드 저장 실패:", error);
      toast.error("코드 저장에 실패했습니다.");
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

  //상단 나가기 버튼 저장 여부 확인후 나가기 방지
  const handleExitSolvePage = () => {
    const hasAnyDirty = Object.values(codeStateByProblem).some(
      (s) =>
        s.currentCode !== s.savedCode || s.currentLanguage !== s.savedLanguage,
    );

    if (hasAnyDirty) {
      const ok = window.confirm(
        "저장되지 않은 코드가 있습니다.\n정말 종료하시겠습니까?",
      );

      if (!ok) return;
    }

    navigate(`/contests/${contestCode}`);
  };

  const handleSidebarItemClick = (pid: number) => {
    const hasAnyDirty = Object.values(codeStateByProblem).some(
      (s) =>
        s.currentCode !== s.savedCode || s.currentLanguage !== s.savedLanguage,
    );

    if (hasAnyDirty) {
      alert("저장되지 않은 코드가 있습니다.");
      return;
    }

    if (!contestCode) return;
    navigate(`/contests/${contestCode}/solve/${pid}`);
  };

  return (
    <Style.SolveContainer ref={containerRef}>
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
        {problemId && (
          <span style={{ color: "#7dd3fc", marginRight: 12 }}>
            ⏱{" "}
            {formatTime(
              (timeSpentByProblem[String(problemId)] ?? 0) + liveElapsedSec,
            )}
          </span>
        )}

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

      <Style.PageContent
        style={{ paddingRight: isSidebarOpen ? "250px" : "0" }}
      >
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
              value={code}
              onChange={(value) => {
                const newCode = value || "";
                setCode(newCode);

                if (!problemId || !contestCode) return;
                const pid = String(problemId);

                // 1. state 갱신 (기존 로직)
                setCodeStateByProblem((prev) => {
                  const prevState = prev[pid] ?? {
                    savedCode: "",
                    savedLanguage: language,
                    currentCode: "",
                    currentLanguage: language,
                  };

                  return {
                    ...prev,
                    [pid]: {
                      ...prevState,
                      currentCode: newCode,
                      currentLanguage: language,
                    },
                  };
                });

                const key = getLocalCodeKey(contestCode);
                if (!key) return;

                const raw = localStorage.getItem(key);
                const parsed = raw ? JSON.parse(raw) : {};

                localStorage.setItem(
                  key,
                  JSON.stringify({
                    ...parsed,
                    [pid]: newCode,
                  }),
                );
              }}
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
                  {terminalOutput ? (
                    <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>
                      {terminalOutput}
                    </pre>
                  ) : (
                    <div style={{ color: "#a0aec0" }}>
                      실행 결과가 여기에 표시됩니다.
                    </div>
                  )}
                </Style.TerminalOutput>
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
                                "0",
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

            <Style.SubmitWrapper style={{ marginRight: 0 }}>
              <div style={{ display: "flex", gap: "24px" }}>
                <Style.SubmitButton
                  onClick={handleEndTest}
                  disabled={!problemId}
                  style={{
                    backgroundColor: "#35454E",
                    border: "1px solid #495D68",
                  }}
                >
                  테스트 끝내기
                </Style.SubmitButton>

                <Style.SubmitButton
                  onClick={handlePrevProblem}
                  disabled={
                    !problemId ||
                    courseProblems.findIndex(
                      (p) => String(p.problemId) === String(problemId),
                    ) === 0
                  }
                >
                  {"이전 문제"}
                </Style.SubmitButton>
                <Style.SubmitButton
                  onClick={handleNextProblem}
                  disabled={
                    !problemId ||
                    courseProblems.findIndex(
                      (p) => String(p.problemId) === String(problemId),
                    ) ===
                      courseProblems.length - 1
                  }
                >
                  {"다음 문제"}
                </Style.SubmitButton>
                <Style.SaveButton
                  onClick={handleSaveTest}
                  disabled={!problemId}
                  style={{ border: "1px solid #495D68" }}
                >
                  코드 저장하기
                </Style.SaveButton>
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
              </div>
            </Style.SubmitWrapper>
          </Style.ResultContainer>
        </Style.RightPanel>
        {isSidebarOpen && (
          <>
            <Style.ThinDivider />
            <Style.RightSidebar ref={sidebarRef}>
              <Style.SidebarHeader>문제 목록</Style.SidebarHeader>
              <Style.SidebarList>
                {courseLoading
                  ? null
                  : courseProblems.map((p, idx) => {
                      const isSubmitted = submittedProblems.has(
                        String(p.problemId),
                      );

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

                          {/* 상태 표시를 오른쪽으로 이동 */}
                          <div
                            style={{
                              marginLeft: "auto",
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            {(() => {
                              // 제출 완료
                              if (isSubmitted) {
                                return (
                                  <span
                                    title="제출 완료"
                                    style={{
                                      width: "50px",
                                      height: "20px",
                                      borderRadius: "10%",
                                      backgroundColor: "#59b549",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      fontSize: "11px",
                                      fontWeight: "bold",
                                      color: "#ffffff",
                                    }}
                                  >
                                    제출 완료
                                  </span>
                                );
                              }

                              // 미제출
                              if (!isSubmitted) {
                                return (
                                  <span
                                    title="미제출"
                                    style={{
                                      width: "50px",
                                      height: "20px",
                                      borderRadius: "10%",
                                      backgroundColor: "#e45d5d",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      fontSize: "11px",
                                      fontWeight: "bold",
                                      color: "#ffffff",
                                    }}
                                  >
                                    미제출
                                  </span>
                                );
                              }

                              return null;
                            })()}
                          </div>
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
