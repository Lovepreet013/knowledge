import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const AUTH_URLS = ["/auth/login/", "/auth/register/", "/auth/token/refresh/"];

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url: string | undefined = error.config?.url;
    const isAuthCall = url ? AUTH_URLS.some((u) => url.includes(u)) : false;
    if (status === 401 && !isAuthCall) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      if (window.location.pathname !== "/") {
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);

export default api;