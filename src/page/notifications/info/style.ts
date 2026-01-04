import styled from "styled-components";

/* Layout */
export const Page = styled.div`
  min-height: 100vh;
  background: #fff;
  display: flex;
  flex-direction: column;
`;

export const Main = styled.main`
  flex: 1;
  max-width: 1280px;
  margin: 0 auto;
  padding: 60px;
  width: 100%;
`;

export const Container = styled.div`
  width: 794px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 40px;
`;

/* Back Button */
export const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  font-size: 14px;
  color: #6b7280;
  transition: color 0.2s ease;

  &:hover {
    color: #4b5563;
  }

  img {
    width: 16px;
    height: 16px;
  }
`;

/* Notice Header */
export const NoticeHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e5e7eb;
`;

export const Title = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: #1d1d1d;
  margin: 0;
  line-height: 1.4;
`;

export const MetaInfo = styled.div`
  display: flex;
  gap: 40px;
  align-items: center;
`;

export const MetaItem = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

export const MetaLabel = styled.span`
  font-size: 14px;
  color: #6b7280;
  font-weight: 400;
`;

export const MetaValue = styled.span`
  font-size: 14px;
  color: #1d1d1d;
  font-weight: 500;
`;

/* Notice Content */
export const NoticeContent = styled.div`
  min-height: 330px;
`;

export const ContentText = styled.div`
  font-size: 16px;
  line-height: 1.8;
  color: #1d1d1d;
  white-space: pre-wrap;
  word-wrap: break-word;
`;

/* Navigation Buttons */
/* Action Bar */
export const ActionBar = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;

  margin-top: 40px;
  padding-top: 24px;

  border-top: 1px solid #ededed;
`;

/* Left button group */
export const LeftActions = styled.div`
  display: flex;
  gap: 12px;
`;

/* 공지 삭제 */
export const DeleteButton = styled.button`
  display: flex;
  padding: 12px 24px;
  justify-content: center;
  align-items: center;
  gap: 10px;

  border-radius: 8px;
  border: 1px solid #ededed;
  background: #ffffff;

  color: red;
  font-size: 14px;
  cursor: pointer;
`;

/* 공지 수정 */
export const EditButton = styled.button`
  display: flex;
  padding: 12px 24px;
  justify-content: center;
  align-items: center;
  gap: 10px;

  border-radius: 8px;
  border: 1px solid #ededed;
  background: #ffffff;

  color: #000;
  font-size: 14px;
  cursor: pointer;
`;

/* 목록으로 */
export const ListButton = styled.button`
  display: flex;
  padding: 12px 24px;
  justify-content: center;
  align-items: center;
  gap: 10px;

  border-radius: 8px;
  background: #00b4b7;
  border: none;

  color: #ffffff;
  font-size: 14px;
  cursor: pointer;
`;

export const NavButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px 16px;
  font-size: 14px;
  color: #6b7280;
  transition: color 0.2s ease;

  &:hover {
    color: #4b5563;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  img {
    width: 16px;
    height: 16px;
  }
`;

/* Loading & Error States */
export const LoadingText = styled.div`
  text-align: center;
  padding: 60px 0;
  font-size: 16px;
  color: #6b7280;
`;

export const ErrorText = styled.div`
  text-align: center;
  padding: 60px 0;
  font-size: 16px;
  color: #6b7280;
  margin-bottom: 20px;
`;
