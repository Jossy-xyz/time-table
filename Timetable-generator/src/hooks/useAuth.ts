import { useCallback } from "react";
import { useAuthStore } from "../services/state/authStore";

/**
 * Institutional Auth Hook
 * Features: Type-safe access to auth state, role-based checks.
 */
export const useAuth = () => {
  const { user, isLoading, error, setAuth, logout } = useAuthStore();

  const isAuthenticated = useCallback(() => {
    return !!user;
  }, [user]);

  const hasRole = useCallback(
    (role: string) => {
      return user?.roleCode === role;
    },
    [user],
  );

  return {
    user,
    isLoading,
    error,
    logout,
    setUser: setAuth, // Alias for backward compatibility if needed
    isAuthenticated: isAuthenticated(),
    hasRole,
  };
};
