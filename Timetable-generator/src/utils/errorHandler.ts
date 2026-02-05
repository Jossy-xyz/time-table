export class ApiError extends Error {
  status: number;
  originalError: any;

  constructor(message: string, status: number, originalError: any) {
    super(message);
    this.status = status;
    this.originalError = originalError;
    this.name = "ApiError";
  }
}

/**
 * Institutional API Error Handler
 * Features: Type-safe orchestration of academic server errors.
 */
export const handleApiError = (error: any): ApiError => {
  let message = "An academic server error occurred";
  let status = -1;

  if (error.response) {
    // Server responded with error status
    status = error.response.status;
    message =
      error.response.data?.message || `Registry server error (${status})`;
  } else if (error.request) {
    // Request was made but no response
    status = 0;
    if (error.message?.includes("timeout")) {
      message = "Registry request timeout - academic server is unresponsive.";
    } else if (error.code === "ECONNREFUSED") {
      message =
        "Academic server connection refused - backend services offline.";
    } else if (error.message?.includes("Network")) {
      message =
        "Network error - verify institutional connectivity and protocol.";
    } else {
      message = error.message || "Academic server failed to respond.";
    }
  } else if (error.message) {
    // Error in request setup
    status = -1;
    message = error.message;
  }

  return new ApiError(message, status, error);
};

export const getErrorMessage = (error: any): string => {
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error.message) {
    return error.message;
  }
  return "An unexpected academic system error occurred.";
};
