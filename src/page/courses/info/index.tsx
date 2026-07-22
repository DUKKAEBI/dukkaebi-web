import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Header } from "../../../components/header";
import courseApi from "../../../api/courseApi";
import * as S from "./style";
import { IntroSection, ProblemsTable, SideCard } from "../../../components/courses/info";

type ProblemStatus = "submitted" | "pending" | "failed";

interface ApiProblem {
  problemId?: number;
  name?: string;
  title?: string;
  solvedResult?: string;
}

interface ApiCourseDetail {
  title?: string;
  description?: string;
  keywords?: string[];
  tags?: string[];
  level?: string;
  status?: string;
  joined?: boolean;
  isJoined?: boolean;
  enrolled?: boolean;
  isEnrolled?: boolean;
  myEnrollment?: boolean;
  isMyCourse?: boolean;
  isMember?: boolean;
  startDate?: string;
  createdAt?: string;
  addedAt?: string;
  problems?: ApiProblem[];
}

interface ProblemItem {
  id: number;
  title: string;
  status: ProblemStatus;
}

interface CourseDetailData {
  title: string;
  description: string;
  tags: string[];
  progress: number;
  isJoined: boolean;
  summary: {
    startAt: string;
    questionCount: number;
    level: string;
  };
  problems: ProblemItem[];
}

const emptyCourseData: CourseDetailData = {
  title: "",
  description: "",
  tags: [],
  progress: 0,
  isJoined: false,
  summary: {
    startAt: "-",
    questionCount: 0,
    level: "-",
  },
  problems: [],
};

const toProblemStatus = (result?: string): ProblemStatus => {
  if (result === "SOLVED") return "submitted";
  if (result === "FAILED") return "failed";
  return "pending";
};

const formatDate = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
};

const isJoinedFlag = (raw: ApiCourseDetail) => {
  const statusText = (raw.status ?? "").toUpperCase();
  return (
    raw.joined ||
    raw.isJoined ||
    raw.enrolled ||
    raw.isEnrolled ||
    raw.myEnrollment ||
    raw.isMyCourse ||
    raw.isMember ||
    statusText === "JOINED" ||
    statusText === "ENROLLED" ||
    statusText === "IN_PROGRESS" ||
    statusText === "INPROGRESS" ||
    statusText === "ONGOING"
  );
};

const mapCourseDetail = (raw: ApiCourseDetail): CourseDetailData => {
  const problems: ProblemItem[] = Array.isArray(raw?.problems)
    ? raw.problems.map((p, idx) => ({
        id: p?.problemId ?? idx + 1,
        title: p?.name ?? p?.title ?? "제목 없음",
        status: toProblemStatus(p?.solvedResult),
      }))
    : [];

  const solvedCount = problems.filter((p) => p.status === "submitted").length;
  const progress = problems.length
    ? Math.round((solvedCount / problems.length) * 100)
    : 0;

  return {
    title: raw?.title ?? "제목 없음",
    description: raw?.description ?? "",
    tags: Array.isArray(raw?.keywords)
      ? raw.keywords
      : Array.isArray(raw?.tags)
      ? raw.tags
      : [],
    progress,
    isJoined: Boolean(
      isJoinedFlag(raw) ||
        (Array.isArray(raw?.problems) && raw.problems.length > 0)
    ),
    summary: {
      startAt: formatDate(raw?.startDate ?? raw?.createdAt ?? raw?.addedAt),
      questionCount: problems.length,
      level: raw?.level ?? "-",
    },
    problems,
  };
};

const CourseDetailPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [courseData, setCourseData] =
    useState<CourseDetailData>(emptyCourseData);
  const [loading, setLoading] = useState(true);
  const [joinLoading, setJoinLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCourseDetail = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const data = await courseApi.getCourse<ApiCourseDetail>(id);
      setCourseData(mapCourseDetail(data));
    } catch (err) {
      console.error("Failed to fetch course detail:", err);
      setError("코스 정보를 불러오지 못했습니다.");
      setCourseData(emptyCourseData);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!courseId) {
      setLoading(false);
      return;
    }

    // 사용자가 코스 상세 페이지에 들어오면 해당 코스의 이전 작업물을 초기화
    localStorage.removeItem(`course_${courseId}_codes`);
    localStorage.removeItem(`course_${courseId}_langs`);

    fetchCourseDetail(courseId);
  }, [courseId, fetchCourseDetail]);

  const handleJoinCourse = async () => {
    if (!courseId || joinLoading || courseData.isJoined) return;
    setJoinLoading(true);
    try {
      await courseApi.joinCourse(courseId);
      setCourseData((prev) => ({ ...prev, isJoined: true }));
      await fetchCourseDetail(courseId);
    } catch (err) {
      console.error("Failed to join course:", err);
      setError("수강 신청에 실패했습니다.");
    } finally {
      setJoinLoading(false);
    }
  };

  const progress = useMemo(() => courseData.progress, [courseData.progress]);
  const showProgress = courseData.isJoined;
  const showTableRows = !loading && courseData.problems.length > 0;

  const handleProblemClick = (problemId: number) => {
    if (!courseId) return;
    navigate(`/courses/${courseId}/solve/${problemId}`);
  };

  const handleStartFirstProblem = () => {
    if (!courseId || !courseData.problems.length) return;
    navigate(`/courses/${courseId}/solve/${courseData.problems[0].id}`);
  };

  return (
    <S.Container>
      <Header />

      <S.Content>
        <IntroSection
          courseData={courseData}
          progress={progress}
          showProgress={showProgress}
          joinLoading={joinLoading}
          handleJoinCourse={handleJoinCourse}
        />
      </S.Content>

      <S.GraySection>
        <S.MainSection>
          <ProblemsTable
            loading={loading}
            problems={courseData.problems}
            showTableRows={showTableRows}
            error={error}
            handleProblemClick={handleProblemClick}
          />

          <SideCard
            title={courseData.title}
            questionCount={courseData.summary.questionCount}
            level={courseData.summary.level}
            handleStartFirstProblem={handleStartFirstProblem}
          />
        </S.MainSection>
      </S.GraySection>
    </S.Container>
  );
};

export default CourseDetailPage;
