import type { ChangeEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../../../components/header";
import { Footer } from "../../../components/footer";
import * as S from "./style";
import { SearchBar, CourseCard, Pagination } from "../../../components/courses/explore";
import courseApi from "../../../api/courseApi";

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
        const res = await courseApi.getJoinableCourses();
        if (Array.isArray(res)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const data = res as any[];
          console.log(data);
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
      courses.filter((c) =>
        c.title.toLowerCase().includes(query.toLowerCase())
      ),
    [courses, query]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice(
    (currentPage - 1) * PER_PAGE,
    currentPage * PER_PAGE
  );

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <S.Container>
      <Header />

      <S.Main>
        <SearchBar
          query={query}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            setQuery(e.target.value);
            handlePageChange(1);
          }}
        />

        <S.Grid>
          {loading
            ? Array.from({ length: 8 }).map((_, idx) => (
                <CourseCard key={`skeleton-${idx}`} loading />
              ))
            : pageItems.map((c) => (
                <CourseCard key={c.id} course={c} onEnter={() => navigate(`/courses/${c.id}`)} />
              ))}
        </S.Grid>

        {filtered.length > 0 ? (
          <Pagination totalPages={totalPages} currentPage={currentPage} onPageChange={handlePageChange} />
        ) : null}
      </S.Main>

      <S.BackButton onClick={() => navigate("/courses")}>←</S.BackButton>

      <Footer />
    </S.Container>
  );
};

export default CoursePage;
