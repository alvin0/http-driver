# System Patterns — HttpDriver

This document captures the architectural patterns, key technical decisions, and critical flows that shape HttpDriver’s implementation.

## Architectural Overview

- Entry and Builder
  - Driver runtime: [`src/index.ts`](../src/index.ts)
  - Builder pattern: [`class DriverBuilder`](../src/index.ts:305)
- Contracts and Types
  - Services and config: [`src/utils/driver-contracts.ts`](../src/utils/driver-contracts.ts)
- Utilities
  - URL compilation, payload shaping, fetch helper: [`src/utils/index.ts`](../src/utils/index.ts)
- Errors and normalization
  - Error normalization helpers: [`src/utils/error-handler.ts`](../src/utils/error-handler.ts)
  - Custom errors: [`src/utils/custom-errors.ts`](../src/utils/custom-errors.ts)

Mermaid View (high level):
```mermaid
graph TD;
  A[ServiceApi[]] --> B[compileService / compileUrlByService];
  B --> C[Driver.execService()];
  B --> D[Driver.execServiceByFetch()];
  C --> E[apisauce (axios) + interceptors/transforms];
  D --> F[fetch + payload shaping];
  E --> G[responseFormat()];
  F --> G[responseFormat()];
```

## Core Patterns

### 1) Declarative services
- Contract types:
  - HTTP verb enum: [`enum MethodAPI`](../src/utils/driver-contracts.ts:3)
  - Service definition: [`interface ServiceApi`](../src/utils/driver-contracts.ts:14)
  - Call-time selector: [`interface ServiceUrlCompile`](../src/utils/driver-contracts.ts:23)
- Service compilation:
  - Replace path params: [`replaceParamsInUrl()`](../src/utils/index.ts:21)
  - Compile final endpoint: [`compileService()`](../src/utils/index.ts:57)
  - Assemble absolute URL and request data: [`compileUrlByService()`](../src/utils/index.ts:84), [`compileUrl()`](../src/utils/index.ts:146)

Pattern: All endpoint resolution flows through compileUrlByService() to guarantee consistent path parametering and query assembly.

### 2) Builder pattern for driver construction
- Builder: [`class DriverBuilder`](../src/index.ts:305)
- Required fields:
  - Base URL via `.withBaseURL(...)`
  - Service list via `.withServices(...)`
- Extensibility hooks (intended design):
  - Axios transforms (sync/async)
  - Axios interceptors (error handling)
  - Fetch request/response transforms

The `.build()` method materializes a `Driver` and returns the apisauce instance extended with convenience methods:
- Axios path: [`execService()`](../src/index.ts:109)
- Fetch path: [`execServiceByFetch()`](../src/index.ts:164)
- URL inspection: [`getInfoURL()`](../src/index.ts:274)

Pattern: Monkey-patching an `ApisauceInstance` with additional methods via `Object.assign` to keep a unified client surface.

### 3) Consistent response shape
- Canonical type: [`interface ResponseFormat`](../src/utils/driver-contracts.ts:95)
- Formatter: [`responseFormat()`](../src/utils/index.ts:112)
- Success is purely status-based (200–299 => `ok=true`), both Axios and Fetch normalize to the same shape.

Pattern: All call sites can branch on `res.ok` and inspect `status`, `data`, `headers`, `duration`, `problem`, `originalError` uniformly.

### 4) Axios vs Fetch parity
- Axios path
  - Resolution: [`compileUrlByService()`](../src/utils/index.ts:84)
  - Execution via apisauce/axios inside [`execService()`](../src/index.ts:109)
  - Transforms/interceptors (see Extensibility Points)
- Fetch path
  - Resolution: [`compileUrlByService()`](../src/utils/index.ts:84)
  - Payload shaping for body: [`compileBodyFetchWithContextType()`](../src/utils/index.ts:182)
  - Execution and timing: [`execServiceByFetch()`](../src/index.ts:164)
  - Multipart behavior: drops explicit `Content-Type` so browser sets boundary

Pattern: The fetch flow mirrors axios semantics, adds explicit `performance.now()` duration measurement and response text parsing with malformed detection.

### 5) URL and payload shaping
- GET payloads become query strings: [`compileUrl()`](../src/utils/index.ts:146)
- Body shaping:
  - JSON: `application/json` -> `JSON.stringify`
  - Multipart: `multipart/form-data` -> `FormData` via [`compileBodyFetchWithContextType()`](../src/utils/index.ts:182)
  - Null-stripping for nested structures: [`removeNullValues()`](../src/utils/index.ts:298)

Pattern: Query vs body composition is derived from HTTP method; content-type drives body compilation.

### 6) Error handling and normalization
- Axios path:
  - Delegates to apisauce; interceptors can be injected; any thrown error is normalized
- Fetch path:
  - Malformed JSON detected and mapped to custom errors
- Normalization points:
  - Timeout, Network, Malformed responses map through error handler into standard shape
  - See: [`src/utils/error-handler.ts`](../src/utils/error-handler.ts), [`src/utils/custom-errors.ts`](../src/utils/custom-errors.ts)

Pattern: Convert transport/library-specific failures into first-class error objects, then format via `responseFormat()` to keep callsites simple.

### 7) Interceptor and queue pattern (Axios)
- Interceptor injection with refresh queue priming in `Driver` constructor
  - `isRefreshing` flag and `failedQueue` are present to support token refresh flows
  - `processQueue` shared into custom interceptor via `handleInterceptorErrorAxios(...)`
- Hook wiring in constructor: see [`src/index.ts`](../src/index.ts)

Pattern: Consumers can implement token refresh strategies that buffer failed requests and replay them once a new token is issued.

## Extensibility Points

Driver configuration shape: [`interface DriverConfig`](../src/utils/driver-contracts.ts:34)

- Axios (sync)
  - Request: `addRequestTransformAxios(request)`
  - Response: `addTransformResponseAxios(response)`
- Axios (async)
  - Intended: async request/response transforms
- Axios (error interception)
  - `handleInterceptorErrorAxios(axiosInstance, processQueue, isRefreshing)`
- Fetch
  - Request mutator: `addRequestTransformFetch(url, requestOptions)`
  - Response finalizer: `addTransformResponseFetch(response)`

Known mismatch (to be addressed):
- In [`src/index.ts`](../src/index.ts), the constructor checks `config.addAsyncRequestTransformAxios` and `config.addAsyncTransformResponseAxios`, but the contract defines `addAsyncRequestTransform` and `addAsyncResponseTransform`, and [`DriverBuilder`](../src/index.ts:305) setters assign to the non-axios-suffixed names.
- Impact: Async transforms may not be invoked due to naming drift.
- Resolution options:
  1) Align `DriverConfig` to `addAsyncRequestTransformAxios` / `addAsyncTransformResponseAxios`, update builder setters accordingly.
  2) Or update `Driver` to read the contract’s `addAsyncRequestTransform` / `addAsyncResponseTransform`.
  3) Add unit tests to enforce hook invocation paths.

Decision: Track in activeContext and plan a small refactor to unify names and add tests.

## Execution Flows

Sequence — Axios path:
1) Caller invokes [`execService()`](../src/index.ts:109) with `{ id, params }` and `payload`
2) Resolve endpoint: [`compileUrlByService()`](../src/utils/index.ts:84) -> [`compileUrl()`](../src/utils/index.ts:146)
3) apisauce executes `axiosInstance[method](pathname, payload, options)`
4) Interceptors/transforms run
5) Response normalized to [`ResponseFormat`](../src/utils/driver-contracts.ts:95) (by apisauce interface contract)

Sequence — Fetch path:
1) Caller invokes [`execServiceByFetch()`](../src/index.ts:164)
2) Resolve endpoint via [`compileUrlByService()`](../src/utils/index.ts:84)
3) Build `requestOptions`, ensure `Content-Type`
4) Shape body via [`compileBodyFetchWithContextType()`](../src/utils/index.ts:182); drop header for multipart
5) Optional request mutation via `addRequestTransformFetch`
6) Time the request via `performance.now()`
7) Read `res.text()`, try JSON.parse; if fails, map to MalformedResponse
8) Finalize via `addTransformResponseFetch` or raw [`responseFormat()`](../src/utils/index.ts:112)

Helper flow — Standalone Fetch:
- For non-driver usage, see [`httpClientFetch()`](../src/utils/index.ts:204)

## Data and Types

- Service selection and compiled info:
  - [`compileService()`](../src/utils/index.ts:57) returns `CompiledServiceInfo`
- URL builder for generic fetch:
  - [`interface UrlBuilder`](../src/utils/driver-contracts.ts:81)
- Canonical response:
  - [`interface ResponseFormat`](../src/utils/driver-contracts.ts:95)

Pattern: Keep driver-independent helpers public to enable testing and advanced use-cases.

## Security and Transport Notes

- `withCredentials` defaults to true in Driver constructor to support cookies-based auth.
- Multipart on Fetch removes manual `Content-Type` to avoid boundary issues; the platform fills it in.
- Consumers inject auth headers via Axios/Fetch transform hooks rather than library-owned state.

## Testing Patterns

- Unit tests target utilities and fetch helper:
  - Examples: [`test/src/utils/httpClientFetch.test.ts`](../test/src/utils/httpClientFetch.test.ts)
- Recommended additions:
  - Contract tests that assert async transform hooks are invoked
  - Interceptor behavior with queued requests (token refresh)
  - Multipart behavior invariants

## Known Issues and Follow-ups

1) Async transform naming drift (noted above). Risk: hooks not firing.
2) Error normalization parity:
   - Ensure axios path reliably maps timeout/network errors similarly to fetch path.
3) Duration on Axios:
   - Fetch path computes duration; confirm axios path provides comparable duration via apisauce or add explicit timing if necessary.
4) Type alignment for headers:
   - `ResponseFormat.headers` is typed as `Headers | null`; axios returns different shape. Validate downcast or adapt in normalization.

These items should be tracked in [`activeContext.md`](./activeContext.md) and progress logged in [`progress.md`](./progress.md).

## Reference Index

- Builder and driver surface:
  - [`class DriverBuilder`](../src/index.ts:305)
  - [`execService()`](../src/index.ts:109) · [`execServiceByFetch()`](../src/index.ts:164) · [`getInfoURL()`](../src/index.ts:274)
- Utilities:
  - [`compileUrlByService()`](../src/utils/index.ts:84) · [`compileUrl()`](../src/utils/index.ts:146)
  - [`responseFormat()`](../src/utils/index.ts:112) · [`httpClientFetch()`](../src/utils/index.ts:204)
  - [`replaceParamsInUrl()`](../src/utils/index.ts:21) · [`compileBodyFetchWithContextType()`](../src/utils/index.ts:182)
- Contracts:
  - [`MethodAPI`](../src/utils/driver-contracts.ts:3) · [`ServiceApi`](../src/utils/driver-contracts.ts:14) · [`ServiceUrlCompile`](../src/utils/driver-contracts.ts:23) · [`ResponseFormat`](../src/utils/driver-contracts.ts:95)
- Errors:
  - [`src/utils/error-handler.ts`](../src/utils/error-handler.ts) · [`src/utils/custom-errors.ts`](../src/utils/custom-errors.ts)