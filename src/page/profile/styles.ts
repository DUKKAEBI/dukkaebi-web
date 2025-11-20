import styled from "styled-components";

// Page Layout
export const PageWrapper = styled.div`
  width: 100%;
  min-height: 100vh;
  background: white;
  font-family: Pretendard, -apple-system, BlinkMacSystemFont, system-ui,
    sans-serif;
  color: #1d1d1d;
`;

// Header Styles
export const Header = styled.header`
  width: 100%;
  height: 80px;
  background: white;
  border-bottom: 1px solid #ededed;
  position: sticky;
  top: 0;
  z-index: 100;
`;

export const HeaderContent = styled.div`
  width: 100%;
  height: 100%;
  padding: 0 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const HeaderLeft = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 40px;
`;

export const Logo = styled.div`
  width: 80px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: between;
  cursor: pointer;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

export const Nav = styled.nav`
  display: flex;
  gap: 20px;
`;

export const NavLink = styled.a`
  color: #1d1d1d;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
  transition: color 0.2s;

  &:hover {
    color: #00b4b7;
  }
`;

export const UserIcon = styled.div`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

// Main Content
export const MainContent = styled.main`
  padding: 72px 40px;
  display: flex;
  justify-content: center;
`;

export const ContentWrapper = styled.div`
  width: 100%;
  max-width: 886px;
  display: flex;
  gap: 120px;
`;

// Left Sidebar
export const Sidebar = styled.div`
  width: 216px;
  display: flex;
  flex-direction: column;
  gap: 32px;
  flex-shrink: 0;
`;

export const ProfileSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const ProfileImage = styled.img`
  width: 184px;
  height: 184px;
  object-fit: cover;
  border-radius: 4px;
`;

export const UserName = styled.div`
  color: black;
  font-size: 20px;
  font-weight: 600;
`;

export const Divider = styled.div`
  width: 100%;
  height: 1px;
  background: #e0e0e0;
  margin-top: 8px;
`;

export const StatsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const StatItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const StatLabel = styled.div<{ $error?: boolean }>`
  color: ${(props) => (props.$error ? "#EB5757" : "#1d1d1d")};
  font-size: 14px;
  font-weight: 500;
`;

export const StatValue = styled.div`
  color: #bdbdbd;
  font-size: 14px;
  font-weight: 500;
`;

// Right Content Area
export const RightContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-top: 20px;
`;

// Tier Card
export const TierCard = styled.div<{ $backgroundColor: string }>`
  width: 100%;
  height: 160px;
  padding: 20px 24px 20px 20px;
  background: ${(props) => props.$backgroundColor};
  border-radius: 8px;
  display: flex;
  align-items: flex-end;
  gap: 21px;
`;

export const TierCharacter = styled.img`
  width: 160px;
  height: 160px;
  object-fit: contain;
  margin-bottom: -20px;
`;

export const TierInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 12px;
`;

export const TierBadge = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
`;

export const TierName = styled.div`
  color: white;
  font-size: 32px;
  font-weight: 600;
`;

export const TierProgress = styled.div`
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  font-weight: 500;
`;

export const ProgressBarContainer = styled.div`
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 999px;
  overflow: hidden;
  margin-top: 5px;
`;

export const ProgressBarFill = styled.div<{ progress: number }>`
  height: 100%;
  width: ${(props) => props.progress}%;
  background: rgba(255, 255, 255, 0.6);
  transition: width 0.3s ease;
`;

export const TierScore = styled.div`
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  font-weight: 500;
`;

// Streak Card
export const StreakCard = styled.div`
  width: 100%;
  padding: 20px;
  background: #f6f6f6;
  border-radius: 8px;
  border: 1px solid #ededed;
  display: flex;
  gap: 12px;
  align-items: center;
`;

export const StreakIcon = styled.div`
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

export const StreakInfo = styled.div`
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

// Heatmap Card
export const HeatmapCard = styled.div`
  width: 100%;
  padding: 24px 20px;
  background: #f6f6f6;
  border-radius: 8px;
  border: 1px solid #ededed;
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding-left: 30px;
`;

export const MonthLabels = styled.div`
  padding-left: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: calc(100% - 18px);
`;

export const MonthLabel = styled.div`
  color: #bdbdbd;
  font-size: 14px;
  font-weight: 500;
`;

export const HeatmapContainer = styled.div`
  align-self: stretch;
  padding-top: 5px;
  display: flex;
  justify-content: flex-start;
  align-items: flex-end;
  gap: 12px;
`;

export const DayLabels = styled.div`
  width: 13px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 42px;
`;

export const DayLabel = styled.div`
  color: #bdbdbd;
  font-size: 14px;
  font-weight: 500;
`;

export const HeatmapGrid = styled.div`
  justify-content: center;
  align-items: center;
  gap: 4px;
  display: flex;
`;

export const HeatmapWeek = styled.div`
  width: 16px;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  gap: 4px;
  display: inline-flex;
`;

export const HeatmapCell = styled.div<{ $intensity: string }>`
  align-self: stretch;
  height: 16px;
  border-radius: 2px;
  background: ${(props) => {
    switch (props.$intensity) {
      case "100":
        return "#00b4b7";
      case "60":
        return "rgba(0, 180, 183, 0.60)";
      case "20":
        return "rgba(0, 180, 183, 0.20)";
      default:
        return "#e0e0e0";
    }
  }};
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
    z-index: 10;
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
    z-index: 10;
  }

  &:hover::after,
  &:hover::before {
    opacity: 1;
    transform: translate(-50%, -4px);
  }
`;

// Footer Styles
export const Footer = styled.footer`
  width: 100%;
  background: #f6f6f6;
  border-top: 1px solid #ededed;
  padding: 49px 0;
`;

export const FooterContent = styled.div`
  width: 100%;
  padding: 0 40px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

export const FooterTop = styled.div`
  display: flex;
  align-items: center;
`;

export const FooterLogo = styled.img`
  height: 18px;
  object-fit: contain;
`;

export const FooterInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

export const FooterText = styled.div`
  color: #bdbdbd;
  font-size: 14px;
  font-weight: 500;
`;

export const FooterLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const FooterLink = styled.div`
  color: #bdbdbd;
  font-size: 14px;
  font-weight: 600;
  text-decoration: underline;
  cursor: pointer;

  &:hover {
    color: #828282;
  }
`;

export const FooterBottom = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const Copyright = styled.div`
  color: #bdbdbd;
  font-size: 14px;
  font-weight: 500;
`;

export const SocialIcon = styled.img`
  width: 24px;
  height: 24px;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.7;
  }
`;
