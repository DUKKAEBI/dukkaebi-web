import { Link } from "react-router-dom";
import * as S from "./styles";

import dubiProfileImage from "../../assets/image/profile/dubi-profile.png";
import profileImage from "../../assets/image/profile/profile_image.svg";
import fireIcon from "../../assets/image/profile/solar_fire-bold-duotone.svg";
import { Header } from "../../components/header";
import { Footer } from "../../components/footer";

const Profile = () => {
  // Mock data for heatmap
  const generateHeatmapData = () => {
    const data = [];
    for (let week = 0; week < 23; week++) {
      const weekData = [];
      for (let day = 0; day < 7; day++) {
        // Add some sample activity
        if (week === 10 && day === 0) weekData.push("20");
        else if (week === 10 && day === 1) weekData.push("60");
        else if (week === 10 && day === 2) weekData.push("100");
        else if (week === 10 && day === 3) weekData.push("20");
        else if (week === 0 && day === 2) weekData.push("20");
        else weekData.push("0");
      }
      data.push(weekData);
    }
    return data;
  };

  const heatmapData = generateHeatmapData();

  return (
    <S.PageWrapper>
      {/* Header */}
      <Header />

      {/* Main Content */}
      <S.MainContent>
        <S.ContentWrapper>
          {/* Left Sidebar - Profile Info */}
          <S.Sidebar>
            <S.ProfileSection>
              <S.ProfileImage src={profileImage} alt="profile" />
              <S.UserName>이윤하</S.UserName>
              <S.Divider />
            </S.ProfileSection>

            <S.StatsSection>
              <S.StatItem>
                <S.StatLabel>맞은 문제</S.StatLabel>
                <S.StatValue>200</S.StatValue>
              </S.StatItem>
              <S.StatItem>
                <S.StatLabel>제출</S.StatLabel>
                <S.StatValue>300</S.StatValue>
              </S.StatItem>
              <S.StatItem>
                <S.StatLabel>틀린 문제</S.StatLabel>
                <S.StatValue>100</S.StatValue>
              </S.StatItem>
              <S.StatItem>
                <S.StatLabel error>시간 초과</S.StatLabel>
                <S.StatValue>18</S.StatValue>
              </S.StatItem>
              <S.StatItem>
                <S.StatLabel error>메모리 초과</S.StatLabel>
                <S.StatValue>20</S.StatValue>
              </S.StatItem>
              <S.StatItem>
                <S.StatLabel error>런타임에러</S.StatLabel>
                <S.StatValue>1</S.StatValue>
              </S.StatItem>
              <S.StatItem>
                <S.StatLabel error>컴파일에러</S.StatLabel>
                <S.StatValue>2</S.StatValue>
              </S.StatItem>
            </S.StatsSection>
          </S.Sidebar>

          {/* Right Content Area */}
          <S.RightContent>
            {/* Tier Card */}
            <S.TierCard>
              <S.TierCharacter src={dubiProfileImage} alt="tier character" />
              <S.TierInfo>
                <S.TierBadge>
                  <S.TierName>동깨비</S.TierName>
                  <S.TierProgress>철깨비까지 50점</S.TierProgress>
                  <S.ProgressBarContainer>
                    <S.ProgressBarFill progress={55} />
                  </S.ProgressBarContainer>
                </S.TierBadge>
                <S.TierScore>100점</S.TierScore>
              </S.TierInfo>
            </S.TierCard>

            {/* Streak Card */}
            <S.StreakCard>
              <S.StreakIcon>
                <img
                  src={fireIcon}
                  alt="fire"
                  style={{ width: "100%", height: "100%" }}
                />
              </S.StreakIcon>
              <S.StreakInfo>
                <S.StreakLabel>연속 학습일</S.StreakLabel>
                <S.StreakValue>3일</S.StreakValue>
              </S.StreakInfo>
            </S.StreakCard>

            {/* Heatmap Card */}
            <S.HeatmapCard>
              <S.MonthLabels>
                <S.MonthLabel>Jan</S.MonthLabel>
                <S.MonthLabel>Feb</S.MonthLabel>
                <S.MonthLabel>Mar</S.MonthLabel>
                <S.MonthLabel>Apr</S.MonthLabel>
                <S.MonthLabel>May</S.MonthLabel>
                <S.MonthLabel>Jun</S.MonthLabel>
                <S.MonthLabel>Jul</S.MonthLabel>
                <S.MonthLabel>Aug</S.MonthLabel>
              </S.MonthLabels>

              <S.HeatmapContainer>
                <S.DayLabels>
                  <S.DayLabel>M</S.DayLabel>
                  <S.DayLabel>T</S.DayLabel>
                  <S.DayLabel>S</S.DayLabel>
                </S.DayLabels>

                <S.HeatmapGrid>
                  {heatmapData.map((week, weekIndex) => (
                    <S.HeatmapWeek key={weekIndex}>
                      {week.map((intensity, dayIndex) => (
                        <S.HeatmapCell key={dayIndex} intensity={intensity} />
                      ))}
                    </S.HeatmapWeek>
                  ))}
                </S.HeatmapGrid>
              </S.HeatmapContainer>
            </S.HeatmapCard>
          </S.RightContent>
        </S.ContentWrapper>
      </S.MainContent>

      {/* Footer */}
      <Footer />
    </S.PageWrapper>
  );
};

export default Profile;
