import {
  useState,
  useRef,
  useEffect,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";
import type * as monacoEditor from "monaco-editor";
import Editor from "@monaco-editor/react";
import { useParams } from "react-router-dom";
import dubiAvatar from "../../assets/image/solve/Dubi.png";
import * as Style from "./style";

type ProblemDetail = {
  name: string;
  description: string;
  input: string;
  output: string;
  exampleInput: string;
  exampleOutput: string;
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
  const { problemId } = useParams<{ problemId?: string }>();
  const [sampleInput, setSampleInput] = useState("");
  const [sampleOutput, setSampleOutput] = useState("");
  const [terminalOutput, setTerminalOutput] = useState("실행 결과가 이곳에 표시됩니다.");
  const [code, setCode] = useState(``);
  const [language, setLanguage] = useState(LANGUAGE_OPTIONS[0].value);
  const [rightPanelWidth, setRightPanelWidth] = useState(65);
  const [isResizing, setIsResizing] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
  const [problem, setProblem] = useState<ProblemDetail | null>(null);
  const [problemStatus, setProblemStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [problemError, setProblemError] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  // Terminal (floating) size & resize state
  const [terminalHeight, setTerminalHeight] = useState(200); // px
  const terminalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (event: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const relativeX = event.clientX - rect.left;
      const rightWidthPercent = ((rect.width - relativeX) / rect.width) * 100;
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
      setProblemError("서버 주소가 설정되어 있지 않습니다. .env의 VITE_API_URL 값을 확인하세요.");
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
            ? {
                Authorization: `Bearer ${accessToken}`,
              }
            : undefined,
        });
        if (!response.ok) {
          throw new Error("문제 정보를 불러오지 못했습니다.");
        }
        const data: ProblemDetail = await response.json();
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
      `통과한 테스트: ${result.passedTestCases ?? 0} / ${result.totalTestCases ?? 0}`,
      `실행 시간: ${result.executionTime ?? "-"}ms`,
    ];

    if (result.errorMessage) {
      lines.push("", `오류 메시지: ${result.errorMessage}`);
    }

    if (result.details && result.details.length > 0) {
      const detail = result.details[0];
      lines.push(
        "",
        `테스트 케이스 ${detail.testCaseNumber ?? "?"} : ${detail.passed ? "통과" : "실패"}`
      );
      lines.push(`입력값: ${(detail.input ?? "X").replace(/\s+$/, "") || "X"}`);
      if (detail.expectedOutput !== undefined) {
        lines.push(`기댓값: ${(detail.expectedOutput ?? "").replace(/\s+$/, "") || "X"}`);
      }
      lines.push(`실제값: ${(detail.actualOutput ?? "").replace(/\s+$/, "") || "X"}`);
    }

    return lines.join("\n");
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
    if (!code.trim()) {
      setTerminalOutput("제출할 코드를 작성해 주세요.");
      return;
    }

    setTerminalOutput("채점 중입니다...");
    setIsSubmitting(true);
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await fetch(`${API_BASE_URL}solve/grading`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          problemId: numericProblemId,
          code,
          language,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "채점 요청이 실패했습니다.");
      }

      const data = await response.json();
      setTerminalOutput(formatGradingResult(data));
    } catch (error) {
      setTerminalOutput(
        error instanceof Error ? error.message : "채점 중 알 수 없는 오류가 발생했습니다."
      );
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

  useEffect(() => {
    if (!isChatOpen) return;
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isChatOpen]);

  const openChat = () => setIsChatOpen(true);
  const closeChat = () => setIsChatOpen(false);

  const handleChatInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setChatInput(event.target.value);
  };

  const handleChatInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      if (event.nativeEvent.isComposing) {
        return;
      }
      event.preventDefault();
      handleChatSubmit();
    }
  };

  const getNextMessageId = () => {
    messageIdRef.current += 1;
    return messageIdRef.current;
  };

  const appendMessage = (message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  };

  const appendUserMessage = (text: string) => {
    const id = getNextMessageId();
    appendMessage({ id, sender: "user", text });
  };

  const appendBotMessage = (text: string) => {
    const id = getNextMessageId();
    appendMessage({ id, sender: "bot", text });
    return id;
  };

  const updateMessageText = (id: number, text: string) => {
    setMessages((prev) =>
      prev.map((message) => (message.id === id ? { ...message, text } : message))
    );
  };

  const requestChatbotResponse = async (content: string) => {
    if (!API_BASE_URL) {
      appendBotMessage("챗봇 서버 주소가 설정되어 있지 않습니다.");
      return;
    }

    const pendingId = appendBotMessage("답변을 불러오는 중입니다...");
    setIsChatLoading(true);
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await fetch(`${API_BASE_URL}chatbot/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({ message: content }),
      });

      if (!response.ok) {
        throw new Error("챗봇 응답을 불러오지 못했습니다.");
      }

      const data: { response?: string } = await response.json();
      const reply = data.response && data.response.trim().length > 0 ? data.response : "응답이 없습니다.";
      updateMessageText(pendingId, reply);
    } catch (error) {
      updateMessageText(
        pendingId,
        error instanceof Error ? error.message : "챗봇 응답 중 오류가 발생했습니다."
      );
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleChatSubmit = () => {
    if (!chatInput.trim() || isChatLoading) return;
    const trimmed = chatInput.trim();
    appendUserMessage(trimmed);
    setChatInput("");
    void requestChatbotResponse(trimmed);
  };

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

  return (
    <Style.SolveContainer ref={containerRef}>
      <Style.Header>
        <Style.BackButton>‹</Style.BackButton>
        <Style.HeaderTitle>
          {problem?.name ?? (problemStatus === "loading" ? "문제를 불러오는 중..." : "문제 정보 없음")}
        </Style.HeaderTitle>
        <Style.HeaderActions>
          <Style.LanguageSelect value={language} onChange={handleLanguageChange}>
            {LANGUAGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Style.LanguageSelect>
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
              value={code}
              onChange={(value) => setCode(value || "")}
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
            <Style.Terminal ref={terminalRef} $height={terminalHeight}>
              <Style.TerminalHandle />
              <Style.TerminalHeader>실행 결과</Style.TerminalHeader>
              <Style.TerminalOutput>{terminalOutput}</Style.TerminalOutput>
            </Style.Terminal>

            <Style.SubmitWrapper>
              <Style.SubmitButton
                onClick={handleSubmitCode}
                disabled={isSubmitting || !problemId}
              >
                {isSubmitting ? "채점 중..." : "제출 후 채점하기"}
              </Style.SubmitButton>
            </Style.SubmitWrapper>
          </Style.ResultContainer>
        </Style.RightPanel>
      </Style.PageContent>

      {isChatOpen ? (
        <Style.ChatModal>
          <Style.ChatModalHeader>
            <Style.ChatCloseButton
              type="button"
              aria-label="AI 챗봇 닫기"
              onClick={closeChat}
            >
              ×
            </Style.ChatCloseButton>
          </Style.ChatModalHeader>
          <Style.ChatModalBody>
            <Style.ChatMessages>
              {messages.map((message) => {
                const isUser = message.sender === "user";
                return (
                  <Style.ChatMessageRow key={message.id} $isUser={isUser}>
                    <Style.ChatMessageAvatar
                      src={dubiAvatar}
                      alt="두비"
                      $hidden={isUser}
                    />
                    <Style.ChatMessageBubble $isUser={isUser}>
                      {message.text}
                    </Style.ChatMessageBubble>
                  </Style.ChatMessageRow>
                );
              })}
              <div ref={chatEndRef} />
            </Style.ChatMessages>
          </Style.ChatModalBody>
          <Style.ChatInputWrapper>
            <Style.ChatInputContainer>
              <Style.ChatInput
                value={chatInput}
                placeholder="무엇이든 물어보세요"
                onChange={handleChatInputChange}
                onKeyDown={handleChatInputKeyDown}
              />
              <Style.ChatSendButton
                type="button"
                aria-label="메시지 보내기"
                onClick={handleChatSubmit}
                disabled={isChatLoading || !chatInput.trim()}
                $active={Boolean(chatInput.trim()) && !isChatLoading}
              >
                ↑
              </Style.ChatSendButton>
            </Style.ChatInputContainer>
          </Style.ChatInputWrapper>
        </Style.ChatModal>
      ) : (
        <Style.AIAssistantWrapper type="button" onClick={openChat}>
          <Style.AIAssistantAvatarWrapper>
            <Style.AIAssistantAvatar src={dubiAvatar} alt="두비" />
            <Style.AIAssistantLabel>AI 챗봇</Style.AIAssistantLabel>
          </Style.AIAssistantAvatarWrapper>
          <Style.AIAssistantBubble>
            모르겠다면 저에게 물어보세요!
          </Style.AIAssistantBubble>
        </Style.AIAssistantWrapper>
      )}
    </Style.SolveContainer>
  );
}
