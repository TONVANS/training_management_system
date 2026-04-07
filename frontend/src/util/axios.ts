// src/util/axios.ts
import axios, {
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";

const api = axios.create({
  // ຖ້າຢູ່ Client ໃຫ້ໃຊ້ /api (Proxy) ຖ້າຢູ່ Server ໃຫ້ໃຊ້ URL ເຕັມ
  baseURL: typeof window !== "undefined" ? '/api' : process.env.NEXT_PUBLIC_API_URL,
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
