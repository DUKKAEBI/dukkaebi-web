import styled from "styled-components";

export const Container = styled.div`
  width: 100vw;
  min-height: 100vh;
  background: #f6f6f6;
  overflow-x: hidden;
`;

export const Header = styled.header`
  width: 100%;
  height: 80px;
  background: #ffffff;
  border-bottom: 1px solid #ededed;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const HeaderContent = styled.div`
  width: 100%;
  max-width: 1280px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 40px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 0 20px;
  }
`;

export const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 40px;

  @media (max-width: 768px) {
    gap: 20px;
  }
`;

export const LogoImage = styled.img`
  width: 80px;
  height: 32px;
  object-fit: contain;
`;

export const Nav = styled.nav`
  display: flex;
  gap: 20px;
  align-items: center;

  @media (max-width: 480px) {
    display: none;
  }
`;

export const NavItem = styled.a<{ $active: boolean }>`
  font-family: "Pretendard", sans-serif;
  font-weight: 500;
  font-size: 16px;
  color: ${(props) => (props.$active ? "#00B4B7" : "#1D1D1D")};
  text-decoration: none;
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    color: #00b4b7;
  }
`;

export const UserIcon = styled.div`
  width: 24px;
  height: 24px;
  cursor: pointer;
`;

export const ContestInfoSection = styled.section`
  width: 100%;
  background: #ffffff;
  border-bottom: 1px solid #ededed;
  padding: 50px 0;
  display: flex;
  justify-content: center;

  @media (max-width: 768px) {
    padding: 30px 0;
  }
`;

export const ContestInfoContent = styled.div`
  width: 100%;
  max-width: 1280px;
  display: flex;
  gap: 40px;
  align-items: center;
  padding: 0 80px;
  margin: 0 auto;

  @media (max-width: 1280px) {
    padding: 0 40px;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    padding: 0 20px;
    gap: 24px;
  }
`;

export const ContestImage = styled.img`
  width: 100%;
  max-width: 387px;
  height: 200px;
  object-fit: cover;
  border-radius: 4px;
  flex-shrink: 0;

  @media (max-width: 768px) {
    max-width: 100%;
  }
`;

export const ContestDetails = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 40px;
  padding: 4px 0;
  min-width: 0;

  @media (max-width: 768px) {
    gap: 24px;
  }
`;

export const ContestTitle = styled.h1`
  font-family: "Pretendard", sans-serif;
  font-weight: 600;
  font-size: 20px;
  color: #000000;
  margin: 0;
`;

export const ContestDescription = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const DescriptionText = styled.p`
  font-family: "Pretendard", sans-serif;
  font-weight: 500;
  font-size: 14px;
  color: #bdbdbd;
  margin: 0;
  line-height: 1.4;
`;

export const ContestMeta = styled.p`
  font-family: "Pretendard", sans-serif;
  font-weight: 500;
  font-size: 14px;
  color: #bdbdbd;
  margin: 0;
`;

export const ProgressSection = styled.div`
  display: flex;
  gap: 20px;
  align-items: center;
  width: 100%;
`;

export const ProgressBarContainer = styled.div`
  flex: 1;
  height: 8px;
  background: #e0e0e0;
  position: relative;
  overflow: hidden;
  border-radius: 4px;
`;

export const ProgressBar = styled.div<{ progress: number }>`
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: ${(props) => props.progress}%;
  background-color: #00b4b7;
  transition: width 0.3s ease;
`;

export const ProgressText = styled.span`
  font-family: "Pretendard", sans-serif;
  font-weight: 600;
  font-size: 14px;
  color: #bdbdbd;
  white-space: nowrap;
`;

export const MainContentArea = styled.main`
  width: 100%;
  max-width: 1280px;
  padding: 40px 80px;
  display: flex;
  gap: 20px;
  margin: 0 auto 80px;
  align-items: flex-start;

  @media (max-width: 1280px) {
    padding: 40px 40px;
  }

  @media (max-width: 1024px) {
    flex-direction: column;
    padding: 40px 20px;
  }
`;

export const ProblemsSection = styled.section`
  flex: 1;
  width: 100%;
  min-width: 0;

  @media (min-width: 1024px) {
    min-width: 700px;
  }
`;

export const ProblemsTable = styled.div`
  width: 100%;
  background: #ffffff;
  border: 1px solid #ededed;
  border-radius: 8px;
  overflow: hidden;
`;

export const TableHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #ffffff;
  border-bottom: 1px solid #ededed;

  @media (max-width: 480px) {
    padding: 12px 16px;
  }
`;

export const TableHeaderLeft = styled.div`
  display: flex;
  gap: 40px;
  align-items: center;
  width: 90px;

  @media (max-width: 480px) {
    gap: 20px;
  }
`;

export const TableHeaderRight = styled.div`
  display: flex;
  gap: 40px;
  align-items: center;
`;

export const HeaderCell = styled.span`
  font-family: "Pretendard", sans-serif;
  font-weight: 500;
  font-size: 14px;
  color: #828282;
  white-space: nowrap;

  @media (max-width: 480px) {
    font-size: 12px;
  }
`;

export const TableBody = styled.div`
  display: flex;
  flex-direction: column;
`;

export const TableRow = styled.div<{ $isLast: boolean }>`
  display: grid;
  grid-template-columns: 64px 1fr auto;
  align-items: center;
  padding: 20px;
  background: #ffffff;
  border-bottom: ${(props) => (props.$isLast ? "none" : "1px solid #EDEDED")};

  ${(props) =>
    props.$isLast &&
    `
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
  `}

  @media (max-width: 480px) {
    grid-template-columns: 50px 1fr auto;
    padding: 16px;
  }
`;

export const ProblemNumber = styled.span`
  font-family: "Pretendard", sans-serif;
  font-weight: 500;
  font-size: 16px;
  color: #00b4b7;

  @media (max-width: 480px) {
    font-size: 14px;
  }
`;

export const ProblemTitle = styled.span`
  font-family: "Pretendard", sans-serif;
  font-weight: 500;
  font-size: 16px;
  color: #1d1d1d;

  @media (max-width: 480px) {
    font-size: 14px;
  }
`;

export const ProblemStatus = styled.span<{
  $status: "SOLVED" | "FAILED" | "NOT_SOLVED";
}>`
  font-family: "Pretendard", sans-serif;
  font-weight: 500;
  font-size: 16px;
  color: ${(props) => (props.$status === "SOLVED" || props.$status === "FAILED" ? "#00B4B7" : "#BDBDBD")};
  text-align: right;

  @media (max-width: 480px) {
    font-size: 14px;
  }
`;

export const ContestInfoCard = styled.aside`
  width: 100%;
  max-width: 400px;
  background: #ffffff;
  border: 1px solid #ededed;
  border-radius: 8px;
  padding: 24px 20px;
  flex-shrink: 0;

  @media (max-width: 1024px) {
    max-width: 100%;
  }
`;

export const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 40px;
`;

export const CardInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const CardTitle = styled.h2`
  font-family: "Pretendard", sans-serif;
  font-weight: 600;
  font-size: 18px;
  color: #000000;
  margin: 0;
`;

export const CardDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const CardDetail = styled.p`
  font-family: "Pretendard", sans-serif;
  font-weight: 500;
  font-size: 16px;
  color: #828282;
  margin: 0;

  @media (max-width: 480px) {
    font-size: 14px;
  }
`;

export const StartButton = styled.button`
  width: 100%;
  background: #00b4b7;
  border: none;
  border-radius: 8px;
  padding: 14px 24px;
  font-family: "Pretendard", sans-serif;
  font-weight: 600;
  font-size: 18px;
  color: #ffffff;
  cursor: pointer;
  transition: background 0.2s;
  outline: none;

  &:hover {
    background: #009a9d;
  }

  &:focus {
    outline: none;
  }

  &:focus-visible {
    outline: none;
  }
`;
