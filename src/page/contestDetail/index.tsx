import * as S from "./styles";
import axiosInstance from "../../api/axiosInstance";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect , useState } from "react";

// 문제 타입 정의
interface Problem {
  problemId: number;
  name: string;
  difficulty: "COPPER" | "IRON"|"SLIVER"|"GOLD"| "JADE";
  solvedCount:number;
  correctRate:number;
  solvedResult: "NOT_SOLVED" | "SOLVED" | "FAILED";
  addedAt: string;
}

interface ContestDetail {
  code: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  participantCount : number;
  problems: Problem[];
}


export const ContestDetailPage = () => {
  const { contestId } = useParams<{ contestId: string }>();
  const [contestDetails, setContestDetails] = useState<ContestDetail | null>(null);
  const navigate = useNavigate();

  // 문제 진행도 계산 함수
  const calculateProgress = (): number => {
    if (!contestDetails || contestDetails.problems.length === 0) {
      return 0;
    }
    
    const solvedCount = contestDetails.problems.filter(
      problem => problem.solvedResult === "SOLVED" || problem.solvedResult === "FAILED"
    ).length;
    
    return Math.round((solvedCount / contestDetails.problems.length) * 100);
  };

  const startTest = () => {
    if (!contestDetails) {
      return;
    }
    
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
    } else {
      navigate('/solve');
    }
  };

  useEffect(() => {
    const fetchContestDetails = async () => {
      try {
        const response = await axiosInstance.get<ContestDetail>(`/contest/${contestId}`);
        setContestDetails(response.data);
      } catch (error) {
        console.error("Error fetching contest details:", error);        
      }
    };
    
    fetchContestDetails();
  }, [contestId]);

  
  return (
    <>
      <S.Container>
        {/* Header */}
        <S.Header>
          <S.HeaderContent>
            <S.HeaderLeft>
              <S.LogoImage
                src="https://i.ibb.co/ycw6HTQF/image.png"
                alt="DUKKAEBI Logo"
              />
              <S.Nav>
                <S.NavItem $active={false}>문제풀기</S.NavItem>
                <S.NavItem $active={true}>알고리즘 대회</S.NavItem>
              </S.Nav>
            </S.HeaderLeft>
            <S.UserIcon>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
              >
                <path
                  fill="none"
                  stroke="#828282"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0-8 0M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"
                />
              </svg>
            </S.UserIcon>
          </S.HeaderContent>
        </S.Header>

        {/* Contest Info Section */}
        <S.ContestInfoSection>
          <S.ContestInfoContent>
            {/* Contest Image */}
            <S.ContestImage
              src="https://i.ibb.co/bgdgkTBG/image.png"
              alt="DGSW 프로그래밍 대회"
            />

            {/* Contest Details */}
            <S.ContestDetails>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                <S.ContestTitle>{contestDetails?.title}</S.ContestTitle>
                <S.ContestDescription>
                  <S.DescriptionText>
                    {contestDetails?.description}
                    <br />
                    알고리즘 대회 입니다.
                  </S.DescriptionText>
                  <S.ContestMeta>
                    {contestDetails?.startDate} ~ {contestDetails?.endDate} ・{contestDetails?.participantCount}명 참여중
                  </S.ContestMeta>
                </S.ContestDescription>
              </div>

              {/* Progress Bar */}
              <S.ProgressSection>
                <S.ProgressBarContainer>
                  <S.ProgressBar progress={calculateProgress()} />
                </S.ProgressBarContainer>
                <S.ProgressText>{calculateProgress()}%</S.ProgressText>
              </S.ProgressSection>
            </S.ContestDetails>
          </S.ContestInfoContent>
        </S.ContestInfoSection>

        {/* Main Content Area */}
        <S.MainContentArea>
          {/* Problems List */}
          <S.ProblemsSection>
            <S.ProblemsTable>
              {/* Table Header */}
              <S.TableHeader>
                <S.TableHeaderLeft>
                  <S.HeaderCell>번호</S.HeaderCell>
                  <S.HeaderCell>제목</S.HeaderCell>
                </S.TableHeaderLeft>
                <S.TableHeaderRight>
                  <S.HeaderCell>제출 상태</S.HeaderCell>
                </S.TableHeaderRight>
              </S.TableHeader>

              {/* Table Body */}
              <S.TableBody>
                {contestDetails?.problems.map((problem, index) => (
                  <S.TableRow
                    key={problem.problemId}
                    $isLast={index === contestDetails.problems.length - 1}
                  >
                    <S.ProblemNumber>{problem.problemId}</S.ProblemNumber>
                    <S.ProblemTitle>{problem.name}</S.ProblemTitle>
                    <S.ProblemStatus $status={problem.solvedResult}>
                      {problem.solvedResult === "SOLVED" || problem.solvedResult === "FAILED" ? "제출 완료" : "미제출"}
                    </S.ProblemStatus>
                  </S.TableRow>
                ))}
              </S.TableBody>
            </S.ProblemsTable>
          </S.ProblemsSection>

          {/* Contest Info Card */}
          <S.ContestInfoCard>
            <S.CardContent>
              <S.CardInfo>
                <S.CardTitle>{contestDetails?.title}</S.CardTitle>
                <S.CardDetails>
                  <S.CardDetail>시작 일시 : {contestDetails?.startDate} 12:00</S.CardDetail>
                  {/* <S.CardDetail>코딩 테스트 시간 : 30분</S.CardDetail> */}
                  <S.CardDetail>총 {contestDetails?.problems.length}문제</S.CardDetail>
                </S.CardDetails>
              </S.CardInfo>

              <S.StartButton onClick={startTest}>코딩테스트 시작하기</S.StartButton>
            </S.CardContent>
          </S.ContestInfoCard>
        </S.MainContentArea>
      </S.Container>
    </>
  );
};
