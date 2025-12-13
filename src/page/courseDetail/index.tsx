import { useMemo } from "react";
import { Header } from "../../components/header";
import * as S from "./styles";

type ProblemStatus = "submitted" | "pending";

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
  summary: {
    startAt: string;
    questionCount: number;
    level: string;
  };
  problems: ProblemItem[];
}

const CourseDetailPage = () => {
  const courseData: CourseDetailData = useMemo(
    () => ({
      title: "기초 100제",
      description: "개발자가 되기 위해선 꼭 풀어봐야하는 알고리즘 기초 문제 100",
      tags: ["#기초", "#알고리즘", "#기본문법"],
      progress: 10,
      summary: {
        startAt: "2025년 11월 14일 12:00",
        questionCount: 10,
        level: "하",
      },
      problems: [
        { id: 1, title: "숫자야구", status: "pending" },
        { id: 2, title: "문자열과 알파벳 쿼리", status: "submitted" },
        { id: 3, title: "문자열과 알파벳 쿼리", status: "submitted" },
        { id: 4, title: "문자열과 알파벳 쿼리", status: "submitted" },
        { id: 5, title: "문자열과 알파벳 쿼리", status: "pending" },
        { id: 6, title: "문자열과 알파벳 쿼리", status: "pending" },
        { id: 7, title: "문자열과 알파벳 쿼리", status: "submitted" },
        { id: 8, title: "문자열과 알파벳 쿼리", status: "submitted" },
      ],
    }),
    []
  );
  const progress = courseData.progress;

  return (
    <S.Container>
      <Header />

      <S.Content>
        <S.IntroSection>
          <S.IntroContent>
            <S.Title>{courseData.title}</S.Title>
            <S.Description>{courseData.description}</S.Description>
            <S.TagRow>
              {courseData.tags.map((tag) => (
                <S.Tag key={tag}>{tag}</S.Tag>
              ))}
            </S.TagRow>
            <S.ProgressContainer>
              <S.ProgressBar>
                <S.ProgressFill style={{ width: `${progress}%` }} />
              </S.ProgressBar>
              <S.ProgressText>{progress}% 진행</S.ProgressText>
            </S.ProgressContainer>
          </S.IntroContent>
        </S.IntroSection>
      </S.Content>

      <S.GraySection>
        <S.MainSection>
          <S.TableCard>
            <S.TableHeader>
              <S.HeaderText>번호</S.HeaderText>
              <S.HeaderText>제목</S.HeaderText>
              <S.HeaderText align="right">제출 상태</S.HeaderText>
            </S.TableHeader>

            <S.TableBody>
              {courseData.problems.map((problem, index) => (
                <S.TableRow key={problem.id} isLast={index === courseData.problems.length - 1}>
                  <S.IndexCell>{String(problem.id).padStart(2, "0")}</S.IndexCell>
                  <S.TitleCell>{problem.title}</S.TitleCell>
                  <S.StatusCell status={problem.status}>
                    {problem.status === "submitted" ? "제출 완료" : "미제출"}
                  </S.StatusCell>
                </S.TableRow>
              ))}
            </S.TableBody>
          </S.TableCard>

          <S.SideCard>
            <S.SideCardTitle>{courseData.title}</S.SideCardTitle>
            <S.SideCardList>
              <S.SideCardItem>
                <S.SideCardLabel>시작 일시 :</S.SideCardLabel>
                <S.SideCardValue>{courseData.summary.startAt}</S.SideCardValue>
              </S.SideCardItem>
              <S.SideCardItem>
                <S.SideCardLabel>문제 :</S.SideCardLabel>
                <S.SideCardValue>{courseData.summary.questionCount}</S.SideCardValue>
              </S.SideCardItem>
              <S.SideCardItem>
                <S.SideCardLabel>난이도 :</S.SideCardLabel>
                <S.SideCardValue>{courseData.summary.level}</S.SideCardValue>
              </S.SideCardItem>
            </S.SideCardList>

            <S.SideCardButton type="button" fullWidth>
              문제 풀어보기
            </S.SideCardButton>
          </S.SideCard>
        </S.MainSection>
      </S.GraySection>
    </S.Container>
  );
};

export default CourseDetailPage;
