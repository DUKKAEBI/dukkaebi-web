import { useEffect, useState } from "react";
import { Header } from "../../components/header";
import { Footer } from "../../components/footer";
import axiosInstance from "../../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import * as S from "./styles";
import search from "../../assets/image/notifications/search.png";

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
  const [currentPage, setCurrentPage] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(1);
  const [contests, setContests] = useState<Contest[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalPages, setTotalPages] = useState(0);
  const [isFirst, setIsFirst] = useState(true);
  const [isLast, setIsLast] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const ITEMS_PER_PAGE = 16;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(0);
  };

  const getPageNumbers = () => {
    const maxVisiblePages = 5;
    const pages = [];
    const displayPage = currentPage + 1;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let startPage = Math.max(1, displayPage - 2);
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
        return "참여 가능";
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
    navigate(`/contests/${code}`);
  };

  // ============================
  // 서버에서 데이터 불러오기 + 이미지 매핑
  // ============================
  const fetchContests = async (page: number, search?: string) => {
    setIsLoading(true);
    try {
      const params: Record<string, any> = {
        page,
        size: ITEMS_PER_PAGE,
      };
      if (search) {
        params.search = search;
      }

      const res = await axiosInstance.get(`/contest/list`, { params });

      const { content, totalPages: tp, first, last } = res.data;

      const contestsFromServer = (content || []) as ContestApiItem[];
      const contestsWithImages = contestsFromServer.map((c) => ({
        ...c,
        image: IMAGE_MAP[c.title] ?? c.image ?? DEFAULT_IMAGE,
      }));

      setContests(contestsWithImages);
      setTotalPages(tp || 0);
      setIsFirst(first ?? true);
      setIsLast(last ?? true);
    } catch (error) {
      console.error("대회 목록 불러오기 실패", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContests(currentPage, searchTerm || undefined);
  }, [currentPage, searchTerm]);

  // 대회 페이지 로드 시 이전 대회 관련 localStorage 데이터 초기화
  useEffect(() => {
    // localStorage에서 dukkaebi_ 패턴의 모든 대회 관련 데이터 제거
    Object.keys(localStorage).forEach((key) => {
      if (
        key.startsWith("dukkaebi_codes") ||
        key.startsWith("dukkaebi_langs_") ||
        key.startsWith("dukkaebi_timeSpent_")
      ) {
        const contestCode = key.replace(
          /^dukkaebi_codes|dukkaebi_langs_|dukkaebi_timeSpent_/,
          ""
        );
        if (contestCode) {
          // 해당 대회와 관련된 코드 보관소 삭제
          localStorage.removeItem(`dukkaebi_codes_${contestCode}`);
          // 해당 대회와 관련된 언어 설정 보관소 삭제
          localStorage.removeItem(`dukkaebi_langs_${contestCode}`);
          // 해당 대회와 관련된 시간 설정 보관소 삭제
          localStorage.removeItem(`dukkaebi_timeSpent_${contestCode}`);
          console.log(
            `Contest ${contestCode} 관련 로컬 데이터가 초기화되었습니다.`
          );
        }
      }
    });
  }, []);

  return (
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
            placeholder="대회 이름을 검색하세요"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <img src={search} alt="search" />
        </S.SearchBar>

        {/* Contest List */}
        <S.ContestsSection>
          <S.ContestsGrid>
            {contests.length > 0 ? (
              contests.map((contest) => (
                <S.ContestCard
                  key={contest.code}
                  onClick={() => moveToContestDetail(contest.code)}
                >
                  <S.CardImageWrapper>
                    <S.CardImage src={contest.image} alt={contest.title} />
                  </S.CardImageWrapper>

                  <S.CardContent>
                    <S.CardTitle>{contest.title}</S.CardTitle>
                    <S.CardInfo>
                      {contest.dDay !== "종료됨" &&
                        `${contest.dDay}일 남음 ・ `}
                      {contest.participantCount}명 참여중
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
              disabled={isFirst}
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
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
                  $active={num === currentPage + 1}
                  onClick={() => setCurrentPage(num - 1)}
                >
                  {num}
                </S.PageNumber>
              ))}
            </S.PaginationNumbers>

            <S.PaginationButton
              disabled={isLast}
              onClick={() =>
                setCurrentPage(Math.min(totalPages - 1, currentPage + 1))
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
  );
};
