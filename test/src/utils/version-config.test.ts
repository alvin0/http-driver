import { VersionConfig } from "../../../src/types/driver";
import { buildUrlWithVersion } from "../../../src/utils/index";

describe("buildUrlWithVersion", () => {
  const baseURL = "https://api.example.com";
  const endpoint = "users";

  test("returns simple concatenation when no version provided", () => {
    const result = buildUrlWithVersion(baseURL, endpoint, undefined);
    expect(result).toBe("https://api.example.com/users");
  });

  test("returns simple concatenation when version building not enabled", () => {
    const config: VersionConfig = { enabled: false };
    const result = buildUrlWithVersion(baseURL, endpoint, 1, config);
    expect(result).toBe("https://api.example.com/users");
  });

  test("returns simple concatenation when no version config provided", () => {
    const result = buildUrlWithVersion(baseURL, endpoint, 1);
    expect(result).toBe("https://api.example.com/users");
  });

  test("uses default 'after-base' position with 'v' prefix when enabled", () => {
    const config: VersionConfig = { enabled: true };
    const result = buildUrlWithVersion(baseURL, endpoint, 1, config);
    expect(result).toBe("https://api.example.com/v1/users");
  });

  test("handles string version when enabled", () => {
    const config: VersionConfig = { enabled: true };
    const result = buildUrlWithVersion(baseURL, endpoint, "1.2", config);
    expect(result).toBe("https://api.example.com/v1.2/users");
  });

  test("supports 'before-endpoint' position", () => {
    const config: VersionConfig = {
      position: "before-endpoint",
      enabled: true,
    };
    const result = buildUrlWithVersion(baseURL, endpoint, 1, config);
    expect(result).toBe("https://api.example.com/users/v1");
  });

  test("supports 'prefix' position with HTTPS", () => {
    const config: VersionConfig = { position: "prefix", enabled: true };
    const result = buildUrlWithVersion(baseURL, endpoint, 1, config);
    expect(result).toBe("https://v1.api.example.com/users");
  });

  test("supports 'prefix' position with HTTP", () => {
    const config: VersionConfig = { position: "prefix", enabled: true };
    const result = buildUrlWithVersion(
      "http://api.example.com",
      endpoint,
      1,
      config
    );
    expect(result).toBe("http://v1.api.example.com/users");
  });

  test("supports 'prefix' position without protocol", () => {
    const config: VersionConfig = { position: "prefix", enabled: true };
    const result = buildUrlWithVersion("api.example.com", endpoint, 1, config);
    expect(result).toBe("v1.api.example.com/users");
  });

  test("supports custom template", () => {
    const config: VersionConfig = {
      position: "custom",
      template: "{baseURL}/api/{version}/{endpoint}",
      enabled: true,
    };
    const result = buildUrlWithVersion(baseURL, endpoint, 1, config);
    expect(result).toBe("https://api.example.com/api/v1/users");
  });

  test("throws error when custom position but no template provided", () => {
    const config: VersionConfig = { position: "custom", enabled: true };
    expect(() => buildUrlWithVersion(baseURL, endpoint, 1, config)).toThrow(
      "Custom version position requires a template. Please provide a template in versionConfig."
    );
  });

  test("supports custom prefix", () => {
    const config: VersionConfig = { prefix: "version", enabled: true };
    const result = buildUrlWithVersion(baseURL, endpoint, 1, config);
    expect(result).toBe("https://api.example.com/version1/users");
  });

  test("supports empty prefix", () => {
    const config: VersionConfig = { prefix: "", enabled: true };
    const result = buildUrlWithVersion(baseURL, endpoint, 1, config);
    expect(result).toBe("https://api.example.com/1/users");
  });

  test("handles complex custom template", () => {
    const config: VersionConfig = {
      position: "custom",
      template: "{baseURL}/rest/api/{version}/service/{endpoint}",
      prefix: "ver",
      enabled: true,
    };
    const result = buildUrlWithVersion(baseURL, endpoint, 2, config);
    expect(result).toBe("https://api.example.com/rest/api/ver2/service/users");
  });
});
