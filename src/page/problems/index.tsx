import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import problemApi from "../../api/problemApi";
import * as S from "./style";
import { Header } from "../../components/header";
import { Footer } from "../../components/footer";
import {
  SearchBar,
  FilterSection,
  ProblemsTable,
  Pagination,
} from "../../components/problems";

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

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isFirst, setIsFirst] = useState(true);
  const [isLast, setIsLast] = useState(true);
  const itemsPerPage = 15;

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
    fetchProblems(currentPage);
  }, [currentPage, difficultyFilter, successRateFilter, sortBy, searchTerm]);

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

  const fetchProblems = async (page: number) => {
    setIsLoading(true);
    try {
      const params: Record<string, any> = {
        page,
        size: itemsPerPage,
      };

      if (difficultyFilter !== null) {
        params.difficulty = difficultyReverseMap[difficultyFilter];
      }
      if (successRateFilter) {
        params.correctRate = successRateFilter === "asc" ? "low" : "high";
      }
      if (sortBy) {
        params.time = sortBy;
      }
      if (searchTerm) {
        params.name = searchTerm;
      }

      const data = await problemApi.getProblems<{
        content: unknown[];
        totalPages: number;
        first: boolean;
        last: boolean;
      }>(params);
      const { content, totalPages: tp, first, last } = data;

      mapProblems(content || []);
      setTotalPages(tp || 0);
      setIsFirst(first ?? true);
      setIsLast(last ?? true);
    } catch (error) {
      console.error("Failed to fetch problems:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(0);
  };

  const handleDifficultySelect = (
    level: number | null,
    label: string | null,
  ) => {
    setDifficultyFilter(level);
    setDifficultyLabel(label);
    setOpenDropdown(null);
    setCurrentPage(0);
  };

  const handleTimeSelect = (time: string | null, label: string | null) => {
    setSortBy(time);
    setTimeLabel(label);
    setOpenDropdown(null);
    setCurrentPage(0);
  };

  const handleSuccessRateSelect = (
    order: "asc" | "desc" | null,
    label: string | null,
  ) => {
    setSuccessRateFilter(order);
    setSuccessRateLabel(label);
    setOpenDropdown(null);
    setCurrentPage(0);
  };

  const getPageRange = () => {
    const maxVisiblePages = 5;
    const halfVisible = Math.floor(maxVisiblePages / 2);
    const displayPage = currentPage + 1;

    let startPage = Math.max(1, displayPage - halfVisible);
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  const handlePageChange = (page: number) => {
    const zeroBasedPage = page - 1;
    if (zeroBasedPage >= 0 && zeroBasedPage < totalPages) {
      setCurrentPage(zeroBasedPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevPage = () => {
    if (!isFirst) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleNextPage = () => {
    if (!isLast) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <S.ProblemsContainer>
      <Header />

      <S.MainContent>
        <SearchBar searchTerm={searchTerm} onSearch={handleSearch} />

        <FilterSection
          dropdownRef={dropdownRef}
          openDropdown={openDropdown}
          setOpenDropdown={setOpenDropdown}
          difficultyFilter={difficultyFilter}
          difficultyLabel={difficultyLabel}
          sortBy={sortBy}
          timeLabel={timeLabel}
          successRateFilter={successRateFilter}
          successRateLabel={successRateLabel}
          onDifficultySelect={handleDifficultySelect}
          onTimeSelect={handleTimeSelect}
          onSuccessRateSelect={handleSuccessRateSelect}
        />

        <ProblemsTable problems={problems} navigate={navigate} />

        <Pagination
          isFirst={isFirst}
          isLast={isLast}
          currentPage={currentPage}
          getPageRange={getPageRange}
          onPrev={handlePrevPage}
          onNext={handleNextPage}
          onChange={handlePageChange}
        />
      </S.MainContent>

      <Footer />
    </S.ProblemsContainer>
  );
}
