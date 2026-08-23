import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const api = axios.create({ baseURL: BASE_URL });

function getTokens() {
  return {
    access: localStorage.getItem("access_token"),
    refresh: localStorage.getItem("refresh_token"),
  };
}

function setTokens(access, refresh) {
  localStorage.setItem("access_token", access);
  if (refresh) localStorage.setItem("refresh_token", refresh);
}

export function clearTokens() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}

api.interceptors.request.use((config) => {
  const { access } = getTokens();
  if (access) config.headers.Authorization = `Bearer ${access}`;
  return config;
});

// If a request fails with 401 (expired access token), try refreshing once
// and replay the original request — avoids forcing a re-login every 15 min.
let refreshPromise = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const { refresh } = getTokens();

    if (error.response?.status === 401 && refresh && !original._retried) {
      original._retried = true;
      try {
        if (!refreshPromise) {
          refreshPromise = axios
            .post(`${BASE_URL}/auth/refresh`, { refresh_token: refresh })
            .finally(() => {
              refreshPromise = null;
            });
        }
        const { data } = await refreshPromise;
        setTokens(data.access_token, data.refresh_token);
        original.headers.Authorization = `Bearer ${data.access_token}`;
        return api(original);
      } catch {
        clearTokens();
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export { setTokens, getTokens };
