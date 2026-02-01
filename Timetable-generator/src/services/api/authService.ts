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

    // Update the Zustand store immediately
    useAuthStore.getState().setAuth(user);

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
