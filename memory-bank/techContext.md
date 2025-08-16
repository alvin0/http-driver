# Tech Context — HttpDriver

This document captures technologies, dependencies, scripts, environment assumptions, and operational notes for HttpDriver.

## Languages, Runtimes, Targets
- Language: TypeScript (5.1.3) — see [`tsconfig.json`](../tsconfig.json)
- Runtime targets:
  - Browser (Fetch available natively)
  - Node.js (v18+ recommended for native Fetch; otherwise polyfill)
- Module output: `dist/` via `tsc` — entry: [`package.json`](../package.json)

## Core Libraries
- HTTP (Axios via apisauce): `apisauce@^3.1.0`, `axios@^1.7.7`
  - Driver entry and builder: [`src/index.ts`](../src/index.ts)
  - Execution surfaces:
    - Axios path: [`execService()`](../src/index.ts:109)
    - Fetch path: [`execServiceByFetch()`](../src/index.ts:164)
    - URL inspection: [`getInfoURL()`](../src/index.ts:274)
- Query string serialization: `qs@^6.13.0`
  - URL compilation utilities:
    - [`compileUrlByService()`](../src/utils/index.ts:84)
    - [`compileUrl()`](../src/utils/index.ts:146)
    - Templating: [`replaceParamsInUrl()`](../src/utils/index.ts:21)
- Response normalization
  - Canonical type: [`interface ResponseFormat`](../src/utils/driver-contracts.ts:95)
  - Formatter: [`responseFormat()`](../src/utils/index.ts:112)
- Fetch helpers and payload shaping
  - Generic client: [`httpClientFetch()`](../src/utils/index.ts:204)
  - Body encoder: [`compileBodyFetchWithContextType()`](../src/utils/index.ts:182)
  - Null stripping: [`removeNullValues()`](../src/utils/index.ts:298)
  - FormData compiler: [`objectToFormData()`](../src/utils/index.ts:325)

## Error Handling
- Custom error types and normalization helpers:
  - Custom errors: [`src/utils/custom-errors.ts`](../src/utils/custom-errors.ts)
  - Error mapping: [`src/utils/error-handler.ts`](../src/utils/error-handler.ts)
- Network/timeouts/malformed payloads are mapped to the canonical response via [`responseFormat()`](../src/utils/index.ts:112)

## Public API Surface
- Builder (configures driver):
  - [`class DriverBuilder`](../src/index.ts:305)
  - Hooks (builder methods):
    - [`withAddAsyncRequestTransformAxios()`](../src/index.ts:321)
    - [`withAddAsyncResponseTransformAxios()`](../src/index.ts:329)
    - [`withAddRequestTransformAxios()`](../src/index.ts:337)
    - [`withAddResponseTransformAxios()`](../src/index.ts:345)
    - [`withHandleInterceptorErrorAxios()`](../src/index.ts:353)
    - [`withAddTransformResponseFetch()`](../src/index.ts:365)
    - [`withAddRequestTransformFetch()`](../src/index.ts:373)
- Contracts and data types:
  - HTTP methods: [`enum MethodAPI`](../src/utils/driver-contracts.ts:3)
  - Service declaration: [`interface ServiceApi`](../src/utils/driver-contracts.ts:14)
  - Call descriptor: [`interface ServiceUrlCompile`](../src/utils/driver-contracts.ts:23)
  - Response: [`interface ResponseFormat`](../src/utils/driver-contracts.ts:95)

## Package Scripts and Tooling
- Scripts: see [`package.json`](../package.json)
  - Build: `npm run build` (typescript `tsc`)
  - Start (library demo): `npm start` (runs `dist/index.js`)
  - Tests: `npm test` (Jest with coverage)
  - Example: `npm run start:example` (ts-node runs [`example/index.ts`](../example/index.ts))
- Testing:
  - Jest config: [`jest.config.ts`](../jest.config.ts)
  - Example tests: [`test/src/utils/httpClientFetch.test.ts`](../test/src/utils/httpClientFetch.test.ts), [`test/src/index.test.ts`](../test/src/index.test.ts)
  - Coverage badge target: 90%+ in [`README.MD`](../README.MD)

## Build and Distribution
- Compiler: TypeScript (`tsc`) — see [`tsconfig.json`](../tsconfig.json)
- Output: `dist/` (CommonJS/ES settings per tsconfig)
- Babel present for compatibility (presets in [`babel.config.json`](../babel.config.json)) — not part of main build path unless integrated in consumer tooling.

## Environment Assumptions
- Node.js 18+ recommended (native Fetch). For Node <18, bring a WHATWG-compliant `fetch` polyfill at app level.
- Browsers: modern environments with `fetch`, `FormData`, `Headers`, etc.
- CORS and credentials: Driver defaults `withCredentials: true` for Axios via apisauce in [`new Driver(config)`](../src/index.ts:39).

## Known Technical Considerations
- Async transform naming drift:
  - Contract: `addAsyncRequestTransform` / `addAsyncResponseTransform`
  - Driver constructor checks `addAsyncRequestTransformAxios` / `addAsyncTransformResponseAxios`
  - Builder setters: [`withAddAsyncRequestTransformAxios()`](../src/index.ts:321) and [`withAddAsyncResponseTransformAxios()`](../src/index.ts:329) assign to contract names
  - Impact: async hooks may not run. Tracked in [`memory-bank/systemPatterns.md`](./systemPatterns.md) and to be resolved in [`memory-bank/activeContext.md`](./activeContext.md).
- Multipart handling:
  - For Fetch, explicit `Content-Type: multipart/form-data` headers are removed so the browser sets boundaries; body is built with [`compileBodyFetchWithContextType()`](../src/utils/index.ts:182).
- Axios vs Fetch parity:
  - Axios path relies on apisauce behavior and interceptors; Fetch path explicitly measures `duration` and parses text->JSON.

## Example Clients
- JSONPlaceholder driver example: [`example/src/api-clients/jsonplaceholder-driver/driver.ts`](../example/src/api-clients/jsonplaceholder-driver/driver.ts), services in [`post-services.ts`](../example/src/api-clients/jsonplaceholder-driver/post-services.ts)
- DummyJSON example: [`example/src/api-clients/dummyjson-driver/driver.ts`](../example/src/api-clients/dummyjson-driver/driver.ts)

## Commands (for contributors)
- Install: `npm ci` or `npm install`
- Build: `npm run build`
- Test with coverage: `npm test`
- Run examples: `npm run start:example`

## Documentation
- Main guide: [`README.MD`](../README.MD)
- Architecture and patterns: [`memory-bank/systemPatterns.md`](./systemPatterns.md)
- Product goals: [`memory-bank/productContext.md`](./productContext.md)
- Project brief: [`memory-bank/projectbrief.md`](./projectbrief.md)