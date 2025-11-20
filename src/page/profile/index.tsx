import { useState, useEffect } from "react";
import * as S from "./styles";
import copperDubi from "../../assets/image/profile/dubi-rank/copper-dubi.png";
import silverDubi from "../../assets/image/profile/dubi-rank/silver-dubi.png";
import ironDubi from "../../assets/image/profile/dubi-rank/iron-dubi.png";
import goldDubi from "../../assets/image/profile/dubi-rank/gold-dubi.png";
import godDubi from "../../assets/image/profile/dubi-rank/god-dubi.png";
import jadeDubi from "../../assets/image/profile/dubi-rank/jade-dubi.png";
import wispDubi from "../../assets/image/profile/dubi-rank/wisp.png";

import profileImage from "../../assets/image/profile/profile_image.svg";
import fireIcon from "../../assets/image/profile/solar_fire-bold-duotone.svg";
import { Header } from "../../components/header";
import { Footer } from "../../components/footer";
import axiosInstance from "../../api/axiosInstance";

interface StudyDay {
  date: string;
  solved: number;
}

interface StudyMonth {
  year: number;
  month: number;
  days: StudyDay[];
}

interface UserData {
  id?: number;
  name?: string;
  nickname?: string;
  tier?: string;
  streak?: number;
  score?: number;
  studys?: StudyMonth[];
}

// Transform studys data to heatmap format (23 weeks × 7 days)
const generateHeatmapData = (studys: StudyMonth[]): string[][] => {
  const data: string[][] = [];
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - (23 * 7 - 1)); // 23 weeks ago

  // Create a map of date -> solved count
  const solvedMap = new Map<string, number>();
  studys.forEach((study) => {
    study.days.forEach((day) => {
      solvedMap.set(day.date, day.solved);
    });
  });

  // Generate heatmap cells (23 weeks × 7 days)
  for (let week = 0; week < 23; week++) {
    const weekData: string[] = [];
    for (let day = 0; day < 7; day++) {
      const cellDate = new Date(startDate);
      cellDate.setDate(startDate.getDate() + week * 7 + day);

      const dateStr = cellDate.toISOString().split("T")[0];
      const solved = solvedMap.get(dateStr) || 0;

      // Map solved count to intensity
      let intensity = "0";
      if (solved > 0) {
        if (solved >= 3) intensity = "100";
        else if (solved >= 2) intensity = "60";
        else intensity = "20";
      }

      weekData.push(intensity);
    }
    data.push(weekData);
  }

  return data;
};

// Get tier image based on score
const getTierImage = (score: number): string => {
  if (score >= 5000) return godDubi;
  if (score >= 3000) return jadeDubi;
  if (score >= 1000) return goldDubi;
  if (score >= 500) return silverDubi;
  if (score >= 150) return ironDubi;
  if (score >= 50) return copperDubi;
  return wispDubi;
};

// Get tier background color based on score
const getTierBackgroundColor = (score: number): string => {
  if (score >= 5000) {
    // godDubi: gradient
    return "linear-gradient(180deg, #EBD7B6 0%, #BA98C1 50%, #868BB7 75%, #537FAC 100%)";
  }
  if (score >= 3000) return "#11541F"; // jadeDubi
  if (score >= 1000) return "#98712B"; // goldDubi
  if (score >= 500) return "#919191"; // silverDubi
  if (score >= 150) return "#312925"; // ironDubi
  if (score >= 50) return "#AC846E"; // copperDubi
  return "#0191F8"; // wispDubi
};

// Get tier name based on score
const getTierName = (score: number): string => {
  if (score >= 5000) return "신깨비";
  if (score >= 3000) return "옥깨비";
  if (score >= 1000) return "금깨비";
  if (score >= 500) return "은깨비";
  if (score >= 150) return "철깨비";
  if (score >= 50) return "동깨비";
  return "도깨비불";
};

// Get next tier threshold and progress
const getTierProgress = (
  score: number
): { nextTier: string; nextScore: number; progress: number } => {
  if (score >= 5000) {
    return { nextTier: "", nextScore: 5000, progress: 100 };
  }
  if (score >= 3000) {
    const nextScore = 5000;
    const progress = ((score - 3000) / (nextScore - 3000)) * 100;
    return { nextTier: "신깨비", nextScore, progress: Math.min(progress, 100) };
  }
  if (score >= 1000) {
    const nextScore = 3000;
    const progress = ((score - 1000) / (nextScore - 1000)) * 100;
    return { nextTier: "옥깨비", nextScore, progress: Math.min(progress, 100) };
  }
  if (score >= 500) {
    const nextScore = 1000;
    const progress = ((score - 500) / (nextScore - 500)) * 100;
    return { nextTier: "금깨비", nextScore, progress: Math.min(progress, 100) };
  }
  if (score >= 150) {
    const nextScore = 500;
    const progress = ((score - 150) / (nextScore - 150)) * 100;
    return { nextTier: "은깨비", nextScore, progress: Math.min(progress, 100) };
  }
  if (score >= 50) {
    const nextScore = 150;
    const progress = ((score - 50) / (nextScore - 50)) * 100;
    return { nextTier: "철깨비", nextScore, progress: Math.min(progress, 100) };
  }
  const nextScore = 50;
  const progress = (score / nextScore) * 100;
  return { nextTier: "동깨비", nextScore, progress: Math.min(progress, 100) };
};

const Profile = () => {
  const [name, setName] = useState<string>("");
  const [streak, setStreak] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [heatmapData, setHeatmapData] = useState<string[][]>([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axiosInstance.get<UserData>("/user");
        console.log("Full API Response:", response);
        console.log("Response Data:", response.data);

        // Handle both direct and nested response structures
        const userData =
          (response.data as UserData & { data?: UserData })?.data ||
          response.data;

        console.log("User Data:", userData);
        console.log("Name/Nickname:", userData?.name || userData?.nickname);
        console.log("Streak:", userData?.streak);
        console.log("Score:", userData?.score);

        // Use nickname if name is not available
        if (userData?.name || userData?.nickname) {
          setName(userData.name || userData.nickname || "");
        }
        if (userData?.streak !== undefined && userData?.streak !== null) {
          setStreak(userData.streak);
        } else {
          // Default to 0 if streak is not provided
          setStreak(0);
        }
        if (userData?.score !== undefined && userData?.score !== null) {
          setScore(userData.score);
        }

        // Transform studys data to heatmap format
        if (userData?.studys && Array.isArray(userData.studys)) {
          const heatmap = generateHeatmapData(userData.studys);
          setHeatmapData(heatmap);
        } else {
          // Initialize empty heatmap if studys is not provided
          const emptyHeatmap = Array.from({ length: 23 }, () =>
            Array.from({ length: 7 }, () => "0")
          );
          setHeatmapData(emptyHeatmap);
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const tierProgress = getTierProgress(score);

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
              <S.UserName>{name || "로딩 중..."}</S.UserName>
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
            <S.TierCard backgroundColor={getTierBackgroundColor(score)}>
              <S.TierCharacter src={getTierImage(score)} alt="tier character" />
              <S.TierInfo>
                <S.TierBadge>
                  <S.TierName>{getTierName(score)}</S.TierName>
                  {tierProgress.nextTier && (
                    <S.TierProgress>
                      {tierProgress.nextTier}까지{" "}
                      {tierProgress.nextScore - score}점
                    </S.TierProgress>
                  )}
                  <S.ProgressBarContainer>
                    <S.ProgressBarFill progress={tierProgress.progress} />
                  </S.ProgressBarContainer>
                </S.TierBadge>
                <S.TierScore>{score}점</S.TierScore>
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

                <S.StreakValue>{streak}일</S.StreakValue>
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
                  {heatmapData.length > 0
                    ? heatmapData.map((week, weekIndex) => (
                        <S.HeatmapWeek key={weekIndex}>
                          {week.map((intensity, dayIndex) => (
                            <S.HeatmapCell
                              key={dayIndex}
                              intensity={intensity}
                            />
                          ))}
                        </S.HeatmapWeek>
                      ))
                    : // Show empty heatmap while loading
                      Array.from({ length: 23 }).map((_, weekIndex) => (
                        <S.HeatmapWeek key={weekIndex}>
                          {Array.from({ length: 7 }).map((_, dayIndex) => (
                            <S.HeatmapCell key={dayIndex} intensity="0" />
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
