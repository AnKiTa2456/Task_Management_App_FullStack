import axios from "axios";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import { store } from "../app/store";
import { setAccessToken, logout } from "../features/auth/authSlice";

/* ------------------------------------------------------- */
/* Types */
/* ------------------------------------------------------- */

interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

/* ------------------------------------------------------- */
/* Token refresh queue */
/* ------------------------------------------------------- */

let isRefreshing = false;

let failedQueue: {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}[] = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });

  failedQueue = [];
}

/* ------------------------------------------------------- */
/* Force logout */
/* ------------------------------------------------------- */

function forceLogout() {
  store.dispatch(logout());
  window.location.href = "/login";
}

/* ------------------------------------------------------- */
/* API URL */
/* ------------------------------------------------------- */

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV
    ? "http://localhost:3000/api/v1"
    : "https://task-management-app-fullstack.onrender.com/api/v1");

/* ------------------------------------------------------- */
/* Axios Instance */
/* ------------------------------------------------------- */

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

/* ------------------------------------------------------- */
/* Request Interceptor */
/* Attach Access Token */
/* ------------------------------------------------------- */

apiClient.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.accessToken;

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* ------------------------------------------------------- */
/* Response Interceptor */
/* Handle Token Refresh */
/* ------------------------------------------------------- */

apiClient.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest = error.config as RetryConfig | undefined;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    /* ------------------------------ */
    /* If not 401 → reject normally */
    /* ------------------------------ */

    if (error.response?.status !== 401 || originalRequest._retry) {
      if (originalRequest._retry && error.response?.status === 401) {
        forceLogout();
      }

      return Promise.reject(error);
    }

    /* ------------------------------ */
    /* If refresh already running */
    /* ------------------------------ */

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token: string) => {
            originalRequest.headers!.Authorization = `Bearer ${token}`;
            resolve(apiClient(originalRequest));
          },
          reject,
        });
      });
    }

    /* ------------------------------ */
    /* Start Refresh Flow */
    /* ------------------------------ */

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/refresh`,
        {},
        {
          withCredentials: true,
        }
      );

      const newToken = response.data.data.accessToken;

      store.dispatch(setAccessToken(newToken));

      processQueue(null, newToken);

      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
      }

      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      forceLogout();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

/* ------------------------------------------------------- */
/* Reset interceptor state on logout */
/* ------------------------------------------------------- */

export function resetInterceptorState() {
  processQueue(new Error("Logged out"), null);
  isRefreshing = false;
}