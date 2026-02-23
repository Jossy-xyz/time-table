import { useAuthStore } from "../state/authStore";

const BASE_URL = "http://localhost:8080";

/**
 * Institutional API Client
 * Automatically handles headers and actor scoping for the backend.
 */
export const apiClient = {
  fetch: async <T = any>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> => {
    const { user } = useAuthStore.getState();

    const headers = new Headers(options.headers);
    headers.set("Content-Type", "application/json");

    // Inject Actor Username for DIV Scoping
    const actorUsername = user?.username || localStorage.getItem("username");
    if (actorUsername) {
      headers.set("X-Actor-Username", actorUsername);
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    const response = await fetch(`${BASE_URL}${endpoint}`, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(
        `[API ERROR] ${options.method || "GET"} ${endpoint} -> ${response.status}:`,
        errorData,
      );
      throw new Error(errorData.message || `API Error: ${response.status}`);
    }

    // Handle Blob/Raw responses if requested (e.g. for exports)
    if ((options as any).responseType === "blob") {
      return (await response.blob()) as unknown as T;
    }

    if ((options as any).responseType === "text") {
      return (await response.text()) as unknown as T;
    }

    // Handle empty responses (like 204 No Content or success messages)
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return response.json() as Promise<T>;
    }

    return response.text() as unknown as T;
  },

  get: <T = any>(endpoint: string, options: RequestInit = {}): Promise<T> =>
    apiClient.fetch<T>(endpoint, { ...options, method: "GET" }),

  post: <T = any>(
    endpoint: string,
    body?: any,
    options: RequestInit = {},
  ): Promise<T> =>
    apiClient.fetch<T>(endpoint, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T = any>(
    endpoint: string,
    body?: any,
    options: RequestInit = {},
  ): Promise<T> =>
    apiClient.fetch<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T = any>(endpoint: string, options: RequestInit = {}): Promise<T> =>
    apiClient.fetch<T>(endpoint, { ...options, method: "DELETE" }),
};
