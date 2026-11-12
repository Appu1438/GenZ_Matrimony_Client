
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import authService from "../services/authService.js";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("loading");

  // Handle expired sessions
  useEffect(() => {
    const handleSessionExpired = () => {
      setUser(null);
      setStatus("unauthenticated");
    };

    window.addEventListener(
      "auth:session-expired",
      handleSessionExpired
    );

    return () => {
      window.removeEventListener(
        "auth:session-expired",
        handleSessionExpired
      );
    };
  }, []);

  // Get current authenticated user
  const refresh = useCallback(async () => {
    setStatus("loading");

    try {
      const current = await authService.getCurrentUser();

      setUser(current);
      setStatus(
        current ? "authenticated" : "unauthenticated"
      );

      return current;
    } catch (error) {
      setUser(null);
      setStatus("unauthenticated");

      return null;
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Login
  const login = useCallback(async (credentials) => {
    const session = await authService.login(credentials);

    setUser(session.user);
    setStatus("authenticated");

    return session;
  }, []);

  // Register
  const register = useCallback(async (data) => {
    return authService.register(data);
  }, []);

  // Logout
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setStatus("unauthenticated");
    }
  }, []);

  const value = useMemo(() => ({
    user,
    status,

    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",

    login,
    register,
    logout,
    refresh,

  }), [
    user,
    status,
    login,
    register,
    logout,
    refresh,
  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
