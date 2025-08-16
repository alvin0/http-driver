# Product Context — HttpDriver

## Why this project exists
Modern applications talk to many HTTP services. Teams frequently hand-roll ad-hoc API layers that diverge in request shaping, error handling, and response formatting. This increases maintenance cost, reduces testability, and complicates refactors.

HttpDriver standardizes the API layer by:
- Defining services declaratively (id, templated URL, method).
- Building a driver with a single baseURL and rich hooks.
- Exposing consistent, predictable responses across Axios and Fetch paths.

Primary reference: [`README.MD`](../README.MD)

## Problems it solves
- Inconsistent response shapes: A single standardized ResponseFormat removes custom conditionals throughout app code. See [`responseFormat()`](../src/utils/index.ts:112).
- Boilerplate URL building: URL template replacement and query serialization. See [`compileUrlByService()`](../src/utils/index.ts:84).
- Divergent Axios vs Fetch behavior: Unifies semantics with shared response shape and similar hooks. See [`execService()`](../src/index.ts:109) and [`execServiceByFetch()`](../src/index.ts:164).
- Multipart and JSON payload handling: Encodes bodies correctly and safely removes multipart headers for Fetch to let the browser set boundaries. See [`compileBodyFetchWithContextType()`](../src/utils/index.ts:182) and [`objectToFormData()`](../src/utils/index.ts:325).
- Centralized error handling strategy: Interceptor hook points and error normalization (timeouts, network, malformed payloads). See [`src/utils/error-handler.ts`](../src/utils/error-handler.ts) and [`src/utils/custom-errors.ts`](../src/utils/custom-errors.ts).

## How it should work
- Developers describe remote endpoints as services:
  - Contract: [`interface ServiceApi`](../src/utils/driver-contracts.ts:14)
  - HTTP verb enum: [`enum MethodAPI`](../src/utils/driver-contracts.ts:3)
  - Call-time id and optional params: [`interface ServiceUrlCompile`](../src/utils/driver-contracts.ts:23)
- A driver is built using the builder pattern, binding:
  - Base URL
  - Services
  - Optional hooks for transforms and interceptors
  - Builder: [`class DriverBuilder`](../src/index.ts:305)
- At runtime, callers use:
  - Axios path: [`execService()`](../src/index.ts:109)
  - Fetch path: [`execServiceByFetch()`](../src/index.ts:164)
  - URL inspection: [`getInfoURL()`](../src/index.ts:274)
- Each call returns a standard response: [`interface ResponseFormat`](../src/utils/driver-contracts.ts:95)

## User experience and developer experience goals
- Low ceremony: Add a service once, use it everywhere with simple, typed calls.
- Predictable behavior: 200–299 is ok=true; else a populated problem/originalError with status, headers, and duration.
- Extensibility at edges: Hooks for Axios and Fetch to add headers, map responses, or perform side effects.
- Testability: Drivers are deterministic; helper [`httpClientFetch()`](../src/utils/index.ts:204) provides a simple integration surface for unit tests.
- Interoperability: Integrates smoothly with client libraries like SWR; examples provided in [`README.MD`](../README.MD).

## Primary workflows
1) Define services
- Declare an array of [`ServiceApi`](../src/utils/driver-contracts.ts:14), using templated URLs for path params (e.g., getUser/{id}).
- Common options (headers, etc.) can be added per service and overridden at call-time.

2) Build the driver
- Use [`class DriverBuilder`](../src/index.ts:305) to set baseURL and services.
- Optionally register Axios transforms/interceptors and Fetch transforms:
  - Axios request/response (sync/async)
  - Fetch request/response transforms (request mutator, response finalizer)

3) Execute calls
- Axios: [`execService()`](../src/index.ts:109)
- Fetch: [`execServiceByFetch()`](../src/index.ts:164)
- Inspect fully compiled URL/method with [`getInfoURL()`](../src/index.ts:274) for debugging, SWR keys, or prefetch strategies.

4) Consume standardized responses
- Always handle a single shape: [`ResponseFormat`](../src/utils/driver-contracts.ts:95).
- Use ok, status, data, problem, originalError, headers, duration.

## Non-functional requirements
- TypeScript-first API with helpful types (services and driver config).
- Works in both browser and Node (consumers ensure Fetch polyfill in Node if necessary).
- Library should not own auth state; provide hooks for token injection and refresh.
- Maintain high test coverage (target 90%+, badge present in [`README.MD`](../README.MD)).

## Product principles
- Convention over configuration: Most users only set baseURL and services.
- Escape hatches exist: Transform and interceptor hooks allow rich customization without forking.
- Minimal surprises: Axios and Fetch return the same conceptual response.
- Debuggability: Deterministic URL compilation via [`compileUrlByService()`](../src/utils/index.ts:84) and helper [`httpClientFetch()`](../src/utils/index.ts:204).

## Key artifacts and loci of behavior
- Public entry: [`src/index.ts`](../src/index.ts)
  - Driver methods: [`execService()`](../src/index.ts:109), [`execServiceByFetch()`](../src/index.ts:164), [`getInfoURL()`](../src/index.ts:274)
  - Builder: [`class DriverBuilder`](../src/index.ts:305)
- Contracts and types: [`src/utils/driver-contracts.ts`](../src/utils/driver-contracts.ts)
- Utilities and helpers: [`src/utils/index.ts`](../src/utils/index.ts)

## Boundaries and what’s intentionally not included (for now)
- No built-in persistence/caching (rely on SWR or app-specific caching).
- No built-in retry policy/backoff (can be implemented via interceptors).
- No opinionated auth state management (token storage not included).
- No GraphQL client (REST-focused primitives, generic enough to be re-used).

## Success signals
- Teams adopt service definitions and stop scattering raw fetch/axios calls.
- Apps rely on uniform response handling rather than bespoke try/catch branches.
- New services added without modifying core code.
- CI maintains ≥ 90% coverage with a targeted and stable test suite.

## Related documentation
- User guide and examples: [`README.MD`](../README.MD)
- API entry points: [`src/index.ts`](../src/index.ts)
- Utilities: [`src/utils/index.ts`](../src/utils/index.ts)
- Contracts: [`src/utils/driver-contracts.ts`](../src/utils/driver-contracts.ts)