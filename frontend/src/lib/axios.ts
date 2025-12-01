import { useAuthStore } from "@/store/useAuthStore";
import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.MODE === "development" ? "http://localhost:5000/api" : "/api",
    withCredentials: true,
    
});
// gắn access token vào req header
api.interceptors.request.use((config) => {
    const {accessToken} = useAuthStore.getState();
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
});

// tự động gọi refresh API khi accesstoken hết hạn
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const message = error.response?.data?.message;

    // Bỏ qua một số API không cần xử lý
    if (
      originalRequest.url.includes("/auth/signin") ||
      originalRequest.url.includes("/auth/signup") ||
      originalRequest.url.includes("/auth/refresh")
    ) {
      return Promise.reject(error);
    }

    // 1️⃣ TOKEN EXPIRED → 401 → CHO PHÉP RETRY 4 LẦN
    if (status === 401) {
      originalRequest._retryCount = originalRequest._retryCount || 0;

      if (originalRequest._retryCount >= 4) {
        useAuthStore.getState().clearState();
        return Promise.reject(error);
      }

      originalRequest._retryCount++;

      try {
        const res = await api.post("/auth/refresh");
        const newAccessToken = res.data.accessToken;

        useAuthStore.getState().setAccessToken(newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (err) {
        useAuthStore.getState().clearState();
        return Promise.reject(err);
      }
    }

    // 2️⃣ USER SUSPENDED → 403
    if (status === 403 && message?.includes("tạm khóa")) {
      useAuthStore.getState().clearState();
      window.location.href = "/signin?reason=suspended";
      return Promise.reject(error);
    }

    // 3️⃣ ROLE KHÔNG ĐỦ → 403 → KHÔNG LOGOUT
    if (status === 403 && message?.includes("quyền")) {
      return Promise.reject(error);
    }

    // 4️⃣ TOKEN INVALID (hack) → 403 → logout
    if (status === 403 && message?.includes("hợp lệ")) {
      useAuthStore.getState().clearState();
      window.location.href = "/signin";
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default api;