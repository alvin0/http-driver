import { DriverBuilder } from "../../../src";
import { MethodAPI, ServiceApi } from "../../../src/utils/driver-contracts";

describe("Version Configuration Integration", () => {
  const services: ServiceApi[] = [
    {
      id: "user.list",
      url: "users",
      method: MethodAPI.get,
    },
    {
      id: "user.detail",
      url: "users/{id}",
      method: MethodAPI.get,
      version: 2, // Service-specific version
    },
    {
      id: "post.list",
      url: "posts",
      method: MethodAPI.get,
      version: "1.2", // String version
    },
  ];

  test("applies global version to services without specific version", () => {
    const driver = new DriverBuilder()
      .withBaseURL("https://api.example.com")
      .withServices(services)
      .withGlobalVersion(1)
      .enableVersioning() // Must enable versioning
      .build();

    const result = driver.getInfoURL({ id: "user.list" });
    expect(result.fullUrl).toBe("https://api.example.com/v1/users");
  });

  test("service-specific version overrides global version", () => {
    const driver = new DriverBuilder()
      .withBaseURL("https://api.example.com")
      .withServices(services)
      .withGlobalVersion(1)
      .enableVersioning() // Must enable versioning
      .build();

    const result = driver.getInfoURL({ 
      id: "user.detail", 
      params: { id: 123 } 
    });
    expect(result.fullUrl).toBe("https://api.example.com/v2/users/123");
  });

  test("handles string versions", () => {
    const driver = new DriverBuilder()
      .withBaseURL("https://api.example.com")
      .withServices(services)
      .withGlobalVersion(1)
      .enableVersioning() // Must enable versioning
      .build();

    const result = driver.getInfoURL({ id: "post.list" });
    expect(result.fullUrl).toBe("https://api.example.com/v1.2/posts");
  });

  test("works with custom version configuration", () => {
    const driver = new DriverBuilder()
      .withBaseURL("https://api.example.com")
      .withServices(services)
      .withVersionConfig({
        enabled: true, // Explicitly enable
        position: 'custom',
        template: '{baseURL}/api/{version}/{endpoint}',
        defaultVersion: 1,
      })
      .build();

    const result = driver.getInfoURL({ id: "user.list" });
    expect(result.fullUrl).toBe("https://api.example.com/api/v1/users");
  });

  test("works with before-endpoint position", () => {
    const driver = new DriverBuilder()
      .withBaseURL("https://api.example.com")
      .withServices(services)
      .withVersionConfig({
        enabled: true, // Explicitly enable
        position: 'before-endpoint',
        defaultVersion: 1,
      })
      .build();

    const result = driver.getInfoURL({ id: "user.list" });
    expect(result.fullUrl).toBe("https://api.example.com/users/v1");
  });

  test("works with subdomain versioning", () => {
    const driver = new DriverBuilder()
      .withBaseURL("https://api.example.com")
      .withServices(services)
      .withVersionConfig({
        enabled: true, // Explicitly enable
        position: 'prefix',
        defaultVersion: 1,
      })
      .build();

    const result = driver.getInfoURL({ id: "user.list" });
    expect(result.fullUrl).toBe("https://v1.api.example.com/users");
  });

  test("works with no version prefix", () => {
    const driver = new DriverBuilder()
      .withBaseURL("https://api.example.com")
      .withServices(services)
      .withVersionConfig({
        enabled: true, // Explicitly enable
        prefix: '',
        defaultVersion: 1,
      })
      .build();

    const result = driver.getInfoURL({ id: "user.list" });
    expect(result.fullUrl).toBe("https://api.example.com/1/users");
  });

  test("preserves query parameters with versioning", () => {
    const driver = new DriverBuilder()
      .withBaseURL("https://api.example.com")
      .withServices(services)
      .withGlobalVersion(1)
      .enableVersioning() // Must enable versioning
      .build();

    const result = driver.getInfoURL(
      { id: "user.list" },
      { page: 1, limit: 10 }
    );
    expect(result.fullUrl).toBe("https://api.example.com/v1/users?page=1&limit=10");
  });

  test("handles no version configuration gracefully", () => {
    const driver = new DriverBuilder()
      .withBaseURL("https://api.example.com")
      .withServices(services)
      .build();

    const result1 = driver.getInfoURL({ id: "user.list" });
    expect(result1.fullUrl).toBe("https://api.example.com/users");

    // Service with specific version is also ignored when versioning not enabled
    const result2 = driver.getInfoURL({ 
      id: "user.detail", 
      params: { id: 123 } 
    });
    expect(result2.fullUrl).toBe("https://api.example.com/users/123");
  });

  test("chaining withVersionConfig and withGlobalVersion works", () => {
    const driver = new DriverBuilder()
      .withBaseURL("https://api.example.com")
      .withServices(services)
      .withVersionConfig({
        enabled: true, // Explicitly enable
        position: 'after-base',
        prefix: 'api-v',
      })
      .withGlobalVersion(3)
      .build();

    const result = driver.getInfoURL({ id: "user.list" });
    expect(result.fullUrl).toBe("https://api.example.com/api-v3/users");
  });
});
