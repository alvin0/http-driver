# Active Context — HttpDriver

This file tracks the current focus, recent changes, decisions, next steps, and active considerations for the HttpDriver project.

## Current Focus
- **COMPLETED**: Implemented comprehensive version configuration system for dynamic URL versioning
- **NEW FEATURE**: Version injection with multiple positioning strategies and custom templates
- Continue working on identified implementation mismatches and edge cases for upcoming refactors
- Prepare a concise set of fixes improving correctness and API parity between Axios and Fetch flows

## Recent Changes
- **Version Configuration System (NEW)**:
  - Added `VersionConfig` interface in [`src/types/driver.ts`](../src/types/driver.ts)
  - Implemented `buildUrlWithVersion()` utility function in [`src/utils/index.ts`](../src/utils/index.ts)
  - Updated `compileUrlByService()` to use version injection logic
  - Modified `getInfoURL()` method to support versioned URLs
  - Added builder methods `withVersionConfig()` and `withGlobalVersion()`
  - Created comprehensive examples in [`example/src/app/version-examples.ts`](../example/src/app/version-examples.ts)
  - Added complete test coverage for version functionality
  - Created detailed documentation at [`docs/version-configuration.md`](../docs/version-configuration.md)

- Memory Bank core docs:
  - Brief: [`memory-bank/projectbrief.md`](./projectbrief.md)
  - Product: [`memory-bank/productContext.md`](./productContext.md)
  - Patterns: [`memory-bank/systemPatterns.md`](./systemPatterns.md)
  - Tech: [`memory-bank/techContext.md`](./techContext.md)
- Reviewed primary source files:
  - Entry/Builder: [`src/index.ts`](../src/index.ts)
  - Contracts: [`src/utils/driver-contracts.ts`](../src/utils/driver-contracts.ts)
  - Utilities: [`src/utils/index.ts`](../src/utils/index.ts)
  - Errors: [`src/utils/custom-errors.ts`](../src/utils/custom-errors.ts), [`src/utils/error-handler.ts`](../src/utils/error-handler.ts)

## Important Patterns and Preferences
- Standard response shape for all calls via [`ResponseFormat`](../src/utils/driver-contracts.ts:95) and formatter [`responseFormat()`](../src/utils/index.ts:112).
- Services are declarative with templated URLs; resolution goes through [`compileService()`](../src/utils/index.ts:57) and [`compileUrlByService()`](../src/utils/index.ts:84).
- Dual execution paths:
  - Axios: [`execService()`](../src/index.ts:109)
  - Fetch: [`execServiceByFetch()`](../src/index.ts:164)
- Body shaping guided by content type via [`compileBodyFetchWithContextType()`](../src/utils/index.ts:182).

## Decisions and Open Issues

1) Async transform naming mismatch
- Observed
  - In [`src/index.ts`](../src/index.ts), the constructor checks `config.addAsyncRequestTransformAxios` and `config.addAsyncTransformResponseAxios`.
  - The contract defines `addAsyncRequestTransform` / `addAsyncResponseTransform` in [`interface DriverConfig`](../src/utils/driver-contracts.ts:34).
  - Builder setters [`withAddAsyncRequestTransformAxios()`](../src/index.ts:321) and [`withAddAsyncResponseTransformAxios()`](../src/index.ts:329) currently assign to the non-axios-suffixed names in `DriverConfig`.
- Impact
  - Async hooks likely never invoked.
- Decision
  - Update `Driver` to use `config.addAsyncRequestTransform` and `config.addAsyncResponseTransform` (align to contract).
- Follow-up
  - Add tests asserting async hooks invocation.

2) Axios response casting vs normalization
- Observed
  - [`execService()`](../src/index.ts:109) returns `result as ResponseFormat`, where `result` is `ApiResponse` from apisauce.
- Risk
  - Type shape differences (e.g., headers) and invariants may diverge from [`ResponseFormat`](../src/utils/driver-contracts.ts:95).
- Decision
  - Map `ApiResponse` -> [`ResponseFormat`](../src/utils/driver-contracts.ts:95) via explicit adapter + [`responseFormat()`](../src/utils/index.ts:112), ensuring duration, problem, originalError fields are coherent.

3) Fetch JSON strictness
- Observed
  - In [`execServiceByFetch()`](../src/index.ts:164), the response text is parsed as JSON; failure throws [`MalformedResponseError`](../src/utils/custom-errors.ts:35) even when HTTP OK.
- Trade-off
  - Strict JSON contracts are good for typed APIs but break text/binary endpoints.
- Decision
  - Keep strict behavior for now but document this and potentially gate with a config flag later (e.g., `strictJsonFetch?: boolean`). Consumers can also override via [`withAddTransformResponseFetch()`](../src/index.ts:365).

4) objectToFormData array handling bug
- Observed
  - In [`objectToFormData()`](../src/utils/index.ts:325) array branch uses `typeof value === "object"` and `String(value)` instead of `subValue`. This is a logic bug when arrays contain non-files or nested values.
- Decision
  - Fix to use `subValue` checks and `String(subValue)`; add tests for nested arrays/objects and File entries.

5) getInfoURL method check literal
- Observed
  - [`getInfoURL()`](../src/index.ts:274) checks `apiInfo.methods === "get"`.
- Decision
  - Replace with `apiInfo.methods === MethodAPI.get` for correctness and refactor-safety. Reference: [`enum MethodAPI`](../src/utils/driver-contracts.ts:3).

6) Error normalization flow
- Observed
  - Errors route through [`handleErrorResponse()`](../src/utils/error-handler.ts:41) returning a ResponseFormat-like object, then wrapped again by [`responseFormat()`](../src/utils/index.ts:112).
- Decision
  - This is redundant but harmless; keep for now. Consider a single normalization step later for clarity/perf.

## Next Steps (Implementation Plan)
- Hook alignment
  - Update `Driver` constructor to use:
    - `config.addAsyncRequestTransform` inside `addAsyncRequestTransform(...)`
    - `config.addAsyncResponseTransform` inside `addAsyncResponseTransform(...)`
  - Add tests to validate async hooks are invoked.
- Axios adapter
  - Implement an adapter mapping apisauce `ApiResponse` to [`ResponseFormat`](../src/utils/driver-contracts.ts:95) in [`execService()`](../src/index.ts:109).
  - Preserve `duration`, `status`, `data`, and map axios headers appropriately (or omit headers for axios path if incompatible).
- FormData bugfix
  - Correct array handling in [`objectToFormData()`](../src/utils/index.ts:325): use `subValue` for typeof checks and append, not `value`.
  - Expand tests to cover nested arrays/objects and File payloads.
- Minor corrections
  - Use `MethodAPI.get` in [`getInfoURL()`](../src/index.ts:274).
- Optional enhancement
  - Consider `strictJsonFetch` flag in config for [`execServiceByFetch()`](../src/index.ts:164) to optionally allow text payloads without error (fall back to text when JSON.parse fails).

## Testing Additions
- Async hooks
  - Verify both async request/response transforms fire for axios path.
- Axios mapping
  - Ensure response shape matches [`ResponseFormat`](../src/utils/driver-contracts.ts:95) including `ok` logic, `problem`, `originalError`.
- FormData compiler
  - Arrays of primitives, arrays of objects, nested objects, and `File` instances.
- Parity checks
  - For identical successful endpoints, axios and fetch produce compatible `ok`, `status`, and `data` semantics.

## Notes, Constraints, Considerations
- Node vs Browser
  - Fetch in Node requires Node 18+ or a polyfill; document in tech context. See [`memory-bank/techContext.md`](./techContext.md).
- Credentials default
  - Axios is initialized with `withCredentials: true` in [`new Driver(config)`](../src/index.ts:39).
- Example drivers
  - Refer to JSONPlaceholder and DummyJSON examples under `example/src/api-clients/` for manual testing of both paths.

## Open Questions
- Should we expose a `headers` adapter for axios to align to `Headers` semantics, or omit headers for axios path in [`ResponseFormat`](../src/utils/driver-contracts.ts:95)?
- Do we want a configurable parse strategy for fetch (e.g., try JSON, else text) as default instead of strict JSON?

## Work Log Snapshot
- 2025-08-16
  - Initialized Memory Bank and documented core/system/tech contexts.
  - Identified async transform naming mismatch and FormData array handling bug.
  - Planned adapter for axios responses to ensure strict [`ResponseFormat`](../src/utils/driver-contracts.ts:95) compliance.

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