import { DriverBuilder } from "../../src/index";
import { MethodAPI, ServiceApi } from "../../src/types/driver";

describe("Driver Axios transforms and interceptors", () => {
  const svcGet: ServiceApi = {
    id: "transform.get",
    url: "api/tx/{id}",
    method: MethodAPI.get,
    options: {},
  };

  const svcPost: ServiceApi = {
    id: "transform.post",
    url: "api/tx",
    method: MethodAPI.post,
    options: { headers: { "Content-Type": "application/json" } },
  };

  test("invokes sync + async request/response transforms and normalizes success response", async () => {
    const syncReq = jest.fn((req) => {
      req.headers = { ...(req.headers || {}), "X-Sync": "1" };
    });
    const syncResp = jest.fn();

    let asyncRespCalled = false;
    let capturedAdapterHeaders: any = null;

    const driver = new DriverBuilder()
      .withBaseURL("http://example.com")
      .withServices([svcGet, svcPost])
      .withAddRequestTransformAxios(syncReq)
      .withAddAsyncRequestTransformAxios((register: any) => {
        (register as any)(async (req: any) => {
          req.headers = { ...(req.headers || {}), "X-Async-Req": "1" };
        });
      })
      .withAddResponseTransformAxios((resp) => {
        // ApiResponseLike
        syncResp(resp);
      })
      .withAddAsyncResponseTransformAxios((register: any) => {
        (register as any)(async (_res: any) => {
          asyncRespCalled = true;
        });
      })
      .build();

    // Mock axios adapter to avoid real HTTP and surface config after request transforms
    (driver as any).defaults.adapter = async (config: any) => {
      capturedAdapterHeaders = config.headers;
      return {
        data: { echo: true },
        status: 200,
        statusText: "OK",
        headers: { "content-type": "application/json" },
        config,
      };
    };

    const res = await (driver as any).execService(
      { id: "transform.get", params: { id: "123" } },
      {},
      {}
    );

    expect(res.ok).toBe(true);
    expect(res.status).toBe(200);
    expect(syncReq).toHaveBeenCalled();
    expect(syncResp).toHaveBeenCalled();
    expect(asyncRespCalled).toBe(true);
    expect(capturedAdapterHeaders["X-Sync"]).toBe("1");
    expect(capturedAdapterHeaders["X-Async-Req"]).toBe("1");
  });

  test("normalizes AxiosError with TIMEOUT_ERROR when code is ECONNABORTED", async () => {
    const driver = new DriverBuilder()
      .withBaseURL("http://example.com")
      .withServices([svcGet])
      .build();

    (driver as any).defaults.adapter = async () => {
      // Simulate AxiosError-like object
      const err: any = { isAxiosError: true, code: "ECONNABORTED" };
      throw err;
    };

    const res = await (driver as any).execService({ id: "transform.get", params: { id: "1" } });
    expect(res.ok).toBe(false);
    expect(res.problem).toBe("TIMEOUT_ERROR");
    expect(res.status).toBe(0);
  });

  test("normalizes AxiosError with SERVER_ERROR when response status >= 500", async () => {
    const driver = new DriverBuilder()
      .withBaseURL("http://example.com")
      .withServices([svcGet])
      .build();

    (driver as any).defaults.adapter = async (config: any) => {
      const err: any = {
        isAxiosError: true,
        response: {
          status: 500,
          statusText: "Internal Server Error",
          headers: { "X-Test": "A" },
          data: { error: "server" },
          config,
        },
      };
      throw err;
    };

    const res = await (driver as any).execService({ id: "transform.get", params: { id: "1" } });
    expect(res.ok).toBe(false);
    expect(res.problem).toBe("SERVER_ERROR");
    expect(res.status).toBe(500);
    // headers normalized to plain object
    expect(typeof res.headers).toBe("object");
    expect((res.headers as any)["x-test"]).toBe("A");
    expect(res.data).toEqual({ error: "server" });
  });
});