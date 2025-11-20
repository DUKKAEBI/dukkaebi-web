import { useEffect, useState } from "react";
import { Header } from "../../components/header";
import { Footer } from "../../components/footer";
import axiosInstance from "../../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import * as S from "./styles";

// 대회 타입 정의
interface Contest {
  code: string;
  title: string;
  dDay: string;
  participantCount: number;
  status: "JOINABLE" | "JOINED" | "ENDED";
}

// 목업 데이터
const MOCK_CONTESTS: Contest[] = Array.from({ length: 16 }, (_, i) => ({
  code: (12345 + i).toString(),
  title: "DGSW 프로그래밍 대회",
  dDay: "2",
  participantCount: 100,
  status: i % 4 === 1 ? "JOINED" : i % 4 === 2 ? "ENDED" : "JOINABLE",
  image: "https://i.ibb.co/bgdgkTBG/image.png",
}));

export const ContestPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [currentSlide, setCurrentSlide] = useState(1);
  const [contests, setContests] = useState<Contest[]>(MOCK_CONTESTS);
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();
  
  const ITEMS_PER_PAGE = 16;
  
  const filteredContests = contests.filter((contest) =>
    contest.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const totalPages = Math.ceil(filteredContests.length / ITEMS_PER_PAGE);
  
  const currentContests = filteredContests.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };
  
  const getPageNumbers = () => {
    const maxVisiblePages = 5;
    const pages = [];
    
    if (totalPages <= maxVisiblePages) {
      // 전체 페이지가 5개 이하면 모두 표시
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {

      let startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      
      if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };
  
  const pageNumbers = getPageNumbers();

  const getStatusText = (status: Contest["status"]) => {
    switch (status) {
      case "JOINABLE":
        return "참가하기";
      case "JOINED":
        return "참여중";
      case "ENDED":
        return "대회 종료";
    }
  };

  const getStatusColor = (status: Contest["status"]) => {
    switch (status) {
      case "JOINABLE":
        return "#00B4B7";
      case "JOINED":
        return "#E0E0E0";
      case "ENDED":
        return "#EB5757";
    }
  };

  const getStatusTextColor = (status: Contest["status"]) => {
    return status === "JOINED" ? "#828282" : "#FFFFFF";
  };

  const joinConest = async (contestCode: string) => {
    const targetContest = contests.find(contests => contestCode === contests.code);
    if (!targetContest || targetContest.status !== "JOINABLE") {
      return;
    }

    const promptMessage = prompt("대회 코드를 입력해주세요.");

    if (!promptMessage) return;

    try{
      const res = await axiosInstance.post(`/contest/${promptMessage}/join`, null,{
        params:{
          code: promptMessage
        }
      });
      console.log("Join contest response:", res.data);
      alert("대회 참가에 성공했습니다.");
      navigate(`/contests/${contestCode}`);
    }catch(error) {
      alert("대회 참가에 실패했습니다. 대회 코드를 다시 확인해주세요.");
      console.error("Error joining contest:", error);
    }
  };

  const moveToContestDetail = (contestCode: string) => {
    const targetContest = contests.find(contests => contestCode === contests.code);
    if (targetContest?.status === "JOINED") {
      navigate(`/contests/${contestCode}`);
    }else{
      return;
    }
    
  };

  useEffect(() => {
    const getContests = async (): Promise<Contest[]> => {
      try {
        const response = await axiosInstance.get(`/contest/list`);
        const data = Array.isArray(response.data) ? response.data : [];
        setContests(data);
        return data;
      } catch (error) {
        console.error("Error fetching contests:", error);
        setContests(MOCK_CONTESTS);
        return [];
      }
    };

    getContests();
  }, []);

  return (
    <>
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
            <S.SearchInput type="text" placeholder="대회 이름을 검색하세요.." value={searchTerm} onChange={handleSearchChange} />
            <S.SearchIcon>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 16 16"
              >
                <path
                  fill="#828282"
                  fillRule="evenodd"
                  d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06zM10.5 7a3.5 3.5 0 1 1-7 0a3.5 3.5 0 0 1 7 0"
                  clipRule="evenodd"
                />
              </svg>
            </S.SearchIcon>
          </S.SearchBar>

          {/* Contests Grid */}
          <S.ContestsSection>
            <S.ContestsGrid>
              {currentContests.length > 0 ? (
                currentContests.map((contest) => (
                  <S.ContestCard key={contest.code} onClick={() => moveToContestDetail(contest.code)}>
                    <S.CardImageWrapper>
                      <S.CardImage src={"https://i.ibb.co/bgdgkTBG/image.png"} alt={contest.title} />
                      <S.CardBadge
                        onClick={(e) => {
                          e.stopPropagation();
                          joinConest(contest.code);
                        }}
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
                        {contest.dDay} ・{contest.participantCount}명
                        참여중
                      </S.CardInfo>
                    </S.CardContent>
                  </S.ContestCard>
                ))
              ) : (
                <S.NoResultsMessage>
                  {searchTerm ? `"${searchTerm}"에 대한 검색 결과가 없습니다.` : "아직 대회가 없습니다."}
                </S.NoResultsMessage>
              )}
            </S.ContestsGrid>

            {/* Pagination */}
            <S.Pagination>
              <S.PaginationButton
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
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
                  {pageNumbers.map((num) => (
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
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
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
