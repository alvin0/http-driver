# Version Configuration Guide

HttpDriver hỗ trợ flexible version management cho API services. Thay vì phải hardcode version vào baseURL, bạn có thể configure version handling theo nhiều cách khác nhau.

## Tại sao cần Version Configuration?

### Vấn đề trước đây:
- Phải hardcode version vào baseURL: `https://api.example.com/v1`
- Khó thay đổi version cho từng service riêng biệt
- Không linh hoạt khi API provider thay đổi version pattern

### Giải pháp hiện tại:
- Version được inject tự động vào URL
- Hỗ trợ nhiều version pattern khác nhau
- Service có thể override global version
- Flexible configuration

## Cách sử dụng

### 1. Global Version - Simple Usage

```typescript
const driver = new DriverBuilder()
  .withBaseURL("https://api.example.com")  // Không cần hardcode version
  .withServices(services)
  .withGlobalVersion(1)  // Global version cho tất cả services
  .build();

// Kết quả: https://api.example.com/v1/users
```

### 2. Service-specific Version Override

```typescript
const services: ServiceApi[] = [
  {
    id: "user.list",
    url: "users",
    method: MethodAPI.get,
    // Sử dụng global version
  },
  {
    id: "user.detail", 
    url: "users/{id}",
    method: MethodAPI.get,
    version: 2, // Override global version
  },
];

const driver = new DriverBuilder()
  .withBaseURL("https://api.example.com")
  .withServices(services)
  .withGlobalVersion(1)
  .build();

// user.list: https://api.example.com/v1/users
// user.detail: https://api.example.com/v2/users/123
```

### 3. Version Position Configuration

#### After Base URL (Default)
```typescript
.withVersionConfig({
  position: 'after-base',  // Default
  defaultVersion: 1
})
// Kết quả: https://api.example.com/v1/users
```

#### Before Endpoint
```typescript
.withVersionConfig({
  position: 'before-endpoint',
  defaultVersion: 1
})
// Kết quả: https://api.example.com/users/v1
```

#### Subdomain Versioning
```typescript
.withVersionConfig({
  position: 'prefix',
  defaultVersion: 1
})
// Kết quả: https://v1.api.example.com/users
```

#### Custom Template
```typescript
.withVersionConfig({
  position: 'custom',
  template: '{baseURL}/api/{version}/{endpoint}',
  defaultVersion: 1
})
// Kết quả: https://api.example.com/api/v1/users
```

### 4. Custom Version Prefix

```typescript
.withVersionConfig({
  prefix: 'api-v',  // Default là 'v'
  defaultVersion: 1
})
// Kết quả: https://api.example.com/api-v1/users

// Hoặc không có prefix
.withVersionConfig({
  prefix: '',  // Không có prefix
  defaultVersion: 1
})
// Kết quả: https://api.example.com/1/users
```

## Ví dụ thực tế

### RESTful API với version path
```typescript
const driver = new DriverBuilder()
  .withBaseURL("https://api.myservice.com")
  .withVersionConfig({
    position: 'after-base',
    defaultVersion: 1
  })
  .withServices([
    { id: "users.list", url: "users", method: MethodAPI.get },
    { id: "posts.list", url: "posts", method: MethodAPI.get, version: 2 }
  ])
  .build();

// users.list: https://api.myservice.com/v1/users  
// posts.list: https://api.myservice.com/v2/posts
```

### Enterprise API với custom path
```typescript
const driver = new DriverBuilder()
  .withBaseURL("https://enterprise-api.com")
  .withVersionConfig({
    position: 'custom',
    template: '{baseURL}/rest/api/{version}/services/{endpoint}',
    defaultVersion: '2024.1'
  })
  .withServices(services)
  .build();

// Kết quả: https://enterprise-api.com/rest/api/v2024.1/services/users
```

### Microservice với subdomain versioning
```typescript
const driver = new DriverBuilder()
  .withBaseURL("https://api.microservice.io")
  .withVersionConfig({
    position: 'prefix',
    prefix: 'v',
    defaultVersion: 3
  })
  .withServices(services)
  .build();

// Kết quả: https://v3.api.microservice.io/users
```

## API Reference

### VersionConfig Interface

```typescript
interface VersionConfig {
  /**
   * Position where version should be injected in the URL
   * - 'after-base': baseURL/v1/endpoint (default)
   * - 'before-endpoint': baseURL/endpoint/v1  
   * - 'prefix': v1.baseURL/endpoint
   * - 'custom': use custom template
   */
  position?: 'after-base' | 'before-endpoint' | 'prefix' | 'custom';
  
  /**
   * Custom template for version placement
   * Use {baseURL}, {version}, {endpoint} as placeholders
   * Example: "{baseURL}/api/{version}/{endpoint}"
   */
  template?: string;
  
  /**
   * Version prefix (default: 'v')
   * Set to empty string to use version without prefix
   */  
  prefix?: string;
  
  /**
   * Global version to apply to all services without explicit version
   */
  defaultVersion?: string | number;
}
```

### Builder Methods

```typescript
// Set complete version configuration
.withVersionConfig(config: VersionConfig)

// Quick set global version only
.withGlobalVersion(version: string | number)
```

## Migration từ hardcoded version

### Trước:
```typescript
const driver = new DriverBuilder()
  .withBaseURL("https://api.example.com/api/v1")  // Hardcoded
  .withServices(services)
  .build();
```

### Sau:
```typescript
const driver = new DriverBuilder()
  .withBaseURL("https://api.example.com")  // Clean base URL
  .withVersionConfig({
    position: 'custom',
    template: '{baseURL}/api/{version}/{endpoint}', 
    defaultVersion: 1
  })
  .withServices(services)
  .build();
```

## Best Practices

1. **Sử dụng clean base URL**: Tránh hardcode version vào baseURL
2. **Service-level versioning**: Đặt version ở service level khi cần override
3. **Consistent naming**: Sử dụng consistent version naming (1, 2, 3 hoặc 1.0, 1.1, etc.)
4. **Template reuse**: Sử dụng custom template cho complex enterprise APIs
5. **Testing**: Luôn test URL generation với `getInfoURL()` method

## Backward Compatibility

Nếu bạn không sử dụng version configuration, HttpDriver vẫn hoạt động như cũ:
- Services không có `version` field sẽ không được inject version
- `baseURL + "/" + endpoint` pattern vẫn được maintain

Điều này đảm bảo existing code không bị break khi upgrade.
