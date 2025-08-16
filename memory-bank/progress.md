# Progress — HttpDriver

Updated: 2025-08-16

## Current Status Summary
- Memory Bank initialized: project brief, product, system patterns, tech context, and active context are in place.
- Docs: [`projectbrief.md`](./projectbrief.md), [`productContext.md`](./productContext.md), [`systemPatterns.md`](./systemPatterns.md), [`techContext.md`](./techContext.md), [`activeContext.md`](./activeContext.md)
- Core code reviewed: [`src/index.ts`](../src/index.ts), [`src/utils/index.ts`](../src/utils/index.ts), [`src/utils/driver-contracts.ts`](../src/utils/driver-contracts.ts), [`src/utils/error-handler.ts`](../src/utils/error-handler.ts), [`src/utils/custom-errors.ts`](../src/utils/custom-errors.ts)
- Tests present; coverage target 90% per [`README.MD`](../README.MD).

## What Works
- Driver construction via [`class DriverBuilder`](../src/index.ts:305) producing a client with: [`execService()`](../src/index.ts:109), [`execServiceByFetch()`](../src/index.ts:164), [`getInfoURL()`](../src/index.ts:274).
- URL and request compilation: [`compileService()`](../src/utils/index.ts:57), [`compileUrlByService()`](../src/utils/index.ts:84), [`compileUrl()`](../src/utils/index.ts:146), [`replaceParamsInUrl()`](../src/utils/index.ts:21).
- Standard response shaping: [`interface ResponseFormat`](../src/utils/driver-contracts.ts:95) with [`responseFormat()`](../src/utils/index.ts:112).
- Fetch path features: body shaping via [`compileBodyFetchWithContextType()`](../src/utils/index.ts:182), timing and JSON parsing in [`execServiceByFetch()`](../src/index.ts:164), error normalization through [`handleErrorResponse()`](../src/utils/error-handler.ts:41) and [`class MalformedResponseError`](../src/utils/custom-errors.ts:35).
- Standalone helper for non-driver fetch: [`httpClientFetch()`](../src/utils/index.ts:204).
- Examples available under [`example/`](../example) with drivers in [`example/src/api-clients/`](../example/src/api-clients).

## What's Left To Build / Improve
1) Align async Axios transform hooks
- Update constructor in [`src/index.ts`](../src/index.ts) to reference [`addAsyncRequestTransform`](../src/utils/driver-contracts.ts:40) and [`addAsyncResponseTransform`](../src/utils/driver-contracts.ts:41) instead of `addAsyncRequestTransformAxios`/`addAsyncTransformResponseAxios`.
- Verify builder methods [`withAddAsyncRequestTransformAxios()`](../src/index.ts:321) and [`withAddAsyncResponseTransformAxios()`](../src/index.ts:329) wire to those fields; add tests.

2) Normalize Axios responses to ResponseFormat
- In [`execService()`](../src/index.ts:109), adapt apisauce ApiResponse via [`responseFormat()`](../src/utils/index.ts:112) rather than casting.

3) Fix FormData array handling
- In [`objectToFormData()`](../src/utils/index.ts:325), use subValue when appending array entries; ensure nested arrays/objects are handled.

4) Method enum comparison in getInfoURL
- Replace string literal 'get' with [`MethodAPI.get`](../src/utils/driver-contracts.ts:3) check inside [`getInfoURL()`](../src/index.ts:274).

5) Optional: make Fetch JSON strictness configurable
- Consider flag strictJsonFetch in [`interface DriverConfig`](../src/utils/driver-contracts.ts:34) to permit text responses; or recommend [`withAddTransformResponseFetch()`](../src/index.ts:365) to relax parsing.

## Known Issues
- Async transform mismatch may prevent async hooks from running.
- Axios path may not strictly conform to [`ResponseFormat`](../src/utils/driver-contracts.ts:95).
- Array handling bug in [`objectToFormData()`](../src/utils/index.ts:325) for non-File entries.
- Inconsistent method comparison in [`getInfoURL()`](../src/index.ts:274).
- Fetch JSON strictness may reject valid text endpoints.

## Recent Decisions
- Align to contract names for async hooks (do not rename contract).
- Keep strict JSON in Fetch for now; document override via [`withAddTransformResponseFetch()`](../src/index.ts:365).
- Plan explicit Axios->ResponseFormat adapter.

## Next Actions
- Code: Hook alignment and Axios adapter in [`src/index.ts`](../src/index.ts).
- Code: Fix [`objectToFormData()`](../src/utils/index.ts:325) array branch.
- Code: Update [`getInfoURL()`](../src/index.ts:274) to use [`MethodAPI.get`](../src/utils/driver-contracts.ts:3).
- Tests: Add coverage for async hooks, adapter mapping, and FormData edge cases in [`test/src/index.test.ts`](../test/src/index.test.ts), [`test/src/utils/index.test.ts`](../test/src/utils/index.test.ts), [`test/src/utils/httpClientFetch.test.ts`](../test/src/utils/httpClientFetch.test.ts).

## Test & Coverage Snapshot
- Existing tests: [`test/src/index.test.ts`](../test/src/index.test.ts), [`test/src/utils/index.test.ts`](../test/src/utils/index.test.ts), [`test/src/utils/httpClientFetch.test.ts`](../test/src/utils/httpClientFetch.test.ts), [`test/src/utils/additional.test.ts`](../test/src/utils/additional.test.ts), [`test/src/utils/extra.test.ts`](../test/src/utils/extra.test.ts).
- Target: maintain 90%+ coverage as per [`README.MD`](../README.MD).

## Reference Index
- Entry/Builder: [`src/index.ts`](../src/index.ts)
- Contracts: [`src/utils/driver-contracts.ts`](../src/utils/driver-contracts.ts)
- Utilities: [`src/utils/index.ts`](../src/utils/index.ts)
- Errors: [`src/utils/error-handler.ts`](../src/utils/error-handler.ts), [`src/utils/custom-errors.ts`](../src/utils/custom-errors.ts)
- Examples: [`example/`](../example)