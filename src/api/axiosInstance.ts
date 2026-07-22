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

// 동시에 여러 401이 떠도 재발급은 한 번만 타도록 진행 중인 refresh를 공유
let refreshPromise: Promise<string> | null = null;

const refreshAccessToken = (): Promise<string> => {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${apiUrl}/auth/refresh`, {
        token: localStorage.getItem("refreshToken"),
      })
      .then((response) => {
        const { accessToken, refreshToken } = response.data;
        localStorage.setItem("accessToken", accessToken);
        // 토큰 회전 도입 시 새 refreshToken도 함께 내려오면 교체
        if (refreshToken) {
          localStorage.setItem("refreshToken", refreshToken);
        }
        return accessToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

// 응답 인터셉터: 401 시 토큰 재발급 후 재요청, 실패 시 로그인 이동
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // 이미 진행 중인 재발급이 있으면 그 결과를 기다렸다가 재시도
        const accessToken = await refreshAccessToken();

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
