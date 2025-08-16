// Advanced samples to showcase package capabilities: AbortController, transforms, getInfoURL, and httpClientFetch.

import { DriverBuilder } from "../../../src";
import { MethodAPI, type UrlBuilder } from "../../../src/utils/driver-contracts";
import { httpClientFetch } from "../../../src/utils/index";
import { httpDummyjsonApiDriver, httpJsonPlaceholderDriver } from "../api-clients";
import dummyjsonApiDriver from "../api-clients/dummyjson-driver/driver";
import { DummyjsonPostServiceIds } from "../api-clients/dummyjson-driver/post-services";
import jsonPlaceholderApiDriver from "../api-clients/jsonplaceholder-driver/driver";
import { JsonPlaceholderPostServiceIds } from "../api-clients/jsonplaceholder-driver/post-services";

/**
 * AbortController demo for Axios path (execService)
 * - Aborts an in-flight GET request and prints normalized response (TimeoutError).
 */
async function abortAxiosSample() {
  console.log("\n[Advanced] AbortController — Axios path (execService)");
  const c = new AbortController();
  const p = httpJsonPlaceholderDriver.execService(
    { id: JsonPlaceholderPostServiceIds.List },
    undefined,
    { signal: c.signal }
  );
  // Abort shortly after starting the request
  setTimeout(() => c.abort(), 10);
  const res = await p;
  console.log("Aborted Axios =>", { ok: res.ok, status: res.status, problem: res.problem });
}

/**
 * AbortController demo for Fetch path (execServiceByFetch)
 * - Aborts an in-flight GET request and prints normalized response (TimeoutError).
 */
async function abortFetchSample() {
  console.log("\n[Advanced] AbortController — Fetch path (execServiceByFetch)");
  const c = new AbortController();
  const p = httpDummyjsonApiDriver.execServiceByFetch(
    { id: DummyjsonPostServiceIds.List },
    undefined,
    { signal: c.signal }
  );
  setTimeout(() => c.abort(), 10);
  const res = await p;
  console.log("Aborted Fetch =>", { ok: res.ok, status: res.status, problem: res.problem });
}

/**
 * getInfoURL demo (useful for SWR keys, prefetch, debugging)
 * - Shows how GET payload becomes query string.
 */
async function getInfoURLSample() {
  console.log("\n[Advanced] getInfoURL — compile URL and query");
  const info = httpJsonPlaceholderDriver.getInfoURL(
    { id: JsonPlaceholderPostServiceIds.Detail, params: { id: 1 } },
    { search: "title", page: 2 }
  );
  console.log("getInfoURL =>", info);
}

/**
 * httpClientFetch demo — standalone helper without driver
 * - Builds URL with templating and performs a fetch with standardized response.
 */
async function httpClientFetchSample() {
  console.log("\n[Advanced] httpClientFetch — standalone helper");
  const builder: UrlBuilder = {
    url: "https://jsonplaceholder.typicode.com/posts/{id}",
    method: MethodAPI.get,
    param: { id: "1" },
  };
  const res = await httpClientFetch(builder);
  console.log("httpClientFetch =>", { ok: res.ok, status: res.status, data: res.data });
}

/**
 * Axios transforms demo (sync + async) — request and response transforms
 * - Illustrates how to inject headers and run response hooks.
 */
async function axiosTransformsSample() {
  console.log("\n[Advanced] Axios transforms — sync + async");
  const syncReq = (req: any) => {
    req.headers = { ...(req.headers || {}), "X-Sync": "1" };
  };

  let asyncReqApplied = false;
  let syncRespCalled = false;
  let asyncRespCalled = false;

  const driver = new DriverBuilder()
    .withBaseURL(jsonPlaceholderApiDriver.baseURL)
    .withServices(jsonPlaceholderApiDriver.services)
    .withAddRequestTransformAxios(syncReq)
    .withAddAsyncRequestTransformAxios((register: any) => {
      (register as any)(async (req: any) => {
        asyncReqApplied = true;
        req.headers = { ...(req.headers || {}), "X-Async-Req": "1" };
      });
    })
    .withAddResponseTransformAxios((_resp: any) => {
      syncRespCalled = true;
    })
    .withAddAsyncResponseTransformAxios((register: any) => {
      (register as any)(async (_res: any) => {
        asyncRespCalled = true;
      });
    })
    .build();

  const res = await (driver as any).execService({ id: JsonPlaceholderPostServiceIds.List });
  console.log("Axios transforms =>", {
    ok: res.ok,
    status: res.status,
    syncRespCalled,
    asyncRespCalled,
    asyncReqApplied,
  });
}

/**
 * Fetch transforms demo — request mutator + response finalizer
 * - Mutates request URL/headers and post-processes standardized response.
 */
async function fetchTransformsSample() {
  console.log("\n[Advanced] Fetch transforms — request + response");
  const driver = new DriverBuilder()
    .withBaseURL(dummyjsonApiDriver.baseURL)
    .withServices(dummyjsonApiDriver.services)
    .withAddRequestTransformFetch((url, requestOptions) => {
      // Add a diagnostic header and an extra query param
      const u = new URL(url);
      u.searchParams.set("debug", "1");
      return {
        url: u.toString(),
        requestOptions: {
          ...requestOptions,
          headers: { ...(requestOptions.headers || {}), "X-Fetch-Req": "1" },
        },
      };
    })
    .withAddTransformResponseFetch((response) => {
      // Annotate response
      return {
        ...response,
        data: { transformedByFetch: true, original: response.data },
      } as any;
    })
    .build();

    const res = await (driver as any).execServiceByFetch({ id: DummyjsonPostServiceIds.List });
    console.log("Fetch transforms =>", {
      ok: res.ok,
      status: res.status,
      hasTransformedFlag: !!(res.data as any)?.transformedByFetch,
    });
}

/**
 * Run all advanced samples sequentially.
 */
export async function runAdvancedSamples() {
  try {
    await abortAxiosSample();
  } catch (e) {
    console.error("abortAxiosSample error:", e);
  }

  try {
    await abortFetchSample();
  } catch (e) {
    console.error("abortFetchSample error:", e);
  }

  try {
    await getInfoURLSample();
  } catch (e) {
    console.error("getInfoURLSample error:", e);
  }

  try {
    await httpClientFetchSample();
  } catch (e) {
    console.error("httpClientFetchSample error:", e);
  }

  try {
    await axiosTransformsSample();
  } catch (e) {
    console.error("axiosTransformsSample error:", e);
  }

  try {
    await fetchTransformsSample();
  } catch (e) {
    console.error("fetchTransformsSample error:", e);
  }
}