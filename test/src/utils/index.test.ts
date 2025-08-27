import * as qs from "qs";
import { MethodAPI, ServiceApi } from "../../../src/types/driver";
import {
    compileBodyFetchWithContextType,
    compileService,
    compileUrl,
    findServiceApi,
    httpClientFetch,
    removeNullValues,
    replaceParamsInUrl,
    responseFormat
} from "../../../src/utils/index";

/* Dummy service for testing compileService and findServiceApi */
const dummyService: ServiceApi = { 
    id: "dummy", 
    url: "/dummy/{param}", 
    method: MethodAPI.get, 
    options: { headers: { "Content-Type": "application/json" } } 
};

describe("replaceParamsInUrl", () => {
    test("replaces placeholders with values", () => {
        const url = "/users/{userId}/posts/{postId}";
        const params = { userId: "123", postId: "456" };
        const result = replaceParamsInUrl(url, params);
        expect(result).toBe("/users/123/posts/456");
    });

    test("returns original url when no matching placeholders", () => {
        const url = "/about";
        const params = { id: "123" };
        expect(replaceParamsInUrl(url, params)).toBe("/about");
    });
});

describe("findServiceApi", () => {
    const services: ServiceApi[] = [
        { id: "1", url: "/one", method: MethodAPI.get },
        dummyService
    ];

    test("finds a service by id", () => {
        const service = findServiceApi(services, "dummy");
        expect(service).toEqual(dummyService);
    });

    test("returns null if service is not found", () => {
        const service = findServiceApi(services, "missing");
        expect(service).toBeNull();
    });
});

describe("compileService", () => {
    const services: ServiceApi[] = [
        dummyService,
        { id: "2", url: "/two", method: MethodAPI.post }
    ];

    test("compiles service info if found", () => {
        const idService = { id: "dummy", params: { param: "test" } };
        const result = compileService(idService, services);
        expect(result).not.toBeNull();
        expect(result?.url).toBe("/dummy/test");
        expect(result?.methods).toBe(dummyService.method);
        expect(result?.options).toEqual(dummyService.options || {});
    });

    test("returns null if service is not found", () => {
        const idService = { id: "missing" };
        const result = compileService(idService, services);
        expect(result).toBeNull();
    });
});

describe("responseFormat", () => {
    test("sets ok true for 2xx status", () => {
        const input = {
            ok: false,
            status: 200,
            data: { result: "success" },
            headers: new Headers({ "content-type": "application/json" }),
            originalError: null,
            duration: 50,
            problem: null
        };
        const formatted = responseFormat(input);
        expect(formatted.ok).toBe(true);
    });

    test("sets ok false for non-2xx status", () => {
        const input = {
            ok: false,
            status: 404,
            data: null,
            headers: new Headers({ "content-type": "application/json" }),
            originalError: "Not Found",
            duration: 30,
            problem: "Not Found"
        };
        const formatted = responseFormat(input);
        expect(formatted.ok).toBe(false);
    });
});

describe("compileUrl", () => {
    test("appends query string for GET method with payload", () => {
        const baseUrl = "http://example.com/api/resource";
        const payload = { foo: "bar", num: "10" };
        const result = compileUrl(baseUrl, MethodAPI.get, payload, { custom: "header" });
        // Should append query string to the URL and clear payload
        const expectedQuery = qs.stringify(payload);
        expect(result.url).toBe(`${baseUrl}?${expectedQuery}`);
        expect(result.payload).toEqual({});
        expect(result.options).toEqual({ custom: "header" });
        expect(result.method).toBe("get");
    });

    test("keeps payload for non-GET method", () => {
        const baseUrl = "http://example.com/api/resource";
        const payload = { foo: "bar" };
        const result = compileUrl(baseUrl, MethodAPI.post, payload, {});
        expect(result.url).toBe(baseUrl);
        expect(result.payload).toEqual(payload);
        expect(result.method).toBe("post");
    });
});

describe("compileBodyFetchWithContextType", () => {
    test("returns JSON string for application/json", () => {
        const payload = { key: "value" };
        const result = compileBodyFetchWithContextType("application/json", payload);
        expect(result).toBe(JSON.stringify(payload));
    });

    test("returns FormData for multipart/form-data", () => {
        const payload = { key: "value" };
        const result = compileBodyFetchWithContextType("multipart/form-data", payload);
        // Check if result has append method (indicative of FormData)
        expect(typeof (result as FormData).append).toBe("function");
    });
});

describe("removeNullValues", () => {
    test("removes null and undefined values from object", () => {
        const obj = { a: null, b: 2, c: undefined, d: { e: null, f: "keep" } };
        const cleaned = removeNullValues(obj);
        expect(cleaned).toEqual({ b: 2, d: { f: "keep" } });
    });

    test("handles empty object", () => {
        const obj = {};
        const cleaned = removeNullValues(obj);
        expect(cleaned).toEqual({});
    });
});

describe("httpClientFetch", () => {
    const originalFetch = (globalThis as any).fetch;
    
    afterEach(() => {
        (globalThis as any).fetch = originalFetch;
    });
    
    test("returns formatted response on successful fetch", async () => {
        // Simulate a successful fetch
        const fakeResponse = {
            ok: true,
            status: 200,
            headers: new Headers({ "Content-Type": "application/json" }),
            text: async () => JSON.stringify({ message: "success" })
        };
        (globalThis as any).fetch = jest.fn().mockResolvedValue(fakeResponse as any);
        const urlBuilder = { url: "http://example.com/api", method: MethodAPI.get, param: {} };
        const response = await httpClientFetch(urlBuilder, { foo: "bar" }, { headers: { "Content-Type": "application/json" } });
        expect(response.ok).toBe(true);
        expect(response.data).toEqual({ message: "success" });
    });
    
    test("handles fetch failure and returns error response", async () => {
        // Simulate a fetch that throws an error
        (globalThis as any).fetch = jest.fn().mockRejectedValue(new Error("Network error"));
        const urlBuilder = { url: "http://example.com/api", method: MethodAPI.get, param: {} };
        const response = await httpClientFetch(urlBuilder, {}, { headers: { "Content-Type": "application/json" } });
        expect(response.ok).toBe(false);
        expect(response.problem).toContain("Error fetching data");
        expect(response.status).toBe(500);
    });

    test("handles non-OK fetch response", async () => {
        const fakeResponse = {
            ok: false,
            status: 404,
            statusText: "Not Found",
            headers: new Headers({ "Content-Type": "application/json" }),
            text: async () => "Not Found"
        };
        (global as any).fetch = jest.fn().mockResolvedValue(fakeResponse as any);
        const urlBuilder = { url: "http://example.com/api", method: MethodAPI.get, param: {} };
        const response = await httpClientFetch(urlBuilder, {}, { headers: { "Content-Type": "application/json" } });
        expect(response.ok).toBe(false);
        expect(response.problem).toBe("Not Found");
        expect(response.status).toBe(404);
    });
});
