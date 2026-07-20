import { useState, useRef, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, useParams } from "react-router-dom";
import * as Style from "./style";
import {
  useSolveForm,
  useProblem,
  useContest,
  useGrading,
  useResizePanel,
} from "../../../hooks/solve";
import {
  SolveHeader,
  ProblemDescription,
  CodeEditor,
  ResultPanel,
  ProblemSidebar,
} from "../../../components/solve";

export default function SolvePage() {
  const { contestCode, problemId } = useParams<{
    contestCode?: string;
    problemId?: string;
  }>();
  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeResultTab, setActiveResultTab] = useState<"result" | "tests">(
    "result",
  );
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);

  const {
    control,
    currentLanguageOption,
    handleCodeChange,
    handleLanguageChange,
    getValues,
    saveToLocalStorage,
    languageOptions,
  } = useSolveForm({
    storageKey: `dukkaebi_contest_${contestCode}`,
    problemId,
  });

  const {
    problem,
    status: problemStatus,
    error: problemError,
    sampleInput,
    sampleOutput,
    problemSections,
  } = useProblem({ problemId });

  const {
    problems: courseProblems,
    timeLeft,
    contestPhase,
    getTimeSpent,
  } = useContest({
    contestCode,
    problemId,
  });

  const {
    isSubmitting,
    isTesting,
    terminalOutput,
    gradingDetails,
    submitCode,
    testCode,
  } = useGrading({ problemId });

  const {
    containerRef,
    rightPanelWidth,
    isResizing,
    terminalHeight,
    startResizing,
  } = useResizePanel({ isSidebarOpen });

  // 사이드바 외부 클릭 시 닫기
  useEffect(() => {
    if (!isSidebarOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSidebarOpen]);

  const handleTestCode = () => {
    const { code, language } = getValues();
    testCode(code, language);
  };

  const isContestOngoing = contestPhase === "ONGOING"; // 제출/테스트 허용 여부

  const handleSubmitCode = () => {
    // 대회 제출은 진행 중 상태에서만 허용
    if (!isContestOngoing) {
      alert("대회 진행 중에만 제출할 수 있습니다.");
      return;
    }

    saveToLocalStorage();
    const { code, language } = getValues();
    submitCode(code, language, getTimeSpent(problemId));
  };

  const handleNextProblem = () => {
    saveToLocalStorage();
    const currentIndex = courseProblems.findIndex(
      (p) => String(p.problemId) === String(problemId),
    );
    const isLastProblem = currentIndex === courseProblems.length - 1;

    if (!isLastProblem && currentIndex !== -1 && contestCode) {
      const nextProblem = courseProblems[currentIndex + 1];
      navigate(`/contests/${contestCode}/solve/${nextProblem.problemId}`);
    }
  };

  const handleEndTest = () => {
    if (contestCode) navigate(`/contests/${contestCode}`);
  };

  const toggleSidebar = () => setIsSidebarOpen((v) => !v);
  const handleExitSolvePage = () => navigate(`/contests/${contestCode}`);
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

      <SolveHeader
        problemName={problem?.name}
        isLoading={problemStatus === "loading"}
        languageOptions={languageOptions}
        control={control}
        onLanguageChange={handleLanguageChange}
        onBack={handleExitSolvePage}
        rightContent={
          <>
            {timeLeft && (
              <span style={{ color: "#9fb1bc", marginRight: 12 }}>
                {timeLeft}
              </span>
            )}
            <Style.MenuButton
              ref={menuButtonRef}
              type="button"
              onClick={toggleSidebar}
            >
              ☰
            </Style.MenuButton>
          </>
        }
      />

      <Style.PageContent>
        <ProblemDescription
          status={problemStatus}
          error={problemError}
          sections={problemSections}
          sampleInput={sampleInput}
          sampleOutput={sampleOutput}
        />

        <Style.Divider onMouseDown={startResizing} $isResizing={isResizing} />

        <Style.RightPanel $width={rightPanelWidth}>
          <CodeEditor
            control={control}
            currentLanguage={currentLanguageOption}
            onCodeChange={handleCodeChange}
          />

          <ResultPanel
            activeTab={activeResultTab}
            onTabChange={setActiveResultTab}
            terminalHeight={terminalHeight}
            terminalOutput={terminalOutput}
            gradingDetails={gradingDetails}
            actionButtons={
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  marginRight: isSidebarOpen ? 268 : 0,
                }}
              >
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
                  disabled={!problemId || isSubmitting || !isContestOngoing}
                >
                  {isSubmitting ? "제출 중..." : "제출"}
                </Style.SubmitButton>
                <Style.SubmitButton
                  onClick={handleNextProblem}
                  disabled={
                    !problemId ||
                    courseProblems.findIndex(
                      (p) => String(p.problemId) === String(problemId ?? ""),
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
            }
          />
        </Style.RightPanel>

        {isSidebarOpen && (
          <>
            <Style.ThinDivider />
            <ProblemSidebar
              ref={sidebarRef}
              problems={courseProblems}
              currentProblemId={problemId}
              onProblemClick={handleSidebarItemClick}
              showHeader={false}
            />
          </>
        )}
      </Style.PageContent>
    </Style.SolveContainer>
  );
}
