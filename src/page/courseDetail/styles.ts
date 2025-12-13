import styled from "styled-components";

export const Container = styled.div`
  min-height: 100vh;
  background: #ffffff;
  display: flex;
  flex-direction: column;
`;

export const Content = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 32px 40px;
  display: flex;
  flex-direction: column;
  gap: 32px;

  @media (max-width: 768px) {
    padding: 24px 20px 60px;
  }
`;

export const IntroSection = styled.section`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

export const IntroContent = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: flex-start;
`;

export const Title = styled.h1`
  margin: 0 0 12px;
  font-size: 22px;
  font-weight: 700;
  color: #1d1d1d;
`;

export const Description = styled.p`
  margin: 0 0 12px;
  font-size: 14px;
  font-weight: 500;
  color: #828282;
  line-height: 1.5;
`;

export const TagRow = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 16px;
`;

export const Tag = styled.span`
  padding: 8px 12px;
  background: #f3f3f3;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #9b9b9b;
`;

export const ProgressContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 24px;
`;

export const ProgressBar = styled.div`
  position: relative;
  width: 100%;
  height: 8px;
  background: #e6e6e6;
  border-radius: 999px;
  overflow: hidden;
`;

export const ProgressFill = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: #00b4b7;
  border-radius: 999px;
  transition: width 0.3s ease;
`;

export const ProgressText = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: #bdbdbd;
  white-space: nowrap;
`;

export const PrimaryButton = styled.button<{ fullWidth?: boolean }>`
  background: #00b4b7;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 12px 20px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s ease;
  min-width: 160px;
  width: ${(p) => (p.fullWidth ? "100%" : "fit-content")};

  &:hover {
    background: #009da0;
  }
`;

export const EnrollButton = styled(PrimaryButton)`
  width: 135px;
  height: 35px;
  padding: 0 16px;
  margin-top: 40px;
  font-size: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;

export const GraySection = styled.section`
  width: 100%;
  background: #f6f6f6;
  padding: 20px 0 80px;
`;

export const MainSection = styled.section`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 32px;
  display: flex;
  gap: 20px;
  align-items: flex-start;

  @media (max-width: 1024px) {
    flex-direction: column;
  }

  @media (max-width: 768px) {
    padding: 0 20px;
  }
`;

export const TableCard = styled.div`
  flex: 1;
  background: #ffffff;
  border: 1px solid #ededed;
  border-radius: 8px;
  overflow: hidden;
`;

export const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 80px 1fr 140px;
  padding: 14px 20px;
  border-bottom: 1px solid #ededed;
  background: #ffffff;

  @media (max-width: 600px) {
    grid-template-columns: 60px 1fr 120px;
    padding: 12px 16px;
  }
`;

export const HeaderText = styled.span<{ align?: "right" }>`
  font-size: 14px;
  font-weight: 600;
  color: #828282;
  text-align: ${(p) => p.align || "left"};
`;

export const TableBody = styled.div`
  display: flex;
  flex-direction: column;
`;

export const TableRow = styled.div<{ isLast?: boolean }>`
  display: grid;
  grid-template-columns: 80px 1fr 140px;
  padding: 18px 20px;
  align-items: center;
  border-bottom: ${(p) => (p.isLast ? "none" : "1px solid #ededed")};

  @media (max-width: 600px) {
    grid-template-columns: 60px 1fr 120px;
    padding: 16px;
  }
`;

export const IndexCell = styled.span`
  font-size: 16px;
  font-weight: 700;
  color: #00b4b7;
`;

export const TitleCell = styled.span`
  font-size: 16px;
  font-weight: 500;
  color: #1d1d1d;
`;

export const StatusCell = styled.span<{ status: "submitted" | "pending" }>`
  font-size: 16px;
  font-weight: 600;
  color: ${(p) => (p.status === "submitted" ? "#00B4B7" : "#BDBDBD")};
  text-align: right;
`;

export const SideCard = styled.aside`
  width: 100%;
  max-width: 400px;
  background: #ffffff;
  border: 1px solid #ededed;
  border-radius: 8px;
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;

  @media (max-width: 1024px) {
    max-width: 100%;
  }
`;

export const SideCardTitle = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #1d1d1d;
`;

export const SideCardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const SideCardItem = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

export const SideCardLabel = styled.span`
  font-size: 16px;
  font-weight: 600;
  color: #9b9b9b;
  min-width: 72px;
`;

export const SideCardValue = styled.span`
  font-size: 16px;
  font-weight: 600;
  color: #828282;
`;

export const SideCardButton = styled(PrimaryButton)`
  margin-top: 40px;
`;
