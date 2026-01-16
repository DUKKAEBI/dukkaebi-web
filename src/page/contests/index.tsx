import { useEffect, useState, useMemo } from "react";
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

// ============================
// 이미지 매핑
// ============================

const DEFAULT_IMAGE = "https://i.ibb.co/Rp6GC0LG/dgsw.png";

export const ContestPage = () => {
  const navigate = useNavigate();

  // 상태 관리
  const [contests, setContests] = useState<Contest[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1); // 1-based index
  const [totalPages, setTotalPages] = useState(1);
  const [currentSlide, setCurrentSlide] = useState(1);

  // ============================
  // 서버에서 데이터 불러오기
  // ============================
  useEffect(() => {
    const fetchContests = async () => {
      try {
        // 서버의 페이징이 0부터 시작한다면 currentPage - 1을 전달해야 합니다.
        const res = await axiosInstance.get(`/contest/list`, {
          params: { page: currentPage - 1, size: 12 },
        });

        const data = res.data;

        // data.content가 배열인지 확인
        if (data && Array.isArray(data.content)) {
          const mappedContests = data.content.map((c: any) => ({
            code: c.code,
            title: c.title,
            dDay: c.dDay,
            participantCount: c.participantCount,
            status: c.status,
            // 서버의 imageUrl을 사용하거나 IMAGE_MAP에서 매핑
            image: c.imageUrl ?? DEFAULT_IMAGE,
          }));

          setContests(mappedContests);
          setTotalPages(data.totalPages || 1);
        }
      } catch (error) {
        console.error("대회 목록 불러오기 실패", error);
      }
    };

    fetchContests();
  }, [currentPage]); // 페이지 변경 시 재호출

  // 검색 필터링 (클라이언트 사이드)
  const filteredContests = useMemo(() => {
    return contests.filter((contest) =>
      contest.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [contests, searchTerm]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // 페이지 번호 계산 로직
  const getPageNumbers = () => {
    const maxVisiblePages = 5;
    const pages = [];
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      if (i >= 1) pages.push(i);
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

  // 상태 텍스트/컬러 유틸리티
  const getStatusText = (status: Contest["status"]) => {
    switch (status) {
      case "JOINABLE":
        return "참여 가능";
      case "JOINED":
        return "참여중";
      case "ENDED":
        return "대회 종료";
      default:
        return "";
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
      default:
        return "#E0E0E0";
    }
  };

  const getStatusTextColor = (status: Contest["status"]) => {
    return status === "JOINED" ? "#828282" : "#FFFFFF";
  };

  const moveToContestDetail = (code: string) => {
    navigate(`/contests/${code}`);
  };

  return (
    <>
      <S.Container>
        <Header />

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

        <S.MainContent>
          <S.SearchBar>
            <S.SearchInput
              type="text"
              placeholder="대회 이름을 검색하세요"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </S.SearchBar>

          <S.ContestsSection>
            <S.ContestsGrid>
              {filteredContests.length > 0 ? (
                filteredContests.map((contest) => (
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
                      >
                        {getStatusText(contest.status)}
                      </S.CardBadge>
                    </S.CardImageWrapper>
                    <S.CardContent>
                      <S.CardTitle>{contest.title}</S.CardTitle>
                      <S.CardInfo>
                        {contest.dDay} ・ {contest.participantCount}명 참여중
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

            <S.Pagination>
              <S.PaginationButton
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
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
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
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
