import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../../components/header";
import { Footer } from "../../components/footer";
import * as S from "./style";
import SearchIcon from "../../assets/image/problems/search.png";
import axiosInstance from "../../api/axiosInstance";

interface CourseItem {
  id: string;
  title: string;
  level?: string;
  keywords?: string[];
  progress?: number;
  status?: string;
}

const CoursePage = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(false);
  const PER_PAGE = 12;

  useEffect(() => {
    const fetchJoinableCourses = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get("/student/course/joinable");
        if (Array.isArray(res.data)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const data = res.data as any[];
          const mapped = data.map<CourseItem>((it) => ({
            id: String(it.courseId ?? it.id ?? it.code ?? it.title),
            title: it.title ?? it.name ?? "제목 없음",
            level: it.level ?? it.difficulty ?? "-",
            keywords: (it.tags ?? it.keywords ?? []) as string[],
            progress: it.progressPercent ?? it.progress ?? 0,
            status: it.status ?? "NOT_STARTED",
          }));

          setCourses(mapped);
        } else {
          setCourses([]);
        }
      } catch (err) {
        console.warn("/student/course/joinable fetch failed", err);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchJoinableCourses();
  }, []);

  const filtered = useMemo(
    () =>
      courses.filter((c) => c.title.toLowerCase().includes(query.toLowerCase())),
    [courses, query]
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
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setQuery(e.target.value);
              handlePageChange(1);
            }}
          />
          <S.SearchIcon aria-hidden>
            <img src={SearchIcon} alt="검색" />
          </S.SearchIcon>
        </S.SearchBar>

        <S.Grid>
          {loading
            ? Array.from({ length: 8 }).map((_, idx) => (
                <S.Card key={`skeleton-${idx}`} style={{ opacity: 0.7 }}>
                  <S.CardContent>
                    <S.LevelBadge style={{ background: "#f0f0f0", height: 14, width: "60%" }} />
                    <S.CardTitle style={{ background: "#f0f0f0", height: 18, width: "90%" }} />
                    <S.KeywordContainer>
                      {Array.from({ length: 2 }).map((__, k) => (
                        <S.Keyword key={k} style={{ background: "#f6f6f6", borderColor: "#f6f6f6" }}>
                          &nbsp;
                        </S.Keyword>
                      ))}
                    </S.KeywordContainer>
                  </S.CardContent>
                  <S.SolveButton style={{ background: "#e0e0e0", color: "#bdbdbd" }}>로딩 중…</S.SolveButton>
                </S.Card>
              ))
            : pageItems.map((c) => (
                <S.Card key={c.id}>
                  <S.CardContent>
                    <S.LevelBadge>난이도 : {c.level ?? "-"}</S.LevelBadge>
                    <S.CardTitle>{c.title}</S.CardTitle>
                    <S.KeywordContainer>
                      {(c.keywords ?? []).length > 0 ? (
                        (c.keywords ?? []).slice(0, 4).map((keyword, idx) => (
                          <S.Keyword key={idx}>{keyword}</S.Keyword>
                        ))
                      ) : (
                        <S.Keyword>{c.status ?? "참여 가능"}</S.Keyword>
                      )}
                    </S.KeywordContainer>
                  </S.CardContent>
                  <S.SolveButton>코스 입장 →</S.SolveButton>
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
