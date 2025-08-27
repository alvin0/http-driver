import { runAdvancedSamples } from "./src/app/advanced-samples";
import { DummyJSONApi } from "./src/app/api-dummpyjson";
import { JsonPlaceholderApi } from "./src/app/api-jsonplaceholder";
import { runFullBuilderDemo } from "./src/app/full-builder-demo";
import { runVersionBuilderExamples } from "./src/app/version-builder-examples";
import { VersionExampleApi } from "./src/app/version-examples";

/**
 * Main function to call both APIs sequentially
 */
async function main() {
  // Initialize API instances
  const dummyApi = new DummyJSONApi();
  const jsonPlaceholderApi = new JsonPlaceholderApi();
  const versionApi = new VersionExampleApi();

  console.log("Starting DummyJSON API calls...");
  await dummyApi.dummyJSONCaller();

  console.log("\nStarting JSONPlaceholder API calls...");
  await jsonPlaceholderApi.jsonPlaceholderCaller();

  console.log("\nStarting Advanced Samples...");
  await runAdvancedSamples();

  console.log("\nStarting Full Builder Demo...");
  await runFullBuilderDemo();

  console.log("\nStarting Version Configuration Examples...");
  await versionApi.demonstrateVersioning();

  console.log("\nStarting Version Builder Examples...");
  runVersionBuilderExamples();
}

// Run the main function and catch any errors
main().catch((error) => {
  console.error("Error in main:", error);
  process.exit(1);
});
