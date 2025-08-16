import { DriverBuilder } from "../../src/index";
import { MethodAPI } from "../../src/utils/driver-contracts";
import { AxiosHeaders } from "axios";

describe("Driver - Branch Coverage Tests", () => {
  describe("normalizeAxiosHeaders branches (lines 489-493)", () => {
    test("should cover toJSON branch in normalizeAxiosHeaders", async () => {
      const driver = new DriverBuilder()
        .withServices([{ id: "test", url: "api/test", method: MethodAPI.get }])
        .withBaseURL("http://example.com")
        .build();

      // Mock axios response with AxiosHeaders (has toJSON method)
      (driver as any).defaults.adapter = async () => {
        const headers = new AxiosHeaders();
        headers.set("content-type", "application/json");
        headers.set("authorization", "Bearer token");
        
        return {
          data: { success: true },
          status: 200,
          statusText: "OK",
          headers: headers, // This will trigger toJSON branch (line 488)
          config: {},
        };
      };

      const response = await driver.execService({ id: "test" });
      expect(response.ok).toBe(true);
      expect(response.headers).toBeDefined();
    });

    test("should cover plain object branch in normalizeAxiosHeaders", async () => {
      const driver = new DriverBuilder()
        .withServices([{ id: "test", url: "api/test", method: MethodAPI.get }])
        .withBaseURL("http://example.com")
        .build();

      // Mock axios response with plain object headers
      (driver as any).defaults.adapter = async () => ({
        data: { success: true },
        status: 200,
        statusText: "OK",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer token" }, // Plain object (line 491)
        config: {},
      });

      const response = await driver.execService({ id: "test" });
      expect(response.ok).toBe(true);
      expect(response.headers).toBeDefined();
      expect((response.headers as any)["content-type"]).toBe("application/json");
    });

    test("should cover null return branch in normalizeAxiosHeaders", async () => {
      const driver = new DriverBuilder()
        .withServices([{ id: "test", url: "api/test", method: MethodAPI.get }])
        .withBaseURL("http://example.com")
        .build();

      // Mock axios response with non-object headers
      (driver as any).defaults.adapter = async () => ({
        data: { success: true },
        status: 200,
        statusText: "OK",
        headers: "invalid-headers-string", // This will trigger null return (line 494)
        config: {},
      });

      const response = await driver.execService({ id: "test" });
      expect(response.ok).toBe(true);
      expect(response.headers).toEqual({});
    });

    test("should cover null/undefined headers", async () => {
      const driver = new DriverBuilder()
        .withServices([{ id: "test", url: "api/test", method: MethodAPI.get }])
        .withBaseURL("http://example.com")
        .build();

      // Test with null headers
      (driver as any).defaults.adapter = async () => ({
        data: { success: true },
        status: 200,
        statusText: "OK",
        headers: null,
        config: {},
      });

      const response1 = await driver.execService({ id: "test" });
      expect(response1.ok).toBe(true);
      expect(response1.headers).toEqual({});

      // Test with undefined headers
      (driver as any).defaults.adapter = async () => ({
        data: { success: true },
        status: 200,
        statusText: "OK",
        headers: undefined,
        config: {},
      });

      const response2 = await driver.execService({ id: "test" });
      expect(response2.ok).toBe(true);
      expect(response2.headers).toEqual({});
    });
  });

  describe("DriverBuilder version config branches (lines 553-559, 564)", () => {
    test("should cover versionConfig creation branches in withVersionTemplate", () => {
      // Test when versionConfig doesn't exist initially
      const builder = new DriverBuilder()
        .withServices([
          { id: "test", url: "test", method: MethodAPI.get }
        ])
        .withBaseURL("http://example.com");

      // This should trigger the versionConfig creation branch (line 554)
      builder.withVersionTemplate("/api/v{version}/endpoint");

      const config = (builder as any).config;
      expect(config.versionConfig).toBeDefined();
      expect(config.versionConfig.template).toBe("/api/v{version}/endpoint");
      expect(config.versionConfig.position).toBe("custom");
      expect(config.versionConfig.enabled).toBe(true);
    });

    test("should cover versionConfig creation branches in enableVersioning", () => {
      // Test when versionConfig doesn't exist initially
      const builder = new DriverBuilder()
        .withServices([
          { id: "test", url: "test", method: MethodAPI.get }
        ])
        .withBaseURL("http://example.com");

      // This should trigger the versionConfig creation branch (line 563)
      builder.enableVersioning(true);

      const config = (builder as any).config;
      expect(config.versionConfig).toBeDefined();
      expect(config.versionConfig.enabled).toBe(true);
    });

    test("should cover when versionConfig already exists", () => {
      // Test when versionConfig already exists
      const builder = new DriverBuilder()
        .withServices([
          { id: "test", url: "test", method: MethodAPI.get }
        ])
        .withBaseURL("http://example.com")
        .withVersionConfig({ enabled: false, position: 'after-base' });

      // This should NOT trigger the versionConfig creation branch
      builder.withVersionTemplate("/api/v{version}/endpoint");
      builder.enableVersioning(false);

      const config = (builder as any).config;
      expect(config.versionConfig).toBeDefined();
      expect(config.versionConfig.template).toBe("/api/v{version}/endpoint");
      expect(config.versionConfig.enabled).toBe(false);
    });

    test("should handle enableVersioning with default parameter", () => {
      const builder = new DriverBuilder()
        .withServices([
          { id: "test", url: "test", method: MethodAPI.get }
        ])
        .withBaseURL("http://example.com");

      // Test with default parameter (should be true)
      builder.enableVersioning();

      const config = (builder as any).config;
      expect(config.versionConfig.enabled).toBe(true);
    });

    test("should handle enableVersioning with explicit false", () => {
      const builder = new DriverBuilder()
        .withServices([
          { id: "test", url: "test", method: MethodAPI.get }
        ])
        .withBaseURL("http://example.com");

      builder.enableVersioning(false);

      const config = (builder as any).config;
      expect(config.versionConfig.enabled).toBe(false);
    });
  });
});
