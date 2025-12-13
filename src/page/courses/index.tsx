import { Header } from "../../components/header";
import { Footer } from "../../components/footer";
import * as S from "./styles";
import avatarImage from "../../assets/image/profile/dubi-profile.png";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";

interface CourseItem {
  id: string;
  title: string;
  desc?: string;
  image?: string;
  level?: string;
  lessonCount?: number;
  tags?: string[];
  progress?: number;
  status?: "inprogress" | "completed";
}

const FALLBACK_COURSES: CourseItem[] = [
  {
    id: "course-1",
    title: "알고리즘 입문 코스",
    desc: "기초부터 차근차근 배우는 알고리즘 입문 코스입니다.",
    image: undefined,
    level: "초급",
    lessonCount: 12,
    tags: ["#큐", "#스택", "#이진탐색"],
    progress: 100,
    status: "completed",
  },
  {
    id: "course-2",
    title: "자료구조 심화 코스",
    desc: "자료구조의 원리와 실전 활용을 다룹니다.",
    image: undefined,
    level: "중급",
    lessonCount: 16,
    tags: ["#그래프", "#DFS", "#BFS"],
    progress: 100,
    status: "completed",
  },
  {
    id: "course-3",
    title: "코딩 인터뷰 대비 코스",
    desc: "실전 문제 풀이와 면접 팁을 제공합니다.",
    image: undefined,
    level: "중/고급",
    lessonCount: 20,
    tags: ["#그리디", "#투포인터"],
    progress: 75,
    status: "inprogress",
  },
  {
    id: "course-4",
    title: "동적 프로그래밍 마스터",
    desc: "동적 프로그래밍 패턴과 최적화 전략을 배웁니다.",
    image: undefined,
    level: "중급",
    lessonCount: 18,
    tags: ["#DP", "#최적화", "#재귀"],
    progress: 45,
    status: "inprogress",
  },
  {
    id: "course-5",
    title: "그래프 알고리즘 완전정복",
    desc: "그래프 이론부터 실전 문제까지 완벽하게 학습합니다.",
    image: undefined,
    level: "고급",
    lessonCount: 24,
    tags: ["#그래프", "#최단경로", "#위상정렬"],
    progress: 60,
    status: "inprogress",
  },
  {
    id: "course-6",
    title: "백트래킹과 제약조건 만족",
    desc: "복잡한 문제를 체계적으로 해결하는 방법을 배웁니다.",
    image: undefined,
    level: "중고급",
    lessonCount: 14,
    tags: ["#백트래킹", "#NP", "#시뮬레이션"],
    progress: 30,
    status: "inprogress",
  },
  {
    id: "course-7",
    title: "정렬과 검색 심화",
    desc: "효율적인 정렬과 검색 알고리즘을 마스터합니다.",
    image: undefined,
    level: "초중급",
    lessonCount: 10,
    tags: ["#정렬", "#이진탐색", "#성능"],
    progress: 0,
    status: "completed",
  },
  {
    id: "course-8",
    title: "해시 테이블과 맵 구현",
    desc: "해시 함수와 충돌 해결 방법을 깊이 있게 학습합니다.",
    image: undefined,
    level: "중급",
    lessonCount: 12,
    tags: ["#해시", "#맵", "#데이터구조"],
    progress: 100,
    status: "completed",
  },
  {
    id: "course-9",
    title: "트리 구조 완벽 가이드",
    desc: "이진 트리부터 균형 트리까지 모든 것을 배웁니다.",
    image: undefined,
    level: "중급",
    lessonCount: 20,
    tags: ["#이진트리", "#AVL", "#BST"],
    progress: 50,
    status: "inprogress",
  },
  {
    id: "course-10",
    title: "힙과 우선순위 큐",
    desc: "힙 자료구조와 우선순위 큐의 실제 응용을 배웁니다.",
    image: undefined,
    level: "중급",
    lessonCount: 10,
    tags: ["#힙", "#우선순위큐", "#정렬"],
    progress: 85,
    status: "inprogress",
  },
  {
    id: "course-11",
    title: "분할 정복 패턴",
    desc: "분할 정복 알고리즘을 패턴별로 학습합니다.",
    image: undefined,
    level: "중급",
    lessonCount: 8,
    tags: ["#분할정복", "#퀵정렬", "#병합정렬"],
    progress: 40,
    status: "inprogress",
  },
  {
    id: "course-12",
    title: "탐욕 알고리즘 실전",
    desc: "그리디 전략과 증명 아이디어를 다룹니다.",
    image: undefined,
    level: "초중급",
    lessonCount: 9,
    tags: ["#그리디", "#증명", "#활용"],
    progress: 70,
    status: "inprogress",
  },
  {
    id: "course-13",
    title: "수학적 사고 훈련",
    desc: "조합론, 확률, 수열을 문제로 익힙니다.",
    image: undefined,
    level: "중급",
    lessonCount: 11,
    tags: ["#조합론", "#확률", "#수열"],
    progress: 100,
    status: "completed",
  },
  {
    id: "course-14",
    title: "코딩 인터뷰 50제",
    desc: "빈출 패턴으로 인터뷰 대비하기.",
    image: undefined,
    level: "중급",
    lessonCount: 15,
    tags: ["#패턴", "#문제풀이", "#인터뷰"],
    progress: 100,
    status: "completed",
  },
  {
    id: "course-15",
    title: "SQL과 데이터 처리",
    desc: "SQL 기초부터 최적화까지.",
    image: undefined,
    level: "초급",
    lessonCount: 12,
    tags: ["#SQL", "#쿼리", "#최적화"],
    progress: 100,
    status: "completed",
  },
  {
    id: "course-16",
    title: "웹 성능 최적화",
    desc: "프론트엔드 성능 향상 기법 모음.",
    image: undefined,
    level: "중급",
    lessonCount: 10,
    tags: ["#웹", "#성능", "#최적화"],
    progress: 100,
    status: "completed",
  },
  // 추가 더미 (학습 중) - 페이지네이션 3페이지 확보
  {
    id: "course-17",
    title: "그래프 이론 응용",
    desc: "실전 그래프 모델링 사례를 학습합니다.",
    image: undefined,
    level: "중급",
    lessonCount: 10,
    tags: ["#그래프", "#모델링", "#사례"],
    progress: 20,
    status: "inprogress",
  },
  {
    id: "course-18",
    title: "문자열 알고리즘",
    desc: "KMP, 트라이, Z 알고리즘을 익힙니다.",
    image: undefined,
    level: "중급",
    lessonCount: 9,
    tags: ["#문자열", "#KMP", "#트라이"],
    progress: 45,
    status: "inprogress",
  },
  {
    id: "course-19",
    title: "고급 DP 패턴",
    desc: "비트마스크, 구간 DP, 트리 DP를 다룹니다.",
    image: undefined,
    level: "고급",
    lessonCount: 12,
    tags: ["#DP", "#트리", "#비트마스크"],
    progress: 65,
    status: "inprogress",
  },
  {
    id: "course-20",
    title: "네트워크 플로우",
    desc: "플로우와 컷, 매칭 문제를 풉니다.",
    image: undefined,
    level: "고급",
    lessonCount: 11,
    tags: ["#플로우", "#매칭", "#컷"],
    progress: 10,
    status: "inprogress",
  },
  {
    id: "course-21",
    title: "시뮬레이션 실습",
    desc: "구현 & 시뮬레이션 문제 집중 훈련.",
    image: undefined,
    level: "초중급",
    lessonCount: 8,
    tags: ["#구현", "#시뮬레이션", "#연습"],
    progress: 55,
    status: "inprogress",
  },
  {
    id: "course-22",
    title: "백엔드 입문",
    desc: "REST, DB, 배포까지 기본기 다지기.",
    image: undefined,
    level: "초급",
    lessonCount: 10,
    tags: ["#백엔드", "#REST", "#DB"],
    progress: 75,
    status: "inprogress",
  },
  {
    id: "course-23",
    title: "프론트엔드 상태관리",
    desc: "상태 관리 전략과 패턴을 익힙니다.",
    image: undefined,
    level: "중급",
    lessonCount: 7,
    tags: ["#상태관리", "#패턴", "#리액트"],
    progress: 35,
    status: "inprogress",
  },
  {
    id: "course-24",
    title: "테스트 주도 개발",
    desc: "TDD 사이클과 실전 예제를 다룹니다.",
    image: undefined,
    level: "중급",
    lessonCount: 9,
    tags: ["#TDD", "#테스트", "#사이클"],
    progress: 15,
    status: "inprogress",
  },
  {
    id: "course-25",
    title: "알고리즘 리팩터링",
    desc: "기존 풀이를 더 깔끔하게 개선하는 법.",
    image: undefined,
    level: "중급",
    lessonCount: 6,
    tags: ["#리팩터링", "#클린코드", "#성능"],
    progress: 5,
    status: "inprogress",
  },
  {
    id: "course-26",
    title: "시각화와 자료 표현",
    desc: "문제 풀이 시 자료를 시각화하는 방법.",
    image: undefined,
    level: "초중급",
    lessonCount: 6,
    tags: ["#시각화", "#자료표현", "#도식"],
    progress: 25,
    status: "inprogress",
  },
  // 추가 더미 (완료) - 페이지네이션 3페이지 확보
  {
    id: "course-27",
    title: "보안 기초",
    desc: "웹 보안의 기본 원칙과 모범 사례.",
    image: undefined,
    level: "초급",
    lessonCount: 7,
    tags: ["#보안", "#OWASP", "#기초"],
    progress: 100,
    status: "completed",
  },
  {
    id: "course-28",
    title: "자료구조 리뷰",
    desc: "핵심 자료구조를 다시 점검합니다.",
    image: undefined,
    level: "초중급",
    lessonCount: 8,
    tags: ["#자료구조", "#리뷰", "#핵심"],
    progress: 100,
    status: "completed",
  },
  {
    id: "course-29",
    title: "프로그래밍 패턴",
    desc: "디자인 패턴과 실전 적용.",
    image: undefined,
    level: "중급",
    lessonCount: 10,
    tags: ["#패턴", "#디자인패턴", "#적용"],
    progress: 100,
    status: "completed",
  },
  {
    id: "course-30",
    title: "최적화 기법",
    desc: "알고리즘과 코드 최적화 기초.",
    image: undefined,
    level: "중급",
    lessonCount: 9,
    tags: ["#최적화", "#성능", "#팁"],
    progress: 100,
    status: "completed",
  },
  {
    id: "course-31",
    title: "클라우드 기본기",
    desc: "클라우드 서비스의 핵심 개념 익히기.",
    image: undefined,
    level: "초급",
    lessonCount: 8,
    tags: ["#클라우드", "#기초", "#서비스"],
    progress: 100,
    status: "completed",
  },
  {
    id: "course-32",
    title: "데브옵스 워크플로",
    desc: "CI/CD와 모니터링 흐름 익히기.",
    image: undefined,
    level: "중급",
    lessonCount: 9,
    tags: ["#CI/CD", "#모니터링", "#워크플로"],
    progress: 100,
    status: "completed",
  },
  {
    id: "course-33",
    title: "협업과 코드리뷰",
    desc: "팀 협업 규칙과 코드리뷰 스킬.",
    image: undefined,
    level: "초중급",
    lessonCount: 6,
    tags: ["#협업", "#코드리뷰", "#팀워크"],
    progress: 100,
    status: "completed",
  },
  {
    id: "course-34",
    title: "문제 해결 패턴",
    desc: "빈출 풀이 패턴을 정리합니다.",
    image: undefined,
    level: "중급",
    lessonCount: 8,
    tags: ["#패턴", "#풀이", "#정리"],
    progress: 100,
    status: "completed",
  },
  {
    id: "course-35",
    title: "데이터 시각화",
    desc: "시각화 라이브러리와 차트 활용.",
    image: undefined,
    level: "초중급",
    lessonCount: 7,
    tags: ["#시각화", "#차트", "#라이브러리"],
    progress: 100,
    status: "completed",
  },
  {
    id: "course-36",
    title: "형상관리",
    desc: "Git과 협업 브랜치 전략.",
    image: undefined,
    level: "초중급",
    lessonCount: 6,
    tags: ["#Git", "#브랜치", "#협업"],
    progress: 100,
    status: "completed",
  },
];

export default function CoursesPage() {
  const [courses, setCourses] = useState<CourseItem[]>(FALLBACK_COURSES);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"inprogress" | "completed">("inprogress");
  const [pageByTab, setPageByTab] = useState({
    inprogress: 1,
    completed: 1,
  });
  const ITEMS_PER_PAGE = 8; 
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get("/courses");

        if (Array.isArray(res.data)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const data = res.data as any[];
          const mapped: CourseItem[] = data.map((it) => ({
            id: it.id ?? it.code ?? String(it._id ?? it.title),
            title: it.title ?? it.name ?? "제목 없음",
            desc: it.description ?? it.desc ?? "",
            image: it.image ?? it.thumbnail ?? undefined,
            level: it.level ?? it.difficulty ?? "",
            lessonCount: it.lessonCount ?? it.lessons ?? 0,
            status: it.status ?? "inprogress",
          }));

          setCourses(mapped);
        }
      } catch (err) {
        console.warn("/courses fetch failed, using fallback", err);
      }
      setLoading(false);
    };

    fetchCourses();
  }, []);

  const handlePageChange = (page: number) => {
    setPageByTab((prev) => ({ ...prev, [activeTab]: page }));
  };

  const filteredCourses = courses.filter((c) => {
    if (activeTab === "inprogress") return c.status === "inprogress";
    if (activeTab === "completed") return c.status === "completed";
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredCourses.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(pageByTab[activeTab], totalPages);

  return (
    <S.Container>
      <Header />

      <S.Main>
        {/** 전체 흰색 박스 */}
        <S.TopSection>
          {/* 프로필 영역 */}
          <S.ProfileRow>
            <S.Avatar src={avatarImage} alt="avatar" />

            <S.ProfileInfo>
              <div style={{ display: "flex", alignItems: "center" }}>
                <S.ProfileName>이윤하</S.ProfileName>
                <S.ProfileTitle>・ 뚝깨비</S.ProfileTitle>
              </div>
              <div style={{ color: "#bdbdbd", fontSize: 13 }}>yoonha2017</div>
            </S.ProfileInfo>

            <S.VerticalDivider />

            <S.ProgressWrapper>
              <S.ProgressLabel>
                <div style={{ fontWeight: 700, color: "#1d1d1d" }}>나의 학습 진행도</div>
                <div style={{ color: "#bdbdbd", fontSize: 13 }}>
                  현재 40개의 코스 중 20개 코스 완료
                </div>
              </S.ProgressLabel>

              <S.ProgressBar>
                <S.ProgressFill $percent={30} />
              </S.ProgressBar>
            </S.ProgressWrapper>

            <S.RightProfileMeta>
              <div style={{ fontWeight: 700, color: "#BDBDBD"}}>30% 진행</div>
            </S.RightProfileMeta>
          </S.ProfileRow>

          {/* 탭 영역 */}
          <S.Tabs>
            <S.TabItem $active={activeTab === "inprogress"} onClick={() => setActiveTab("inprogress")}>
              학습 중인 코스
            </S.TabItem>
            <S.TabItem $active={activeTab === "completed"} onClick={() => setActiveTab("completed")}>
              완료한 코스
            </S.TabItem>
            <S.TabItem $active={false} onClick={() => navigate("/courses/explore")}>
              코스 탐방 →
            </S.TabItem>
          </S.Tabs>
        </S.TopSection>


        <S.SectionTitle>
            {activeTab === "inprogress" ? "학습 중인 코스" : "완료한 코스"}
        </S.SectionTitle>


        {/* 코스 카드 목록 */}
        <S.CourseGrid>
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <S.CourseCard key={`ph-${i}`} style={{ opacity: 0.7 }}>
                  <S.CourseDifficultyLabel style={{ background: "#f0f0f0", height: 16 }} />
                  <S.CourseTitle style={{ background: "#f0f0f0", height: 18 }} />
                  <S.CourseTagsWrapper>
                    <S.CourseTagChip style={{ background: "#f6f6f6", height: 24 }} />
                  </S.CourseTagsWrapper>
                  <S.CourseProgressSection>
                    <S.CourseProgressPercent style={{ background: "#f0f0f0", height: 12 }} />
                    <S.CourseProgressBar>
                      <S.CourseProgressFill $percent={0} />
                    </S.CourseProgressBar>
                  </S.CourseProgressSection>
                </S.CourseCard>
              ))
            : (() => {
                const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
                const endIndex = startIndex + ITEMS_PER_PAGE;
                const paginatedCourses = filteredCourses.slice(startIndex, endIndex);

                return paginatedCourses.map((c) => (
                  <S.CourseCard key={c.id}>
                    <S.CourseDifficultyLabel>난이도 : {c.level ?? "-"}</S.CourseDifficultyLabel>
                    <S.CourseTitle>{c.title}</S.CourseTitle>

                    <S.CourseTagsWrapper>
                      {(c.tags ?? []).slice(0, 4).map((t) => (
                        <S.CourseTagChip key={t}>{t}</S.CourseTagChip>
                      ))}
                    </S.CourseTagsWrapper>

                    <S.CourseProgressSection>
                      <S.CourseProgressPercent>{c.progress ?? 0}%</S.CourseProgressPercent>
                      <S.CourseProgressBar>
                        <S.CourseProgressFill $percent={c.progress ?? 0} />
                      </S.CourseProgressBar>
                    </S.CourseProgressSection>
                  </S.CourseCard>
                ));
              })()}
        </S.CourseGrid>

        {/* Pagination */}
        {filteredCourses.length > 0 ? (
          <S.PaginationWrapper>
            <S.PaginationButton
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              style={{ fontSize: "30px", lineHeight: 0, color: "#BDBDBD" }}
            >
              ‹
            </S.PaginationButton>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <S.PaginationButton
                key={page}
                $active={currentPage === page}
                onClick={() => handlePageChange(page)}
              >
                {page}
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

      <Footer />
    </S.Container>
  );
}
