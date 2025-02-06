# System Patterns

## Architecture Overview
The system follows a layered architecture with clear separation of concerns:

1. **Service Layer**
   - Defines individual API endpoints
   - Each service specifies URL, HTTP method, and identifiers
   - Services can be grouped by functionality

2. **Driver Layer**
   - Acts as configuration hub
   - Registers services with base URL
   - Provides central point for API configuration

3. **Builder Layer**
   - Transforms configuration into HTTP client
   - Handles request/response transformations
   - Manages interceptors for axios/fetch

## Key Technical Decisions

### 1. Dual HTTP Client Support
- Supports both axios and fetch implementations
- Separate transformation methods for each client
- Consistent interface regardless of underlying implementation

### 2. Service-Based Organization
- Each API endpoint defined as a service
- Services grouped logically
- Promotes maintainability and code organization

### 3. Parameter Handling
- Dynamic URL parameter replacement
- Automatic query parameter conversion
- Flexible payload handling for different HTTP methods

### 4. Interceptor Pattern
- Request/response transformation capabilities
- Support for authentication (e.g., refresh tokens)
- Error handling middleware

## Design Patterns Used
1. **Builder Pattern**
   - DriverBuilder for constructing HTTP clients
   - Fluent interface for configuration
   - Step-by-step assembly of complex objects

2. **Factory Pattern**
   - Creates HTTP clients based on configuration
   - Abstracts implementation details
   - Provides consistent interface

3. **Interceptor Pattern**
   - Transforms requests/responses
   - Handles cross-cutting concerns
   - Enables middleware functionality

4. **Strategy Pattern**
   - Different HTTP client implementations (axios/fetch)
   - Swappable strategies for making requests
   - Common interface across strategies
