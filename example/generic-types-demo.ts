// Test file to demonstrate that ResponseFormat<T> is now properly typed
import { DriverBuilder, MethodAPI } from '../src/index';

// Interface for a User object
interface User {
  id: number;
  name: string;
  email: string;
  username: string;
}

// Interface for a Post object
interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
}

// Create driver
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
  .build();

async function demonstrateGenericTypes() {
  console.log('=== Generic Type System Demo ===\n');

  // Test with explicit User type - now T will be User instead of any
  console.log('1. Using execService with explicit User type:');
  const userResult = await apiDriver.execService<User>(
    { id: 'getUser', params: { id: '1' } }
  );
  
  // Now userResult.data should be of type User (not any!)
  console.log(`   - User data type properly inferred: ${typeof userResult.data}`);
  console.log(`   - User name: ${userResult.data?.name || 'N/A'}`);
  console.log(`   - User email: ${userResult.data?.email || 'N/A'}`);

  // Test with explicit Post type
  console.log('\n2. Using execServiceByFetch with explicit Post type:');
  const postResult = await apiDriver.execServiceByFetch<Post>(
    { id: 'createPost' },
    { title: 'Test Post', body: 'Test content', userId: 1 }
  );
  
  // Now postResult.data should be of type Post (not any!)
  console.log(`   - Post data type properly inferred: ${typeof postResult.data}`);
  console.log(`   - Post title: ${postResult.data?.title || 'N/A'}`);
  console.log(`   - Post body: ${postResult.data?.body || 'N/A'}`);

  // Test without explicit type (should default to any)
  console.log('\n3. Without explicit type (defaults to any):');
  const anyResult = await apiDriver.execService(
    { id: 'getUser', params: { id: '1' } }
  );
  
  // This will be ResponseFormat<any>
  console.log(`   - Default any type: ${typeof anyResult.data}`);
}

// Run the demonstration
demonstrateGenericTypes().catch(console.error);

export {};
