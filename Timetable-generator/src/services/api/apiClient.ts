import { useAuthStore } from "../state/authStore";

const BASE_URL = "http://localhost:8080";

/**
 * Institutional API Client
 * Automatically handles headers and actor scoping for the backend.
 */
export const apiClient = {
  fetch: async (endpoint: string, options: RequestInit = {}) => {
    const { user } = useAuthStore.getState();

    const headers = new Headers(options.headers);
    headers.set("Content-Type", "application/json");

    // Inject Actor Username for DIV Scoping
    if (user?.username) {
      headers.set("X-Actor-Username", user.username);
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    const response = await fetch(`${BASE_URL}${endpoint}`, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API Error: ${response.status}`);
    }

    // Handle empty responses (like 204 No Content or success messages)
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return response.json();
    }

    return response.text();
  },

  get: (endpoint: string, options: RequestInit = {}) =>
    apiClient.fetch(endpoint, { ...options, method: "GET" }),

  post: (endpoint: string, body: any, options: RequestInit = {}) =>
    apiClient.fetch(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(body),
    }),

  put: (endpoint: string, body: any, options: RequestInit = {}) =>
    apiClient.fetch(endpoint, {
      ...options,
      method: "PUT",
      body: JSON.stringify(body),
    }),

  delete: (endpoint: string, options: RequestInit = {}) =>
    apiClient.fetch(endpoint, { ...options, method: "DELETE" }),
};
