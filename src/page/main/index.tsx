import { useState, useEffect } from "react";
import * as S from "./styles";
import dubiImage from "../../assets/image/main/dubi.png";
import fireIcon from "../../assets/image/main/solar_fire-bold-duotone.svg";
import arrowIcon from "../../assets/image/main/arrow.svg";
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

interface Course {
  courseId: number;
  name: string;
  difficulty: string;
  labels: string[];
}

interface MainData {
  streak: number;
  studys: StudyMonth[];
  courses: Course[];
}

// Transform studys data to heatmap format (17 weeks × 7 days = 119 cells)
const generateHeatmapData = (studys: StudyMonth[]): string[] => {
  const data: string[] = [];
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - (17 * 7 - 1)); // 17 weeks ago

  // Create a map of date -> solved count
  const solvedMap = new Map<string, number>();
  studys.forEach((study) => {
    study.days.forEach((day) => {
      solvedMap.set(day.date, day.solved);
    });
  });

  // Generate heatmap cells
  for (let week = 0; week < 17; week++) {
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

      data.push(intensity);
    }
  }

  return data;
};

const Main = () => {
  const [streak, setStreak] = useState<number>(0);
  const [heatmapData, setHeatmapData] = useState<string[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    const fetchMainData = async () => {
      try {
        const response = await axiosInstance.get<MainData>("/main");
        setStreak(response.data.streak);
        setCourses(response.data.courses);

        // Transform studys data to heatmap format
        const heatmap = generateHeatmapData(response.data.studys);
        setHeatmapData(heatmap);
      } catch (error) {
        console.error("Failed to fetch main data:", error);
      }
    };

    fetchMainData();
  }, []);

  const getDifficultyText = (difficulty: string): string => {
    const map: Record<string, string> = {
      easy: "하",
      normal: "중",
      hard: "상",
    };
    return `난이도 : ${map[difficulty] || difficulty}`;
  };

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
                {heatmapData.map((intensity, idx) => (
                  <S.HeatmapCell key={idx} intensity={intensity} />
                ))}
              </S.HeatmapGrid>
            </S.HeatmapSection>
          </S.StatsCard>
        </S.HeroSection>

        {/* Recommended Learning Section */}
        <S.LearningSection>
          <S.SectionHeader>
            <S.SectionLabel>오늘의 추천 학습</S.SectionLabel>
            <S.SectionTitle>
              알고리즘 완전 정복 코스
              <S.ArrowIcon>
                <img
                  src={arrowIcon}
                  alt="Arrow"
                  style={{ width: "100%", height: "100%" }}
                />
              </S.ArrowIcon>
            </S.SectionTitle>
          </S.SectionHeader>

          <S.CourseGrid>
            {courses.map((course) => (
              <S.CourseCard key={course.courseId}>
                <S.CardContent>
                  <S.CardHeader>
                    <S.Difficulty>
                      {getDifficultyText(course.difficulty)}
                    </S.Difficulty>
                    <S.CardTitle>{course.name}</S.CardTitle>
                  </S.CardHeader>
                  <S.TagList>
                    {course.labels.map((label, idx) => (
                      <S.Tag key={idx}>{label}</S.Tag>
                    ))}
                  </S.TagList>
                </S.CardContent>
                <S.SolveButton>문제 풀기 →</S.SolveButton>
              </S.CourseCard>
            ))}
          </S.CourseGrid>
        </S.LearningSection>
      </S.MainContent>

      {/* Footer */}
      <Footer />
    </S.PageWrapper>
  );
};

export default Main;
