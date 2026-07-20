import { useState, useEffect, useRef } from "react";
import { EventSourcePolyfill } from "event-source-polyfill";
import { toast } from "react-toastify";
import { z } from "zod";
import axiosInstance from "../../api/axiosInstance";

const API_BASE_URL = (() => {
  const raw = import.meta.env.VITE_API_URL;
  if (!raw || typeof raw !== "string") return "";
  return raw.trim().replace(/\/?$/, "/");
})();

const contestProblemItemSchema = z.object({
  problemId: z.number(),
  name: z.string(),
  difficulty: z.string().optional(),
  solvedResult: z.string().optional(),
});

const contestResponseSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.string().optional(),
  problems: z.array(contestProblemItemSchema).optional(),
});

export type ContestProblemItem = z.infer<typeof contestProblemItemSchema>;

type ContestInfo = {
  startDate?: string;
  endDate?: string;
  status?: string;
};
type ContestPhase = "BEFORE" | "ONGOING" | "ENDED"; //대회 상태를 나타내는 타입 추가

interface UseContestProps {
  contestCode?: string;
  problemId?: string;
}

export function useContest({ contestCode, problemId }: UseContestProps) {
  const [problems, setProblems] = useState<ContestProblemItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [contestInfo, setContestInfo] = useState<ContestInfo | null>(null);
  const [timeLeft, setTimeLeft] = useState("");
  const [timeSpentByProblem, setTimeSpentByProblem] = useState<Record<string, number>>(() => {
    try {
      const stored = localStorage.getItem(`dukkaebi_timeSpent_${contestCode}`);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const sseConnectionRef = useRef<EventSourcePolyfill | null>(null);

  // Fetch contest data
  useEffect(() => {
    if (!contestCode || !API_BASE_URL) return;
    const controller = new AbortController();

    const fetchContest = async () => {
      try {
        setIsLoading(true);
        const accessToken = localStorage.getItem("accessToken");
        const res = await axiosInstance(`${API_BASE_URL}contest/${contestCode}`, {
          signal: controller.signal,
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
        });

        const data = contestResponseSchema.parse(res.data);
        setContestInfo({
          startDate: data.startDate,
          endDate: data.endDate,
          status: data.status,
        });

        const items = Array.isArray(data.problems)
          ? data.problems.map((p, idx) => ({
              problemId: p.problemId ?? idx + 1,
              name: p.name ?? `문제 ${idx + 1}`,
              difficulty: p.difficulty,
              solvedResult: p.solvedResult,
            }))
          : [];
        setProblems(items);
      } catch (e) {
        if (!controller.signal.aborted) setProblems([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContest();
    return () => controller.abort();
  }, [contestCode]);

  // SSE connection
  useEffect(() => {
    if (!contestCode || !API_BASE_URL) return;
    if (sseConnectionRef.current) return;

    const sseUrl = `${API_BASE_URL}contest/${contestCode}/subscribe`;
    const accessToken = localStorage.getItem("accessToken");

    const eventSource = new EventSourcePolyfill(sseUrl, {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      withCredentials: false,
      heartbeatTimeout: 300000,
    });

    sseConnectionRef.current = eventSource;

    eventSource.addEventListener("contest-update", (event) => {
      try {
        const data = JSON.parse((event as MessageEvent).data);
        if (data.eventType === "CONTEST_UPDATED") {
          setContestInfo((prev) => ({
            ...prev,
            startDate: data.startDate ?? prev?.startDate,
            endDate: data.endDate ?? prev?.endDate,
            status: data.status ?? prev?.status,
          }));
          toast.info(data.message || "대회 정보가 업데이트되었습니다.");
        }
      } catch (error) {
        console.error("SSE 메시지 파싱 오류:", error);
      }
    });

    eventSource.onerror = () => {
      eventSource?.close();
      sseConnectionRef.current = null;
    };

    return () => {
      eventSource?.close();
      sseConnectionRef.current = null;
    };
  }, [contestCode]);

  // Time tracking
  useEffect(() => {
    if (!problemId || !contestCode) return;

    const timer = setInterval(() => {
      setTimeSpentByProblem((prev) => {
        const newTimes = { ...prev };
        const key = String(problemId);
        newTimes[key] = (prev[key] || 0) + 1;

        try {
          localStorage.setItem(
            `dukkaebi_timeSpent_${contestCode}`,
            JSON.stringify(newTimes)
          );
        } catch (e) {
          console.error("Failed to save time spent:", e);
        }

        return newTimes;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [problemId, contestCode]);

  // Live countdown
  useEffect(() => {
    if (!contestInfo) {
      setTimeLeft("");
      return;
    }

    const compute = () => {
      const now = new Date();
      const start = contestInfo.startDate ? new Date(contestInfo.startDate) : null;
      const end = contestInfo.endDate ? new Date(contestInfo.endDate) : null;
      const status = contestInfo.status;

      if (status === "ENDED" || (end && now > end)) return "종료됨";

      const fmt = (ms: number) => {
        const totalSec = Math.max(0, Math.floor(ms / 1000));
        const d = Math.floor(totalSec / 86400);
        const h = Math.floor((totalSec % 86400) / 3600);
        const m = Math.floor((totalSec % 3600) / 60);
        const s = totalSec % 60;
        const hh = String(h).padStart(2, "0");
        const mm = String(m).padStart(2, "0");
        const ss = String(s).padStart(2, "0");
        return d > 0 ? `D-${d} ${hh}:${mm}:${ss}` : `${hh}:${mm}:${ss}`;
      };

      if (start && now < start) return `시작까지 ${fmt(start.getTime() - now.getTime())}`;
      if (end && now < end) return `종료까지 ${fmt(end.getTime() - now.getTime())}`;
      return "";
    };

    setTimeLeft(compute());
    const id = setInterval(() => setTimeLeft(compute()), 1000);
    return () => clearInterval(id);
  }, [contestInfo]);

  const getTimeSpent = (pid?: string) => {
    return timeSpentByProblem[String(pid)] || 0;
  };

  return {
    problems,
    isLoading,
    contestInfo,
    timeLeft,
    getTimeSpent,
  };
}
