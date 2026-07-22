import { useEffect, useMemo, useState } from "react";
import * as S from "./styles";
import { Header } from "../../components/header";
import { Footer } from "../../components/footer";
import { HeroSection, StatsCard, NoticeSection } from "../../components/main";
import noticeApi from "../../api/noticeApi";
import userApi from "../../api/userApi";
import { useNavigate } from "react-router-dom";

type ContributionsResponse = Record<string, number>;

interface StreakResponse {
  streak?: number;
}

interface HeatmapCellData {
  date: string;
  intensity: string;
  solved: number;
}

interface Notice {
  noticeId: number;
  title: string;
  writer: string;
  date: string;
  content: string;
  fileUrl?: string;
}

const WEEKS_TO_DISPLAY = 17;

const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * 푼 문제 수를 히트맵 색상 강도로 변환
 * @param {number} solved - 푼 문제 수
 * @returns {string} 강도 값 ("0", "20", "60", "100")
 */
const mapSolvedToIntensity = (solved: number): string => {
  if (solved >= 3) return "100"; // 3문제 이상: 가장 진한 색
  if (solved >= 2) return "60";  // 2문제: 중간 색
  if (solved >= 1) return "20";  // 1문제: 연한 색
  return "0";                    // 0문제: 회색
};

/**
 * 히트맵 데이터 생성 함수
 * @param {ContributionsResponse} contributions - 날짜별 문제 풀이 수 데이터
 * @returns {HeatmapCellData[]} 17주간의 히트맵 셀 데이터 배열
 */
const generateHeatmapData = (
  contributions: ContributionsResponse = {},
): HeatmapCellData[] => {
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - (WEEKS_TO_DISPLAY * 7 - 1));

  const cells: HeatmapCellData[] = [];

  for (let index = 0; index < WEEKS_TO_DISPLAY * 7; index++) {
    const cellDate = new Date(startDate);
    cellDate.setDate(startDate.getDate() + index);

    const dateStr = formatDate(cellDate);
    const solved = contributions[dateStr] || 0;

    cells.push({
      date: dateStr,
      solved,
      intensity: mapSolvedToIntensity(solved),
    });
  }

  return cells;
};

const Main = () => {
  const [streak, setStreak] = useState(0);
  const [contributions, setContributions] = useState<ContributionsResponse>({});
  const [notices, setNotices] = useState<Notice[]>([]);

  const navigate = useNavigate();

  const handleNoticeClick = (id: number) => {
    navigate(`/notifications/${id}`);
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
    const fetchActivity = async () => {
      try {
        const today = new Date();
        const contributionsStart = new Date(
          today.getFullYear(),
          today.getMonth() - 1,
          1,
        );
        const contributionsEnd = new Date(
          today.getFullYear(),
          today.getMonth() + 1,
          1,
        );

        const [contributionsResponse, streakResponse, noticeResponse] =
          await Promise.all([
            userApi.getContributions<ContributionsResponse>(
              formatDate(contributionsStart),
              formatDate(contributionsEnd),
            ),
            userApi.getStreak<StreakResponse>(),
            noticeApi.getHomeNotices<{ content: Notice[] }>(),
          ]);

        const contributionsData =
          (contributionsResponse as any)?.data || contributionsResponse || {};
        setContributions(contributionsData);

        const streakData = (streakResponse as any)?.data || streakResponse;
        setStreak(
          typeof streakData?.streak === "number" ? streakData.streak : 0,
        );

        const noticeData =
          (noticeResponse as any)?.content || noticeResponse || [];
        setNotices(noticeData.slice(0, 5));
      } catch (error) {
        console.error("Failed to load home data:", error);
      }
    };

    fetchActivity();
  }, []);

  const heatmapData = useMemo(
    () => generateHeatmapData(contributions),
    [contributions],
  );

  return (
    <S.PageWrapper>
      <Header />

      <S.MainContent>
        <S.HeroSection>
          <HeroSection />

          <StatsCard streak={streak} heatmapData={heatmapData} />
        </S.HeroSection>

        <NoticeSection notices={notices} onNoticeClick={handleNoticeClick} />
      </S.MainContent>

      <Footer />
    </S.PageWrapper>
  );
};

export default Main;
