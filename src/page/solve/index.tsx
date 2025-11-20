import {
  useState,
  useRef,
  useEffect,
  type ReactNode,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";
import type * as monacoEditor from "monaco-editor";
import Editor from "@monaco-editor/react";
import dubiAvatar from "../../assets/image/solve/Dubi.png";
import * as Style from "./style";

type SectionContent = {
  title: string;
  content: ReactNode;
};

type ChatMessage = {
  id: number;
  sender: "bot" | "user";
  text: string;
};

const PROBLEM_SECTIONS: SectionContent[] = [
  {
    title: "문제 설명",
    content: (
      <>
        N개의 정수가 주어졌을 때, 그 중 최댓값을 구하는 프로그램을 작성하시오.
      </>
    ),
  },
  {
    title: "입력:",
    content: (
      <>
        첫째 줄에 정수의 개수 N(1 ≤ N ≤ 100)이 주어진다.
        <br />
        둘째 줄에는 N개의 정수가 공백으로 구분되어 주어진다.
      </>
    ),
  },
  {
    title: "출력:",
    content: <>주어진 정수 중 최댓값을 출력한다.</>,
  },
];

const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 1,
    sender: "bot",
    text: "모르는 개념이 있다면 저 두비에게 물어보세요!",
  },
];

export default function SolvePage() {
  const [input] = useState("5\n1 7 3 9 2");
  const [output, setOutput] = useState("9");
  const [code, setCode] = useState(``);
  const [rightPanelWidth, setRightPanelWidth] = useState(65);
  const [isResizing, setIsResizing] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(
    INITIAL_CHAT_MESSAGES
  );
  const containerRef = useRef<HTMLDivElement | null>(null);
  const messageIdRef = useRef(INITIAL_CHAT_MESSAGES.length);
  const botReplyTimeoutRef = useRef<number | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

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

  const handleCalculate = () => {
    const lines = input.trim().split("\n");
    if (lines.length < 2) {
      setOutput("입력 오류");
      return;
    }

    const numbers = lines[1].trim().split(/\s+/).map(Number);
    if (numbers.some(isNaN)) {
      setOutput("입력 오류");
      return;
    }

    const max = Math.max(...numbers);
    setOutput(max.toString());
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

  useEffect(
    () => () => {
      if (botReplyTimeoutRef.current) {
        window.clearTimeout(botReplyTimeoutRef.current);
      }
    },
    []
  );

  const handleChatSubmit = () => {
    if (!chatInput.trim()) return;
    const trimmed = chatInput.trim();
    const nextUserId = messageIdRef.current + 1;
    const newUserMessage: ChatMessage = {
      id: nextUserId,
      sender: "user",
      text: trimmed,
    };
    messageIdRef.current = nextUserId;
    setMessages((prev) => [...prev, newUserMessage]);
    setChatInput("");

    if (botReplyTimeoutRef.current) {
      window.clearTimeout(botReplyTimeoutRef.current);
    }

    botReplyTimeoutRef.current = window.setTimeout(() => {
      const botId = messageIdRef.current + 1;
      const newBotMessage: ChatMessage = {
        id: botId,
        sender: "bot",
        text: `좋은 질문이에요! "${trimmed}"에 대해 곧 답을 준비할게요.`,
      };
      messageIdRef.current = botId;
      setMessages((prev) => [...prev, newBotMessage]);
      botReplyTimeoutRef.current = null;
    }, 600);
  };

  return (
    <Style.SolveContainer ref={containerRef}>
      <Style.Header>
        <Style.BackButton>‹</Style.BackButton>
        <Style.HeaderTitle>최댓값 구하기</Style.HeaderTitle>
      </Style.Header>

      <Style.PageContent>
        <Style.LeftPanel>
          <Style.LeftPanelContent>
            {PROBLEM_SECTIONS.map(({ title, content }) => (
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
                value={input}
              />
            </Style.Section>

            <Style.Section>
              <Style.SectionTitle>예시 출력:</Style.SectionTitle>
              <Style.ExampleOutput>9</Style.ExampleOutput>
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
              language="python"
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
              <Style.TerminalOutput>{output}</Style.TerminalOutput>
            </Style.Terminal>

            <Style.SubmitWrapper>
              <Style.SubmitButton onClick={handleCalculate}>
                제출 후 채점하기
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
                $active={Boolean(chatInput.trim())}
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
