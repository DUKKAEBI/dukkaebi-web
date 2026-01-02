import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import * as S from "./style";
import SearchIcon from "../../assets/image/problems/search.png";
import ArrowDownIcon from "../../assets/image/problems/arrow-down.png";
//왼쪽
import ArrowLeftIcon from "../../assets/image/problems/arrow-left.png";
//오른쪽
import ArrowRightIcon from "../../assets/image/problems/arrow-right.png";
//성공 아이콘
import SuccessIcon from "../../assets/image/problems/success.png";
//실패 아이콘
import FailIcon from "../../assets/image/problems/fail.png";
//난이도 이미지
import GoldIcon from "../../assets/image/problems/difficulty/gold.png";
import SilverIcon from "../../assets/image/problems/difficulty/silver.png";
import CopperIcon from "../../assets/image/problems/difficulty/copper.png";
import JadeIcon from "../../assets/image/problems/difficulty/jade.png";
import IronIcon from "../../assets/image/problems/difficulty/iron.png";
import { Header } from "../../components/header";
import { Footer } from "../../components/footer";

interface Problem {
  id: number;
  title: string;
  difficulty: number;
  completedCount: number;
  successRate: number;
  solved: boolean;
  failed: boolean;
}

export default function Problems() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [difficultyFilter, setDifficultyFilter] = useState<number | null>(null);
  const [difficultyLabel, setDifficultyLabel] = useState<string | null>(null);
  const [successRateFilter, setSuccessRateFilter] = useState<
    "asc" | "desc" | null
  >(null);
  const [successRateLabel, setSuccessRateLabel] = useState<string | null>(null);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [timeLabel, setTimeLabel] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 페이지네이션 상태 추가
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 15;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    // 모든 필터가 null이면 전체 조회
    if (difficultyFilter === null && !successRateFilter && !sortBy) {
      fetchProblems();
    } else {
      // 필터가 하나라도 있으면 필터된 조회
      fetchFilteredProblems();
    }
  }, [difficultyFilter, successRateFilter, sortBy]);

  const difficultyMap: Record<string, number> = {
    GOLD: 1,
    SILVER: 2,
    COPPER: 3,
    IRON: 4,
    JADE: 5,
  };

  const difficultyReverseMap: Record<number, string> = {
    1: "GOLD",
    2: "SILVER",
    3: "COPPER",
    4: "IRON",
    5: "JADE",
  };

  const solvedStatusMap: Record<string, { solved: boolean; failed: boolean }> =
    {
      SOLVED: { solved: true, failed: false },
      FAILED: { solved: false, failed: true },
      NOT_SOLVED: { solved: false, failed: false },
    };

  useEffect(() => {
    fetchProblems();
  }, []);

  const extractProblemList = (payload: any): any[] => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.results)) return payload.results;
    return [];
  };

  const fetchProblems = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(`/problems`);
      const list = extractProblemList(response.data);
      mapProblems(list);
    } catch (error) {
      console.error("Failed to fetch problems:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFilteredProblems = async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string> = {};

      // 난이도 필터: null이면 빈 문자열, 아니면 해당 값
      if (difficultyFilter !== null) {
        params.difficulty = difficultyReverseMap[difficultyFilter];
      } else {
        params.difficulty = "";
      }

      // 정답률 필터: null이면 빈 문자열, 아니면 해당 값
      if (successRateFilter) {
        params.correctRate = successRateFilter === "asc" ? "low" : "high";
      } else {
        params.correctRate = "";
      }

      // 시간 필터: null이면 빈 문자열, 아니면 해당 값
      if (sortBy) {
        params.time = sortBy;
      } else {
        params.time = "";
      }

      const response = await axiosInstance.get(`/problems/filter`, { params });
      const list = extractProblemList(response.data);
      mapProblems(list);
    } catch (error) {
      console.error("Failed to fetch filtered problems:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSearchProblems = async (query: string) => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(`/problems/search`, {
        params: { name: query },
      });
      const list = extractProblemList(response.data);
      mapProblems(list);
    } catch (error) {
      console.error("Failed to search problems:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const mapProblems = (apiProblems: any[]) => {
    if (!Array.isArray(apiProblems)) {
      setProblems([]);
      return;
    }
    const mapped = apiProblems.map((p) => ({
      id: p.problemId,
      title: p.name,
      difficulty: difficultyMap[p.difficulty],
      completedCount: p.solvedCount,
      successRate: p.correctRate,
      ...solvedStatusMap[p.solvedResult],
    }));
    setProblems(mapped);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setCurrentPage(1); // 첫 페이지로 리셋
    if (value.trim()) {
      fetchSearchProblems(value);
    } else {
      fetchProblems();
    }
  };

  const handleDifficultySelect = (
    level: number | null,
    label: string | null
  ) => {
    setDifficultyFilter(level);
    setDifficultyLabel(label);
    setOpenDropdown(null);
    setCurrentPage(1); // 첫 페이지로 리셋
  };

  const handleTimeSelect = (time: string | null, label: string | null) => {
    setSortBy(time);
    setTimeLabel(label);
    setOpenDropdown(null);
    setCurrentPage(1); // 첫 페이지로 리셋
  };

  const handleSuccessRateSelect = (
    order: "asc" | "desc" | null,
    label: string | null
  ) => {
    setSuccessRateFilter(order);
    setSuccessRateLabel(label);
    setOpenDropdown(null);
    setCurrentPage(1); // 첫 페이지로 리셋
  };

  let filteredProblems = problems.filter((problem) =>
    problem.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (difficultyFilter !== null) {
    filteredProblems = filteredProblems.filter(
      (problem) => problem.difficulty === difficultyFilter
    );
  }

  if (successRateFilter === "asc") {
    filteredProblems = [...filteredProblems].sort(
      (a, b) => a.successRate - b.successRate
    );
  } else if (successRateFilter === "desc") {
    filteredProblems = [...filteredProblems].sort(
      (a, b) => b.successRate - a.successRate
    );
  }

  // 페이지네이션 계산 함수
  const getPaginatedProblems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredProblems.slice(startIndex, endIndex);
  };

  // 페이지 범위 계산 (화면에 보이는 페이지 번호)
  const getPageRange = () => {
    const maxVisiblePages = 5;
    const halfVisible = Math.floor(maxVisiblePages / 2);

    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // 끝에 도달했을 때 시작 페이지 조정
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  // filteredProblems가 변경될 때마다 총 페이지 수 계산 및 현재 페이지 조정
  useEffect(() => {
    const total = Math.ceil(filteredProblems.length / itemsPerPage);
    setTotalPages(total);

    // 현재 페이지가 총 페이지 수를 초과하면 마지막 페이지로 이동
    if (currentPage > total && total > 0) {
      setCurrentPage(total);
    }
  }, [filteredProblems.length]);

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // 이전/다음 페이지 핸들러
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const difficultyLabels: Record<number, string> = {
    1: "금",
    2: "은",
    3: "동",
    4: "철",
    5: "옥",
  };

  const difficultyImages: Record<number, string> = {
    1: GoldIcon,
    2: SilverIcon,
    3: CopperIcon,
    4: IronIcon,
    5: JadeIcon,
  };

  return (
    <S.ProblemsContainer>
      {/* Header */}
      <Header />

      {/* Main Content */}
      <S.MainContent>
        {/* Search Bar */}
        <S.SearchBox>
          <S.SearchInput
            type="text"
            placeholder="문제 이름을 검색하세요"
            value={searchTerm}
            onChange={handleSearch}
          />
          <S.SearchIconContainer>
            <img src={SearchIcon} alt="검색" />
          </S.SearchIconContainer>
        </S.SearchBox>

        {/* Filter Section */}
        <S.FilterSection ref={dropdownRef}>
          <S.FilterButtonsWrapper>
            {/* 난이도 */}
            <S.FilterButtonGroup>
              <S.FilterButton
                isActive={
                  openDropdown === "difficulty" || difficultyFilter !== null
                }
                onClick={() =>
                  setOpenDropdown(
                    openDropdown === "difficulty" ? null : "difficulty"
                  )
                }
              >
                {difficultyLabel || "난이도"}
                <S.ArrowIcon src={ArrowDownIcon} alt="드롭다운" />
              </S.FilterButton>

              {openDropdown === "difficulty" && (
                <S.DropdownMenu>
                  <S.DropdownItem
                    isSelected={difficultyFilter === null}
                    onClick={() => handleDifficultySelect(null, null)}
                  >
                    선택 안함
                  </S.DropdownItem>
                  <S.DropdownItem
                    isSelected={difficultyFilter === 1}
                    onClick={() => handleDifficultySelect(1, "금")}
                  >
                    금
                  </S.DropdownItem>
                  <S.DropdownItem
                    isSelected={difficultyFilter === 2}
                    onClick={() => handleDifficultySelect(2, "은")}
                  >
                    은
                  </S.DropdownItem>
                  <S.DropdownItem
                    isSelected={difficultyFilter === 3}
                    onClick={() => handleDifficultySelect(3, "동")}
                  >
                    동
                  </S.DropdownItem>
                  <S.DropdownItem
                    isSelected={difficultyFilter === 4}
                    onClick={() => handleDifficultySelect(4, "철")}
                  >
                    철
                  </S.DropdownItem>
                  <S.DropdownItem
                    isSelected={difficultyFilter === 5}
                    onClick={() => handleDifficultySelect(5, "옥")}
                  >
                    옥
                  </S.DropdownItem>
                </S.DropdownMenu>
              )}
            </S.FilterButtonGroup>

            {/* 시간 */}
            <S.FilterButtonGroup>
              <S.FilterButton
                isActive={openDropdown === "time" || sortBy !== null}
                onClick={() =>
                  setOpenDropdown(openDropdown === "time" ? null : "time")
                }
              >
                {timeLabel || "시간"}
                <S.ArrowIcon src={ArrowDownIcon} alt="드롭다운" />
              </S.FilterButton>

              {openDropdown === "time" && (
                <S.DropdownMenu>
                  <S.DropdownItem
                    isSelected={sortBy === null}
                    onClick={() => handleTimeSelect(null, null)}
                  >
                    선택 안함
                  </S.DropdownItem>
                  <S.DropdownItem
                    isSelected={sortBy === "recent"}
                    onClick={() => handleTimeSelect("recent", "최신순")}
                  >
                    최신순
                  </S.DropdownItem>
                  <S.DropdownItem
                    isSelected={sortBy === "old"}
                    onClick={() => handleTimeSelect("old", "오래된순")}
                  >
                    오래된순
                  </S.DropdownItem>
                </S.DropdownMenu>
              )}
            </S.FilterButtonGroup>

            {/* 정답률 */}
            <S.FilterButtonGroup>
              <S.FilterButton
                isActive={
                  openDropdown === "successRate" || successRateFilter !== null
                }
                onClick={() =>
                  setOpenDropdown(
                    openDropdown === "successRate" ? null : "successRate"
                  )
                }
              >
                {successRateLabel || "정답률"}
                <S.ArrowIcon src={ArrowDownIcon} alt="드롭다운" />
              </S.FilterButton>

              {openDropdown === "successRate" && (
                <S.DropdownMenu>
                  <S.DropdownItem
                    isSelected={successRateFilter === null}
                    onClick={() => handleSuccessRateSelect(null, null)}
                  >
                    선택 안함
                  </S.DropdownItem>
                  <S.DropdownItem
                    isSelected={successRateFilter === "asc"}
                    onClick={() =>
                      handleSuccessRateSelect("asc", "정답률 낮은 순")
                    }
                  >
                    정답률 낮은 순
                  </S.DropdownItem>
                  <S.DropdownItem
                    isSelected={successRateFilter === "desc"}
                    onClick={() =>
                      handleSuccessRateSelect("desc", "정답률 높은 순")
                    }
                  >
                    정답률 높은 순
                  </S.DropdownItem>
                </S.DropdownMenu>
              )}
            </S.FilterButtonGroup>
          </S.FilterButtonsWrapper>
        </S.FilterSection>

        {/* Problems Table */}
        <S.TableContainer>
          {/* Table Header */}
          <S.TableHeader>
            <S.TableHeaderCell>상태</S.TableHeaderCell>
            <S.TableHeaderCell>제목</S.TableHeaderCell>
            <S.TableHeaderCellRight>난이도</S.TableHeaderCellRight>
            <S.TableHeaderCellRight>완료한 사람</S.TableHeaderCellRight>
            <S.TableHeaderCellRight>정답률</S.TableHeaderCellRight>
          </S.TableHeader>

          {/* Table Body */}
          <S.TableBody>
            {getPaginatedProblems().map((problem, index) => (
              <S.TableRow
                key={problem.id}
                onClick={() => navigate(`/solve/${problem.id}`)}
                data-is-last={index === getPaginatedProblems().length - 1}
              >
                <S.TableCell>
                  {(problem.solved && (
                    <S.StatusIcon src={SuccessIcon} alt="해결됨" />
                  )) ||
                    (problem.failed && (
                      <S.StatusIcon src={FailIcon} alt="실패" />
                    ))}
                </S.TableCell>
                <S.TableCell>{problem.title}</S.TableCell>
                <S.TableCellRight>
                  <S.DifficultyImage
                    src={difficultyImages[problem.difficulty]}
                    alt={difficultyLabels[problem.difficulty]}
                  />
                </S.TableCellRight>
                <S.TableCellRight>{problem.completedCount}명</S.TableCellRight>
                <S.TableCellRight>{problem.successRate}%</S.TableCellRight>
              </S.TableRow>
            ))}
          </S.TableBody>
        </S.TableContainer>

        {/* Pagination */}
        <S.PaginationContainer>
          <S.PaginationButton
            onClick={handlePrevPage}
            style={{
              opacity: currentPage === 1 ? 0.5 : 1,
              cursor: currentPage === 1 ? "not-allowed" : "pointer",
            }}
          >
            <S.ArrowIcon src={ArrowLeftIcon} alt="이전" />
          </S.PaginationButton>
          <S.PaginationNumbers>
            {getPageRange().map((page) => (
              <S.PaginationNumber
                key={page}
                data-is-active={page === currentPage}
                onClick={() => handlePageChange(page)}
                style={{ cursor: "pointer" }}
              >
                {page}
              </S.PaginationNumber>
            ))}
          </S.PaginationNumbers>
          <S.PaginationButton
            onClick={handleNextPage}
            style={{
              opacity: currentPage === totalPages ? 0.5 : 1,
              cursor: currentPage === totalPages ? "not-allowed" : "pointer",
            }}
          >
            <S.ArrowIcon src={ArrowRightIcon} alt="다음" />
          </S.PaginationButton>
        </S.PaginationContainer>
      </S.MainContent>

      {/* Footer */}
      <Footer />
    </S.ProblemsContainer>
  );
}
