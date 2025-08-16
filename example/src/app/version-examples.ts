import { DriverBuilder } from "../../../src";
import { MethodAPI, ServiceApi } from "../../../src/utils/driver-contracts";

// Example services with version
const exampleServices: ServiceApi[] = [
  {
    id: "user.list",
    url: "users",
    method: MethodAPI.get,
    // No version - will use global default
  },
  {
    id: "user.detail",
    url: "users/{id}",
    method: MethodAPI.get,
    version: 2, // Specific version for this service
  },
  {
    id: "post.list",
    url: "posts",
    method: MethodAPI.get,
    version: "1.2", // String version
  },
];

// Example 1: Simple version after base URL
// Result: https://api.example.com/v1/users
export const driverWithSimpleVersion = new DriverBuilder()
  .withBaseURL("https://api.example.com")
  .withServices(exampleServices)
  .withGlobalVersion(1) // Global default version
  .build();

// Example 2: Custom position - before endpoint
// Result: https://api.example.com/users/v1
export const driverWithVersionBeforeEndpoint = new DriverBuilder()
  .withBaseURL("https://api.example.com")
  .withServices(exampleServices)
  .withVersionConfig({
    position: 'before-endpoint',
    defaultVersion: 1,
  })
  .build();

// Example 3: Custom template
// Result: https://api.example.com/api/v1/users
export const driverWithCustomTemplate = new DriverBuilder()
  .withBaseURL("https://api.example.com")
  .withServices(exampleServices)
  .withVersionConfig({
    position: 'custom',
    template: '{baseURL}/api/{version}/{endpoint}',
    defaultVersion: 1,
  })
  .build();

// Example 4: No version prefix
// Result: https://api.example.com/1/users
export const driverWithNoPrefix = new DriverBuilder()
  .withBaseURL("https://api.example.com")
  .withServices(exampleServices)
  .withVersionConfig({
    position: 'after-base',
    prefix: '', // No 'v' prefix
    defaultVersion: 1,
  })
  .build();

// Example 5: Subdomain versioning
// Result: v1.api.example.com/users
export const driverWithSubdomainVersion = new DriverBuilder()
  .withBaseURL("https://api.example.com")
  .withServices(exampleServices)
  .withVersionConfig({
    position: 'prefix',
    defaultVersion: 1,
  })
  .build();

export class VersionExampleApi {
  /**
   * Demo các cách sử dụng version khác nhau
   */
  public async demonstrateVersioning() {
    console.log("\n=== Version Configuration Examples ===\n");

    // Example 1: Global version v1, but user.detail uses v2
    console.log("1. Simple version after base URL:");
    const userListInfo = driverWithSimpleVersion.getInfoURL({ id: "user.list" });
    const userDetailInfo = driverWithSimpleVersion.getInfoURL({ id: "user.detail", params: { id: 123 } });
    console.log(`   user.list (v1): ${userListInfo.fullUrl}`);
    console.log(`   user.detail (v2): ${userDetailInfo.fullUrl}`);

    // Example 2: Version before endpoint
    console.log("\n2. Version before endpoint:");
    const userListInfo2 = driverWithVersionBeforeEndpoint.getInfoURL({ id: "user.list" });
    console.log(`   user.list: ${userListInfo2.fullUrl}`);

    // Example 3: Custom template with /api/ prefix
    console.log("\n3. Custom template with /api/ prefix:");
    const userListInfo3 = driverWithCustomTemplate.getInfoURL({ id: "user.list" });
    console.log(`   user.list: ${userListInfo3.fullUrl}`);

    // Example 4: No prefix (just number)
    console.log("\n4. No version prefix:");
    const userListInfo4 = driverWithNoPrefix.getInfoURL({ id: "user.list" });
    console.log(`   user.list: ${userListInfo4.fullUrl}`);

    // Example 5: Subdomain versioning
    console.log("\n5. Subdomain versioning:");
    const userListInfo5 = driverWithSubdomainVersion.getInfoURL({ id: "user.list" });
    console.log(`   user.list: ${userListInfo5.fullUrl}`);

    console.log("\n=== End Examples ===\n");
  }
}
