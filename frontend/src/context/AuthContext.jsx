import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../api/client";
import { setAuthToken } from "../api/client";

const AuthContext = createContext(null);

const STORAGE_KEY = "parent-school-auth";

const safeParse = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? safeParse(raw) : null;
    if (parsed?.token && parsed?.user) {
      setToken(parsed.token);
      setUser(parsed.user);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (token && user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user }));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [token, user]);

  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  const login = async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    setToken(response.data.data.token);
    setUser(response.data.data.user);
    return response.data.data.user;
  };

  const register = async (payload) => {
    const response = await api.post("/auth/register", payload);
    setToken(response.data.data.token);
    setUser(response.data.data.user);
    return response.data.data.user;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const refreshMe = async () => {
    if (!token) return null;
    const response = await api.get("/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const me = response.data.data.user;
    setUser(me);
    return me;
  };

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      login,
      register,
      logout,
      refreshMe,
      isAuthenticated: Boolean(token && user),
    }),
    [token, user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
