import { MethodAPI } from "../../../src/utils/driver-contracts";
import { httpClientFetch } from "../../../src/utils/index";

describe("httpClientFetch", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  test("handles non-JSON response text gracefully", async () => {
    // Simulate a response with OK status and non-JSON text.
    const fakeResponse = {
      ok: true,
      status: 200,
      headers: new Headers({ "Content-Type": "text/plain" }),
      text: async () => "This is not JSON"
    };
    globalThis.fetch = jest.fn().mockResolvedValue(fakeResponse as any);

    // Create a dummy UrlBuilder object.
    const urlBuilder = { url: "http://example.com/test", method: MethodAPI.get, param: {} };

    const response = await httpClientFetch(urlBuilder);
    // Since response text is "This is not JSON", data should equal that.
    expect(response.ok).toBe(true);
    expect(response.status).toBe(200);
    expect(response.data).toBe("This is not JSON");
  });

  test("handles fetch errors by returning proper error response", async () => {
    globalThis.fetch = jest.fn().mockRejectedValue(new Error("Fetch failed"));
    const urlBuilder = { url: "http://example.com/test", method: MethodAPI.get, param: {} };
    const response = await httpClientFetch(urlBuilder);
    expect(response.ok).toBe(false);
    expect(response.status).toBe(500);
    expect(response.problem).toContain("Error fetching data");
  });

  test("handles POST method by setting request body", async () => {
    const testPayload = { name: "John", age: "30" };
    const fakeResponse = {
      ok: true,
      status: 201,
      headers: new Headers({ "Content-Type": "application/json" }),
      text: async () => JSON.stringify({ id: "123" })
    };
    globalThis.fetch = jest.fn().mockResolvedValue(fakeResponse as any);
    const urlBuilder = {
      url: "http://example.com/api/resource",
      method: MethodAPI.post,
      param: {}
    };
    const response = await httpClientFetch(urlBuilder, testPayload, {});
    expect(globalThis.fetch).toHaveBeenCalled();
    const callArgs = (globalThis.fetch as jest.Mock).mock.calls[0];
    expect(callArgs[1].method).toBe("POST");
    expect(callArgs[1].body).toBe(JSON.stringify(testPayload));
    expect(response.ok).toBe(true);
    expect(response.data).toEqual({ id: "123" });
  });
});
