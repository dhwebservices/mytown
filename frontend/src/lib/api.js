import axios from "axios";

const BACKEND_URL = (process.env.REACT_APP_BACKEND_URL || "").trim().replace(/\/$/, "");
export const API_BASE = BACKEND_URL ? `${BACKEND_URL}/api` : "/api";
const SUPABASE_SESSION_KEY = "mytown_supabase_session";

export const api = axios.create({ baseURL: API_BASE });

export function unwrapList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

export function unwrapFirst(data) {
  if (data && typeof data === "object" && !Array.isArray(data)) return data;
  const rows = unwrapList(data);
  return rows[0] || null;
}

api.interceptors.request.use((config) => {
  let token = localStorage.getItem("mytown_token");
  if (!token) {
    try {
      const raw = localStorage.getItem(SUPABASE_SESSION_KEY);
      const session = raw ? JSON.parse(raw) : null;
      token = session?.access_token || "";
    } catch {
      token = "";
    }
  }
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err?.response?.status === 401) {
      // token invalid; let caller handle
    }
    return Promise.reject(err);
  }
);
