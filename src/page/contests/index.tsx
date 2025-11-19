import { useState } from "react";
import { createGlobalStyle } from "styled-components";
import { Header } from "../../components/header";
import { Footer } from "../../components/footer";
import * as S from "./styles";

// 글로벌 스타일
const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
  }

  html, body {
    margin: 0;
    padding: 0;
    font-family: 'Pretendard', system-ui, Avenir, Helvetica, Arial, sans-serif;
    line-height: 1.5;
    font-weight: 400;
    color: #213547;
    background-color: #ffffff;
    font-synthesis: none;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    min-width: 320px;
    min-height: 100vh;
    overflow-x: hidden;
  }

  a {
    font-weight: 500;
    color: #646cff;
    text-decoration: inherit;
  }

  a:hover {
    color: #747bff;
  }

  h1 {
    font-size: 3.2em;
    line-height: 1.1;
  }

  button {
    border-radius: 8px;
    border: 1px solid transparent;
    padding: 0.6em 1.2em;
    font-size: 1em;
    font-weight: 500;
    font-family: inherit;
    cursor: pointer;
    transition: border-color 0.25s;
  }
`;

// 대회 타입 정의
interface Contest {
  id: number;
  title: string;
  daysLeft: number;
  participants: number;
  status: "available" | "participating" | "closed";
  image: string;
}

// 목업 데이터
const MOCK_CONTESTS: Contest[] = Array.from({ length: 16 }, (_, i) => ({
  id: i + 1,
  title: "DGSW 프로그래밍 대회",
  daysLeft: 2,
  participants: 100,
  status: i % 4 === 1 ? "participating" : i % 4 === 2 ? "closed" : "available",
  image: "https://i.ibb.co/bgdgkTBG/image.png",
}));

export const ContestPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [currentSlide, setCurrentSlide] = useState(1);

  const getStatusText = (status: Contest["status"]) => {
    switch (status) {
      case "available":
        return "참가하기";
      case "participating":
        return "참여중";
      case "closed":
        return "접수마감";
    }
  };

  const getStatusColor = (status: Contest["status"]) => {
    switch (status) {
      case "available":
        return "#00B4B7";
      case "participating":
        return "#E0E0E0";
      case "closed":
        return "#EB5757";
    }
  };

  const getStatusTextColor = (status: Contest["status"]) => {
    return status === "participating" ? "#828282" : "#FFFFFF";
  };

  return (
    <>
      <GlobalStyle />
      <S.Container>
        {/* Header */}
        <Header />
        {/* Hero Banner */}
        <S.HeroBanner>
          <S.HeroContent>
            <S.HeroTitle>
              DGSW
              <br />
              <S.HeroTitleHighlight>프로그래밍 대회</S.HeroTitleHighlight>
            </S.HeroTitle>
            <S.HeroSubtitle>
              DGSW Programming
              <br />
              Contest 2025
            </S.HeroSubtitle>
          </S.HeroContent>

          <S.CarouselControls>
            <S.CarouselButton
              onClick={() => setCurrentSlide(Math.max(1, currentSlide - 1))}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
              >
                <path
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.4)"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m14 7l-5 5l5 5"
                  strokeWidth="1"
                />
              </svg>
            </S.CarouselButton>
            <S.CarouselIndicator>
              <S.CarouselText $active={true}>{currentSlide}</S.CarouselText>
              <S.CarouselDivider>|</S.CarouselDivider>
              <S.CarouselText $active={false}>5</S.CarouselText>
            </S.CarouselIndicator>
            <S.CarouselButton
              onClick={() => setCurrentSlide(Math.min(5, currentSlide + 1))}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
              >
                <path
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.4)"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m10 17l5-5l-5-5"
                  strokeWidth="1"
                />
              </svg>
            </S.CarouselButton>
          </S.CarouselControls>
        </S.HeroBanner>

        {/* Main Content */}
        <S.MainContent>
          {/* Search Bar */}
          <S.SearchBar>
            <S.SearchInput type="text" placeholder="대회 이름을 검색하세요.." />
            <S.SearchIcon>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 16 16"
              >
                <path
                  fill="#828282"
                  fill-rule="evenodd"
                  d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06zM10.5 7a3.5 3.5 0 1 1-7 0a3.5 3.5 0 0 1 7 0"
                  clip-rule="evenodd"
                />
              </svg>
            </S.SearchIcon>
          </S.SearchBar>

          {/* Contests Grid */}
          <S.ContestsSection>
            <S.ContestsGrid>
              {MOCK_CONTESTS.map((contest) => (
                <S.ContestCard key={contest.id}>
                  <S.CardImageWrapper>
                    <S.CardImage src={contest.image} alt={contest.title} />
                    <S.CardBadge
                      $status={contest.status}
                      $bgColor={getStatusColor(contest.status)}
                      $textColor={getStatusTextColor(contest.status)}
                    >
                      {getStatusText(contest.status)}
                    </S.CardBadge>
                  </S.CardImageWrapper>
                  <S.CardContent>
                    <S.CardTitle>{contest.title}</S.CardTitle>
                    <S.CardInfo>
                      종료까지 D-{contest.daysLeft} ・{contest.participants}명
                      참여중
                    </S.CardInfo>
                  </S.CardContent>
                </S.ContestCard>
              ))}
            </S.ContestsGrid>

            {/* Pagination */}
            <S.Pagination>
              <S.PaginationButton
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="none"
                    stroke="#BDBDBD"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m14 7l-5 5l5 5"
                    strokeWidth="1"
                  />
                </svg>
              </S.PaginationButton>
              <S.PaginationNumbers>
                {[1, 2, 3, 4, 5].map((num) => (
                  <S.PageNumber
                    key={num}
                    $active={num === currentPage}
                    onClick={() => setCurrentPage(num)}
                  >
                    {num}
                  </S.PageNumber>
                ))}
              </S.PaginationNumbers>
              <S.PaginationButton
                onClick={() => setCurrentPage(Math.min(5, currentPage + 1))}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="none"
                    stroke="#BDBDBD"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m10 17l5-5l-5-5"
                    strokeWidth="1"
                  />
                </svg>
              </S.PaginationButton>
            </S.Pagination>
          </S.ContestsSection>
        </S.MainContent>

        {/* Footer */}
        <Footer />
      </S.Container>
    </>
  );
};
