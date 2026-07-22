import { useEffect, useState, useMemo } from "react";
import { Header } from "../../../components/header";
import { Footer } from "../../../components/footer";
import contestApi from "../../../api/contestApi";
import { useNavigate } from "react-router-dom";
import * as S from "./style";
import {
  HeroBanner,
  SearchBar,
  ContestsGrid,
  Pagination,
} from "../../../components/contests";

interface Contest {
  code: string;
  title: string;
  dDay: string;
  participantCount: number;
  status: "JOINABLE" | "JOINED" | "ENDED";
  image: string;
}

interface ContestAPIResponse {
  code: string;
  title: string;
  dDay: string;
  participantCount: number;
  status: "JOINABLE" | "JOINED" | "ENDED";
  imageUrl?: string;
}

const DEFAULT_IMAGE = "https://i.ibb.co/Rp6GC0LG/dgsw.png";

const ContestPage = () => {
  const navigate = useNavigate();

  const [contests, setContests] = useState<Contest[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [currentSlide, setCurrentSlide] = useState(1);

  useEffect(() => {
    Object.keys(localStorage).forEach((key) => {
      if (
        key.startsWith("dukkaebi_codes_") ||
        key.startsWith("dukkaebi_timeSpent_") ||
        key.startsWith("dukkaebi_submitted_")
      ) {
        localStorage.removeItem(key);
      }
    });
  }, []);

  useEffect(() => {
    const fetchContests = async () => {
      try {
        const data = await contestApi.getContests<{
          content: ContestAPIResponse[];
          totalPages: number;
        }>(currentPage - 1, 12);

        if (data && Array.isArray(data.content)) {
          const mappedContests = data.content.map((c: ContestAPIResponse) => ({
            code: c.code,
            title: c.title,
            dDay: c.dDay,
            participantCount: c.participantCount,
            status: c.status,
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
  }, [currentPage]);

  const filteredContests = useMemo(() => {
    return contests.filter((contest) =>
      contest.title.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [contests, searchTerm]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const getPageNumbers = () => {
    const maxVisiblePages = 5;
    const pages = [];
    let startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      if (i >= 1) pages.push(i);
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

  const moveToContestDetail = (code: string) => {
    navigate(`/contests/${code}`);
  };

  return (
    <>
      <S.Container>
        <Header />

        <HeroBanner
          currentSlide={currentSlide}
          onPrevSlide={() => setCurrentSlide(Math.max(1, currentSlide - 1))}
          onNextSlide={() => setCurrentSlide(Math.min(5, currentSlide + 1))}
        />

        <S.MainContent>
          <SearchBar searchTerm={searchTerm} onChange={handleSearchChange} />

          <S.ContestsSection>
            <ContestsGrid
              contests={filteredContests}
              searchTerm={searchTerm}
              onCardClick={moveToContestDetail}
              defaultImage={DEFAULT_IMAGE}
            />

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageNumbers={pageNumbers}
              onPageChange={setCurrentPage}
              onPrevPage={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              onNextPage={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
            />
          </S.ContestsSection>
        </S.MainContent>

        <Footer />
      </S.Container>
    </>
  );
};

export default ContestPage;
