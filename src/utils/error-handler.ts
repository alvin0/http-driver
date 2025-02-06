import { AuthenticationError, HTTPError, MalformedResponseError, NetworkError, RedirectError, TimeoutError, TLSError } from "./custom-errors";
import type { ResponseFormat } from "./driver-contracts";

// ErrorResponse must match ResponseFormat structure
export function normalizeError(error: unknown): ResponseFormat {
  const baseError = {
    ok: false as const,
    duration: 0,
    headers: null,
    data: null
  };

  if (error instanceof HTTPError) {
    return {
      ...baseError,
      status: error.status || 500,
      problem: error.message,
      originalError: error.message,
      data: error.data || null
    };
  }

  if (error instanceof Error) {
    return {
      ...baseError,
      status: 500,
      problem: error.message,
      originalError: error.message
    };
  }

  // Handle unexpected error types
  return {
    ...baseError,
    status: 500,
    problem: 'An unknown error occurred',
    originalError: String(error)
  };
}

export function handleErrorResponse(error: unknown): ResponseFormat {
  if (error instanceof AuthenticationError) {
    return normalizeError(error);
  }

  if (error instanceof TimeoutError) {
    return normalizeError(error);
  }

  if (error instanceof NetworkError) {
    return normalizeError(error);
  }

  if (error instanceof RedirectError) {
    return normalizeError(error);
  }

  if (error instanceof TLSError) {
    return normalizeError(error);
  }

  if (error instanceof MalformedResponseError) {
    return normalizeError(error);
  }

  return normalizeError(error);
}

export function isMalformedResponse(response: unknown): boolean {
  if (!response) return true;
  
  if (typeof response === 'string') {
    try {
      JSON.parse(response);
      return false;
    } catch {
      return true;
    }
  }

  return false;
}

export function isEmptyResponse(response: unknown): boolean {
  return response === '' || response === null || response === undefined;
}
