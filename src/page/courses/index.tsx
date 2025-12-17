import { Header } from "../../components/header";
import { Footer } from "../../components/footer";
import * as S from "./styles";
import copper from "../../assets/image/profile/dubi-rank/copper-dubi.png";
import god from "../../assets/image/profile/dubi-rank/god-dubi.png";
import gold from "../../assets/image/profile/dubi-rank/gold-dubi.png";
import iron from "../../assets/image/profile/dubi-rank/iron-dubi.png";
import jade from "../../assets/image/profile/dubi-rank/jade-dubi.png";
import silver from "../../assets/image/profile/dubi-rank/silver-dubi.png";
import wisp from "../../assets/image/profile/dubi-rank/wisp.png";

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

interface UserInfo {
  id: number;
  nickname: string;
  score: number;
  growth: string;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"inprogress" | "completed">(
    "inprogress"
  );
  const [pageByTab, setPageByTab] = useState<
    Record<"inprogress" | "completed", number>
  >({
    inprogress: 1,
    completed: 1,
  });
  const ITEMS_PER_PAGE = 8;
  const navigate = useNavigate();

  // Growth별 이미지 매핑
  const getAvatarImage = (growth: string) => {
    const growthMap: Record<string, string> = {
      COPPER: copper,
      SILVER: silver,
      GOLD: gold,
      JADE: jade,
      IRON: iron,
      GOD: god,
      WISP: wisp,
    };
    return growthMap[growth.toUpperCase()] || copper;
  };

  // Growth별 ProfileTitle 텍스트와 색상 결정
  const getGrowthStyle = (growth: string) => {
    const growthUpper = growth.toUpperCase();
    const colorMap: Record<string, { text: string; color: string }> = {
      COPPER: { text: "동깨비", color: "#B87333" },
      SILVER: { text: "은깨비", color: "#C0C0C0" },
      GOLD: { text: "금깨비", color: "#FFD700" },
      JADE: { text: "옥깨비", color: "#00A86B" },
      IRON: { text: "철깨비", color: "#D3D3D3" },
      GOD: { text: "신깨비", color: "#4169E1" },
      WISP: {
        text: "도깨비불",
        color:
          "linear-gradient(135deg, #FFFFFF 0%, #FFB6C1 25%, #FFD700 50%, #87CEEB 100%)",
      },
    };
    return colorMap[growthUpper] || { text: "", color: "#1d1d1d" };
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 사용자 정보 조회
        const userRes = await axiosInstance.get("/user");
        if (userRes.data) {
          setUserInfo(userRes.data);
        }

        const [inProgressRes, completedRes] = await Promise.allSettled([
          axiosInstance.get("/student/course/in-progress"),
          axiosInstance.get("/student/course/completed"),
        ]);

        const nextCourses: CourseItem[] = [];

        if (
          inProgressRes.status === "fulfilled" &&
          Array.isArray(inProgressRes.value.data)
        ) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const data = inProgressRes.value.data as any[];
          nextCourses.push(
            ...data.map<CourseItem>((it) => ({
              id: it.courseId ?? it.id ?? it.code ?? String(it._id ?? it.title),
              title: it.title ?? it.name ?? "제목 없음",
              desc: it.description ?? it.desc ?? "",
              image: it.image ?? it.thumbnail ?? undefined,
              level: it.level ?? it.difficulty ?? "",
              lessonCount: it.lessonCount ?? it.lessons ?? 0,
              status: "inprogress",
              progress: it.progressPercent ?? it.progress ?? 0,
              tags: (it.tags ?? it.keywords ?? []) as string[],
            }))
          );
        }

        if (
          completedRes.status === "fulfilled" &&
          Array.isArray(completedRes.value.data)
        ) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const data = completedRes.value.data as any[];
          nextCourses.push(
            ...data.map<CourseItem>((it) => ({
              id: it.courseId ?? it.id ?? it.code ?? String(it._id ?? it.title),
              title: it.title ?? it.name ?? "제목 없음",
              desc: it.description ?? it.desc ?? "",
              image: it.image ?? it.thumbnail ?? undefined,
              level: it.level ?? it.difficulty ?? "",
              lessonCount: it.lessonCount ?? it.lessons ?? 0,
              status: "completed" as const,
              progress: it.progressPercent ?? it.progress ?? 100,
              tags: it.tags ?? it.keywords ?? [],
            }))
          );
        }

        setCourses(nextCourses);
      } catch (err) {
        console.warn("Fetch failed, using fallback", err);
        setCourses([]);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  const handlePageChange = (page: number) => {
    setPageByTab((prev: Record<"inprogress" | "completed", number>) => ({
      ...prev,
      [activeTab]: page,
    }));
  };

  const filteredCourses = courses.filter((c: CourseItem) => {
    if (activeTab === "inprogress") return c.status === "inprogress";
    if (activeTab === "completed") return c.status === "completed";
    return true;
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCourses.length / ITEMS_PER_PAGE)
  );
  const currentPage = Math.min(pageByTab[activeTab], totalPages);

  return (
    <S.Container>
      <Header />

      <S.Main>
        {/** 전체 흰색 박스 */}
        <S.TopSection>
          {/* 프로필 영역 */}
          <S.ProfileRow>
            <S.Avatar
              src={userInfo ? getAvatarImage(userInfo.growth) : copper}
              alt="avatar"
            />

            <S.ProfileInfo>
              <div style={{ display: "flex", alignItems: "center" }}>
                <S.ProfileName>{userInfo?.nickname}</S.ProfileName>
                <S.ProfileTitle
                  style={{
                    color: getGrowthStyle(userInfo?.growth || "").color,
                    WebkitBackgroundClip: getGrowthStyle(
                      userInfo?.growth || ""
                    ).color.startsWith("linear-gradient")
                      ? "text"
                      : undefined,
                    WebkitTextFillColor: getGrowthStyle(
                      userInfo?.growth || ""
                    ).color.startsWith("linear-gradient")
                      ? "transparent"
                      : undefined,
                  }}
                >
                  ・ {getGrowthStyle(userInfo?.growth || "").text}
                </S.ProfileTitle>
              </div>
              <div style={{ color: "#bdbdbd", fontSize: 13 }}>
                {userInfo?.nickname || "yoonha2017"}
              </div>
            </S.ProfileInfo>

            <S.VerticalDivider />

            <S.ProgressWrapper>
              <S.ProgressLabel>
                <div style={{ fontWeight: 700, color: "#1d1d1d" }}>
                  나의 학습 진행도
                </div>
                <div style={{ color: "#bdbdbd", fontSize: 13 }}>
                  현재 40개의 코스 중 20개 코스 완료
                </div>
              </S.ProgressLabel>

              <S.ProgressBar>
                <S.ProgressFill $percent={30} />
              </S.ProgressBar>
            </S.ProgressWrapper>

            <S.RightProfileMeta>
              <div style={{ fontWeight: 700, color: "#BDBDBD" }}>30% 진행</div>
            </S.RightProfileMeta>
          </S.ProfileRow>

          {/* 탭 영역 */}
          <S.Tabs>
            <S.TabItem
              $active={activeTab === "inprogress"}
              onClick={() => setActiveTab("inprogress")}
            >
              학습 중인 코스
            </S.TabItem>
            <S.TabItem
              $active={activeTab === "completed"}
              onClick={() => setActiveTab("completed")}
            >
              완료한 코스
            </S.TabItem>
            <S.TabItem
              $active={false}
              onClick={() => navigate("/courses/explore")}
            >
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
                  <S.CourseDifficultyLabel
                    style={{ background: "#f0f0f0", height: 16 }}
                  />
                  <S.CourseTitle
                    style={{ background: "#f0f0f0", height: 18 }}
                  />
                  <S.CourseTagsWrapper>
                    <S.CourseTagChip
                      style={{ background: "#f6f6f6", height: 24 }}
                    />
                  </S.CourseTagsWrapper>
                  <S.CourseProgressSection>
                    <S.CourseProgressPercent
                      style={{ background: "#f0f0f0", height: 12 }}
                    />
                    <S.CourseProgressBar>
                      <S.CourseProgressFill $percent={0} />
                    </S.CourseProgressBar>
                  </S.CourseProgressSection>
                </S.CourseCard>
              ))
            : (() => {
                const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
                const endIndex = startIndex + ITEMS_PER_PAGE;
                const paginatedCourses = filteredCourses.slice(
                  startIndex,
                  endIndex
                );

                return paginatedCourses.map((c: CourseItem) => (
                  <S.CourseCard key={c.id}>
                    <S.CourseDifficultyLabel>
                      난이도 : {c.level ?? "-"}
                    </S.CourseDifficultyLabel>
                    <S.CourseTitle>{c.title}</S.CourseTitle>

                    <S.CourseTagsWrapper>
                      {(c.tags ?? []).slice(0, 4).map((t: string) => (
                        <S.CourseTagChip key={t}>{t}</S.CourseTagChip>
                      ))}
                    </S.CourseTagsWrapper>

                    <S.CourseProgressSection>
                      <S.CourseProgressPercent>
                        {c.progress ?? 0}%
                      </S.CourseProgressPercent>
                      <S.CourseProgressBar>
                        <S.CourseProgressFill $percent={c.progress ?? 0} />
                      </S.CourseProgressBar>
                    </S.CourseProgressSection>
                  </S.CourseCard>
                ));
              })()}
        </S.CourseGrid>

        {/* Pagination */}
        {!loading && filteredCourses.length === 0 ? (
          <div style={{ color: "#828282", marginTop: 24 }}>
            표시할 코스가 없습니다.
          </div>
        ) : filteredCourses.length > 0 ? (
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
              onClick={() =>
                handlePageChange(Math.min(totalPages, currentPage + 1))
              }
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
