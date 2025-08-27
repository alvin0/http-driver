import { DriverBuilder } from "../../src/index";
import { MethodAPI, ServiceApi } from "../../src/types/driver";

describe("Driver Fetch transforms and error mapping", () => {
  const svcGet: ServiceApi = {
    id: "fetch.get",
    url: "api/fetch/{id}",
    method: MethodAPI.get,
    options: {},
  };

  const svcPost: ServiceApi = {
    id: "fetch.post",
    url: "api/fetch",
    method: MethodAPI.post,
    options: { headers: { "Content-Type": "application/json" } },
  };

  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
    jest.clearAllMocks();
  });

  test("invokes addRequestTransformFetch to mutate URL and options, and addTransformResponseFetch to tweak response", async () => {
    const driver = new DriverBuilder()
      .withBaseURL("http://example.com")
      .withServices([svcGet])
      .withAddRequestTransformFetch((url, requestOptions) => {
        // mutate URL & add header
        const mutated = `${url}&trace=1`;
        return {
          url: mutated,
          requestOptions: {
            ...requestOptions,
            headers: { ...(requestOptions.headers || {}), "X-Trace": "1" },
          },
        };
      })
      .withAddTransformResponseFetch((response) => {
        // mutate data to assert hook executed
        return { ...response, data: { ...(response.data as any), hook: true } };
      })
      .build();

    const fake = {
      ok: true,
      status: 200,
      headers: new Headers({ "Content-Type": "application/json" }),
      text: async () => JSON.stringify({ ok: true }),
      statusText: "OK",
    };
    globalThis.fetch = jest.fn().mockResolvedValue(fake as any);

    const res = await (driver as any).execServiceByFetch(
      { id: "fetch.get", params: { id: "1" } },
      {},
      {}
    );

    expect(res.ok).toBe(true);
    expect((res.data as any).ok).toBe(true);
    expect((res.data as any).hook).toBe(true);

    // Verify URL mutation happened
    const callUrl = (globalThis.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(callUrl).toContain("trace=1");

    // Verify header mutation happened
    const callOpts = (globalThis.fetch as jest.Mock).mock.calls[0][1] as any;
    expect(callOpts.headers["X-Trace"]).toBe("1");
  });

  test("maps fetch thrown error containing 'timeout' to TimeoutError normalized response", async () => {
    const driver = new DriverBuilder()
      .withBaseURL("http://example.com")
      .withServices([svcGet])
      .build();

    globalThis.fetch = jest.fn().mockRejectedValue(new Error("Timeout exceeded"));
    const res = await (driver as any).execServiceByFetch(
      { id: "fetch.get", params: { id: "1" } },
      {},
      {}
    );

    expect(res.ok).toBe(false);
    expect(res.status).toBe(408);
    expect(String(res.problem).toLowerCase()).toContain("timeout");
  });

  test("maps fetch thrown error containing 'network' to NetworkError normalized response", async () => {
    const driver = new DriverBuilder()
      .withBaseURL("http://example.com")
      .withServices([svcGet])
      .build();

    globalThis.fetch = jest.fn().mockRejectedValue(new Error("Network down"));
    const res = await (driver as any).execServiceByFetch(
      { id: "fetch.get", params: { id: "1" } },
      {},
      {}
    );

    expect(res.ok).toBe(false);
    expect(res.status).toBe(503);
    expect(String(res.problem)).toContain("Network");
  });

  test("multipart/form-data on fetch removes headers to let platform set boundary", async () => {
    const driver = new DriverBuilder()
      .withBaseURL("http://example.com")
      .withServices([svcPost])
      .build();

    const fake = {
      ok: true,
      status: 201,
      headers: new Headers({ "Content-Type": "application/json" }),
      text: async () => JSON.stringify({ ok: true }),
      statusText: "Created",
    };
    globalThis.fetch = jest.fn().mockResolvedValue(fake as any);

    const res = await (driver as any).execServiceByFetch(
      { id: "fetch.post" },
      { a: 1 },
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    expect(res.ok).toBe(true);
    // Verify headers removed when multipart/form-data so browser sets boundary
    const callOpts = (globalThis.fetch as jest.Mock).mock.calls[0][1] as any;
    expect(callOpts.headers).toBeUndefined();
    expect(callOpts.method).toBe("POST");
  });
});