import axiosInstance from "./axiosInstance";

export const userApi = {
  // 내 정보 조회
  getUser: async <T = unknown>() => {
    const res = await axiosInstance.get<T>(`/user`);
    return res.data;
  },

  // 로그아웃
  logout: async () => {
    const res = await axiosInstance.post(`/user/logout`);
    return res.data;
  },

  // 회원탈퇴
  deleteAccount: async () => {
    const res = await axiosInstance.delete(`/user/delete`);
    return res.data;
  },

  // 날짜별 문제 풀이 수 (히트맵)
  getContributions: async <T = unknown>(start: string, end: string) => {
    const res = await axiosInstance.get<T>(`/user/activity/contributions`, {
      params: { start, end },
    });
    return res.data;
  },

  // 연속 풀이 일수
  getStreak: async <T = unknown>() => {
    const res = await axiosInstance.get<T>(`/user/activity/streak`);
    return res.data;
  },
};

export default userApi;
