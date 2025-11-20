import { useState, useEffect } from "react";
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

  useEffect(() => {
    if (difficultyFilter !== null || successRateFilter || sortBy) {
      fetchFilteredProblems();
    }
  }, [difficultyFilter, successRateFilter, sortBy]);

  const difficultyMap: Record<string, number> = {
    GOLD: 1,
    SLIVER: 2,
    COPPER: 3,
    IRON: 4,
    JADE: 5,
  };

  const difficultyReverseMap: Record<number, string> = {
    1: "GOLD",
    2: "SLIVER",
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
      if (difficultyFilter !== null) {
        params.difficulty = difficultyReverseMap[difficultyFilter];
      }
      if (successRateFilter) {
        params.correctRate = successRateFilter === "asc" ? "low" : "high";
      }
      if (sortBy) {
        params.time = sortBy;
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
  };

  const handleTimeSelect = (time: string | null, label: string | null) => {
    setSortBy(time);
    setTimeLabel(label); // 추가
    setOpenDropdown(null);
  };

  const handleSuccessRateSelect = (
    order: "asc" | "desc" | null,
    label: string | null
  ) => {
    setSuccessRateFilter(order);
    setSuccessRateLabel(label);
    setOpenDropdown(null);
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
        <S.FilterSection>
          <S.FilterButtonsWrapper>
            <S.FilterButtonGroup>
              <S.FilterButton
                data-is-active={openDropdown === "difficulty"}
                onClick={() =>
                  setOpenDropdown(
                    openDropdown === "difficulty" ? null : "difficulty"
                  )
                }
              >
                {difficultyLabel || "난이도"}
                <S.ArrowIcon src={ArrowDownIcon} alt="드롭다운" />
              </S.FilterButton>

              {/* Dropdown Menu - Difficulty */}
              {openDropdown === "difficulty" && (
                <S.DropdownMenu>
                  <S.DropdownItem
                    data-is-selected={difficultyFilter === null}
                    onClick={() => handleDifficultySelect(null, null)}
                  >
                    선택 안함
                  </S.DropdownItem>
                  <S.DropdownItem
                    data-is-selected={difficultyFilter === 1}
                    onClick={() => handleDifficultySelect(1, "금")}
                  >
                    금
                  </S.DropdownItem>
                  <S.DropdownItem
                    data-is-selected={difficultyFilter === 2}
                    onClick={() => handleDifficultySelect(2, "은")}
                  >
                    은
                  </S.DropdownItem>
                  <S.DropdownItem
                    data-is-selected={difficultyFilter === 3}
                    onClick={() => handleDifficultySelect(3, "동")}
                  >
                    동
                  </S.DropdownItem>
                  <S.DropdownItem
                    data-is-selected={difficultyFilter === 4}
                    onClick={() => handleDifficultySelect(4, "철")}
                  >
                    철
                  </S.DropdownItem>
                  <S.DropdownItem
                    data-is-selected={difficultyFilter === 5}
                    onClick={() => handleDifficultySelect(5, "옥")}
                  >
                    옥
                  </S.DropdownItem>
                </S.DropdownMenu>
              )}
            </S.FilterButtonGroup>

            <S.FilterButtonGroup>
              <S.FilterButton
                data-is-active={openDropdown === "time"}
                onClick={() =>
                  setOpenDropdown(openDropdown === "time" ? null : "time")
                }
              >
                {timeLabel || "시간"}
                <S.ArrowIcon src={ArrowDownIcon} alt="드롭다운" />
              </S.FilterButton>

              {/* Dropdown Menu - Time */}
              {openDropdown === "time" && (
                <S.DropdownMenu>
                  <S.DropdownItem
                    data-is-selected={sortBy === null}
                    onClick={() => handleTimeSelect(null, null)}
                  >
                    선택 안함
                  </S.DropdownItem>
                  <S.DropdownItem
                    data-is-selected={sortBy === "recent"}
                    onClick={() => handleTimeSelect("recent", "최신순")}
                  >
                    최신순
                  </S.DropdownItem>
                  <S.DropdownItem
                    data-is-selected={sortBy === "old"}
                    onClick={() => handleTimeSelect("old", "오래된순")}
                  >
                    오래된순
                  </S.DropdownItem>
                </S.DropdownMenu>
              )}
            </S.FilterButtonGroup>

            <S.FilterButtonGroup>
              <S.FilterButton
                data-is-active={openDropdown === "successRate"}
                onClick={() =>
                  setOpenDropdown(
                    openDropdown === "successRate" ? null : "successRate"
                  )
                }
              >
                {successRateLabel || "정답률"}
                <S.ArrowIcon src={ArrowDownIcon} alt="드롭다운" />
              </S.FilterButton>

              {/* Dropdown Menu - Success Rate */}
              {openDropdown === "successRate" && (
                <S.DropdownMenu>
                  <S.DropdownItem
                    data-is-selected={successRateFilter === null}
                    onClick={() => handleSuccessRateSelect(null, null)}
                  >
                    선택 안함
                  </S.DropdownItem>
                  <S.DropdownItem
                    data-is-selected={successRateFilter === "asc"}
                    onClick={() =>
                      handleSuccessRateSelect("asc", "정답률 낮은 순")
                    }
                  >
                    정답률 낮은 순
                  </S.DropdownItem>
                  <S.DropdownItem
                    data-is-selected={successRateFilter === "desc"}
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
            {filteredProblems.map((problem, index) => (
              <S.TableRow
                key={problem.id}
                onClick={() => navigate(`/solve/${problem.id}`)}
                data-is-last={index === filteredProblems.length - 1}
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
          <S.PaginationButton>
            <S.ArrowIcon src={ArrowLeftIcon} alt="이전" />
          </S.PaginationButton>
          <S.PaginationNumbers>
            <S.PaginationNumber data-is-active={true}>1</S.PaginationNumber>
            <S.PaginationNumber>2</S.PaginationNumber>
            <S.PaginationNumber>3</S.PaginationNumber>
            <S.PaginationNumber>4</S.PaginationNumber>
            <S.PaginationNumber>5</S.PaginationNumber>
          </S.PaginationNumbers>
          <S.PaginationButton>
            <S.ArrowIcon src={ArrowRightIcon} alt="다음" />
          </S.PaginationButton>
        </S.PaginationContainer>
      </S.MainContent>

      {/* Footer */}
      <Footer />
    </S.ProblemsContainer>
  );
}
