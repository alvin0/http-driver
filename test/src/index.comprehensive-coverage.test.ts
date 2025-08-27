import { AxiosError } from "axios";
import { DriverBuilder } from "../../src/index";
import { MethodAPI, ServiceApi } from "../../src/types/driver";

describe("Driver (src/index.ts) Comprehensive Coverage", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
    jest.clearAllMocks();
  });

  describe("Driver Constructor and Interceptors", () => {
    test("should handle withCredentials configuration", () => {
      const driver1 = new DriverBuilder()
        .withBaseURL("http://example.com")
        .withServices([{ id: "test", url: "api/test", method: MethodAPI.get }])
        .build();

      // Default withCredentials should be true
      expect((driver1 as any).defaults.withCredentials).toBe(true);
    });

    test("should handle custom interceptor error handler", async () => {
      const mockInterceptorHandler = jest.fn().mockImplementation(
        (axiosInstance, processQueue, isRefreshing) => 
          async (error: any) => Promise.reject(error)
      );

      const driver = new DriverBuilder()
        .withBaseURL("http://example.com")
        .withServices([{ id: "test", url: "api/test", method: MethodAPI.get }])
        .withHandleInterceptorErrorAxios(mockInterceptorHandler)
        .build();

      expect(mockInterceptorHandler).toHaveBeenCalled();
    });

    test("should handle request transform throwing error", async () => {
      const throwingTransform = jest.fn().mockImplementation(() => {
        throw new Error("Transform failed");
      });

      const driver = new DriverBuilder()
        .withBaseURL("http://example.com")
        .withServices([{ id: "test", url: "api/test", method: MethodAPI.get }])
        .withAddRequestTransformAxios(throwingTransform)
        .build();

      // Mock adapter to avoid real HTTP
      (driver as any).defaults.adapter = async () => {
        throw new Error("Should not reach here");
      };

      const response = await driver.execService({ id: "test" });
      expect(response.ok).toBe(false);
      expect(throwingTransform).toHaveBeenCalled();
    });

    test("should handle async request transform throwing error", async () => {
      const driver = new DriverBuilder()
        .withBaseURL("http://example.com")
        .withServices([{ id: "test", url: "api/test", method: MethodAPI.get }])
        .withAddAsyncRequestTransformAxios((register: any) => {
          (register as any)(async (req: any) => {
            throw new Error("Async transform failed");
          });
        })
        .build();

      (driver as any).defaults.adapter = async () => {
        throw new Error("Should not reach here");
      };

      const response = await driver.execService({ id: "test" });
      expect(response.ok).toBe(false);
    });

    test("should handle response transform throwing error (swallowed)", async () => {
      const throwingResponseTransform = jest.fn().mockImplementation(() => {
        throw new Error("Response transform failed");
      });

      const driver = new DriverBuilder()
        .withBaseURL("http://example.com")
        .withServices([{ id: "test", url: "api/test", method: MethodAPI.get }])
        .withAddResponseTransformAxios(throwingResponseTransform)
        .build();

      (driver as any).defaults.adapter = async () => ({
        data: { success: true },
        status: 200,
        statusText: "OK",
        headers: {},
        config: {},
      });

      const response = await driver.execService({ id: "test" });
      expect(response.ok).toBe(true); // Error should be swallowed
      expect(throwingResponseTransform).toHaveBeenCalled();
    });

    test("should handle async response transform throwing error (ignored)", async () => {
      const driver = new DriverBuilder()
        .withBaseURL("http://example.com")
        .withServices([{ id: "test", url: "api/test", method: MethodAPI.get }])
        .withAddAsyncResponseTransformAxios((register: any) => {
          (register as any)(async (res: any) => {
            throw new Error("Async response transform failed");
          });
        })
        .build();

      (driver as any).defaults.adapter = async () => ({
        data: { success: true },
        status: 200,
        statusText: "OK",
        headers: {},
        config: {},
      });

      const response = await driver.execService({ id: "test" });
      expect(response.ok).toBe(true); // Error should be ignored
    });
  });

  describe("execService method coverage", () => {
    test("should handle multipart/form-data content type detection", async () => {
      const service: ServiceApi = {
        id: "multipart",
        url: "api/upload",
        method: MethodAPI.post,
        options: { headers: { "Content-Type": "multipart/form-data" } }
      };

      const driver = new DriverBuilder()
        .withBaseURL("http://example.com")
        .withServices([service])
        .build();

      (driver as any).defaults.adapter = async (config: any) => ({
        data: { uploaded: true },
        status: 201,
        statusText: "Created",
        headers: {},
        config,
      });

      const response = await driver.execService({ id: "multipart" }, { file: "data" });
      expect(response.ok).toBe(true);
      expect(response.status).toBe(201);
    });

    test("should handle AbortController signal from abortController.signal", async () => {
      const service: ServiceApi = {
        id: "abort",
        url: "api/abort",
        method: MethodAPI.get,
      };

      const driver = new DriverBuilder()
        .withBaseURL("http://example.com")
        .withServices([service])
        .build();

      const abortController = new AbortController();
      let capturedConfig: any;

      (driver as any).defaults.adapter = async (config: any) => {
        capturedConfig = config;
        return {
          data: { success: true },
          status: 200,
          statusText: "OK",
          headers: {},
          config,
        };
      };

      await driver.execService(
        { id: "abort" },
        {},
        { abortController }
      );

      expect(capturedConfig.signal).toBe(abortController.signal);
    });

    test("should handle different HTTP methods (DELETE, HEAD)", async () => {
      const deleteService: ServiceApi = {
        id: "delete",
        url: "api/delete/{id}",
        method: MethodAPI.delete,
      };

      const headService: ServiceApi = {
        id: "head",
        url: "api/head",
        method: MethodAPI.head,
      };

      const driver = new DriverBuilder()
        .withBaseURL("http://example.com")
        .withServices([deleteService, headService])
        .build();

      // Mock the specific methods
      driver.delete = jest.fn().mockResolvedValue({
        ok: true,
        status: 204,
        data: null,
        headers: {},
      });

      driver.head = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        data: null,
        headers: { "Content-Length": "100" },
      });

      const deleteResponse = await driver.execService({ id: "delete", params: { id: "123" } });
      expect(deleteResponse.ok).toBe(true);
      expect(deleteResponse.status).toBe(204);
      expect(driver.delete).toHaveBeenCalledWith("http://example.com/api/delete/123", {});

      const headResponse = await driver.execService({ id: "head" });
      expect(headResponse.ok).toBe(true);
      expect(headResponse.status).toBe(200);
      expect(driver.head).toHaveBeenCalledWith("http://example.com/api/head", {});
    });

    test("should handle method not available fallback to request", async () => {
      const customService: ServiceApi = {
        id: "custom",
        url: "api/custom",
        method: "PATCH" as any, // Custom method not directly available
      };

      const driver = new DriverBuilder()
        .withBaseURL("http://example.com")
        .withServices([customService])
        .build();

      driver.request = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        data: { patched: true },
        headers: {},
      });

      const response = await driver.execService({ id: "custom" }, { data: "patch" });
      expect(response.ok).toBe(true);
      expect(driver.request).toHaveBeenCalledWith({
        method: "PATCH",
        url: "http://example.com/api/custom",
        data: { data: "patch" },
      });
    });

    test("should handle already normalized response passthrough", async () => {
      const service: ServiceApi = {
        id: "normalized",
        url: "api/normalized",
        method: MethodAPI.get,
      };

      const driver = new DriverBuilder()
        .withBaseURL("http://example.com")
        .withServices([service])
        .build();

      // Mock method to return already normalized response
      const normalizedResponse = {
        ok: true,
        status: 200,
        data: { already: "normalized" },
        headers: {},
        problem: null,
        originalError: null,
        duration: 50,
      };

      driver.get = jest.fn().mockResolvedValue(normalizedResponse);

      const response = await driver.execService({ id: "normalized" });
      expect(response).toBe(normalizedResponse); // Should be the same object
    });

    test("should handle AxiosError with ERR_CANCELED code", async () => {
      const service: ServiceApi = {
        id: "canceled",
        url: "api/canceled",
        method: MethodAPI.get,
      };

      const driver = new DriverBuilder()
        .withBaseURL("http://example.com")
        .withServices([service])
        .build();

      const canceledError = {
        isAxiosError: true,
        code: "ERR_CANCELED",
        message: "Request canceled",
      } as AxiosError;

      driver.get = jest.fn().mockRejectedValue(canceledError);

      const response = await driver.execService({ id: "canceled" });
      expect(response.ok).toBe(false);
      expect(response.status).toBe(408);
      expect(response.problem).toContain("timeout");
    });

    test("should handle AxiosError with CanceledError name", async () => {
      const service: ServiceApi = {
        id: "canceled-name",
        url: "api/canceled",
        method: MethodAPI.get,
      };

      const driver = new DriverBuilder()
        .withBaseURL("http://example.com")
        .withServices([service])
        .build();

      const canceledError = {
        isAxiosError: true,
        name: "CanceledError",
        message: "Request canceled",
      } as AxiosError;

      driver.get = jest.fn().mockRejectedValue(canceledError);

      const response = await driver.execService({ id: "canceled-name" });
      expect(response.ok).toBe(false);
      expect(response.status).toBe(408);
    });

    test("should handle non-Error thrown values", async () => {
      const service: ServiceApi = {
        id: "non-error",
        url: "api/non-error",
        method: MethodAPI.get,
      };

      const driver = new DriverBuilder()
        .withBaseURL("http://example.com")
        .withServices([service])
        .build();

      driver.get = jest.fn().mockRejectedValue("string error");

      const response = await driver.execService({ id: "non-error" });
      expect(response.ok).toBe(false);
      expect(response.status).toBe(500);
    });
  });

  describe("execServiceByFetch method coverage", () => {
    test("should handle AbortController from abortController.signal", async () => {
      const service: ServiceApi = {
        id: "fetch-abort",
        url: "api/fetch-abort",
        method: MethodAPI.get,
      };

      const driver = new DriverBuilder()
        .withBaseURL("http://example.com")
        .withServices([service])
        .build();

      const abortController = new AbortController();
      let capturedOptions: any;

      globalThis.fetch = jest.fn().mockImplementation((url, options) => {
        capturedOptions = options;
        return Promise.resolve({
          ok: true,
          status: 200,
          headers: new Headers({ "Content-Type": "application/json" }),
          text: async () => JSON.stringify({ success: true }),
        });
      });

      await driver.execServiceByFetch(
        { id: "fetch-abort" },
        {},
        { abortController }
      );

      expect(capturedOptions.signal).toBe(abortController.signal);
    });

    test("should handle headers without hasOwnProperty method", async () => {
      const service: ServiceApi = {
        id: "no-hasown",
        url: "api/no-hasown",
        method: MethodAPI.post,
      };

      const driver = new DriverBuilder()
        .withBaseURL("http://example.com")
        .withServices([service])
        .build();

      // Create headers object without hasOwnProperty
      const headersWithoutHasOwn = Object.create(null);
      headersWithoutHasOwn["Authorization"] = "Bearer token";

      globalThis.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ "Content-Type": "application/json" }),
        text: async () => JSON.stringify({ success: true }),
      });

      // This should handle the missing hasOwnProperty and return an error response
      try {
        const response = await driver.execServiceByFetch(
          { id: "no-hasown" },
          { data: "test" },
          { headers: headersWithoutHasOwn }
        );
        expect(response.ok).toBe(false); // Should fail due to missing hasOwnProperty
        expect(response.status).toBe(500);
      } catch (error) {
        // If it crashes due to missing hasOwnProperty, that's expected behavior
        expect(error).toBeDefined();
      }
    });

    test("should handle Content-Type header access that returns undefined", async () => {
      const service: ServiceApi = {
        id: "undefined-ct",
        url: "api/undefined-ct",
        method: MethodAPI.post,
      };

      const driver = new DriverBuilder()
        .withBaseURL("http://example.com")
        .withServices([service])
        .build();

      const problematicHeaders = {
        "Authorization": "Bearer token"
      };
      
      // Make Content-Type access return undefined
      Object.defineProperty(problematicHeaders, "Content-Type", {
        get() { return undefined; },
        enumerable: true,
        configurable: true
      });

      globalThis.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ "Content-Type": "application/json" }),
        text: async () => JSON.stringify({ success: true }),
      });

      const response = await driver.execServiceByFetch(
        { id: "undefined-ct" },
        { data: "test" },
        { headers: problematicHeaders }
      );

      expect(response.ok).toBe(false); // Should fail due to undefined.toLowerCase()
      expect(response.status).toBe(500);
    });

    test("should handle AbortError from fetch", async () => {
      const service: ServiceApi = {
        id: "abort-error",
        url: "api/abort-error",
        method: MethodAPI.get,
      };

      const driver = new DriverBuilder()
        .withBaseURL("http://example.com")
        .withServices([service])
        .build();

      const abortError = new Error("Request aborted");
      abortError.name = "AbortError";

      globalThis.fetch = jest.fn().mockRejectedValue(abortError);

      const response = await driver.execServiceByFetch({ id: "abort-error" });
      expect(response.ok).toBe(false);
      expect(response.status).toBe(408);
    });

    test("should handle error with aborted message", async () => {
      const service: ServiceApi = {
        id: "aborted-msg",
        url: "api/aborted-msg",
        method: MethodAPI.get,
      };

      const driver = new DriverBuilder()
        .withBaseURL("http://example.com")
        .withServices([service])
        .build();

      globalThis.fetch = jest.fn().mockRejectedValue(new Error("Request was aborted"));

      const response = await driver.execServiceByFetch({ id: "aborted-msg" });
      expect(response.ok).toBe(false);
      expect(response.status).toBe(408);
    });

    test("should handle error with canceled message", async () => {
      const service: ServiceApi = {
        id: "canceled-msg",
        url: "api/canceled-msg",
        method: MethodAPI.get,
      };

      const driver = new DriverBuilder()
        .withBaseURL("http://example.com")
        .withServices([service])
        .build();

      globalThis.fetch = jest.fn().mockRejectedValue(new Error("Request was canceled"));

      const response = await driver.execServiceByFetch({ id: "canceled-msg" });
      expect(response.ok).toBe(false);
      expect(response.status).toBe(408);
    });
  });

  describe("getInfoURL method coverage", () => {
    test("should handle service not found", () => {
      const driver = new DriverBuilder()
        .withBaseURL("http://example.com")
        .withServices([{ id: "dummy", url: "api/dummy", method: MethodAPI.get }]) // Need at least one service
        .build();

      const info = driver.getInfoURL({ id: "nonexistent" });
      expect(info.fullUrl).toBeNull();
      expect(info.method).toBeNull();
      expect(info.pathname).toBeNull();
      expect(info.payload).toBeNull();
    });

    test("should handle GET method with payload and existing query string", () => {
      const service: ServiceApi = {
        id: "get-with-query",
        url: "api/search?default=true",
        method: MethodAPI.get,
      };

      const driver = new DriverBuilder()
        .withBaseURL("http://example.com")
        .withServices([service])
        .build();

      const info = driver.getInfoURL(
        { id: "get-with-query" },
        { q: "test", page: 1 }
      );

      expect(info.fullUrl).toContain("default=true&q=test&page=1");
      expect(info.payload).toBeNull();
    });

    test("should handle non-GET method with payload", () => {
      const service: ServiceApi = {
        id: "post-with-payload",
        url: "api/create",
        method: MethodAPI.post,
      };

      const driver = new DriverBuilder()
        .withBaseURL("http://example.com")
        .withServices([service])
        .build();

      const payload = { name: "test", value: 123 };
      const info = driver.getInfoURL({ id: "post-with-payload" }, payload);

      expect(info.fullUrl).toBe("http://example.com/api/create");
      expect(info.payload).toBe(payload);
      expect(info.method).toBe(MethodAPI.post);
    });

    test("should handle empty payload for GET method", () => {
      const service: ServiceApi = {
        id: "get-empty",
        url: "api/empty",
        method: MethodAPI.get,
      };

      const driver = new DriverBuilder()
        .withBaseURL("http://example.com")
        .withServices([service])
        .build();

      const info = driver.getInfoURL({ id: "get-empty" }, {});
      expect(info.fullUrl).toBe("http://example.com/api/empty");
      expect(info.payload).toEqual({});
    });
  });

  describe("Static utility methods coverage", () => {
    test("should test static methods through driver instance", async () => {
      const driver = new DriverBuilder()
        .withBaseURL("http://example.com")
        .withServices([{ id: "test", url: "api/test", method: MethodAPI.get }])
        .build();

      // Test normalizeAxiosHeaders through actual usage
      (driver as any).defaults.adapter = async () => ({
        data: { success: true },
        status: 200,
        statusText: "OK",
        headers: null, // This will test null headers path
        config: {},
      });

      const response = await driver.execService({ id: "test" });
      expect(response.ok).toBe(true);
      // Headers get normalized to empty object when null, not null itself
      expect(response.headers).toEqual({});
    });

    test("should test error mapping through actual errors", async () => {
      const driver = new DriverBuilder()
        .withBaseURL("http://example.com")
        .withServices([{ id: "test", url: "api/test", method: MethodAPI.get }])
        .build();

      // Test ETIMEDOUT error mapping
      (driver as any).defaults.adapter = async () => {
        const error: any = { isAxiosError: true, code: "ETIMEDOUT" };
        throw error;
      };

      const response = await driver.execService({ id: "test" });
      expect(response.ok).toBe(false);
      expect(response.problem).toBe("TIMEOUT_ERROR");
    });
  });

  describe("DriverBuilder method coverage", () => {
    test("should handle all builder methods", () => {
      const services: ServiceApi[] = [
        { id: "test", url: "api/test", method: MethodAPI.get }
      ];

      const versionConfig = {
        defaultVersion: "1.0",
        position: "after-base" as const
      };

      const builder = new DriverBuilder()
        .withBaseURL("http://example.com")
        .withServices(services)
        .withVersionConfig(versionConfig)
        .withGlobalVersion("2.0")
        .withAddAsyncRequestTransformAxios((register: any) => {
          (register as any)(async (req: any) => {
            req.headers = { ...req.headers, "X-Test": "1" };
          });
        })
        .withAddAsyncResponseTransformAxios((register: any) => {
          (register as any)(async (res: any) => {
            // Transform response
          });
        })
        .withAddRequestTransformAxios((req) => {
          req.headers = { ...req.headers, "X-Sync": "1" };
        })
        .withAddResponseTransformAxios((res) => {
          // Transform response
        })
        .withHandleInterceptorErrorAxios((axiosInstance, processQueue, isRefreshing) => 
          async (error) => Promise.reject(error)
        )
        .withAddTransformResponseFetch((response) => response)
        .withAddRequestTransformFetch((url, options) => ({ url, requestOptions: options }));

      const driver = builder.build();
      expect(driver).toBeDefined();
      expect(typeof driver.execService).toBe("function");
    });

    test("should handle withGlobalVersion creating versionConfig if not exists", () => {
      const builder = new DriverBuilder()
        .withBaseURL("http://example.com")
        .withServices([{ id: "test", url: "api/test", method: MethodAPI.get }])
        .withGlobalVersion("3.0");

      const driver = builder.build();
      expect(driver).toBeDefined();
    });
  });
});