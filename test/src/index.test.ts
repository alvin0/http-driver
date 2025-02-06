// test/src/merged.test.ts

import { AxiosHeaders } from "axios";
import { DriverBuilder } from "../../src/index";
import {
  AuthenticationError,
  HTTPError,
  NetworkError,
  RedirectError,
  TimeoutError,
  TLSError
} from "../../src/utils/custom-errors";
import type { ServiceApi } from "../../src/utils/driver-contracts";
import { MethodAPI } from "../../src/utils/driver-contracts";

// -------------------- Additional Tests --------------------

const serviceWithPlaceholder: ServiceApi = {
  id: "test",
  url: "api/test/{id}",
  method: MethodAPI.get,
  options: {},
};

describe("Driver - Additional Tests", () => {
  test("getInfoURL appends query string when payload is provided", () => {
    const driver = new DriverBuilder()
      .withBaseURL("http://example.com")
      .withServices([serviceWithPlaceholder])
      .build();
    // When payload is provided and method is GET, it should append the query string.
    const info = driver.getInfoURL(
      { id: "test", params: { id: "test" } },
      { search: "query" }
    );
    // Expected behavior:
    // - The service URL "api/test/{id}" with {id} replaced by "test" becomes "api/test/test".
    // - Since payload is non-empty and method is "get", a query string is appended.
    expect(info.fullUrl).toBe("http://example.com/api/test/test?search=query");
    // The payload should be cleared after appending the query string.
    expect(info.payload).toBeNull();
    expect(info.method).toBe("get");
  });

  test("execService returns error response when underlying API call returns null", async () => {
    const service: ServiceApi = {
      id: "nullService",
      url: "api/null",
      method: MethodAPI.get,
      options: {},
    };
    const driver = new DriverBuilder()
      .withBaseURL("http://example.com")
      .withServices([service])
      .build();
    // Override the API call method to simulate a null response.
    driver.get = jest.fn().mockResolvedValue(null);
    const response = await driver.execService({ id: "nullService" });
    expect(response.ok).toBe(false);
    expect(response.status).toBe(500);
    expect(response.problem).toContain("No response from service call");
    expect(response.data).toBeNull();
  });
});

// -------------------- Main Driver Unit Tests --------------------

describe("Driver (src/index.ts) Unit Tests", () => {
  const serviceOne: ServiceApi = {
    id: "service1",
    url: "api/service1/{id}",
    method: MethodAPI.get,
    options: {},
  };

  const serviceTwo: ServiceApi = {
    id: "service2",
    url: "api/service2",
    method: MethodAPI.post,
    options: { headers: { "Content-Type": "application/json" } },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should throw error if configuration is incomplete", () => {
    expect(() => new DriverBuilder().build()).toThrow("Missing required configuration values");
    expect(() => new DriverBuilder().withBaseURL("http://example.com").build()).toThrow("Missing required configuration values");
  });

  test("should build driver with available methods", () => {
    const driver = new DriverBuilder()
      .withBaseURL("http://example.com")
      .withServices([serviceOne, serviceTwo])
      .build();
    expect(typeof driver.execService).toBe("function");
    expect(typeof driver.execServiceByFetch).toBe("function");
    expect(typeof driver.getInfoURL).toBe("function");
  });

  test("execService returns error response when service is not found", async () => {
    const driver = new DriverBuilder()
      .withBaseURL("http://example.com")
      .withServices([serviceOne])
      .build();
    const response = await driver.execService({ id: "unknownService" });
    expect(response.ok).toBe(false);
    expect(response.status).toBe(500);
    expect(response.problem).toContain("Service unknownService in driver not found");
  });

  test("execService returns successful response for GET service", async () => {
    const headers = new AxiosHeaders();
    headers.set("content-type", "application/json");

    const fakeResponse = {
      ok: true,
      status: 200,
      headers: { "content-type": "application/json" },
      data: { data: "getSuccess" },
      problem: null,
      originalError: null,
      duration: 40,
    };
    const driver = new DriverBuilder()
      .withBaseURL("http://example.com")
      .withServices([serviceOne])
      .build();
    driver.get = jest.fn().mockResolvedValue(fakeResponse);
    const response = await driver.execService({ id: "service1", params: { id: "123" } });
    expect(response.ok).toBe(true);
    expect(response.data).toEqual({ data: "getSuccess" });
  });

  test("execServiceByFetch returns successful response for POST service", async () => {
    const fakeResponse = {
      ok: true,
      status: 201,
      headers: new Headers({ "Content-Type": "application/json" }),
      text: async () => JSON.stringify({ data: "postSuccess" }),
    };
    const driver = new DriverBuilder()
      .withBaseURL("http://example.com")
      .withServices([serviceTwo])
      .build();
    const originalFetch = globalThis.fetch;
    globalThis.fetch = jest.fn().mockResolvedValue(fakeResponse as any);
    const response = await driver.execServiceByFetch({ id: "service2" }, { payload: "testData" });
    expect(response.ok).toBe(true);
    expect(response.status).toBe(201);
    expect(response.data).toEqual({ data: "postSuccess" });
    globalThis.fetch = originalFetch;
  });

  test("should handle malformed responses", async () => {
    const malformedService: ServiceApi = {
      id: "malformed",
      url: "api/malformed",
      method: MethodAPI.get,
      options: {},
    };

    const driver = new DriverBuilder()
      .withBaseURL("http://example.com")
      .withServices([malformedService])
      .build();

    const originalFetch = globalThis.fetch;

    // Test malformed JSON response
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ "Content-Type": "application/json" }),
      text: async () => "{invalid json}",
    });

    let response = await driver.execServiceByFetch({ id: "malformed" });
    expect(response.ok).toBe(false);
    expect(response.problem).toContain("Malformed response");
    expect(response.status).toBe(500);

    // Test empty response
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ "Content-Type": "application/json" }),
      text: async () => "",
    });

    response = await driver.execServiceByFetch({ id: "malformed" });
    expect(response.ok).toBe(false);
    expect(response.problem).toContain("Malformed response");

    globalThis.fetch = originalFetch;
  });

  test("should handle network failures", async () => {
    const networkService: ServiceApi = {
      id: "network",
      url: "api/network",
      method: MethodAPI.get,
      options: {},
    };

    const driver = new DriverBuilder()
      .withBaseURL("http://example.com")
      .withServices([networkService])
      .build();

    // Test timeout
    const timeoutError = new TimeoutError();
    driver.get = jest.fn().mockRejectedValue(timeoutError);

    let response = await driver.execService({ id: "network" });
    expect(response.ok).toBe(false);
    expect(response.problem).toContain("timeout");
    expect(response.status).toBe(408);

    // Test network error
    const networkError = new NetworkError("Connection failed");
    driver.get = jest.fn().mockRejectedValue(networkError);

    response = await driver.execService({ id: "network" });
    expect(response.ok).toBe(false);
    expect(response.problem).toContain("Connection failed");
    expect(response.status).toBe(503);
  });

  test("should handle HTTP error status codes", async () => {
    const errorService: ServiceApi = {
      id: "error",
      url: "api/error",
      method: MethodAPI.get,
      options: {},
    };

    const driver = new DriverBuilder()
      .withBaseURL("http://example.com")
      .withServices([errorService])
      .build();

    // Test authentication error
    const authError = new AuthenticationError("Token expired");
    driver.get = jest.fn().mockRejectedValue(authError);

    let response = await driver.execService({ id: "error" });
    expect(response.ok).toBe(false);
    expect(response.status).toBe(401);
    expect(response.problem).toContain("Token expired");

    // Test server error
    const serverError = new HTTPError("Internal server error", 500);
    driver.get = jest.fn().mockRejectedValue(serverError);

    response = await driver.execService({ id: "error" });
    expect(response.ok).toBe(false);
    expect(response.status).toBe(500);
  });

  test("should handle redirect loops", async () => {
    const redirectService: ServiceApi = {
      id: "redirect-loop",
      url: "api/redirect-loop",
      method: MethodAPI.get,
      options: { maxRedirects: 5 },
    };

    const driver = new DriverBuilder()
      .withBaseURL("http://example.com")
      .withServices([redirectService])
      .build();

    const redirectError = new RedirectError();
    driver.get = jest.fn().mockRejectedValue(redirectError);

    const response = await driver.execService({ id: "redirect-loop" });
    expect(response.ok).toBe(false);
    expect(response.problem).toContain("Maximum redirects exceeded");
    expect(response.status).toBe(310);
  });

  test("should handle request timeouts", async () => {
    jest.useFakeTimers();

    const timeoutService: ServiceApi = {
      id: "timeout",
      url: "api/timeout",
      method: MethodAPI.get,
      options: { timeout: 5000 },
    };

    const driver = new DriverBuilder()
      .withBaseURL("http://example.com")
      .withServices([timeoutService])
      .build();

    const timeoutError = new TimeoutError();
    driver.get = jest.fn().mockRejectedValue(timeoutError);

    const response = await driver.execService({ id: "timeout" });
    expect(response.ok).toBe(false);
    expect(response.problem).toContain("timeout");
    expect(response.status).toBe(408);

    jest.useRealTimers();
  });

  test("should handle authentication flows", async () => {
    const authService: ServiceApi = {
      id: "auth",
      url: "api/auth",
      method: MethodAPI.post,
      options: {
        headers: { "Authorization": "Bearer expired-token" },
      },
    };

    const driver = new DriverBuilder()
      .withBaseURL("http://example.com")
      .withServices([authService])
      .build();

    const authError = new AuthenticationError("Token expired");
    driver.post = jest.fn().mockRejectedValue(authError);

    const response = await driver.execService({ id: "auth" });
    expect(response.ok).toBe(false);
    expect(response.status).toBe(401);
    expect(response.problem).toContain("Token expired");
  });

  test("should handle HTTPS and SSL/TLS errors", async () => {
    const httpsService: ServiceApi = {
      id: "https",
      url: "api/secure",
      method: MethodAPI.get,
      options: {},
    };

    const driver = new DriverBuilder()
      .withBaseURL("https://example.com")
      .withServices([httpsService])
      .build();

    const tlsError = new TLSError("Certificate validation failed");
    driver.get = jest.fn().mockRejectedValue(tlsError);

    const response = await driver.execService({ id: "https" });
    expect(response.ok).toBe(false);
    expect(response.status).toBe(525);
    expect(response.problem).toContain("Certificate validation failed");
  });

  test("should handle concurrent requests with proper error handling", async () => {
    const concurrentService: ServiceApi = {
      id: "concurrent",
      url: "api/concurrent",
      method: MethodAPI.get,
      options: { timeout: 1000 },
    };

    const driver = new DriverBuilder()
      .withBaseURL("http://example.com")
      .withServices([concurrentService])
      .build();

    // One request succeeds, one times out
    driver.get = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        data: { id: 1 },
        headers: new Headers(),
        problem: null,
        originalError: null,
      })
      .mockRejectedValueOnce(new TimeoutError());

    const [response1, response2] = await Promise.all([
      driver.execService({ id: "concurrent" }),
      driver.execService({ id: "concurrent" }),
    ]);

    expect(response1.ok).toBe(true);
    expect(response2.ok).toBe(false);
    expect(response2.status).toBe(408);
    expect(driver.get).toHaveBeenCalledTimes(2);
  });
});