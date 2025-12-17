import { useEffect, useState } from "react";
import { Header } from "../../components/header";
import { Footer } from "../../components/footer";
import axiosInstance from "../../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import * as S from "./styles";

// ============================
// 타입 정의
// ============================
interface Contest {
  code: string;
  title: string;
  dDay: string;
  participantCount: number;
  status: "JOINABLE" | "JOINED" | "ENDED";
  image: string;
}
type ContestApiItem = Omit<Contest, "image"> & { image?: string };

// ============================
// 이미지 매핑
// ============================
const IMAGE_MAP: Record<string, string> = {
  "2학년 코딩 테스트": "https://i.ibb.co/Rp6GC0LG/dgsw.png",
  "1학년 파이썬 코딩 테스트": "https://i.ibb.co/Cfyvb0J/python.png",
  "C언어 코딩 테스트": "https://i.ibb.co/TBwmN9gG/c.png",
  "제 1회 코딩 테스트": "https://i.ibb.co/bgdgkTBG/image.png",
  "두카미 코딩테스트": "https://i.ibb.co/DDKHcv4N/ducami.png",
};
const DEFAULT_IMAGE = "https://i.ibb.co/Rp6GC0LG/dgsw.png";

// ============================
// 메인 컴포넌트
// ============================
export const ContestPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [currentSlide, setCurrentSlide] = useState(1);
  const [contests, setContests] = useState<Contest[]>([]);
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
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

      if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }

      for (let i = startPage; i <= endPage; i++) pages.push(i);
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

  const joinContest = async (contestCode: string) => {
    const target = contests.find((c) => c.code === contestCode);
    if (!target || target.status !== "JOINABLE") return;

    const input = prompt("대회 코드를 입력해주세요.");
    if (!input) return;

    try {
      await axiosInstance.post(`/contest/${input}/join`, null, {
        params: { code: input },
      });

      alert("대회 참가에 성공했습니다.");
      navigate(`/contests/${contestCode}`);
    } catch (error) {
      alert("대회 참가 실패. 코드를 다시 확인해주세요.");
      console.error(error);
    }
  };

  const moveToContestDetail = (code: string) => {
    const target = contests.find((c) => c.code === code);
    if (target?.status === "JOINED") navigate(`/contests/${code}`);
  };

  // ============================
  // 서버에서 데이터 불러오기 + 이미지 매핑
  // ============================
  useEffect(() => {
    const fetchContests = async () => {
      try {
        const res = await axiosInstance.get(`/contest/list`);

        if (Array.isArray(res.data)) {
          const contestsFromServer = res.data as ContestApiItem[];

          // 🔥 서버 데이터에 이미지 붙이기
          const contestsWithImages = contestsFromServer.map((c) => ({
            ...c,
            image: IMAGE_MAP[c.title] ?? c.image ?? DEFAULT_IMAGE,
          }));

          setContests(contestsWithImages);
          return;
        }
      } catch (error) {
        console.error("대회 목록 불러오기 실패", error);
      }
    };

    fetchContests();
  }, []);

  return (
    <>
      <S.Container>
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
              <svg width="24" height="24">
                <path
                  fill="none"
                  stroke="rgba(255,255,255,0.4)"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m14 7l-5 5l5 5"
                />
              </svg>
            </S.CarouselButton>

            <S.CarouselIndicator>
              <S.CarouselText $active>{currentSlide}</S.CarouselText>
              <S.CarouselDivider>|</S.CarouselDivider>
              <S.CarouselText $active={false}>5</S.CarouselText>
            </S.CarouselIndicator>

            <S.CarouselButton
              onClick={() => setCurrentSlide(Math.min(5, currentSlide + 1))}
            >
              <svg width="24" height="24">
                <path
                  fill="none"
                  stroke="rgba(255,255,255,0.4)"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m10 17l5-5l-5-5"
                />
              </svg>
            </S.CarouselButton>
          </S.CarouselControls>
        </S.HeroBanner>

        {/* Main Content */}
        <S.MainContent>
          {/* Search */}
          <S.SearchBar>
            <S.SearchInput
              type="text"
              placeholder="대회 이름을 검색하세요..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </S.SearchBar>

          {/* Contest List */}
          <S.ContestsSection>
            <S.ContestsGrid>
              {currentContests.length > 0 ? (
                currentContests.map((contest) => (
                  <S.ContestCard
                    key={contest.code}
                    onClick={() => moveToContestDetail(contest.code)}
                  >
                    <S.CardImageWrapper>
                      <S.CardImage src={contest.image} alt={contest.title} />

                      <S.CardBadge
                        $status={contest.status}
                        $bgColor={getStatusColor(contest.status)}
                        $textColor={getStatusTextColor(contest.status)}
                        onClick={(e) => {
                          e.stopPropagation();
                          joinContest(contest.code);
                        }}
                      >
                        {getStatusText(contest.status)}
                      </S.CardBadge>
                    </S.CardImageWrapper>

                    <S.CardContent>
                      <S.CardTitle>{contest.title}</S.CardTitle>
                      <S.CardInfo>
                        {contest.dDay}일 남음 ・ {contest.participantCount}명
                        참여중
                      </S.CardInfo>
                    </S.CardContent>
                  </S.ContestCard>
                ))
              ) : (
                <S.NoResultsMessage>
                  {searchTerm
                    ? `"${searchTerm}"에 대한 검색 결과가 없습니다.`
                    : "아직 대회가 없습니다."}
                </S.NoResultsMessage>
              )}
            </S.ContestsGrid>

            {/* Pagination */}
            <S.Pagination>
              <S.PaginationButton
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              >
                <svg width="24" height="24">
                  <path
                    fill="none"
                    stroke="#BDBDBD"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m14 7l-5 5l5 5"
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
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
              >
                <svg width="24" height="24">
                  <path
                    fill="none"
                    stroke="#BDBDBD"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m10 17l5-5l-5-5"
                  />
                </svg>
              </S.PaginationButton>
            </S.Pagination>
          </S.ContestsSection>
        </S.MainContent>

        <Footer />
      </S.Container>
    </>
  );
};
