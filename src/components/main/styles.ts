import styled from "styled-components";

export const CardContainer = styled.div`
  width: 184px;
  height: 207px;
  padding: 24px 20px 24px 20px;
  background: var(--Gray-Colors-Gray5, #f6f6f6);
  border-radius: 8px;
  outline-offset: -1px;
  display: inline-flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 20px;
  :hover {
    cursor: pointer;
  }
`;

export const HeaderSection = styled.div`
  align-self: stretch;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 8px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--Gray-Colors-Gray4, #e0e0e0);
`;

export const Title = styled.h3`
  align-self: stretch;
  color: black;
  font-size: 16px;
  font-family: "Pretendard", sans-serif;
  font-weight: 500;
  line-height: 140%; /* 22.40px / 16px */
  margin: 0;
  word-wrap: break-word;
`;

export const InfoGroup = styled.div`
  display: inline-flex;
  justify-content: flex-start;
  align-items: center;
  gap: 8px;
`;

export const InfoText = styled.span`
  color: var(--Gray-Colors-Gray1, #828282);
  font-size: 14px;
  font-family: "Pretendard", sans-serif;
  font-weight: 500;
  word-wrap: break-word;
`;

export const Divider = styled.div`
  width: 3px;
  height: 3px;
  background: var(--Gray-Colors-Gray1, #828282);
  border-radius: 9999px;
`;

export const Content = styled.p`
  align-self: stretch;
  color: var(--Gray-Colors-Gray1, #828282);
  font-size: 14px;
  font-family: "Pretendard", sans-serif;
  font-weight: 500;
  line-height: 140%; /* 19.60px / 14px */
  margin: 0;
  word-wrap: break-word;
`;

export const Attachment = styled.div`
  align-self: stretch;
  color: var(--Gray-Colors-Gray2, #bdbdbd);
  font-size: 12px;
  font-family: "Pretendard", sans-serif;
  font-weight: 500;
  word-wrap: break-word;
`;
