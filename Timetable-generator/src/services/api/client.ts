import axios, { AxiosError } from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

/**
 * Institutional API Client
 * Features: Type-safe requests, centralized error handling, and session management.
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const username = localStorage.getItem("username");
    if (username) {
      config.headers["X-Actor-Username"] = username;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor - basic error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Technical Error Reconstruction
    if (error.message === "Network Error") {
      error.message =
        "System connectivity issue - ensure academic servers are operational.";
    } else if (error.code === "ECONNABORTED") {
      error.message = `Registry timeout - Server at ${API_BASE_URL} responded with a wait error.`;
    }

    return Promise.reject(error);
  },
);

export default apiClient;
