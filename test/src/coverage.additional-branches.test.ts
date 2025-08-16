import { DriverBuilder } from "../../src/index";
import { HTTPError } from "../../src/types/errors";
import { MethodAPI, type ServiceApi } from "../../src/utils/driver-contracts";
import { normalizeError } from "../../src/utils/error-handler";

describe("Additional coverage - non-Error thrown and HTTPError fallback", () => {
  const svcGet: ServiceApi = {
    id: "cov.primitive.get",
    url: "api/cov/{id}",
    method: MethodAPI.get,
    options: {},
  };

  const svcFetchGet: ServiceApi = {
    id: "fetch.primitive.get",
    url: "api/fetch/{id}",
    method: MethodAPI.get,
    options: {},
  };

  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
    jest.clearAllMocks();
  });

  test("axios path: non-Error primitive thrown &#45;> falls back to unknown error normalization", async () => {
    const driver = new DriverBuilder()
      .withBaseURL("http://example.com")
      .withServices([svcGet])
      .build();

    // Force axios adapter to throw a string primitive
    (driver as any).defaults.adapter = async () => {
      throw "boom";
    };

    const res = await (driver as any).execService(
      { id: "cov.primitive.get", params: { id: "1" } },
      {},
      {}
    );

    expect(res.ok).toBe(false);
    expect(res.status).toBe(500);
    expect(res.problem).toBe("An unknown error occurred");
  });

  test("fetch path: non-Error primitive rejection &#45;> falls back to unknown error normalization", async () => {
    const driver = new DriverBuilder()
      .withBaseURL("http://example.com")
      .withServices([svcFetchGet])
      .build();

    globalThis.fetch = jest.fn().mockRejectedValue("boom");

    const res = await (driver as any).execServiceByFetch(
      { id: "fetch.primitive.get", params: { id: "x" } },
      {},
      {}
    );

    expect(res.ok).toBe(false);
    expect(res.status).toBe(500);
    expect(res.problem).toBe("An unknown error occurred");
  });

  test("normalizeError: HTTPError without status uses 500 fallback", () => {
    const err = new HTTPError("custom without status");
    const normalized = normalizeError(err);
    expect(normalized.ok).toBe(false);
    expect(normalized.status).toBe(500);
    expect(normalized.problem).toBe("custom without status");
    expect(normalized.originalError).toBe("custom without status");
  });
});