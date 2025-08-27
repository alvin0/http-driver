// Test type inference for HttpDriver
import { AxiosInstance } from 'axios';
import { DriverBuilder, HttpDriverInstance, MethodAPI } from '../src/index';

describe('Type Inference Tests', () => {
  it('should properly infer types for driver methods', () => {
    // Test builder pattern with type inference
    const driver = new DriverBuilder()
      .withBaseURL('https://api.example.com')
      .withServices([
        { id: 'getUser', url: 'users/{id}', method: MethodAPI.get },
        { id: 'createUser', url: 'users', method: MethodAPI.post }
      ])
      .build();

    // Export type checking
    type DriverType = typeof driver;
    type ExpectedType = HttpDriverInstance & AxiosInstance;

    // This should not cause type error if types match correctly
    const _typeCheck: ExpectedType = driver;

    // Basic type checking
    expect(typeof driver.execService).toBe('function');
    expect(typeof driver.execServiceByFetch).toBe('function');
    expect(typeof driver.getInfoURL).toBe('function');
    expect(typeof driver.get).toBe('function'); // AxiosInstance method
    
    // URL info should be properly typed
    const urlInfo = driver.getInfoURL({ id: 'getUser', params: { id: '1' } });
    expect(typeof urlInfo.fullUrl).toBe('string');
    expect(typeof urlInfo.pathname).toBe('string');
  });
});

