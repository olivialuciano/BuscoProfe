import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { loginRequest } from "../api/authService";
import {
  clearSession,
  getStoredUser,
  getToken,
  saveSession,
} from "../utils/storage";
import { useToast } from "./ToastContext";
import { normalizeRole } from "../utils/constants";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const storedUser = getStoredUser();
    if (!storedUser) return null;

    return {
      ...storedUser,
      role: normalizeRole(storedUser.role),
    };
  });

  const [token, setToken] = useState(getToken());
  const [loading, setLoading] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (!token) setUser(null);
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);

    try {
      const response = await loginRequest({ email, password });

      const normalizedUser = {
        id: response.userId,
        email: response.email,
        role: normalizeRole(response.role),
      };

      const session = {
        token: response.token,
        user: normalizedUser,
      };

      saveSession(session);
      setToken(session.token);
      setUser(normalizedUser);
      setSessionExpired(false);

      return {
        ...response,
        role: normalizedUser.role,
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearSession();
    setToken(null);
    setUser(null);
  };

  const expireSession = () => {
    clearSession();
    setToken(null);
    setUser(null);
    setSessionExpired(true);
  };

  const closeSessionExpiredModal = () => {
    setSessionExpired(false);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(token),
      sessionExpired,
      login,
      logout,
      expireSession,
      closeSessionExpiredModal,
    }),
    [user, token, loading, sessionExpired],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
