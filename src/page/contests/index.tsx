import { useState } from "react";
import styled, { createGlobalStyle } from "styled-components";

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

const ContestPage = () => {
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
      <Container>
        {/* Header */}
        <Header>
          <HeaderContent>
            <HeaderLeft>
              <LogoImage
                src="https://i.ibb.co/ycw6HTQF/image.png"
                alt="DUKKAEBI Logo"
              />
              <Nav>
                <NavItem $active={false}>문제풀기</NavItem>
                <NavItem $active={true}>알고리즘 대회</NavItem>
              </Nav>
            </HeaderLeft>
            <UserIcon>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
              >
                <path
                  fill="none"
                  stroke="#828282"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0-8 0M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"
                />
              </svg>
            </UserIcon>
          </HeaderContent>
        </Header>

        {/* Hero Banner */}
        <HeroBanner>
          <HeroContent>
            <HeroTitle>
              DGSW
              <br />
              <HeroTitleHighlight>프로그래밍 대회</HeroTitleHighlight>
            </HeroTitle>
            <HeroSubtitle>
              DGSW Programming
              <br />
              Contest 2025
            </HeroSubtitle>
          </HeroContent>

          <CarouselControls>
            <CarouselButton
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
            </CarouselButton>
            <CarouselIndicator>
              <CarouselText $active={true}>{currentSlide}</CarouselText>
              <CarouselDivider>|</CarouselDivider>
              <CarouselText $active={false}>5</CarouselText>
            </CarouselIndicator>
            <CarouselButton
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
            </CarouselButton>
          </CarouselControls>
        </HeroBanner>

        {/* Main Content */}
        <MainContent>
          {/* Search Bar */}
          <SearchBar>
            <SearchInput type="text" placeholder="대회 이름을 검색하세요.." />
            <SearchIcon>
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
            </SearchIcon>
          </SearchBar>

          {/* Contests Grid */}
          <ContestsSection>
            <ContestsGrid>
              {MOCK_CONTESTS.map((contest) => (
                <ContestCard key={contest.id}>
                  <CardImageWrapper>
                    <CardImage src={contest.image} alt={contest.title} />
                    <CardBadge
                      $status={contest.status}
                      $bgColor={getStatusColor(contest.status)}
                      $textColor={getStatusTextColor(contest.status)}
                    >
                      {getStatusText(contest.status)}
                    </CardBadge>
                  </CardImageWrapper>
                  <CardContent>
                    <CardTitle>{contest.title}</CardTitle>
                    <CardInfo>
                      종료까지 D-{contest.daysLeft} ・{contest.participants}명
                      참여중
                    </CardInfo>
                  </CardContent>
                </ContestCard>
              ))}
            </ContestsGrid>

            {/* Pagination */}
            <Pagination>
              <PaginationButton
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
              </PaginationButton>
              <PaginationNumbers>
                {[1, 2, 3, 4, 5].map((num) => (
                  <PageNumber
                    key={num}
                    $active={num === currentPage}
                    onClick={() => setCurrentPage(num)}
                  >
                    {num}
                  </PageNumber>
                ))}
              </PaginationNumbers>
              <PaginationButton
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
              </PaginationButton>
            </Pagination>
          </ContestsSection>
        </MainContent>

        {/* Footer */}
        <Footer>
          <FooterContent>
            <FooterLogoImage
              src="https://i.ibb.co/KxNQVwGc/image.png"
              alt="DUKKAEBI Logo"
            />
            <FooterLinks>
              <FooterInfo>
                <FooterText>두카미</FooterText>
                <FooterDivider>|</FooterDivider>
                <FooterText>대구광역시 달성군 구지면 창리로11길 93</FooterText>
                <FooterDivider>|</FooterDivider>
                <FooterText>ducami@dgsw.hs.kr</FooterText>
                <FooterDivider>|</FooterDivider>
                <FooterLink>서비스 이용약관</FooterLink>
                <FooterDivider>|</FooterDivider>
                <FooterLink>개인정보 처리방침</FooterLink>
              </FooterInfo>
              <FooterBottom>
                <FooterCopyright>
                  © 2025 두카미. All rights reserved.
                </FooterCopyright>
                <SocialIcon>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="#bdbdbd"
                      d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4zm9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8A1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5a5 5 0 0 1-5 5a5 5 0 0 1-5-5a5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3"
                    />
                  </svg>
                </SocialIcon>
              </FooterBottom>
            </FooterLinks>
          </FooterContent>
        </Footer>
      </Container>
    </>
  );
};

// Styled Components
const Container = styled.div`
  margin: 0;
  padding: 0;
  width: 100%;
  min-height: 100vh;
  background: white;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
`;

const Header = styled.header`
  height: 80px;
  background: #ffffff;
  border-bottom: 1px solid #ededed;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const HeaderContent = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 40px;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 40px;
`;

const LogoImage = styled.img`
  width: 80px;
  object-fit: contain;
`;

const Nav = styled.nav`
  display: flex;
  gap: 20px;
  align-items: center;
`;

const NavItem = styled.div<{ $active?: boolean }>`
  font-family: "Pretendard", sans-serif;
  font-weight: 500;
  font-size: 16px;
  color: ${(props) => (props.$active ? "#00B4B7" : "#1D1D1D")};
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    color: #00b4b7;
  }
`;

const UserIcon = styled.div`
  font-size: 24px;
  cursor: pointer;
`;

const HeroBanner = styled.div`
  width: 100vw;
  height: 240px;
  background: #315374;
  position: relative;
  overflow: hidden;
`;

const HeroContent = styled.div`
  position: absolute;
  left: calc(16.67% + 37.67px);
  top: 40px;
  z-index: 10;
`;

const HeroTitle = styled.h1`
  font-family: "Paperlogy", "SB AggroOTF", "Pretendard", sans-serif;
  font-weight: 700;
  font-size: 36px;
  line-height: 1.2;
  color: white;
  margin: 0 0 4px 0;
`;

const HeroTitleHighlight = styled.span`
  color: #2cb0ff;
`;

const HeroSubtitle = styled.p`
  font-family: "Pretendard", sans-serif;
  font-weight: 500;
  font-size: 14px;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.4);
  margin: 0;
`;

const CarouselControls = styled.div`
  position: absolute;
  left: calc(16.67% + 28.67px);
  bottom: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 10;
`;

const CarouselButton = styled.button`
  width: 24px;
  height: 24px;
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  outline: none;

  svg {
    width: 24px;
    height: 24px;
  }

  &:focus {
    outline: none;
  }

  &:focus-visible {
    outline: none;
  }

  &:hover svg path {
    stroke: rgba(255, 255, 255, 0.8);
  }
`;

const CarouselIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-family: "Pretendard", sans-serif;
  font-weight: 500;
  font-size: 16px;
`;

const CarouselText = styled.span<{ $active: boolean }>`
  color: ${(props) => (props.$active ? "white" : "rgba(255, 255, 255, 0.4)")};
`;

const CarouselDivider = styled.span`
  color: rgba(255, 255, 255, 0.4);
`;

const MainContent = styled.main`
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-x: hidden;
`;

const SearchBar = styled.div`
  width: 388px;
  background: #f6f6f6;
  border: 1px solid #ededed;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 20px;
  margin-bottom: 40px;
`;

const SearchInput = styled.input`
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-family: "Pretendard", sans-serif;
  font-weight: 500;
  font-size: 14px;
  color: #1d1d1d;

  &::placeholder {
    color: #bdbdbd;
  }
`;

const SearchIcon = styled.div`
  font-size: 20px;
`;

const ContestsSection = styled.section`
  width: 794px;
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const ContestsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 183px);
  gap: 20px;
`;

const ContestCard = styled.div`
  width: 183px;
  display: flex;
  flex-direction: column;
`;

const CardImageWrapper = styled.div`
  position: relative;
  width: 183px;
  height: 128px;
  border-radius: 8px 8px 0 0;
  overflow: hidden;
`;

const CardImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const CardBadge = styled.div<{
  $status: string;
  $bgColor: string;
  $textColor: string;
}>`
  position: absolute;
  bottom: 8px;
  right: 10px;
  padding: 4px 12px;
  border-radius: 4px;
  font-family: "Pretendard", sans-serif;
  font-weight: 500;
  font-size: 12px;
  color: ${(props) => props.$textColor};
  background: ${(props) => props.$bgColor};
  white-space: nowrap;
`;

const CardContent = styled.div`
  background: #f6f6f6;
  border: 1px solid #ededed;
  border-top: none;
  border-radius: 0 0 8px 8px;
  padding: 12px 10px 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const CardTitle = styled.h3`
  font-family: "Pretendard", sans-serif;
  font-weight: 600;
  font-size: 14px;
  color: black;
  margin: 0;
  line-height: 1.4;
`;

const CardInfo = styled.p`
  font-family: "Pretendard", sans-serif;
  font-weight: 500;
  font-size: 12px;
  color: #bdbdbd;
  margin: 0;
  line-height: 1.4;
  white-space: nowrap;
`;

const Pagination = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
`;

const PaginationButton = styled.button`
  width: 24px;
  height: 24px;
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  outline: none;

  svg {
    width: 24px;
    height: 24px;
  }

  &:hover svg path {
    stroke: #828282;
  }

  &:focus {
    outline: none;
  }

  &:focus-visible {
    outline: none;
  }
`;

const PaginationNumbers = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const PageNumber = styled.button<{ $active: boolean }>`
  background: transparent;
  border: none;
  font-family: "Pretendard", sans-serif;
  font-weight: 500;
  font-size: 16px;
  color: ${(props) => (props.$active ? "#828282" : "#BDBDBD")};
  cursor: pointer;
  padding: 0;
  outline: none;

  &:hover {
    color: #828282;
  }

  &:focus {
    outline: none;
  }

  &:focus-visible {
    outline: none;
  }
`;

const Footer = styled.footer`
  width: 100%;
  background: #f6f6f6;
  border-top: 1px solid #ededed;
  padding: 49px 40px;
  margin-top: auto;
`;

const FooterContent = styled.div`
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const FooterLogoImage = styled.img`
  width: 100px;
  height: auto;
`;

const FooterLinks = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const FooterInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const FooterText = styled.span`
  font-family: "Pretendard", sans-serif;
  font-weight: 500;
  font-size: 14px;
  color: #bdbdbd;
  white-space: nowrap;
`;

const FooterLink = styled.span`
  font-family: "Pretendard", sans-serif;
  font-weight: 600;
  font-size: 14px;
  color: #bdbdbd;
  text-decoration: underline;
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    color: #828282;
  }
`;

const FooterDivider = styled.span`
  color: #bdbdbd;
`;

const FooterBottom = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const FooterCopyright = styled.p`
  font-family: "Pretendard", sans-serif;
  font-weight: 500;
  font-size: 14px;
  color: #bdbdbd;
  margin: 0;
`;

const SocialIcon = styled.div`
  font-size: 24px;
  cursor: pointer;
`;

export default ContestPage;
