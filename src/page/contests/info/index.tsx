import * as S from "./styles";
import axiosInstance from "../../../api/axiosInstance";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Header } from "../../../components/header";
import { toast } from "react-toastify";

// ============================
// 상수 및 이미지 매핑
// ============================
const DEFAULT_IMAGE = "https://i.ibb.co/Rp6GC0LG/dgsw.png";

// ============================
// 타입 정의
// ============================
interface Problem {
  problemId: number;
  name: string;
  difficulty: "COPPER" | "IRON" | "SLIVER" | "GOLD" | "JADE";
  solvedCount: number;
  correctRate: number;
  solvedResult: "NOT_SOLVED" | "SOLVED" | "FAILED";
  addedAt: string;
}

interface ContestDetail {
  code: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: "JOINABLE" | "JOINED" | "ENDED";
  participantCount: number;
  problems: Problem[];
  imageUrl?: string; // API에서 내려오는 이미지 필드 추가
}

export const ContestDetailPage = () => {
  const { contestCode } = useParams<{ contestCode: string }>();
  const [contestDetails, setContestDetails] = useState<ContestDetail | null>(
    null,
  );
  const navigate = useNavigate();

  useEffect(() => {
    if (!contestCode) return;

    // 문제 풀이 관련 로컬스토리지 정리
    Object.keys(localStorage).forEach((key) => {
      if (
        key.startsWith("dukkaebi_codes_") ||
        key.startsWith("dukkaebi_timeSpent_")
      ) {
        localStorage.removeItem(key);
      }
    });
  }, [contestCode]);

  // 문제 진행도 계산 함수
  const calculateProgress = (): number => {
    if (!contestDetails || contestDetails.problems.length === 0) {
      return 0;
    }

    const solvedCount = contestDetails.problems.filter(
      (problem) =>
        problem.solvedResult === "SOLVED" || problem.solvedResult === "FAILED",
    ).length;

    return Math.round((solvedCount / contestDetails.problems.length) * 100);
  };

  // 이미지 결정 로직
  const contestImage = contestDetails?.imageUrl || DEFAULT_IMAGE;

  const startTest = () => {
    if (!contestDetails || !contestCode) return;

    const now = new Date();
    const startDateTime = new Date(contestDetails.startDate);
    startDateTime.setHours(0, 0, 0, 0);

    const endDateTime = new Date(contestDetails.endDate);
    endDateTime.setHours(23, 59, 59, 999);

    if (now < startDateTime) {
      alert("아직 대회가 시작되지 않았습니다.");
      return;
    } else if (now > endDateTime) {
      alert("이미 대회가 종료되었습니다.");
      return;
    }

    const proceedToFirstNotSolvedProblem = () => {
      // NOT_SOLVED인 첫 문제 찾기
      const firstNotSolved = contestDetails.problems.find(
        (p) => p.solvedResult === "NOT_SOLVED",
      );

      // 모든 문제를 이미 풀었다면 첫 문제로 이동
      const targetProblemId = firstNotSolved
        ? firstNotSolved.problemId
        : contestDetails.problems[0]?.problemId;

      if (!targetProblemId) return;

      navigate(`/contests/${contestCode}/solve/${targetProblemId}`);
    };

    if (contestDetails.status === "JOINABLE") {
      const input = prompt("대회 코드를 입력해주세요.");
      if (!input) return;

      axiosInstance
        .post(`/student/contest/${contestDetails.code}/join`, null, {
          params: { code: input },
        })
        .then(() => {
          toast.success("대회 참가에 성공했습니다.");
          // 대회 정보를 다시 불러와서 상태를 JOINED로 업데이트
          axiosInstance
            .get<ContestDetail>(`/contest/${contestCode}`)
            .then((response) => {
              setContestDetails(response.data);
            });
        })
        .catch(() => {
          toast.error("대회 코드가 일치하지 않거나 참여할 수 없습니다.");
        });
      return;
    }

    proceedToFirstNotSolvedProblem();
  };

  useEffect(() => {
    const fetchContestDetails = async () => {
      try {
        const response = await axiosInstance.get<ContestDetail>(
          `/contest/${contestCode}`,
        );
        setContestDetails(response.data);

        if (contestCode) {
          // 해당 대회와 관련된 코드 보관소 삭제
          localStorage.removeItem(`dukkaebi_codes${contestCode}`);
          // 해당 대회와 관련된 언어 설정 보관소 삭제
          localStorage.removeItem(`dukkaebi_langs_${contestCode}`);
          // 해당 대회와 관련된 시간 설정 보관소 삭제
          localStorage.removeItem(`dukkaebi_timeSpent_${contestCode}`);
          console.log(
            `Contest ${contestCode} 관련 로컬 데이터가 초기화되었습니다.`,
          );
        }
      } catch (error) {
        console.error("Error fetching contest details:", error);
      }
    };

    fetchContestDetails();
  }, [contestCode]);

  return (
    <>
      <S.Container>
        <Header />

        <S.ContestInfoSection>
          <S.ContestInfoContent>
            {/* 수정된 부분: contestImage 변수 사용 */}
            <S.ContestImage
              src={contestImage}
              alt={contestDetails?.title || "대회 이미지"}
            />

            <S.ContestDetails>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                <S.ContestTitle>{contestDetails?.title}</S.ContestTitle>
                <S.ContestDescription>
                  <S.DescriptionText>
                    {contestDetails?.description}
                  </S.DescriptionText>
                  <S.ContestMeta>
                    {contestDetails?.startDate} ~ {contestDetails?.endDate} ・
                    {contestDetails?.participantCount}명 참여중
                  </S.ContestMeta>
                </S.ContestDescription>
              </div>

              <S.ProgressSection>
                <S.ProgressBarContainer>
                  <S.ProgressBar progress={calculateProgress()} />
                </S.ProgressBarContainer>
                <S.ProgressText>{calculateProgress()}%</S.ProgressText>
              </S.ProgressSection>
            </S.ContestDetails>
          </S.ContestInfoContent>
        </S.ContestInfoSection>

        <S.MainContentArea>
          <S.ProblemsSection>
            <S.ProblemsTable>
              <S.TableHeader>
                <S.TableHeaderLeft>
                  <S.HeaderCell>번호</S.HeaderCell>
                  <S.HeaderCell>제목</S.HeaderCell>
                </S.TableHeaderLeft>
                <S.TableHeaderRight>
                  <S.HeaderCell>제출 상태</S.HeaderCell>
                </S.TableHeaderRight>
              </S.TableHeader>

              <S.TableBody>
                {contestDetails?.problems.map((problem, index) => (
                  <S.TableRow
                    key={problem.problemId}
                    $isLast={index === contestDetails.problems.length - 1}
                  >
                    <S.ProblemNumber>{index + 1}</S.ProblemNumber>
                    <S.ProblemTitle>{problem.name}</S.ProblemTitle>
                    <S.ProblemStatus $status={problem.solvedResult}>
                      {problem.solvedResult === "SOLVED" ||
                      problem.solvedResult === "FAILED"
                        ? "제출 완료"
                        : "미제출"}
                    </S.ProblemStatus>
                  </S.TableRow>
                ))}
              </S.TableBody>
            </S.ProblemsTable>
          </S.ProblemsSection>

          <S.ContestInfoCard>
            <S.CardContent>
              <S.CardInfo>
                <S.CardTitle>{contestDetails?.title}</S.CardTitle>
                <S.CardDetails>
                  <S.CardDetail>
                    시작 일시 : {contestDetails?.startDate} 12:00
                  </S.CardDetail>
                  <S.CardDetail>
                    총 {contestDetails?.problems.length || 0}문제
                  </S.CardDetail>
                </S.CardDetails>
              </S.CardInfo>

              <S.StartButton onClick={startTest}>
                코딩테스트 시작하기
              </S.StartButton>
            </S.CardContent>
          </S.ContestInfoCard>
        </S.MainContentArea>
      </S.Container>
    </>
  );
};
