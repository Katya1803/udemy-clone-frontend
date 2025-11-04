import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosHeaders,
  AxiosRequestHeaders,
} from 'axios';
import { useAuthStore } from '@/store/auth.store';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, 
  timeout: 20000,
});

const refreshClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 20000,
});

const AUTH_ENDPOINTS_NO_REFRESH = new Set<string>([
  '/auth/login',
  '/auth/register',
  '/auth/verify-otp',
  '/auth/refresh',
  '/auth/logout',
]);

const isAuthEndpoint = (url?: string) => {
  if (!url) return false;
  try {
    const path = url.startsWith('http') ? new URL(url).pathname : url;
    return [...AUTH_ENDPOINTS_NO_REFRESH].some((p) =>
      path.startsWith(p)
    );
  } catch {
    return false;
  }
};

let refreshPromise: Promise<string | null> | null = null;

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    // Sử dụng phương thức .set() thay vì gán trực tiếp object
    if (!config.headers) {
      config.headers = new AxiosHeaders();
    }
    (config.headers as AxiosHeaders).set('Authorization', `Bearer ${token}`);
  }
  return config;
});

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const { response, config } = error;
    const original =
      config as InternalAxiosRequestConfig & { _retried?: boolean };

    if (!response || response.status !== 401 || !original) {
      return Promise.reject(error);
    }

    if (isAuthEndpoint(original.url)) {
      useAuthStore.getState().clearAuth();
      return Promise.reject(error);
    }

    if (original._retried) {
      useAuthStore.getState().clearAuth();
      return Promise.reject(error);
    }
    original._retried = true;

    try {
      if (!refreshPromise) {
        refreshPromise = (async () => {
          const res = await refreshClient.post('/auth/refresh', {});
          const newToken = res?.data?.data?.access_token as string | undefined;
          if (!newToken) return null;

          const { user } = useAuthStore.getState();
          useAuthStore.getState().setAuth(user!, newToken);
          return newToken;
        })()
          .catch(() => null)
          .finally(() => {
            setTimeout(() => {
              refreshPromise = null;
            }, 0);
          });
      }

      const newAccess = await refreshPromise;
      if (!newAccess) {
        useAuthStore.getState().clearAuth();
        return Promise.reject(error);
      }

      if (!original.headers) {
        original.headers = new AxiosHeaders();
      }
      (original.headers as AxiosHeaders).set(
        'Authorization',
        `Bearer ${newAccess}`
      );

      return apiClient.request(original);
    } catch (refreshErr) {
      useAuthStore.getState().clearAuth();
      return Promise.reject(refreshErr);
    }
  }
);

export { apiClient };
