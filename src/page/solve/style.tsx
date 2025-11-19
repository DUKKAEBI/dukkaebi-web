import styled from 'styled-components';

export const SolveContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  background: #263238;
  color: white;
  font-family: system-ui, -apple-system, sans-serif;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background-color: #35454e;
  height: 40px;
  flex-shrink: 0;
`;

export const BackButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  margin-right: 8px;
  padding: 0;
  display: flex;
  align-items: center;
`;

export const HeaderTitle = styled.h1`
  font-size: 15px;
  font-weight: 500;
  margin: 0;
  color: #e8eaed;
`;

export const PageContent = styled.div`
  display: flex;
  flex: 1;
  width: 100%;
  position: relative;
`;

export const LeftPanel = styled.div`
  background: #263238;
  padding: 40px 32px;
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  box-sizing: border-box;
  flex: 1;
  min-width: 20%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  height: 100%;
`;

export const LeftPanelContent = styled.div`
  flex: 1 1 auto;
  overflow-y: auto;
  padding-right: 4px;
`;

export const Section = styled.div`
  margin-bottom: 32px;

  &:last-of-type {
    margin-bottom: 0;
  }
`;

export const SectionTitle = styled.div`
  color: #7a8697;
  font-size: 14px;
  margin-bottom: 8px;
  font-weight: 600;
  text-transform: uppercase;
`;

export const SectionText = styled.div`
  color: #cdd1d8;
  font-size: 16px;
  line-height: 1.6;
`;

export const ExampleTextarea = styled.textarea`
  width: 100%;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 12px;
  color: #e8eaed;
  font-family: Menlo, Monaco, 'Courier New', monospace;
  font-size: 14px;
  resize: none;
  min-height: 70px;
  box-sizing: border-box;
  cursor: default;
`;

export const ExampleOutput = styled.div`
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 12px;
  font-family: Menlo, Monaco, 'Courier New', monospace;
  font-size: 14px;
  color: #e8eaed;
  min-height: 40px;
  display: flex;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
`;

export const Divider = styled.div<{ $isResizing: boolean }>`
  width: 4px;
  background: ${({ $isResizing }) =>
    $isResizing ? 'rgba(94, 234, 212, 0.7)' : 'rgba(255, 255, 255, 0.1)'};
  cursor: col-resize;
  flex-shrink: 0;
  transition: background 0.2s;
`;

export const RightPanel = styled.div<{ $width: number }>`
  background: #2d3d48;
  padding: 0;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  width: ${({ $width }) => `${$width}%`};
  min-width: 20%;
  flex-shrink: 0;
  position: relative;
`;

export const EditorContainer = styled.div`
  flex: 1;
  min-height: 0;
`;

export const ResultContainer = styled.div`
  flex: 0 0 auto;
  width: 100%;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  position: relative;
`;

export const Terminal = styled.div<{ $height: number }>`
  width: 100%;
  height: ${({ $height }) => `${$height}px`};
  background: #263238;
  color: #9eeac3;
  font-family: Menlo, Monaco, monospace;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
`;

export const TerminalHandle = styled.div`
  height: 4px;
  cursor: default;
  background: transparent;
`;

export const TerminalHeader = styled.div`
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 4px 16px 0 20px;
  background: #263238;
  font-size: 14px;
  color: #a0aec0;
  font-weight: 600;
`;

export const TerminalOutput = styled.div`
  flex: 1;
  padding: 10px 16px 16px 22px;
  overflow-y: auto;
  white-space: pre-wrap;
  font-size: 16px;
  text-align: left;
  color: #ffffff;
`;

export const SubmitWrapper = styled.div`
  position: absolute;
  right: 20px;
  bottom: 24px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
`;

export const SubmitButton = styled.button`
  background: #00b4b7;
  color: #ffffff;
  border: none;
  border-radius: 10px;
  padding: 11px 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #00969a;
  }
`;

export const AIAssistantWrapper = styled.button`
  position: fixed;
  bottom: 32px;
  left: 32px;
  display: flex;
  align-items: flex-end;
  gap: 12px;
  z-index: 10;
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
`;

export const AIAssistantAvatarWrapper = styled.div`
  text-align: center;
`;

export const AIAssistantAvatar = styled.img`
  width: 52px;
  height: 52px;
  border-radius: 50%;
  object-fit: cover;
  display: block;
  box-shadow: 0 8px 32px #6c8592;
`;

export const AIAssistantLabel = styled.div`
  color: #FFFFFF;
  font-size: 12px;
  margin-top: 4px;
`;

export const AIAssistantBubble = styled.div`
  background: white;
  color: #1a2633;
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 13px;
  white-space: nowrap;
  margin-bottom: 24px;
`;

export const ChatModal = styled.div`
  position: fixed;
  bottom: 32px;
  left: 32px;
  width: 400px;
  height: 500px;
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  z-index: 20;
`;

export const ChatModalHeader = styled.div`
  padding: 16px;
  display: flex;
  justify-content: flex-end;
  position: relative;
`;

export const ChatCloseButton = styled.button`
  position: absolute;
  top: 8px;
  right: -2px;
  width: 36px;
  height: 36px;
  border-radius: 0;
  background: transparent;
  border: none;
  font-size: 24px;
  color: #7b8794;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const ChatModalBody = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding-bottom: 16px;
  min-height: 0;
`;

export const ChatMessages = styled.div`
  flex: 1;
  padding: 16px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
  min-height: 0;
`;

export const ChatMessageRow = styled.div<{ $isUser?: boolean }>`
  display: flex;
  align-items: flex-end;
  gap: 12px;
  justify-content: ${({ $isUser }) => ($isUser ? 'flex-end' : 'flex-start')};
`;

export const ChatMessageAvatar = styled.img<{ $hidden?: boolean }>`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: ${({ $hidden }) => ($hidden ? 'none' : 'block')};
  flex-shrink: 0;
  object-fit: cover;
`;

export const ChatMessageBubble = styled.div<{ $isUser?: boolean }>`
  background: ${({ $isUser }) => ($isUser ? '#00b4b7' : '#f7f9fc')};
  color: ${({ $isUser }) => ($isUser ? '#ffffff' : '#1a202c')};
  border-radius: ${({ $isUser }) => ($isUser ? '16px 2px 16px 16px' : '2px 16px 16px 16px')};
  border: ${({ $isUser }) => ($isUser ? 'none' : '1px solid #EDEDED')};
  padding: 12px 16px;
  font-size: 14px;
  line-height: 1.5;
  box-shadow: 0 2px 4px rgba(15, 23, 42, 0.08);
  max-width: 260px;
  word-break: break-word;
`;

export const ChatInputWrapper = styled.div`
  padding: 0 24px 24px;
`;

export const ChatInputContainer = styled.div`
  background: #f7f9fc;
  border-radius: 10px;
  display: flex;
  align-items: center;
  padding: 12px 16px;
  gap: 8px;
`;

export const ChatInput = styled.input`
  flex: 1;
  border: none;
  background: transparent;
  font-size: 14px;
  color: #1a202c;

  &::placeholder {
    color: #a0aec0;
  }

  &:focus {
    outline: none;
  }
`;

export const ChatSendButton = styled.button<{ $active?: boolean }>`
  width: 26px;
  height: 26px;
  min-width: 26px;
  min-height: 26px;
  aspect-ratio: 1;
  border-radius: 50%;
  border: none;
  background: ${({ $active }) => ($active ? '#00B4B7' : '#dbe4f0')};
  color: ${({ $active }) => ($active ? '#ffffff' : '#7b8794')};
  cursor: ${({ $active }) => ($active ? 'pointer' : 'default')};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 14px;
  line-height: 1;
  padding: 0;
`;
