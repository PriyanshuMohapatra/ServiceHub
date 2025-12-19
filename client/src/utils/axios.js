import axios from "axios";

// Detect localhost (Vite dev)
const isLocalhost =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1");

// ✅ Use proxy in local, real backend in prod
const API_URL = isLocalhost
  ? "/api"
  : `${import.meta.env.VITE_API_BASE_URL}/api`;


const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true, // cookies + auth
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach Bearer token (fallback when cookies aren't sent)
axiosInstance.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem("token");
      if (token && token !== "null" && token !== "undefined") {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // ignore storage errors
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle responses
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      const url = error?.config?.url || "";
      if (!url.includes("/me")) {
        console.error(
          "Authentication error:",
          error?.response?.data?.message || "Unauthorized"
        );
      }
    } else if (error?.response?.status >= 500) {
      console.error(
        "Server error:",
        error?.response?.data?.message || "Internal server error"
      );
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
