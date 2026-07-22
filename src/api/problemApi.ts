import axiosInstance from "./axiosInstance";

export const problemApi = {
  // 문제 목록 조회 (필터/정렬/검색 파라미터 포함)
  getProblems: async <T = unknown>(params: Record<string, unknown>) => {
    const res = await axiosInstance.get<T>(`/problems`, { params });
    return res.data;
  },
};

export default problemApi;
