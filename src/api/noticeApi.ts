import axiosInstance from "./axiosInstance";

export const noticeApi = {
  // 공지사항 목록 조회 (페이지네이션)
  getNotices: async <T = unknown>(page: number = 0, size: number = 15) => {
    const res = await axiosInstance.get<T>(`/notice`, {
      params: { page, size },
    });
    return res.data;
  },

  // 공지사항 검색
  searchNotices: async <T = unknown>(keyword: string) => {
    const res = await axiosInstance.get<T>(`/notice/search`, {
      params: { keyword },
    });
    return res.data;
  },

  // 공지사항 상세 조회
  getNotice: async <T = unknown>(id: string | number) => {
    const res = await axiosInstance.get<T>(`/notice/${id}`);
    return res.data;
  },

  // 홈 화면용 공지사항 목록
  getHomeNotices: async <T = unknown>() => {
    const res = await axiosInstance.get<T>(`/notice/home`);
    return res.data;
  },
};

export default noticeApi;
