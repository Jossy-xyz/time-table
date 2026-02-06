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

        // Purge Institutional Context upon logout
        // We use the getter to avoid circular dependency in some bundlers
        const { useInstitutionalStore } = require("./institutionalStore");
        useInstitutionalStore.getState().resetContext();

        // Clear all authentication artifacts
        localStorage.removeItem("auth-storage");
        localStorage.removeItem("user_data");
        localStorage.removeItem("username");
        localStorage.removeItem("token");
        localStorage.removeItem("institutional-context");
      },

      setLoading: (isLoading: boolean) => set({ isLoading }),
      setError: (error: string | null) => set({ error, isLoading: false }),
    }),
    {
      name: "auth-storage", // local storage key
      onRehydrateStorage: () => (state) => {
        // After Zustand rehydration, also check legacy localStorage
        if (!state?.user) {
          const legacyUser = localStorage.getItem("user_data");
          const legacyUsername = localStorage.getItem("username");

          if (legacyUser) {
            try {
              const user = JSON.parse(legacyUser);

              // Normalize field names (backend might return userName instead of username)
              if (!user.username && (user as any).userName) {
                user.username = (user as any).userName;
              }

              // CRITICAL: Backend doesn't return username, restore from localStorage
              if (!user.username && legacyUsername) {
                user.username = legacyUsername;
              }

              if (!user.roleCode && user.roleId === 1) {
                user.roleCode = "AD";
              }

              state?.setAuth(user);
            } catch (e) {
              // console.error("[AUTH STORE] Failed to parse legacy user data", e);
            }
          } else if (legacyUsername) {
            // warn silently or remove
          }
        } else {
          // Also normalize Zustand-persisted user
          const storedUsername = localStorage.getItem("username");

          if (
            state.user &&
            !state.user.username &&
            (state.user as any).userName
          ) {
            state.user.username = (state.user as any).userName;
          }

          if (state.user && !state.user.username && storedUsername) {
            state.user.username = storedUsername;
          }
        }
      },
    },
  ),
);
