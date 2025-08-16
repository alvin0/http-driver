// Full-featured Builder demo: showcases all builder hooks and both Axios/Fetch paths.

import { DriverBuilder } from "../../../src";
import dummyjsonApiDriver from "../api-clients/dummyjson-driver/driver";
import { DummyjsonPostServiceIds } from "../api-clients/dummyjson-driver/post-services";
import jsonPlaceholderApiDriver from "../api-clients/jsonplaceholder-driver/driver";
import { JsonPlaceholderPostServiceIds } from "../api-clients/jsonplaceholder-driver/post-services";

/**
 * Build a driver using all available builder hooks.
 * - Sync + Async request/response transforms for Axios
 * - Error interceptor wiring (401 retry demo)
 * - Fetch request/response transforms
 */
function buildFullFeaturedDriver() {
  let axiosSyncReqCalled = false;
  let axiosAsyncReqCalled = false;
  let axiosSyncRespCalled = false;
  let axiosAsyncRespCalled = false;

  const driver = new DriverBuilder()
    .withBaseURL(jsonPlaceholderApiDriver.baseURL)
    .withServices(jsonPlaceholderApiDriver.services)

    // Axios: sync request transform
    .withAddRequestTransformAxios((req: any) => {
      axiosSyncReqCalled = true;
      req.headers = { ...(req.headers || {}), "X-Sync-Req": "1" };
    })

    // Axios: async request transform (registrar pattern)
    .withAddAsyncRequestTransformAxios((register: any) => {
      (register as any)(async (req: any) => {
        axiosAsyncReqCalled = true;
        req.headers = { ...(req.headers || {}), "X-Async-Req": "1" };
      });
    })

    // Axios: sync response transform
    .withAddResponseTransformAxios((_resp: any) => {
      axiosSyncRespCalled = true;
    })

    // Axios: async response transform (registrar pattern)
    .withAddAsyncResponseTransformAxios((register: any) => {
      (register as any)(async (_res: any) => {
        axiosAsyncRespCalled = true;
      });
    })

    // Axios: error interceptor (basic 401 retry demo)
    .withHandleInterceptorErrorAxios((axiosInstance: any, _processQueue: any, _isRefreshing: boolean) => {
      return async (error: any) => {
        const status = error?.response?.status ?? 0;

        // Demonstration: if 401 occurs, retry once with a fake token
        if (status === 401 && !error?.config?._retry) {
          (error.config as any)._retry = true;
          // Simulate token refresh delay and attach Authorization header
          await new Promise((r) => setTimeout(r, 50));
          error.config = {
            ...(error.config || {}),
            headers: { ...(error.config?.headers || {}), Authorization: "Bearer FAKE-TOKEN" },
          };
          return axiosInstance.request(error.config);
        }

        // Fallback: propagate error
        return Promise.reject(error);
      };
    })

    // Fetch: request mutator (URL + headers)
    .withAddRequestTransformFetch((url, requestOptions) => {
      // Demonstrate URL mutation + custom header
      const u = new URL(url);
      u.searchParams.set("via", "fetch-transform");
      return {
        url: u.toString(),
        requestOptions: {
          ...requestOptions,
          headers: { ...(requestOptions.headers || {}), "X-Fetch-Tx": "1" },
        },
      };
    })

    // Fetch: response transform (post-process standardized response)
    .withAddTransformResponseFetch((response) => {
      return {
        ...response,
        data: { fullBuilderDemo: true, original: response.data },
      } as any;
    })

    .build();

  return {
    driver,
    getFlags: () => ({
      axiosSyncReqCalled,
      axiosAsyncReqCalled,
      axiosSyncRespCalled,
      axiosAsyncRespCalled,
    }),
  };
}

/**
 * Demonstrates:
 *  - getInfoURL with GET payload -> querystring
 *  - AbortController on execService (Axios)
 *  - Successful execService (Axios)
 *  - execServiceByFetch (Fetch) with fetch transforms
 */
export async function runFullBuilderDemo() {
  console.log("\n[Full-Builder] Building full-featured driver...");
  const { driver, getFlags } = buildFullFeaturedDriver();

  // 1) getInfoURL demonstration (GET payload -> query appended)
  console.log("[Full-Builder] getInfoURL:");
  const info = driver.getInfoURL(
    { id: JsonPlaceholderPostServiceIds.Detail, params: { id: 1 } },
    { q: "search", page: 2 }
  );
  console.log("getInfoURL =>", info);

  // 2) AbortController (Axios path)
  console.log("\n[Full-Builder] AbortController on execService (Axios)");
  const c = new AbortController();
  const abortPromise = driver.execService(
    { id: JsonPlaceholderPostServiceIds.List },
    undefined,
    { signal: c.signal }
  );
  setTimeout(() => c.abort(), 10);
  const abortRes = await abortPromise;
  console.log("Aborted Axios =>", { ok: abortRes.ok, status: abortRes.status, problem: abortRes.problem });

  // 3) Successful execService (Axios)
  console.log("\n[Full-Builder] execService (Axios) success path");
  const listRes = await driver.execService({ id: JsonPlaceholderPostServiceIds.List });
  const flags = getFlags();
  console.log("execService =>", {
    ok: listRes.ok,
    status: listRes.status,
    transforms: flags,
  });

  // 4) execServiceByFetch (Fetch) using DummyJSON baseURL/services for variety
  console.log("\n[Full-Builder] execServiceByFetch (Fetch) with transforms");
  // Create a second driver for fetch demo using the same set of hooks via a quick builder
  const fetchDriver = new DriverBuilder()
    .withBaseURL(dummyjsonApiDriver.baseURL)
    .withServices(dummyjsonApiDriver.services)
    .withAddRequestTransformFetch((url, requestOptions) => {
      const u = new URL(url);
      u.searchParams.set("fb", "1");
      return {
        url: u.toString(),
        requestOptions: {
          ...requestOptions,
          headers: { ...(requestOptions.headers || {}), "X-Fetch-Demo": "1" },
        },
      };
    })
    .withAddTransformResponseFetch((res) => ({ ...res, data: { fetchDemo: true, original: res.data } } as any))
    .build();

  const fetchRes = await (fetchDriver as any).execServiceByFetch({ id: DummyjsonPostServiceIds.List });
  console.log("execServiceByFetch =>", {
    ok: fetchRes.ok,
    status: fetchRes.status,
    dataFlags: {
      fetchDemo: !!(fetchRes.data as any)?.fetchDemo,
      fullBuilderDemo: !!(fetchRes.data as any)?.fullBuilderDemo, // expected false here (different driver)
    },
  });
}