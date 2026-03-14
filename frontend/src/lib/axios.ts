import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { store }     from '../app/store';
import { setAccessToken, logout } from '../features/auth/authSlice';

interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let isRefreshing = false;
let failedQueue: { resolve: (t: string) => void; reject: (e: unknown) => void }[] = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach(({ resolve, reject }) => error ? reject(error) : resolve(token!));
  failedQueue = [];
}

/** Call this on logout so the next login request is never stuck in the queue. */
export function resetInterceptorState() {
  processQueue(new Error('Logged out'), null);
  isRefreshing = false;
}

function forceLogout() {
  store.dispatch(logout());
  window.location.href = '/login';
}

export const apiClient = axios.create({
  baseURL:         import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api/v1',
  timeout:         15_000,
  withCredentials: true,
  headers:         { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = store.getState().auth.accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const original = error.config as RetryConfig | undefined;

    if (!original || error.response?.status !== 401 || original._retry) {
      // Retry-after-refresh also got 401 → session fully invalid, kick to login
      if (original?._retry && error.response?.status === 401) {
        forceLogout();
      }
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token) => {
            original.headers!.Authorization = `Bearer ${token}`;
            resolve(apiClient(original));
          },
          reject,
        });
      });
    }

    original._retry = true;
    isRefreshing    = true;

    try {
      const { data } = await apiClient.post<{ data: { accessToken: string } }>('/auth/refresh');
      const newToken = data.data.accessToken;
      store.dispatch(setAccessToken(newToken));
      processQueue(null, newToken);
      original.headers!.Authorization = `Bearer ${newToken}`;
      return apiClient(original);
    } catch (refreshError) {
      processQueue(refreshError, null);
      forceLogout();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
