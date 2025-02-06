import * as qs from "qs";
import { MethodAPI } from "../../../src/utils/driver-contracts";
import {
  compileBodyFetchWithContextType,
  compileUrl,
  removeNullValues
} from "../../../src/utils/index";

describe("compileBodyFetchWithContextType", () => {
  test("returns JSON string for application/json", () => {
    const payload = { a: 1, flag: true };
    const result = compileBodyFetchWithContextType("application/json", payload);
    expect(result).toBe(JSON.stringify(payload));
  });

  test("returns FormData for multipart/form-data", () => {
    const payload = { a: "value", b: 2 };
    const result = compileBodyFetchWithContextType("multipart/form-data", payload);
    expect(result).toBeInstanceOf(FormData);
    // Check that append exists
    expect(typeof (result as FormData).append).toBe("function");
  });

  test("returns default JSON string for unknown content type", () => {
    const payload = { b: "test" };
    const result = compileBodyFetchWithContextType("text/plain", payload);
    expect(result).toBe(JSON.stringify(payload));
  });
});

describe("removeNullValues", () => {
  test("removes null and undefined from a flat object", () => {
    const obj = { a: null, b: 2, c: undefined, d: "ok" };
    const cleaned = removeNullValues(obj);
    expect(cleaned).toEqual({ b: 2, d: "ok" });
  });

  test("recursively processes nested objects and preserves arrays", () => {
    const obj = { a: { b: null, c: 3, d: { e: undefined, f: 4 }}, g: [null, 5, 6] };
    const cleaned = removeNullValues(obj);
    expect(cleaned).toEqual({ a: { c: 3, d: { f: 4 } }, g: [null, 5, 6] });
  });
});

describe("compileUrl", () => {
  test("returns url unchanged if no payload is provided", () => {
    const baseUrl = "http://example.com";
    const result = compileUrl(baseUrl, MethodAPI.get);
    expect(result.url).toBe(baseUrl);
    expect(result.payload).toEqual({});
  });

  test("compiles query string for GET method with payload and handles various types", () => {
    const baseUrl = "http://example.com/api";
    const payload = { a: "b", c: "3", flag: "true" };
    const result = compileUrl(baseUrl, MethodAPI.get, payload, { header: "ok" });
    const expectedQuery = qs.stringify(payload);
    expect(result.url).toBe(`${baseUrl}?${expectedQuery}`);
    expect(result.payload).toEqual({});
    expect(result.options).toEqual({ header: "ok" });
    expect(result.method).toBe("get");
  });

  test("keeps payload for non-GET method", () => {
    const baseUrl = "http://example.com/api";
    const payload = { a: "b" };
    const result = compileUrl(baseUrl, MethodAPI.post, payload, {});
    expect(result.url).toBe(baseUrl);
    expect(result.payload).toEqual(payload);
    expect(result.method).toBe("post");
  });
});
