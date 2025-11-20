import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL;

const axiosInstance = axios.create({
  baseURL: apiUrl,
});

// 요청 인터셉터: accessToken 자동 추가
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터: 401 시 토큰 재발급 후 재요청, 실패 시 로그인 이동
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        const response = await axios.post(`${apiUrl}/auth/refresh`, {
          token: refreshToken,
        });

        const { accessToken } = response.data;
        localStorage.setItem("accessToken", accessToken);

        // 기존 요청 헤더에 새 토큰 적용
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        return axiosInstance(originalRequest); // 재요청
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);

        // 토큰 제거 후 로그인 페이지 이동
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.assign("/login"); // SPA 환경에서도 확실하게 이동

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
