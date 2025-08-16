import { DriverBuilder } from "../../../src/index";
import { MethodAPI } from "../../../src/types/driver";

export function runVersionBuilderExamples() {
  console.log("\n=== Version Builder Examples ===");

  // Example 1: Default behavior (no version building) - versions in services are ignored
  console.log("\n1. Default behavior - No version building (versions ignored):");
  const driverNoVersion = new DriverBuilder()
    .withBaseURL("https://api.example.com")
    .withServices([
      {
        id: "get-users",
        url: "users",
        method: MethodAPI.get,
        version: 1, // This version will be completely ignored
      },
      {
        id: "get-posts", 
        url: "posts",
        method: MethodAPI.get,
        version: 5, // This version will also be ignored
      },
    ])
    .build();

  const urlInfo1a = driverNoVersion.getInfoURL({ id: "get-users" });
  const urlInfo1b = driverNoVersion.getInfoURL({ id: "get-posts" });
  console.log("URL without version building (users):", urlInfo1a.fullUrl);
  console.log("URL without version building (posts):", urlInfo1b.fullUrl);
  // Output: 
  // https://api.example.com/users
  // https://api.example.com/posts

  // Example 2: Explicitly disable version building (even with config)
  console.log("\n2. Explicitly disabled version building:");
  const driverDisabled = new DriverBuilder()
    .withBaseURL("https://api.example.com")
    .withServices([
      {
        id: "get-health",
        url: "health",
        method: MethodAPI.get,
        version: 1,
      },
    ])
    .withVersionConfig({
      enabled: false, // Explicitly disabled
      defaultVersion: 1,
      position: "after-base",
    })
    .build();

  const urlInfo2 = driverDisabled.getInfoURL({ id: "get-health" });
  console.log("URL with versioning disabled:", urlInfo2.fullUrl);
  // Output: https://api.example.com/health

  // Example 3: Enable version building with template
  console.log("\n3. Custom template version building:");
  const driverCustomTemplate = new DriverBuilder()
    .withBaseURL("https://api.example.com")
    .withServices([
      {
        id: "get-users",
        url: "users",
        method: MethodAPI.get,
        version: 1,
      },
    ])
    .withVersionTemplate("{baseURL}/api/{version}/{endpoint}")
    .build();

  const urlInfo3 = driverCustomTemplate.getInfoURL({ id: "get-users" });
  console.log("URL with custom template:", urlInfo3.fullUrl);
  // Output: https://api.example.com/api/v1/users

  // Example 4: Enable version building with standard position
  console.log("\n4. Standard version building (after-base):");
  const driverStandard = new DriverBuilder()
    .withBaseURL("https://api.example.com")
    .withServices([
      {
        id: "get-users",
        url: "users",
        method: MethodAPI.get,
        version: 2,
      },
    ])
    .enableVersioning() // Must explicitly enable
    .withVersionConfig({
      position: "after-base",
      prefix: "v",
    })
    .build();

  const urlInfo4 = driverStandard.getInfoURL({ id: "get-users" });
  console.log("URL with standard versioning:", urlInfo4.fullUrl);
  // Output: https://api.example.com/v2/users

  // Example 5: Version building with global version
  console.log("\n5. Version building with global version:");
  const driverGlobal = new DriverBuilder()
    .withBaseURL("https://api.example.com")
    .withServices([
      {
        id: "get-users",
        url: "users",
        method: MethodAPI.get,
        // No version specified - will use global
      },
      {
        id: "get-posts",
        url: "posts",
        method: MethodAPI.get,
        version: 3, // This overrides global
      },
    ])
    .enableVersioning()
    .withGlobalVersion(2)
    .build();

  const urlInfo5a = driverGlobal.getInfoURL({ id: "get-users" });
  const urlInfo5b = driverGlobal.getInfoURL({ id: "get-posts" });
  console.log("URL with global version:", urlInfo5a.fullUrl);
  console.log("URL with service-specific version:", urlInfo5b.fullUrl);
  // Output: 
  // https://api.example.com/v2/users
  // https://api.example.com/v3/posts

  // Example 6: Complex custom template
  console.log("\n6. Complex custom template:");
  const driverComplex = new DriverBuilder()
    .withBaseURL("https://api.myservice.com")
    .withServices([
      {
        id: "create-user",
        url: "users",
        method: MethodAPI.post,
        version: "beta",
      },
    ])
    .withVersionTemplate("{baseURL}/api/versions/{version}/resources/{endpoint}")
    .build();

  const urlInfo6 = driverComplex.getInfoURL({ id: "create-user" });
  console.log("URL with complex template:", urlInfo6.fullUrl);
  // Output: https://api.myservice.com/api/versions/vbeta/resources/users

  // Example 7: Comparison - Same service with and without version building
  console.log("\n7. Side-by-side comparison:");
  
  const serviceDefinition = {
    id: "get-profile",
    url: "user/profile", 
    method: MethodAPI.get,
    version: 2
  };

  // Without version building
  const driverWithout = new DriverBuilder()
    .withBaseURL("https://api.example.com")
    .withServices([serviceDefinition])
    .build();

  // With version building  
  const driverWith = new DriverBuilder()
    .withBaseURL("https://api.example.com")
    .withServices([serviceDefinition])
    .enableVersioning()
    .build();

  const urlWithout = driverWithout.getInfoURL({ id: "get-profile" });
  const urlWith = driverWith.getInfoURL({ id: "get-profile" });
  
  console.log("Same service WITHOUT version building:", urlWithout.fullUrl);
  console.log("Same service WITH version building:   ", urlWith.fullUrl);
  // Output:
  // https://api.example.com/user/profile
  // https://api.example.com/v2/user/profile

  console.log("\n=== End Version Builder Examples ===\n");
}
