import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "../../types/institutional";

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setAuth: (user: User) => void;
  logout: () => void;
  setError: (error: string | null) => void;
  setLoading: (isLoading: boolean) => void;
}

/**
 * Institutional Auth Store
 * Handles global user state and persistence.
 */
export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setAuth: (user: User) => {
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          error: null,
        });
        localStorage.removeItem("auth-storage"); // Clear persistence
      },

      setLoading: (isLoading: boolean) => set({ isLoading }),
      setError: (error: string | null) => set({ error, isLoading: false }),
    }),
    {
      name: "auth-storage", // local storage key
    },
  ),
);
