import { describe, expect, test } from '@jest/globals';
import { AxiosInstance } from 'axios';
import type { ResponseFormat } from '../../src/index';
import { DriverBuilder, HttpDriverInstance, MethodAPI } from '../../src/index';

describe('Type Inference Integration Tests', () => {
  test('should properly infer return types after build', async () => {
    // Build driver with proper typing
    const driver = new DriverBuilder()
      .withBaseURL('https://jsonplaceholder.typicode.com')
      .withServices([
        { id: 'getUser', url: 'users/{id}', method: MethodAPI.get },
        { id: 'createPost', url: 'posts', method: MethodAPI.post }
      ])
      .build();

    // Verify that driver conforms to expected type
    const driverType: HttpDriverInstance & AxiosInstance = driver;
    expect(driverType).toBeDefined();

    // Verify execService returns proper type
    const axiosResult: ResponseFormat = await driver.execService({
      id: 'getUser',
      params: { id: '1' }
    });

    // Type inference should work
    expect(typeof axiosResult.ok).toBe('boolean');
    expect(typeof axiosResult.status).toBe('number');
    expect(typeof axiosResult.duration).toBe('number');
    expect(axiosResult.data).toBeDefined();
    expect(axiosResult.headers).toBeDefined();

    // Verify execServiceByFetch returns proper type
    const fetchResult: ResponseFormat = await driver.execServiceByFetch({
      id: 'createPost'
    }, { title: 'test', body: 'test body', userId: 1 });

    // Type inference should work
    expect(typeof fetchResult.ok).toBe('boolean');
    expect(typeof fetchResult.status).toBe('number');
    expect(typeof fetchResult.duration).toBe('number');

    // Verify getInfoURL returns proper type
    const urlInfo = driver.getInfoURL({
      id: 'getUser',
      params: { id: '1' }
    });

    // Type inference should work
    expect(typeof urlInfo.fullUrl).toBe('string');
    expect(typeof urlInfo.method).toBe('string');
    expect(typeof urlInfo.pathname).toBe('string');
    expect(urlInfo.payload).toBeDefined();

    // Verify driver also has Axios methods
    expect(typeof driver.get).toBe('function');
    expect(typeof driver.post).toBe('function');
    expect(typeof driver.put).toBe('function');
    expect(typeof driver.delete).toBe('function');
    expect(driver.interceptors).toBeDefined();
  });

  test('should provide complete TypeScript interface coverage', () => {
    const driver = new DriverBuilder()
      .withBaseURL('https://api.example.com')
      .withServices([
        { id: 'test', url: 'test', method: MethodAPI.get }
      ])
      .build();

    // These should all be available via TypeScript intellisense
    expect(driver.execService).toBeDefined();
    expect(driver.execServiceByFetch).toBeDefined();
    expect(driver.getInfoURL).toBeDefined();

    // Axios instance methods should also be available
    expect(driver.request).toBeDefined();
    expect(driver.get).toBeDefined();
    expect(driver.post).toBeDefined();
    expect(driver.interceptors).toBeDefined();
    expect(driver.defaults).toBeDefined();
  });
});
