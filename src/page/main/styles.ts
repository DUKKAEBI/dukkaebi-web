import styled from "styled-components";

// Page Layout
export const PageWrapper = styled.div`
  width: 100vw;
  min-height: 100vh;
  background: white;
  font-family: Pretendard, -apple-system, BlinkMacSystemFont, system-ui,
    sans-serif;
  color: #1d1d1d;
`;

export const UserIconInner = styled.div`
  width: 12px;
  height: 18px;
  position: absolute;
  left: 6px;
  top: 3px;
  outline: 2px solid #828282;
`;

// Main Content
export const MainContent = styled.main`
  margin: 0 auto;
  padding: 26px 40px 60px;
  min-height: 70vh;
`;

// Hero Section Styles
export const HeroSection = styled.section`
  display: flex;
  gap: 20px;
  margin-bottom: 40px;

  @media (max-width: 1024px) {
    flex-direction: column;
  }
`;

export const HeroCard = styled.div`
  flex: 1;
  min-width: 0;
  height: 300px;
  background: linear-gradient(
    310deg,
    rgba(190, 218, 218, 0.2) 0%,
    rgba(218, 226, 239, 0.6) 50%,
    #ffe2e2 100%
  );
  border-radius: 8px;
  padding: 40px;
  position: relative;
  overflow: hidden;
`;

export const HeroText = styled.div`
  max-width: 448px;
  position: relative;
  z-index: 2;
`;

export const HeroTitle = styled.h1`
  color: #1d1d1d;
  font-size: 20px;
  font-weight: 600;
  line-height: 28px;
  margin: 0 0 12px 0;
  text-align: left;
`;

export const HeroSubtitle = styled.p`
  color: #828282;
  font-size: 14px;
  font-weight: 500;
  line-height: 22.4px;
  margin: 0;
  text-align: left;
`;

export const HeroImagePlaceholder = styled.div`
  width: 388px;
  height: 388px;
  background: #f6f6f6;
  border-radius: 8px;
  position: absolute;
  right: -44px;
  bottom: -44px;
  z-index: 1;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
`;

export const DubiImage = styled.img`
  position: absolute;
  right: -5px;
  bottom: 0;
  width: 350px;
  height: auto;
  z-index: 1;
`;

// Stats Card Styles
export const StatsCard = styled.div`
  width: 468px;
  height: 300px;
  background: #f6f6f6;
  border: 1px solid #ededed;
  border-radius: 8px;
  padding: 30px;
  display: flex;
  flex-direction: column;
  gap: 24px;

  @media (max-width: 1024px) {
    width: 100%;
  }
`;

export const StreakInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const StreakContent = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const StreakIcon = styled.div`
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

export const StreakText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const StreakLabel = styled.div`
  color: #1d1d1d;
  font-size: 14px;
  font-weight: 600;
`;

export const StreakValue = styled.div`
  color: #1d1d1d;
  font-size: 20px;
  font-weight: 600;
`;

export const Divider = styled.div`
  width: 100%;
  height: 1px;
  background: #e0e0e0;
`;

// Heatmap Styles
export const HeatmapSection = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 20px;
  padding-left: 13px;
`;

export const DayLabels = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 42px;
`;

export const DayLabel = styled.div`
  color: #bdbdbd;
  font-size: 14px;
  font-weight: 500;
  width: 13px;
  text-align: center;
`;

export const HeatmapGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(17, 16px);
  grid-template-rows: repeat(7, 16px);
  gap: 5px;
  grid-auto-flow: column;
`;

export const HeatmapCell = styled.div<{ $intensity: string }>`
  width: 16px;
  height: 16px;
  border-radius: 2px;
  background: ${({ $intensity }) =>
    $intensity === "100"
      ? "#00B4B7"
      : $intensity === "60"
      ? "rgba(0, 180, 183, 0.6)"
      : $intensity === "20"
      ? "rgba(0, 180, 183, 0.2)"
      : "#E0E0E0"};
  position: relative;
  cursor: pointer;

  &::after {
    content: attr(data-tooltip);
    position: absolute;
    top: -32px;
    left: 50%;
    transform: translate(-50%, 0);
    background: rgba(0, 0, 0, 0.85);
    color: #fff;
    font-size: 12px;
    padding: 4px 8px;
    border-radius: 4px;
    white-space: nowrap;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.15s ease, transform 0.15s ease;
    z-index: 5;
  }

  &::before {
    content: "";
    position: absolute;
    top: -8px;
    left: 50%;
    transform: translate(-50%, 0);
    border: 6px solid transparent;
    border-top-color: rgba(0, 0, 0, 0.85);
    opacity: 0;
    transition: opacity 0.15s ease;
    z-index: 5;
  }

  &:hover::after,
  &:hover::before {
    opacity: 1;
    transform: translate(-50%, -4px);
  }
`;

// Learning Section Styles
export const LearningSection = styled.section`
  margin-top: 40px;
`;

export const SectionHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 24px;
  align-items: flex-start;
`;

export const SectionLabel = styled.div`
  color: #828282;
  font-size: 14px;
  font-weight: 500;
  text-align: left;
`;

export const SectionTitle = styled.h2`
  color: #1d1d1d;
  font-size: 18px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  text-align: left;
`;

export const ArrowIcon = styled.div`
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

// Course Card Styles
export const CourseGrid = styled.div`
  display: flex;
  gap: 20px;
  overflow-x: auto;
  padding-bottom: 8px;

  /* 스크롤바 숨기기 */
  -ms-overflow-style: none;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

export const CourseCard = styled.article`
  height: 240px;
  width: 224px;
  background: #f6f6f6;
  border: 1px solid #ededed;
  border-radius: 8px;
  padding: 24px 20px 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 20px;
  transition: all 0.2s;

  &:hover {
    border-color: #00b4b7;
    box-shadow: 0 4px 12px rgba(0, 180, 183, 0.1);
  }
`;

export const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const CardHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
`;

export const Difficulty = styled.div`
  display: flex;
  color: #00b4b7;
  font-size: 12px;
  font-weight: 500;
  text-align: center;
  width: 100%;
`;

export const CardTitle = styled.h3`
  display: flex;
  color: black;
  font-size: 16px;
  font-weight: 500;
  margin: 0;
  text-align: center;
  width: 100%;
`;

export const TagList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  justify-content: flex-start;
`;

export const Tag = styled.span`
  padding: 4px 16px;
  background: white;
  border: 1px solid #ededed;
  border-radius: 4px;
  color: #828282;
  font-size: 14px;
  font-weight: 500;
`;

export const SolveButton = styled.button`
  width: 100%;
  padding: 8px 24px;
  background: #00b4b7;
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #009a9d;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 180, 183, 0.2);
  }

  &:active {
    transform: translateY(0);
  }
`;
