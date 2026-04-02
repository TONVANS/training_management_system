// axios.ts - ตั้งค่าและจัดการอินเตอร์เซปเตอร์สำหรับการเรียก API
import axios, {
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem("auth-storage");
      const parsed = raw ? JSON.parse(raw)?.state : null;
      const token = parsed?.token;
      const tokenExpiry = parsed?.tokenExpiry;

      // ถ้า token หมดอายุให้ล้างออกเลย ไม่ต้องส่ง request
      if (tokenExpiry && Date.now() > tokenExpiry) {
        localStorage.removeItem("auth-storage");
        return Promise.reject(new Error("Token expired"));
      }

      if (token) {
        config.headers.set("Authorization", `Bearer ${token}`);
      }
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

export default api;
