import {
  AuthenticationError,
  HTTPError,
  MalformedResponseError,
  NetworkError,
  RedirectError,
  TimeoutError,
  TLSError,
} from "../../../src/types/errors";
import {
  handleErrorResponse,
  isEmptyResponse,
  isMalformedResponse,
  normalizeError,
} from "../../../src/utils/error-handler";

describe("error-handler.normalizeError", () => {
  test("normalizes HTTPError with status and data", () => {
    const err = new HTTPError("boom", 418, { details: "teapot" });
    const res = normalizeError(err);
    expect(res.ok).toBe(false);
    expect(res.status).toBe(418);
    expect(res.problem).toBe("boom");
    expect(res.originalError).toBe("boom");
    expect(res.data).toEqual({ details: "teapot" });
    expect(res.headers).toBeNull();
    expect(res.duration).toBe(0);
  });

  test("normalizes generic Error to 500", () => {
    const err = new Error("generic");
    const res = normalizeError(err);
    expect(res.ok).toBe(false);
    expect(res.status).toBe(500);
    expect(res.problem).toBe("generic");
    expect(res.originalError).toBe("generic");
    expect(res.data).toBeNull();
  });

  test("normalizes unknown to 500 with stringified originalError", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = normalizeError(123 as any);
    expect(res.ok).toBe(false);
    expect(res.status).toBe(500);
    expect(res.problem).toBe("An unknown error occurred");
    expect(res.originalError).toBe("123");
  });
});

describe("error-handler.handleErrorResponse", () => {
  const table = [
    new AuthenticationError("auth"),
    new TimeoutError("timeout"),
    new NetworkError("net"),
    new RedirectError("redir"),
    new TLSError("tls"),
    new MalformedResponseError("mal"),
    new Error("plain"),
  ];

  test("maps all known error classes through normalizeError", () => {
    for (const err of table) {
      const res = handleErrorResponse(err);
      expect(res.ok).toBe(false);
      expect(res.problem).toBeDefined();
      expect(res.status).toBeGreaterThan(0);
    }
  });
});

describe("error-handler.isMalformedResponse", () => {
  test("returns true for falsy", () => {
    expect(isMalformedResponse("")).toBe(true);
    expect(isMalformedResponse(null as unknown as string)).toBe(true);
    expect(isMalformedResponse(undefined as unknown as string)).toBe(true);
  });

  test("returns false for valid JSON string", () => {
    expect(isMalformedResponse(JSON.stringify({ a: 1 }))).toBe(false);
  });

  test("returns true for invalid JSON string", () => {
    expect(isMalformedResponse("{oops")).toBe(true);
  });

  test("returns false for non-string non-empty input", () => {
    expect(isMalformedResponse({})).toBe(false);
    expect(isMalformedResponse(123 as unknown as string)).toBe(false);
  });
});

describe("error-handler.isEmptyResponse", () => {
  test("detects empty", () => {
    expect(isEmptyResponse("")).toBe(true);
    expect(isEmptyResponse(null)).toBe(true);
    expect(isEmptyResponse(undefined)).toBe(true);
  });
  test("detects non-empty", () => {
    expect(isEmptyResponse(" ")).toBe(false);
    expect(isEmptyResponse(0 as unknown as string)).toBe(false);
    expect(isEmptyResponse({} as unknown as string)).toBe(false);
  });
});