import { createContext, useContext, useEffect, useState, useCallback } from "react";
import api, { formatApiErrorDetail } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // null = checking, false = anon, obj = user

  useEffect(() => {
    api
      .get("/auth/me")
      .then((r) => setUser(r.data))
      .catch(() => setUser(false));
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const { data } = await api.post("/auth/login", { email, password });
      setUser(data);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: formatApiErrorDetail(e.response?.data?.detail) };
    }
  }, []);

  const register = useCallback(async (name, email, password) => {
    try {
      const { data } = await api.post("/auth/register", { name, email, password });
      setUser(data);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: formatApiErrorDetail(e.response?.data?.detail) };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch (e) { /* ignore */ }
    setUser(false);
  }, []);

  const updateProfile = useCallback(async (payload) => {
    const { data } = await api.put("/profile", payload);
    setUser(data);
    return data;
  }, []);

  const toggleStep = useCallback(async (stepId, completed) => {
    const { data } = await api.post("/progress/toggle", { step_id: stepId, completed });
    setUser((u) => (u ? { ...u, completed_steps: data.completed_steps } : u));
    return data.completed_steps;
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile, toggleStep, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
