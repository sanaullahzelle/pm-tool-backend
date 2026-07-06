import { createContext, useContext, useEffect, useState } from "react";
import * as api from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("pm_token");
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .fetchMe()
      .then((res) => setUser(res.user))
      .catch(() => localStorage.removeItem("pm_token"))
      .finally(() => setLoading(false));
  }, []);

  async function loginUser(email, password) {
    const res = await api.login({ email, password });
    localStorage.setItem("pm_token", res.token);
    setUser(res.user);
    return res.user;
  }

  async function registerUser(name, email, password) {
    const res = await api.register({ name, email, password });
    localStorage.setItem("pm_token", res.token);
    setUser(res.user);
    return res.user;
  }

  function logout() {
    localStorage.removeItem("pm_token");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, loginUser, registerUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
