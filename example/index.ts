import { DummyJSONApi } from "./src/app/api-dummpyjson";
import { JsonPlaceholderApi } from "./src/app/api-jsonplaceholder";

/**
 * Main function to call both APIs sequentially
 */
async function main() {
  // Initialize API instances
  const dummyApi = new DummyJSONApi();
  const jsonPlaceholderApi = new JsonPlaceholderApi();

  console.log("Starting DummyJSON API calls...");
  await dummyApi.dummyJSONCaller();

  console.log("\nStarting JSONPlaceholder API calls...");
  await jsonPlaceholderApi.jsonPlaceholderCaller();
}

// Run the main function and catch any errors
main().catch((error) => {
  console.error("Error in main:", error);
  process.exit(1);
});