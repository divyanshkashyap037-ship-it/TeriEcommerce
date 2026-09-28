import axios from 'axios';

// Base URL comes from .env (VITE_API_URL) so it works in dev and production.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  withCredentials: true, // always send refresh-token cookie
  headers: { 'Content-Type': 'application/json' },
});

// Access token is kept in memory (module variable), NOT localStorage.
// Why in-memory? Easy to explain and avoids XSS persistence issues.
// It is lost on page reload — we restore it silently via refresh-token cookie.
let accessToken = null;

export function setAccessToken(token) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

// Attach "Authorization: Bearer <token>" to every request if we have a token.
api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// If a request fails with 401 (access token expired), try to refresh once,
// then retry the original request. The _retry flag prevents infinite loops.
let refreshPromise = null;

function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/refresh-token`,
        {},
        { withCredentials: true }
      )
      .then((res) => {
        accessToken = res.data.accessToken;
        return accessToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    // Only attempt refresh for 401s, once per request, and not for auth routes
    // themselves (login/refresh) — otherwise we would loop forever.
    const isAuthRoute =
      original.url.includes('/api/auth/login') ||
      original.url.includes('/api/auth/refresh-token') ||
      original.url.includes('/api/auth/register');

    if (error.response?.status === 401 && !original._retry && !isAuthRoute) {
      original._retry = true;
      try {
        const newToken = await refreshAccessToken();
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original); // retry original request with new token
      } catch (refreshErr) {
        // Refresh failed -> user must log in again. Clear token.
        accessToken = null;
        return Promise.reject(refreshErr);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
