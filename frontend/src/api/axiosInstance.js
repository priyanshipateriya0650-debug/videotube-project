import axios from 'axios';

/**
 * Reusable Axios Instance for VideoTube.
 * - Base URL defaults to '/api/v1' leveraging Vite development proxy.
 * - withCredentials: true ensures HTTP-only cookies (accessToken & refreshToken) are sent with every request.
 * - Dual-layer auth: Also attaches Bearer token header if an accessToken exists in storage.
 * - Response interceptor handles 401 errors and attempts token refresh without infinite loops.
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://videotube-project-1-80xu.onrender.com/api/v1';
export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// In-memory token reference & storage helper
const TOKEN_KEY = 'videotube_access_token';

export const getStoredAccessToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setStoredAccessToken = (token) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
};

// Request interceptor to attach Authorization header if available
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getStoredAccessToken();
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Variables for managing refresh token concurrency
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor to handle 401 & automatic refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Skip refresh logic for auth endpoints (login, register, refresh itself)
    const isAuthRoute =
      originalRequest?.url?.includes('/users/login') ||
      originalRequest?.url?.includes('/users/register') ||
      originalRequest?.url?.includes('/users/refresh-token');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRoute) {
      if (isRefreshing) {
        // Queue subsequent requests while refresh is in flight
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt token refresh via backend endpoint
        const response = await axios.post(
          `${API_BASE_URL}/users/refresh-token`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = response.data?.data?.accessToken;

        if (newAccessToken) {
          setStoredAccessToken(newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          processQueue(null, newAccessToken);
          return axiosInstance(originalRequest);
        } else {
          throw new Error('No access token in refresh response');
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        setStoredAccessToken(null);
        // Dispatch custom event to notify AuthContext to log user out
        window.dispatchEvent(new CustomEvent('auth:session-expired'));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
