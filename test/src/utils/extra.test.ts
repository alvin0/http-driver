import * as qs from "qs";
import { MethodAPI } from "../../../src/utils/driver-contracts";
import { compileUrlByService } from "../../../src/utils/index";

describe("compileUrlByService", () => {
  const configServices = {
    baseURL: "http://example.com",
    services: [
      { id: "svc1", url: "api/{id}", method: MethodAPI.get, options: {} },
      { id: "svc2", url: "post/{id}", method: MethodAPI.post, options: {} }
    ]
  };

  test("returns compiled URL info for GET service with payload", () => {
    const idService = { id: "svc1", params: { id: "123" } };
    const payload = { a: "b" };
    const options = { header: "ok" };
    const result = compileUrlByService(configServices, idService, payload, options);
    expect(result).not.toBeNull();
    if (result) {
      // For GET, payload is appended as query string and then cleared
      const expectedQuery = qs.stringify(payload);
      expect(result.url).toBe(`http://example.com/api/123?${expectedQuery}`);
      expect(result.method).toBe("get");
      expect(result.payload).toEqual({});
      expect(result.options).toEqual(options);
    }
  });

  test("returns compiled URL info for POST service without payload modification", () => {
    const idService = { id: "svc2", params: { id: "456" } };
    const payload = { a: "b" };
    const result = compileUrlByService(configServices, idService, payload);
    expect(result).not.toBeNull();
    if (result) {
      expect(result.url).toBe("http://example.com/post/456");
      expect(result.method).toBe("post");
      expect(result.payload).toEqual(payload);
    }
  });

  test("returns null and logs error when service not found", () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    const idService = { id: "unknown" };
    const result = compileUrlByService(configServices, idService);
    expect(result).toBeNull();
    expect(spy).toHaveBeenCalledWith("Service unknown in driver not found");
    spy.mockRestore();
  });
});
