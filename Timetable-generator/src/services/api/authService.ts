import { apiClient } from "./apiClient";
import { User } from "../../types/institutional";
import { useAuthStore } from "../state/authStore";

/**
 * Institutional Authentication Service
 * Standardized for the new backend DTOs.
 */
export const authService = {
  login: async (username: string, password?: string): Promise<User> => {
    const response = await apiClient.post("/users/login", {
      username,
      password,
    });

    // The backend login returns the User DTO directly
    const user = response as User;

    // Standardize field names for backward compatibility
    if (!user.username && (user as any).userName) {
      user.username = (user as any).userName;
    }

    if (!user.roleCode && user.roleId === 1) {
      user.roleCode = "AD";
    }

    // Update the Zustand store immediately
    useAuthStore.getState().setAuth(user);

    // Also set legacy localStorage for compatibility and background fetch access
    if (user.username) {
      localStorage.setItem("username", user.username);
    }
    localStorage.setItem("user_data", JSON.stringify(user));
    if (password) localStorage.setItem("token", "active-session");

    // Removed debug logs

    return user;
  },

  logout: (): void => {
    useAuthStore.getState().logout();
  },

  getCurrentUser: async (username: string): Promise<User> => {
    const response = await apiClient.get(`/users/${username}`);
    return response as User;
  },
};
