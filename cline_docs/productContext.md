# Product Context

## Purpose
HttpDriver is a library designed to streamline API management by organizing interactions on a per-service basis. It was created to provide a structured and maintainable way to handle HTTP requests in JavaScript/TypeScript applications.

## Problems Solved
1. **API Organization**: Helps organize API endpoints by grouping related services together
2. **Flexibility**: Provides support for both axios and fetch, allowing developers to choose their preferred method
3. **Configuration Management**: Centralizes API configuration through a driver system
4. **Request/Response Control**: Offers interceptors and transformations for fine-grained control over HTTP requests
5. **Type Safety**: Built with TypeScript for better type checking and IDE support

## How It Works
The library follows a 3-step process:

1. **Service Definition**: Each API endpoint is defined with its URL, method, and identifiers
2. **Driver Registration**: Services are registered with a base URL in a driver configuration
3. **Driver Building**: The DriverBuilder transforms configuration into a Promise-based HTTP client with customizable interceptors

The system supports:
- Both axios and fetch implementations
- Custom request/response transformations
- URL parameter handling
- Payload transformations
- Integration with SWR for React applications
- Refresh token functionality
- Query parameter auto-conversion
