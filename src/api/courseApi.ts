import axiosInstance from "./axiosInstance";

export const courseApi = {
  // 코스 상세 조회
  getCourse: async <T = unknown>(id: string | number) => {
    const res = await axiosInstance.get<T>(`/course/${id}`);
    return res.data;
  },

  // 수강 신청
  joinCourse: async (id: string | number) => {
    const res = await axiosInstance.post(`/student/course/${id}/join`);
    return res.data;
  },

  // 학습 중인 코스 목록
  getInProgressCourses: async <T = unknown>() => {
    const res = await axiosInstance.get<T>(`/student/course/in-progress`);
    return res.data;
  },

  // 완료한 코스 목록
  getCompletedCourses: async <T = unknown>() => {
    const res = await axiosInstance.get<T>(`/student/course/completed`);
    return res.data;
  },

  // 수강 가능한 코스 목록
  getJoinableCourses: async <T = unknown>() => {
    const res = await axiosInstance.get<T>(`/student/course/joinable`);
    return res.data;
  },
};

export default courseApi;
