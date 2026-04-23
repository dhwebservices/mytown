import { createContext, useCallback, useContext, useEffect, useState } from "react";

const AuthCtx = createContext(null);

const SUPABASE_URL = (process.env.REACT_APP_SUPABASE_URL || "https://kqefspfdctnxzonirner.supabase.co").trim().replace(/\/$/, "");
const SUPABASE_ANON_KEY = (process.env.REACT_APP_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxZWZzcGZkY3RueHpvbmlybmVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5NzA5NjksImV4cCI6MjA5MjU0Njk2OX0.Tj91xZYrYaHsUSARk_6Y0xRqzOOJYy86nbmBvzCPcmw").trim();
const SESSION_KEY = "mytown_supabase_session";

function readStoredSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeStoredSession(session) {
  if (!session) {
    localStorage.removeItem(SESSION_KEY);
    return;
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function normalizeUser(authUser) {
  if (!authUser) return null;
  const meta = authUser.user_metadata || {};
  return {
    id: authUser.id,
    email: authUser.email || "",
    username: meta.username || (authUser.email ? authUser.email.split("@")[0] : ""),
    role: meta.role || "customer",
    full_name: meta.full_name || meta.name || "",
    phone: meta.phone || "",
    status: "active",
    email_verified: Boolean(authUser.email_confirmed_at),
  };
}

async function supabaseRequest(path, { method = "GET", body, token } = {}) {
  const response = await fetch(`${SUPABASE_URL}${path}`, {
    method,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    throw new Error(data?.msg || data?.error_description || data?.error || "Request failed");
  }
  return data;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const session = readStoredSession();
    if (!session?.access_token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const authUser = await supabaseRequest("/auth/v1/user", { token: session.access_token });
      setUser(normalizeUser(authUser));
    } catch {
      writeStoredSession(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = async (identifier, password) => {
    const data = await supabaseRequest("/auth/v1/token?grant_type=password", {
      method: "POST",
      body: { email: identifier.trim(), password },
    });
    writeStoredSession({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      user: normalizeUser(data.user),
    });
    const nextUser = normalizeUser(data.user);
    setUser(nextUser);
    return nextUser;
  };

  const register = async (payload) => {
    const data = await supabaseRequest("/auth/v1/signup", {
      method: "POST",
      body: {
        email: payload.email.trim(),
        password: payload.password,
        data: {
          username: payload.username.trim(),
          role: payload.role,
          full_name: payload.full_name.trim(),
          phone: (payload.phone || "").trim(),
        },
      },
    });
    const nextUser = normalizeUser(data.user);
    if (data.session?.access_token) {
      writeStoredSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        user: nextUser,
      });
      setUser(nextUser);
    }
    return {
      user: nextUser,
      activeSession: Boolean(data.session?.access_token),
      requiresEmailConfirmation: !data.session?.access_token,
    };
  };

  const sendPasswordReset = async (email) => {
    await supabaseRequest("/auth/v1/recover", {
      method: "POST",
      body: {
        email: email.trim(),
        redirect_to: `${window.location.origin}/reset-password`,
      },
    });
  };

  const updatePasswordWithRecovery = async (accessToken, password) => {
    await supabaseRequest("/auth/v1/user", {
      method: "PUT",
      token: accessToken,
      body: { password },
    });
  };

  const logout = () => {
    writeStoredSession(null);
    localStorage.removeItem("mytown_token");
    setUser(null);
  };

  return (
    <AuthCtx.Provider value={{ user, loading, login, register, logout, refresh, sendPasswordReset, updatePasswordWithRecovery }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);

export function roleHome(role) {
  if (role === "manager") return "/admin";
  if (role === "business") return "/business";
  return "/account";
}
