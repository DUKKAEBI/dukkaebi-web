import * as S from "./styles";
import dubiImage from "../../assets/image/main/dubi.png";
import instagramIcon from "../../assets/image/main/mdi_instagram.svg";
import ducamiLogo from "../../assets/image/main/ducami_logo.svg";
import fireIcon from "../../assets/image/main/solar_fire-bold-duotone.svg";
import arrowIcon from "../../assets/image/main/arrow.svg";
import { Header } from "../../components/header";
import { Footer } from "../../components/footer";

const Main = () => {
  // Mock data for learning streak heatmap
  const generateHeatmapData = () => {
    const data = [];
    for (let week = 0; week < 17; week++) {
      for (let day = 0; day < 7; day++) {
        const intensity =
          week === 10 && day >= 0 && day <= 3
            ? ["20", "60", "100", "20"][day]
            : "0";
        data.push(intensity);
      }
    }
    return data;
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
                  <S.StreakValue>3일</S.StreakValue>
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
                {generateHeatmapData().map((intensity, idx) => (
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
            {[1, 2, 3, 4].map((item) => (
              <S.CourseCard key={item}>
                <S.CardContent>
                  <S.CardHeader>
                    <S.Difficulty>난이도 : 상</S.Difficulty>
                    <S.CardTitle>자료구조 알고리즘</S.CardTitle>
                  </S.CardHeader>
                  <S.TagList>
                    <S.Tag>#큐</S.Tag>
                    <S.Tag>#스택</S.Tag>
                    <S.Tag>#이진탐색</S.Tag>
                    <S.Tag>#그래프</S.Tag>
                  </S.TagList>
                </S.CardContent>
                <S.SolveButton>문제 풀기 →</S.SolveButton>
              </S.CourseCard>
            ))}
          </S.CourseGrid>
        </S.LearningSection>
      </S.MainContent>

      <Footer />
    </S.PageWrapper>
  );
};

export default Main;
