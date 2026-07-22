import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import * as S from "./styles";

import copperDubi from "../../assets/image/profile/dubi-rank/copper-dubi.png";
import silverDubi from "../../assets/image/profile/dubi-rank/silver-dubi.png";
import ironDubi from "../../assets/image/profile/dubi-rank/iron-dubi.png";
import goldDubi from "../../assets/image/profile/dubi-rank/gold-dubi.png";
import godDubi from "../../assets/image/profile/dubi-rank/god-dubi.png";
import jadeDubi from "../../assets/image/profile/dubi-rank/jade-dubi.png";
import wispDubi from "../../assets/image/profile/dubi-rank/wisp.png";

import { Header } from "../../components/header";
import { Footer } from "../../components/footer";
import {
  ProfileSidebar,
  TierCard,
  StreakCard,
  HeatmapCard,
} from "../../components/profile";
import userApi from "../../api/userApi";

interface UserData {
  id?: number;
  name?: string;
  nickname?: string;
  tier?: string;
  score?: number;
}

type ContributionsResponse = Record<string, number>;

interface StreakResponse {
  streak?: number;
}

interface HeatmapCellData {
  date: string;
  intensity: string;
  solved: number;
}

const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Get day of week (0 = Monday, 6 = Sunday)
const getDayOfWeek = (date: Date): number => {
  const day = date.getDay();
  return day === 0 ? 6 : day - 1; // Convert Sunday(0) to 6, Monday(1) to 0
};

// Transform contributions data to heatmap format (23 weeks × 7 days)
const generateHeatmapData = (
  contributions: ContributionsResponse = {},
): HeatmapCellData[][] => {
  const data: HeatmapCellData[][] = Array.from({ length: 23 }, () => []);
  const today = new Date();

  const endDate = new Date(today);
  endDate.setDate(today.getDate() + 2);

  const startDate = new Date(endDate);
  startDate.setDate(endDate.getDate() - 160);

  const startDayOfWeek = getDayOfWeek(startDate);
  const firstMonday = new Date(startDate);
  firstMonday.setDate(startDate.getDate() - startDayOfWeek);

  for (let week = 0; week < 23; week++) {
    for (let day = 0; day < 7; day++) {
      const cellDate = new Date(firstMonday);
      cellDate.setDate(firstMonday.getDate() + week * 7 + day);

      const dateStr = formatDate(cellDate);
      const solved = contributions[dateStr] || 0;

      let intensity = "0";
      if (solved > 0) {
        if (solved >= 3) intensity = "100";
        else if (solved >= 2) intensity = "60";
        else intensity = "20";
      }

      data[week].push({ date: dateStr, intensity, solved });
    }
  }

  return data;
};

const getTierImage = (score: number): string => {
  if (score >= 5000) return godDubi;
  if (score >= 3000) return jadeDubi;
  if (score >= 1000) return goldDubi;
  if (score >= 500) return silverDubi;
  if (score >= 150) return ironDubi;
  if (score >= 50) return copperDubi;
  return wispDubi;
};

const getTierBackgroundColor = (score: number): string => {
  if (score >= 5000) {
    return "linear-gradient(180deg, #EBD7B6 0%, #BA98C1 50%, #868BB7 75%, #537FAC 100%)";
  }
  if (score >= 3000) return "#11541F";
  if (score >= 1000) return "#98712B";
  if (score >= 500) return "#919191";
  if (score >= 150) return "#312925";
  if (score >= 50) return "#AC846E";
  return "#0191F8";
};

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
  score: number,
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
  const [heatmapData, setHeatmapData] = useState<HeatmapCellData[][]>(
    generateHeatmapData(),
  );
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);

  const handleLogout = async () => {
    try {
      await userApi.logout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      toast.success("로그아웃되었습니다.");
      setTimeout(() => {
        window.location.assign("/login");
      }, 500);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await userApi.deleteAccount();
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      window.location.assign("/");
    } catch (error) {
      console.error("Failed to delete account:", error);
      alert("회원탈퇴에 실패했습니다. 다시 시도해주세요.");
    }
  };

  useEffect(() => {
    Object.keys(localStorage).forEach((key) => {
      if (
        key.startsWith("dukkaebi_codes_") ||
        key.startsWith("dukkaebi_timeSpent_") ||
        key.startsWith("dukkaebi_submitted_")
      ) {
        localStorage.removeItem(key);
      }
    });
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const today = new Date();

        const endDate = new Date(today);
        endDate.setDate(today.getDate() + 2);

        const startDate = new Date(endDate);
        startDate.setDate(endDate.getDate() - 160);

        const [userResponse, contributionsResponse, streakResponse] =
          await Promise.all([
            userApi.getUser<UserData>(),
            userApi.getContributions<ContributionsResponse>(
              formatDate(startDate),
              formatDate(endDate),
            ),
            userApi.getStreak<StreakResponse>(),
          ]);

        const userData =
          (userResponse as UserData & { data?: UserData })?.data ||
          userResponse;

        if (userData?.name || userData?.nickname) {
          setName(userData.name || userData.nickname || "");
        }
        if (userData?.score !== undefined && userData?.score !== null) {
          setScore(userData.score);
        }

        const contributionsData = contributionsResponse || {};
        setHeatmapData(generateHeatmapData(contributionsData));

        const streakData =
          (streakResponse as StreakResponse & { data?: StreakResponse })
            ?.data || streakResponse;
        setStreak(
          typeof streakData?.streak === "number" ? streakData.streak : 0,
        );
      } catch (error) {
        console.error("Failed to fetch profile data:", error);
        setHeatmapData(generateHeatmapData());
        setStreak(0);
      }
    };

    fetchUserData();
  }, []);

  const tierProgress = getTierProgress(score);

  return (
    <S.PageWrapper>
      <Header />

      {/* Main Content */}
      <S.MainContent>
        <S.ContentWrapper>
          {/* Left Sidebar - Profile Info */}
          <ProfileSidebar
            name={name}
            onLogout={handleLogout}
            onDeleteAccount={() => setShowDeleteModal(true)}
          />

          <S.RightContent>
            <TierCard
              tierImage={getTierImage(score)}
              backgroundColor={getTierBackgroundColor(score)}
              tierName={getTierName(score)}
              score={score}
              tierProgress={tierProgress}
            />

            <StreakCard streak={streak} />

            <HeatmapCard heatmapData={heatmapData} />
          </S.RightContent>
        </S.ContentWrapper>
      </S.MainContent>

      <Footer />

      {showDeleteModal && (
        <S.ModalOverlay onClick={() => setShowDeleteModal(false)}>
          <S.ModalContent onClick={(e) => e.stopPropagation()}>
            <S.ModalTitle>회원탈퇴</S.ModalTitle>
            <S.ModalDescription>
              정말 탈퇴하시겠습니까? 탈퇴 시 모든 데이터가 삭제되며 복구할 수
              없습니다.
            </S.ModalDescription>
            <S.ModalButtons>
              <S.ModalButton onClick={() => setShowDeleteModal(false)}>
                취소
              </S.ModalButton>
              <S.ModalButton $danger onClick={handleDeleteAccount}>
                탈퇴하기
              </S.ModalButton>
            </S.ModalButtons>
          </S.ModalContent>
        </S.ModalOverlay>
      )}
    </S.PageWrapper>
  );
};
export default Profile;
