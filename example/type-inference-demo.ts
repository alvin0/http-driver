// Example demonstrating type inference after build
import { DriverBuilder, MethodAPI } from '../src/index';

// Create driver with proper typing
const apiDriver = new DriverBuilder()
  .withBaseURL('https://jsonplaceholder.typicode.com')
  .withServices([
    { 
      id: 'getUser', 
      url: 'users/{id}', 
      method: MethodAPI.get 
    },
    { 
      id: 'createPost', 
      url: 'posts', 
      method: MethodAPI.post 
    }
  ])
  .build(); // Returns HttpDriverInstance & AxiosInstance

async function demonstrateTypes() {
  console.log('=== Type Inference Demo ===\n');

  // Test execService (Axios) - should have full type inference
  console.log('1. Using execService (Axios):');
  const userResult = await apiDriver.execService(
    { id: 'getUser', params: { id: '1' } }
  );
  
  // TypeScript should infer these properties
  console.log(`   - ok: ${userResult.ok} (type: boolean)`);
  console.log(`   - status: ${userResult.status} (type: number)`);
  console.log(`   - data type: ${typeof userResult.data}`);
  console.log(`   - duration: ${userResult.duration}ms (type: number)`);

  // Test execServiceByFetch - should have full type inference  
  console.log('\n2. Using execServiceByFetch (Fetch):');
  const postResult = await apiDriver.execServiceByFetch(
    { id: 'createPost' },
    { title: 'Test Post', body: 'Test content', userId: 1 }
  );
  
  // TypeScript should infer these properties
  console.log(`   - ok: ${postResult.ok} (type: boolean)`);
  console.log(`   - status: ${postResult.status} (type: number)`);
  console.log(`   - has data: ${postResult.data !== null}`);

  // Test getInfoURL - should have proper return type
  console.log('\n3. Using getInfoURL:');
  const urlInfo = apiDriver.getInfoURL(
    { id: 'getUser', params: { id: '1' } }
  );
  
  // TypeScript should infer these properties
  console.log(`   - fullUrl: ${urlInfo.fullUrl} (type: string | null)`);
  console.log(`   - method: ${urlInfo.method} (type: MethodAPI | null)`);

  // Test that driver also has Axios instance methods
  console.log('\n4. Direct Axios methods available:');
  console.log(`   - Has get method: ${typeof apiDriver.get === 'function'}`);
  console.log(`   - Has post method: ${typeof apiDriver.post === 'function'}`);
  console.log(`   - Has interceptors: ${typeof apiDriver.interceptors === 'object'}`);

  return { userResult, postResult, urlInfo };
}

// Export for testing
export { apiDriver, demonstrateTypes };

// Run if called directly
if (require.main === module) {
  demonstrateTypes()
    .then(() => console.log('\n✅ Type inference demo completed successfully!'))
    .catch(console.error);
}
