import { useEffect, useMemo, useState } from "react";
import * as S from "./styles";
import dubiImage from "../../assets/image/main/dubi.png";
import fireIcon from "../../assets/image/main/solar_fire-bold-duotone.svg";
import arrowIcon from "../../assets/image/main/arrow.svg";
import { Header } from "../../components/header";
import { Footer } from "../../components/footer";
import axiosInstance from "../../api/axiosInstance";

type ContributionsResponse = Record<string, number>;

interface StreakResponse {
  streak?: number;
}

interface HeatmapCellData {
  date: string;
  intensity: string;
  solved: number;
}

const WEEKS_TO_DISPLAY = 17;

const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const mapSolvedToIntensity = (solved: number): string => {
  if (solved >= 3) return "100";
  if (solved >= 2) return "60";
  if (solved >= 1) return "20";
  return "0";
};

const generateHeatmapData = (
  contributions: ContributionsResponse = {}
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

const recommendedCourses = [
  {
    id: 1,
    difficulty: "난이도 : 상",
    title: "자료구조 알고리즘",
    tags: ["#큐", "#스택", "#이진탐색", "#그래프"],
  },
  {
    id: 2,
    difficulty: "난이도 : 중",
    title: "DP 집중 연습",
    tags: ["#dp", "#동적계획법", "#냅색", "#계단오르기"],
  },
  {
    id: 3,
    difficulty: "난이도 : 중상",
    title: "그리디 & 구현",
    tags: ["#그리디", "#시뮬레이션", "#구현", "#정렬"],
  },
  {
    id: 4,
    difficulty: "난이도 : 하",
    title: "입출력 리마인드",
    tags: ["#입출력", "#문자열", "#기본구현"],
  },
  {
    id: 5,
    difficulty: "난이도 : 상",
    title: "그래프 최단거리",
    tags: ["#다익스트라", "#벨만포드", "#플로이드워셜"],
  },
];

const Main = () => {
  const [streak, setStreak] = useState(0);
  const [contributions, setContributions] = useState<ContributionsResponse>({});

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const today = new Date();
        const contributionsStart = new Date(
          today.getFullYear(),
          today.getMonth() - 1,
          1
        );
        const contributionsEnd = new Date(
          today.getFullYear(),
          today.getMonth() + 1,
          1
        );

        const [contributionsResponse, streakResponse] = await Promise.all([
          axiosInstance.get<ContributionsResponse>(
            "/user/activity/contributions",
            {
              params: {
                start: formatDate(contributionsStart),
                end: formatDate(contributionsEnd),
              },
            }
          ),
          axiosInstance.get<StreakResponse>("/user/activity/streak"),
        ]);

        const contributionsData =
          (
            contributionsResponse.data as ContributionsResponse & {
              data?: ContributionsResponse;
            }
          )?.data ||
          contributionsResponse.data ||
          {};
        setContributions(contributionsData);

        const streakData =
          (streakResponse.data as StreakResponse & { data?: StreakResponse })
            ?.data || streakResponse.data;
        setStreak(
          typeof streakData?.streak === "number" ? streakData.streak : 0
        );
      } catch (error) {
        console.error("Failed to load home activity data:", error);
        setContributions({});
        setStreak(0);
      }
    };

    fetchActivity();
  }, []);

  const heatmapData = useMemo(
    () => generateHeatmapData(contributions),
    [contributions]
  );

  return (
    <S.PageWrapper>
      {/* Header */}

      <Header />

      {/* Main Content */}
      <S.MainContent>
        {/* Hero Section */}
        <S.HeroSection>
          <S.HeroCard>
            <S.HeroText>
              <S.HeroTitle>
                하루 한 문제로
                <br />
                어제보다 성장한 당신을 만들어드립니다
              </S.HeroTitle>
              <S.HeroSubtitle>
                AI가 문제 풀이를 분석해 당신의 약점을 찾아드리고, 맞춤 학습
                경로를 제안합니다.
                <br />
                단순한 문제풀이를 넘어, 실력을 완성하는 여정을 함께하세요.
              </S.HeroSubtitle>
            </S.HeroText>
            <S.DubiImage src={dubiImage} alt="Dubi Character" />
          </S.HeroCard>

          {/* Stats Card */}
          <S.StatsCard>
            <S.StreakInfo>
              <S.StreakContent>
                <S.StreakIcon>
                  <img
                    src={fireIcon}
                    alt="Fire"
                    style={{ width: "100%", height: "100%" }}
                  />
                </S.StreakIcon>
                <S.StreakText>
                  <S.StreakLabel>연속 학습일</S.StreakLabel>
                  <S.StreakValue>{streak}일</S.StreakValue>
                </S.StreakText>
              </S.StreakContent>
              <S.Divider />
            </S.StreakInfo>

            <S.HeatmapSection>
              <S.DayLabels>
                <S.DayLabel>M</S.DayLabel>
                <S.DayLabel>T</S.DayLabel>
                <S.DayLabel>S</S.DayLabel>
              </S.DayLabels>

              <S.HeatmapGrid>
                {heatmapData.map((cell) => (
                  <S.HeatmapCell
                    key={cell.date}
                    $intensity={cell.intensity}
                    data-tooltip={`${cell.date} · ${cell.solved} 문제`}
                    aria-label={`${cell.date} · ${cell.solved} 문제`}
                    title={`${cell.date} · ${cell.solved} 문제`}
                  />
                ))}
              </S.HeatmapGrid>
            </S.HeatmapSection>
          </S.StatsCard>
        </S.HeroSection>
      </S.MainContent>

      <Footer />
    </S.PageWrapper>
  );
};

export default Main;
