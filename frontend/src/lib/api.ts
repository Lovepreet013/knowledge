import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
})

const ACCESS_KEY = "access_token";
const REFRESH_KEY = "refresh_token";

/** Persistent (Remember me) storage first, session storage fallback. */
export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_KEY) ?? sessionStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY) ?? sessionStorage.getItem(REFRESH_KEY);
}

/** Updates just the access token, keeping it in whichever storage it was already using. */
export function setAccessToken(access: string): void {
  if (localStorage.getItem(REFRESH_KEY)) {
    localStorage.setItem(ACCESS_KEY, access);
  } else {
    sessionStorage.setItem(ACCESS_KEY, access);
  }
}

export function setAuthTokens(access: string, refresh: string, remember: boolean): void {
  if (remember) {
    localStorage.setItem(ACCESS_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
    sessionStorage.removeItem(ACCESS_KEY);
    sessionStorage.removeItem(REFRESH_KEY);
  } else {
    sessionStorage.setItem(ACCESS_KEY, access);
    sessionStorage.setItem(REFRESH_KEY, refresh);
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  }
}

export function clearAuthTokens(): void {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  sessionStorage.removeItem(ACCESS_KEY);
  sessionStorage.removeItem(REFRESH_KEY);
}

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const AUTH_URLS = ["/auth/login/", "/auth/register/", "/auth/login/refresh/"];

// Tracks an in-flight refresh so concurrent 401s don't each trigger their own refresh call.
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const res = await axios.post(`${api.defaults.baseURL}/auth/login/refresh/`, {
      refresh: refreshToken,
    });
    const newAccess = res.data.access;
    setAccessToken(newAccess);
    return newAccess;
  } catch {
    return null;
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const url: string | undefined = error.config?.url;
    const isAuthCall = url ? AUTH_URLS.some((u) => url.includes(u)) : false;
    const originalRequest = error.config;

    if (status === 401 && !isAuthCall && !originalRequest._retry) {
      originalRequest._retry = true;

      // Reuse a single in-flight refresh if multiple requests 401 at the same time.
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }

      const newAccess = await refreshPromise;

      if (newAccess) {
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return api(originalRequest);
      }

      // Refresh token itself is invalid/expired — genuinely log out now.
      clearAuthTokens();
      if (window.location.pathname !== "/") {
        window.location.href = "/";
      }
    }

    return Promise.reject(error);
  }
);

export default api;