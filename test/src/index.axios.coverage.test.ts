import { AxiosHeaders } from "axios";
import { DriverBuilder } from "../../src/index";
import { MethodAPI, ServiceApi } from "../../src/types/driver";

describe("Axios coverage and branches for Driver (src/index.ts)", () => {
  const svcGet: ServiceApi = {
    id: "cov.get",
    url: "api/cov/{id}",
    method: MethodAPI.get,
    options: {},
  };

  const svcPostMultipart: ServiceApi = {
    id: "cov.post.multipart",
    url: "api/cov/post",
    method: MethodAPI.post,
    options: { headers: { "Content-Type": "multipart/form-data" } },
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("covers normalizeAxiosHeaders object-branch (array join, lowercase keys) on success", async () => {
    const driver = new DriverBuilder()
      .withBaseURL("http://example.com")
      .withServices([svcGet])
      .build();

    // Mock axios adapter returning plain object headers without toJSON to hit object branch
    (driver as any).defaults.adapter = async (config: any) => {
      return {
        data: { ok: true },
        status: 200,
        statusText: "OK",
        headers: { "X-Array": ["a", "b"], "X-Key": "V" },
        config,
      };
    };

    const res = await (driver as any).execService(
      { id: "cov.get", params: { id: "1" } },
      {},
      {}
    );

    expect(res.ok).toBe(true);
    expect(res.status).toBe(200);
    // headers normalized to lower-case keys and arrays joined with comma+space
    expect((res.headers as any)["x-array"]).toBe("a, b");
    expect((res.headers as any)["x-key"]).toBe("V");
  });

  test("covers normalizeAxiosHeaders toJSON-branch on success", async () => {
    const driver = new DriverBuilder()
      .withBaseURL("http://example.com")
      .withServices([svcGet])
      .build();

    (driver as any).defaults.adapter = async (config: any) => {
      return {
        data: { flag: true },
        status: 200,
        statusText: "OK",
        headers: new AxiosHeaders({ "X-Test": "A", "y": "z" }),
        config,
      };
    };

    const res = await (driver as any).execService(
      { id: "cov.get", params: { id: "xyz" } },
      {},
      {}
    );
    expect(res.ok).toBe(true);
    // After normalization, keys are lower-cased
    expect((res.headers as any)["x-test"]).toBe("A");
  });

  test("covers multipart branch in execService (headers contain multipart/form-data)", async () => {
    const driver = new DriverBuilder()
      .withBaseURL("http://example.com")
      .withServices([svcPostMultipart])
      .build();

    (driver as any).defaults.adapter = async (config: any) => {
      return {
        data: { created: true },
        status: 201,
        statusText: "Created",
        headers: { "Content-Type": "application/json" },
        config,
      };
    };

    const res = await (driver as any).execService({ id: "cov.post.multipart" }, { a: 1 }, {});
    expect(res.ok).toBe(true);
    expect(res.status).toBe(201);
  });

  test("covers defaultInterceptorError path (no custom handler) -> NETWORK_ERROR mapping with no response", async () => {
    const driver = new DriverBuilder()
      .withBaseURL("http://example.com")
      .withServices([svcGet])
      .build();

    (driver as any).defaults.adapter = async () => {
      const err: any = { isAxiosError: true, code: "ENETDOWN" }; // not timeout, no response
      throw err;
    };

    const res = await (driver as any).execService({ id: "cov.get", params: { id: "1" } });
    expect(res.ok).toBe(false);
    expect(res.problem).toBe("NETWORK_ERROR");
    expect(res.status).toBe(0);
  });

  test("covers UNKNOWN_ERROR mapping when response.status is 0", async () => {
    const driver = new DriverBuilder()
      .withBaseURL("http://example.com")
      .withServices([svcGet])
      .build();

    (driver as any).defaults.adapter = async (config: any) => {
      const err: any = {
        isAxiosError: true,
        response: {
          status: 0,
          statusText: "Zero",
          headers: {},
          data: null,
          config,
        },
      };
      throw err;
    };

    const res = await (driver as any).execService({ id: "cov.get", params: { id: "1" } });
    expect(res.ok).toBe(false);
    expect(res.problem).toBe("UNKNOWN_ERROR");
    expect(res.status).toBe(0);
  });
});
test("maps plain Error('timeout ...') in axios path to TimeoutError normalized response", async () => {
  const driver = new DriverBuilder()
    .withBaseURL("http://example.com")
    .withServices([{ id: "plain.timeout", url: "api/plain", method: MethodAPI.get } as ServiceApi])
    .build();

  (driver as any).defaults.adapter = async () => {
    throw new Error("timeout reached");
  };

  const res = await (driver as any).execService({ id: "plain.timeout", params: {} });
  expect(res.ok).toBe(false);
  expect(res.status).toBe(408);
  expect(String(res.problem).toLowerCase()).toContain("timeout");
});

test("maps plain Error('network ...') in axios path to NetworkError normalized response", async () => {
  const driver = new DriverBuilder()
    .withBaseURL("http://example.com")
    .withServices([{ id: "plain.network", url: "api/plain", method: MethodAPI.get } as ServiceApi])
    .build();

  (driver as any).defaults.adapter = async () => {
    throw new Error("Network unreachable");
  };

  const res = await (driver as any).execService({ id: "plain.network", params: {} });
  expect(res.ok).toBe(false);
  expect(res.status).toBe(503);
  expect(String(res.problem)).toContain("Network");
});