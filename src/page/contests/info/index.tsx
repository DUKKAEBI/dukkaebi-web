import * as S from "./style";
import contestApi from "../../../api/contestApi";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Header } from "../../../components/header";
import { toast } from "react-toastify";
import {
  ContestInfoHeader,
  ProblemsTable,
  ContestSideCard,
} from "../../../components/contests/info";

const DEFAULT_IMAGE = "https://i.ibb.co/Rp6GC0LG/dgsw.png";

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
  imageUrl?: string;
}

const ContestDetailPage = () => {
  const { contestCode } = useParams<{ contestCode: string }>();
  const [contestDetails, setContestDetails] = useState<ContestDetail | null>(
    null,
  );
  const navigate = useNavigate();

  useEffect(() => {
    if (!contestCode) return;

    Object.keys(localStorage).forEach((key) => {
      if (
        key.startsWith("dukkaebi_codes_") ||
        key.startsWith("dukkaebi_timeSpent_") ||
        key.startsWith("dukkaebi_submitted_")
      ) {
        localStorage.removeItem(key);
      }
    });
  }, [contestCode]);

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
      const firstNotSolved = contestDetails.problems.find(
        (p) => p.solvedResult === "NOT_SOLVED",
      );

      const targetProblemId = firstNotSolved
        ? firstNotSolved.problemId
        : contestDetails.problems[0]?.problemId;

      if (!targetProblemId) return;

      navigate(`/contests/${contestCode}/solve/${targetProblemId}`);
    };

    if (contestDetails.status === "JOINABLE") {
      const input = prompt("대회 코드를 입력해주세요.");
      if (!input) return;

      contestApi
        .joinContest(contestDetails.code, input)
        .then(() => {
          toast.success("대회 참가에 성공했습니다.");
          contestApi.getContest<ContestDetail>(contestCode).then((data) => {
            setContestDetails(data);
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
        const data = await contestApi.getContest<ContestDetail>(contestCode);
        setContestDetails(data);

        if (contestCode) {
          localStorage.removeItem(`dukkaebi_codes${contestCode}`);
          localStorage.removeItem(`dukkaebi_langs_${contestCode}`);
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

        <ContestInfoHeader
          contestImage={contestImage}
          title={contestDetails?.title || ""}
          description={contestDetails?.description || ""}
          startDate={contestDetails?.startDate || ""}
          endDate={contestDetails?.endDate || ""}
          participantCount={contestDetails?.participantCount || 0}
          progress={calculateProgress()}
        />

        <S.MainContentArea>
          <ProblemsTable problems={contestDetails?.problems || []} />

          <ContestSideCard
            title={contestDetails?.title || ""}
            startDate={contestDetails?.startDate || ""}
            problemCount={contestDetails?.problems.length || 0}
            onStartTest={startTest}
          />
        </S.MainContentArea>
      </S.Container>
    </>
  );
};

export default ContestDetailPage;
