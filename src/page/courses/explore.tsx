import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../../components/header";
import { Footer } from "../../components/footer";
import * as S from "./style";
import SearchIcon from "../../assets/image/problems/search.png";

interface CourseItem {
  id: number;
  title: string;
  level: string;
  keywords: string[];
}



const MOCK: CourseItem[] = Array.from({ length: 24 }, (_, i) => ({
  id: i + 1,
  title: "자료구조 알고리즘",
  level: "상",
  keywords: ["#자료", "#구조", "#알고리즘", "#그래프"],
}));

const CoursePage = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const PER_PAGE = 12;

  const filtered = useMemo(
    () =>
      MOCK.filter((c) => c.title.toLowerCase().includes(query.toLowerCase())),
    [query]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <S.Container>
      <Header />

      <S.Main>
        <S.SearchBar>
          <S.SearchInput
            placeholder="대회 이름을 검색하세요..."
            value={query}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setQuery(e.target.value);
              handlePageChange(1);
            }}
          />
          <S.SearchIcon aria-hidden>
            <img src={SearchIcon} alt="검색" />
          </S.SearchIcon>
        </S.SearchBar>

        <S.Grid>
          {pageItems.map((c) => (
            <S.Card key={c.id}>
              <S.CardContent>
                <S.LevelBadge>난이도 : {c.level}</S.LevelBadge>
                <S.CardTitle>{c.title}</S.CardTitle>
                <S.KeywordContainer>
                  {c.keywords.map((keyword, idx) => (
                    <S.Keyword key={idx}>{keyword}</S.Keyword>
                  ))}
                </S.KeywordContainer>
              </S.CardContent>
              <S.SolveButton>
                문제 풀기 →
              </S.SolveButton>
            </S.Card>
          ))}
        </S.Grid>

        {filtered.length > 0 ? (
          <S.PaginationWrapper>
            <S.PaginationButton
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              style={{ fontSize: "30px", lineHeight: 0, color: "#BDBDBD" }}
            >
              ‹
            </S.PaginationButton>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <S.PaginationButton
                key={pageNum}
                $active={currentPage === pageNum}
                onClick={() => handlePageChange(pageNum)}
              >
                {pageNum}
              </S.PaginationButton>
            ))}

            <S.PaginationButton
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              style={{ fontSize: "30px", lineHeight: 0, color: "#BDBDBD" }}
            >
              ›
            </S.PaginationButton>
          </S.PaginationWrapper>
        ) : null}
      </S.Main>

      <S.BackButton onClick={() => navigate("/courses")}>
        ←
      </S.BackButton>

      <Footer />
    </S.Container>
  );
};

export default CoursePage;
