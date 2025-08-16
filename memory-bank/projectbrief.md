# Project Brief — HttpDriver

## Overview
HttpDriver is a TypeScript library for building per-service HTTP clients with a consistent, typed interface. It unifies Axios (via apisauce) and the Fetch API, standardizes responses, and provides hooks for request/response transforms and error interception. The library targets maintainable API layers with clear service definitions and a builder pattern for configuration.

## Core Objectives
- Provide a per-service API layer that composes a driver from:
  - Base URL
  - Service definitions (id, url template, HTTP method, options)
  - Request/response transforms (sync/async) for Axios and Fetch
  - Interceptors for robust error handling
- Expose a Promise-based client with a standardized response format:
  - ok, status, data, headers, duration, problem, originalError
- Support both Axios (execService) and Fetch (execServiceByFetch) with parity in behavior.
- Offer utilities for URL/path compilation, query building, and payload encoding (JSON, multipart).

## In Scope
- Driver configuration and lifecycle.
- Service compilation (templated paths, query param injection).
- Axios integration via apisauce, including interceptors and transforms.
- Fetch integration with request shaping and response normalization.
- Consistent error handling and response formatting.
- Utilities: qs-based query assembly, payload-to-FormData conversion, httpClientFetch helper.
- Examples and Jest-based tests (coverage target ≈90%).

## Out of Scope (for now)
- GraphQL transport and schema tooling.
- Advanced caching/persistence (beyond consumer-chosen SWR, etc.).
- Retries/backoff/ratelimiting (consumers can add via interceptors or wrappers).
- Client-side auth/token storage policy (left to consumer).
- Request cancellation abstractions beyond what Axios/Fetch support natively.

## Primary Users
- Application developers who need a clear, testable API layer.
- Teams standardizing API calls across codebases (Node.js and browser environments).
- DX-focused libraries that want predictable response shapes and error semantics.

## Key Features
- Dual HTTP support:
  - Axios-based execution: execService
  - Fetch-based execution: execServiceByFetch
- Declarative services with templated paths: e.g. getUser/{id}
- Builder pattern for configuration
- Interceptor support (e.g., token refresh, error queues)
- Request/response transforms (sync and async)
- Multipart and JSON payload support
- Utilities for compiling URLs and requests
- Example drivers (e.g., JSONPlaceholder, DummyJSON)
- SWR integration example

## Deliverables
- NPM package: @alvin0/http-driver
- Public API surface:
  - DriverBuilder for configuration and .build()
  - Driver instance methods: execService, execServiceByFetch, getInfoURL
  - Utilities: compileUrlByService, responseFormat, httpClientFetch, etc.
- Documentation: README with usage, examples, and patterns
- Test suite with Jest and coverage reporting

## Success Criteria
- Consistent 200–299 success detection via standardized response.
- Developer adoption measured by minimal boilerplate to add new services.
- >= 90% test coverage maintained (badge in README).
- Clear error behavior (timeouts, networks, malformed responses mapped predictably).

## Constraints and Assumptions
- TypeScript-first; emits JavaScript for consumption.
- Browser and Node (Fetch availability must be ensured by consumer in Node).
- qs used for querystring serialization.
- apisauce wraps Axios for consistent transform/interceptor API.

## Risks and Mitigations
- Risk: Divergence between Axios and Fetch paths.
  - Mitigation: Maintain shared responseFormat; mirror transform hooks where practical.
- Risk: Inconsistent async transform naming between interfaces and implementation.
  - Mitigation: Align property names and add tests (tracked in activeContext/progress).
- Risk: Multipart handling differences (headers/boundary).
  - Mitigation: Let browser set multipart headers in Fetch path; document patterns.

## High-Level Flow
- Register services and base URL
- Build driver using DriverBuilder
- Execute services via execService (Axios) or execServiceByFetch (Fetch)
- Receive standardized response object

## References
- Source entry: [`src/index.ts`](../src/index.ts)
- Contracts: [`src/utils/driver-contracts.ts`](../src/utils/driver-contracts.ts)
- Utilities: [`src/utils/index.ts`](../src/utils/index.ts)
- README: [`README.MD`](../README.MD)