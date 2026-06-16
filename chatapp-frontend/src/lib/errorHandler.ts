/**
 * Extracts a human-readable error message from various error formats.
 * Handles axios errors, API responses, and generic errors.
 *
 * Supported formats:
 * 1. API response string: { data: "error message" }
 * 2. API response object: { data: { message: "error message" } }
 * 3. API response errors: { data: { errors: "message" } }
 * 4. Spring Boot validation: { data: { errors: { field: ["message"] } } }
 * 5. Alternative error field: { data: { error: "message" } }
 * 6. HTTP status codes with friendly messages
 * 7. Axios message: { message: "Network error" }
 */
export function getErrorMessage(err: unknown, defaultMessage: string = 'An error occurred'): string {
  if (!err) return defaultMessage;

  // Handle axios error response
  const axiosErr = err as {
    response?: {
      data?: string | { message?: string; errors?: string | Record<string, unknown> } | Record<string, unknown>;
      status?: number;
      statusText?: string;
    };
    message?: string;
  };

  // Priority 1: Check response.data (most common)
  if (axiosErr.response?.data) {
    const data = axiosErr.response.data;

    // If it's a non-empty string, return it directly (after trim)
    if (typeof data === 'string') {
      const trimmed = String(data).trim();
      if (trimmed && trimmed.toLowerCase() !== 'error' && trimmed !== '403' && trimmed !== '401') {
        return trimmed;
      }
    }

    // If it's an object, check various properties
    if (typeof data === 'object' && data !== null) {
      const obj = data as Record<string, unknown>;

      // Check for 'message' property (standard)
      if (obj.message && typeof obj.message === 'string') {
        const msg = obj.message.trim();
        if (msg) return msg;
      }

      // Check for 'errors' property (Spring Boot validation errors)
      if (obj.errors) {
        // If errors is a string message
        if (typeof obj.errors === 'string') {
          const errMsg = obj.errors.trim();
          if (errMsg) return errMsg;
        }
        // If errors is an object with field-level errors
        if (typeof obj.errors === 'object' && obj.errors !== null) {
          const errorsObj = obj.errors as Record<string, unknown>;
          const keys = Object.keys(errorsObj);

          // Try to get first error message
          if (keys.length > 0) {
            const firstKey = keys[0];
            const errorValue = errorsObj[firstKey];

            if (typeof errorValue === 'string') return errorValue;
            if (Array.isArray(errorValue) && errorValue.length > 0) {
              if (typeof errorValue[0] === 'string') return errorValue[0];
            }
          }
        }
      }

      // Check for 'error' property (alternative naming)
      if (obj.error && typeof obj.error === 'string') {
        const err = obj.error.trim();
        if (err) return err;
      }

      // Check for 'detail' property (standard REST error)
      if (obj.detail && typeof obj.detail === 'string') {
        const detail = obj.detail.trim();
        if (detail) return detail;
      }

      // Check for 'msg' or 'msg' property (some APIs use this)
      if (obj.msg && typeof obj.msg === 'string') {
        const msg = obj.msg.trim();
        if (msg) return msg;
      }
    }
  }

  // Priority 2: Check HTTP status code
  if (axiosErr.response?.status) {
    const status = axiosErr.response.status;

    // Provide friendly messages for common HTTP errors
    const statusMessages: Record<number, string> = {
      400: 'Bad request - please check your input',
      401: 'Unauthorized - invalid credentials or session expired',
      403: 'Forbidden - access denied',
      404: 'Not found - the resource does not exist',
      409: 'Conflict - this resource already exists',
      410: 'Gone - the resource has been deleted',
      422: 'Unprocessable entity - validation failed',
      429: 'Too many requests - please try again later',
      500: 'Internal server error - please try again later',
      502: 'Bad gateway - service temporarily unavailable',
      503: 'Service unavailable - please try again later',
      504: 'Gateway timeout - request took too long',
    };

    const statusText = axiosErr.response.statusText || 'Error';
    return statusMessages[status] || `${statusText} (${status})`;
  }

  // Priority 3: Check error.message (Axios generic error)
  if (axiosErr.message && typeof axiosErr.message === 'string') {
    const msg = axiosErr.message.trim();
    if (msg && msg !== 'Network Error') return msg;
  }

  // Fallback to default
  return defaultMessage;
}

