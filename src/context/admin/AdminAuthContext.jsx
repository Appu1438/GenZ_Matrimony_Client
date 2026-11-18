
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import toast from "react-hot-toast";
import adminAuthService from "../../services/admin/adminAuthService.js";

export const AdminAuthContext = createContext(null);

const ADMIN_ROLES = ["admin", "super_admin"];

function isAdminUser(user) {
  return Boolean(user && ADMIN_ROLES.includes(user.role));
}

function getErrorMessage(error, fallback) {
  return (
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
}

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [status, setStatus] = useState("loading");

  // Handle expired admin sessions.
  useEffect(() => {
    const handleSessionExpired = () => {
      setAdmin((currentAdmin) => {
        if (currentAdmin) {
          toast.error("Your admin session has expired. Please log in again.");
        }

        return null;
      });

      setStatus("unauthenticated");
    };

    window.addEventListener(
      "admin:session-expired",
      handleSessionExpired
    );

    return () => {
      window.removeEventListener(
        "admin:session-expired",
        handleSessionExpired
      );
    };
  }, []);

  // Restore admin session when the application loads.
  const refresh = useCallback(async () => {
    setStatus("loading");

    try {
      // First, check whether the access token is still valid.
      let currentAdmin = await adminAuthService.getCurrentAdmin();

      // If access token is expired, attempt refresh using the
      // adminRefreshToken cookie.
      if (!isAdminUser(currentAdmin)) {
        const refreshedSession =
          await adminAuthService.refreshSession();

        currentAdmin =
          refreshedSession?.admin ||
          await adminAuthService.getCurrentAdmin();
      }

      if (!isAdminUser(currentAdmin)) {
        setAdmin(null);
        setStatus("unauthenticated");
        return null;
      }

      setAdmin(currentAdmin);
      setStatus("authenticated");

      return currentAdmin;
    } catch (error) {
      // Initial session restoration should fail silently.
      // Do not show an error toast just because the user is logged out.
      setAdmin(null);
      setStatus("unauthenticated");

      return null;
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Admin login.
  const login = useCallback(async (credentials) => {
    try {
      const session = await adminAuthService.login(credentials);

      // Backend response: data.admin
      const authenticatedAdmin = session?.admin;

      if (!isAdminUser(authenticatedAdmin)) {
        try {
          await adminAuthService.logout();
        } catch {
          // Ignore logout failure; preserve authorization error.
        }

        setAdmin(null);
        setStatus("unauthenticated");

        throw new Error(
          "You are not authorized to access the admin portal."
        );
      }

      setAdmin(authenticatedAdmin);
      setStatus("authenticated");

      toast.success("Welcome to the admin dashboard!");

      return authenticatedAdmin;
    } catch (error) {
      setAdmin(null);
      setStatus("unauthenticated");

      toast.error(
        getErrorMessage(error, "Admin login failed. Please try again.")
      );

      throw error;
    }
  }, []);

  // Admin logout.
  const logout = useCallback(async () => {
    try {
      await adminAuthService.logout();

      toast.success("You have been logged out successfully.");
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Unable to complete logout.")
      );
    } finally {
      setAdmin(null);
      setStatus("unauthenticated");
    }
  }, []);

  const value = useMemo(() => ({
    admin,
    status,

    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",

    login,
    logout,
    refresh,
  }), [
    admin,
    status,
    login,
    logout,
    refresh,
  ]);

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}
