import axiosInstance from "./axiosInstance";

export const contestApi = {
  // 대회 목록 조회
  getContests: async <T = unknown>(page: number = 0, size: number = 12) => {
    const res = await axiosInstance.get<T>(`/contest/list`, {
      params: { page, size },
    });
    return res.data;
  },

  // 대회 상세 조회
  getContest: async <T = unknown>(
    code: string | number,
    config?: { signal?: AbortSignal },
  ) => {
    const res = await axiosInstance.get<T>(`/contest/${code}`, {
      signal: config?.signal,
    });
    return res.data;
  },

  // 대회 참가 (참여 코드 필요)
  joinContest: async (code: string | number, joinCode: string) => {
    const res = await axiosInstance.post(
      `/student/contest/${code}/join`,
      null,
      {
        params: { code: joinCode },
      },
    );
    return res.data;
  },
};

export default contestApi;
