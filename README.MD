# HttpDriver

## Installer

```bash
    npm i @alvin0/http-driver
```

## Overview

`HttpDriver` is a library designed to streamline API management by organizing interactions on a per-service basis. It effectively combines `apisauce` with `axios` while also providing support for `fetch`, giving you the flexibility to choose the method that best suits your needs.

### Key Components

1. **Service**: Represents an individual API endpoint. Defining services helps organize API interactions by grouping related endpoints, making your codebase more maintainable and comprehensible.

2. **Driver**: Serves as a configuration hub for your services. It allows you to specify a base URL and register all your services, setting up a solid foundation for making HTTP requests.

3. **DriverBuilder**: This is the final and crucial step, transforming your configuration into a Promise-based HTTP client. The `DriverBuilder` allows for customization with request and response transformations, and it enables the use of interceptors specifically tailored for either `axios` or `fetch`.

### 3-Step Process to Build a Driver

To successfully build and use a driver, follow these three essential steps:

1. **Define Services**: Begin by specifying each API endpoint within your application, detailing the URL, HTTP method, and any identifiers.

2. **Register the Driver**: Set up the driver by linking it to the defined services and specifying a base URL.

3. **Build with DriverBuilder**: Use `DriverBuilder` to compile the driver into an operational HTTP client, customizing it with necessary request/response transformations and interceptors.

By following this structured approach, you leverage `HttpDriver` to create a powerful, configurable API client ready to handle a variety of HTTP requests and responses in a seamless manner.

## Register and Build a Driver with Services

Here's how you can register services and create a driver using `HttpDriver`.

### Define Your Services:

Start by describing each API endpoint. You will specify the endpoint's URL, HTTP method, and any additional configurations needed.
A `service` is the lowest-level component declared within the `driver`, and it is recommended to declare it for each group of services within an API.

```typescript
import type {
  DriverInformation,
  ServiceApi,
} from "@alvin0/http-driver/dist/utils/driver-contracts";

export default [
  {
    id: "login.auth",
    url: "login/auth",
    method: MethodAPI.post, // HTTP method
    //version: 1
  },
  {
    id: "getUser",
    url: "getUser/{id}", // URL with parameters
    method: MethodAPI.get,
    //version: 1 Note version API
  },
] as ServiceApi[];
```

### Register the Driver

Combine the defined services and a base URL to set up the driver configuration.

```typescript
// Register Driver
import type {
  DriverInformation,
  ServiceApi,
} from "@alvin0/http-driver/dist/utils/driver-contracts";
import AuthenticationServices from "./AuthenticationServices";

const baseURL: string = "http://localhost/api"; // Base URL for the API

// Compile services into the driver configuration
export const services: ServiceApi[] = [
  ...AuthenticationServices,
  // add more services
];

const TestDriver: DriverInformation = {
  baseURL: baseURL,
  services: services,
};

export default TestDriver; // Export the driver configuration
```

### Build the HTTP Client:

`DriverBuilder` is the crucial step for transforming your code configuration into a Promise-based HTTP client. It uniquely supports both `axios` and `fetch`, allowing for flexibility in handling HTTP requests. Furthermore, it provides distinct methods to customize and intercept requests and responses for each approach.

```typescript
export const httpTestApi = new DriverBuilder()
  .withBaseURL(TestDriver.baseURL) // Set the base URL for all requests
  .withServices(TestDriver.services) // Register the services with defined endpoints
  // Axios-specific transformations and interceptors
  .withAddRequestTransformAxios((req) => {
    // Apply custom transformations to Axios requests, if needed
    // if (!req.headers) {
    //   req.headers = {};
    // }

    // req.headers["Your-Header-Name"] = "YourHeaderValue";
    // req.headers["Another-Header"] = "AnotherHeaderValue";
  })
  // Axios-specific transformations and interceptors
  .withAddResponseTransformAxios((response) => {
    // Apply custom transformations to Axios responses, if needed
    // response.data.newProp = "Add new prop";
  })
  // Fetch-specific transformations and interceptors
  .addRequestTransformFetch((url, requestOptions) => {
    // Apply custom transformations to Fetch requests, if needed
    return { url, requestOptions };
  })
  .addTransformResponseFetch((response: ResponseFormat) => {
    // Apply custom transformations to Fetch responses, if needed
    return response;
  })
  .build(); // Compile the driver into a functional HTTP client
```

- **Dual Method Support**: Seamlessly integrates both `axios` and `fetch` methods, offering flexibility based on your application needs.
- **Custom Interceptors and Transformations**:
- **Axios**: Utilize `withAddRequestTransformAxios` and `withAddTransformResponseAxios` to modify requests and responses respectively.
- **Fetch**: Use `addRequestTransformFetch` and `addTransformResponseFetch` for similar transformations but specifically catered to the Fetch API.

This comprehensive setup ensures that you can leverage the strengths of both `axios` and `fetch` while having fine-grained control over request and response handling via customizable interceptors.

## Calling APIs

There are two ways to call the API: using `execService` with `axios` and `execServiceByFetch` with `fetch`.

Both methods have a similar usage and differ only in the underlying instance used to make the API call.

### execService

```typescript
// execService: async (idService: ServiceUrlCompile, payload?: any, options?: { [key: string]: any })

const res = await httpTestApi.execService(
  { id: "login.auth" },
  {
    username: "alvin0",
    password: "chaulamdinhai@gmail.com",
  }
);
```

### execServiceByFetch

```typescript
// execServiceByFetch: async (idService: ServiceUrlCompile, payload?: any, options?: { [key: string]: any })

const res = await httpTestApi.execServiceByFetch(
  { id: "login.auth" },
  {
    username: "alvin0",
    password: "chaulamdinhai@gmail.com",
  }
);
```

## Tips

### Handling Service URL with Parameters

```typescript
export default [
  {
    id: "getUser",
    url: "getUser/{id}",
    method: MethodAPI.get,
  },
] as ServiceApi[];
```

```typescript
const res = await httpTestApi.execServiceByFetch({
  id: "getUser",
  params: { id: "1", other: "alvin0" },
});

// url compile: http://localhost/api/getUser/1?other=alvin0
```

Make sure that the parameter names match the parameter names registered in the service. Any parameters that are not registered will automatically be converted into query parameters.

### Payload Handling

For `GET` methods, payloads convert to query parameters automatically.

```typescript
const res = await httpTestApi.execServiceByFetch(
  { id: "getUser", params: { id: "1" } },
  { other: "alvin0" }
);

// url compile: http://localhost/api/getUser/1?other=alvin0
```

### SWR Hook Example

First, install `swr`:

```bash
    npm i swr
```

```typescript
interface Optional {
  requestOptions?: { [key: string]: object | string };
  swrOptions?: SWRConfiguration;
}

interface IPropHttpDriverSwr {
  keySwr: string;
  idService: ServiceUrlCompile;
  payload?: any;
  optional?: Optional;
}

/**
 * Example:
 *
 * const { data, error, isLoading, mutate } = useDriverSwrAxios({
 *     keySwr: 'id_service'
 *     idService: { id: 'id_service' },
 *     optional: {
 *         swrOptions: {
 *             dedupingInterval: 10 * 60 * 1000, // 10 minutes
 *             revalidateOnFocus: false
 *         }
 *     }
 * })
 *
 */
export default function useDriverSwrAxios({
  keySwr,
  idService,
  payload,
  optional,
}: IPropHttpDriverSwr) {
  const axios = async () =>
    httpTestApi.execService(idService, payload, optional?.requestOptions);
  const swr = useSWR(keySwr, axios, optional?.swrOptions);

  return {
    ...swr,
  };
}
```

### refresh token with interceptor error axios

```typescript
import { httpClientApiSauce } from "@alvin0/http-driver/src/utils";
import { DriverBuilder } from "@alvin0/http-driver";

const interceptorError =
  (
    axiosInstance: any,
    processQueue: (error: any, token: string | null) => void,
    isRefreshing: boolean
  ) =>
  async (error: any) => {
    const _axios = axiosInstance;
    const originalRequest = error.config;

    if (!originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          processQueue(error, null);
          reject(error);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      return new Promise((resolve, reject) => {
        httpClientApiSauce
          .post("/refresh-token")
          .then((refreshAccessToken: any) => {
            originalRequest.headers["Authorization"] =
              "Bearer " + refreshAccessToken.accessToken;

            processQueue(null, refreshAccessToken.accessToken);

            resolve(_axios(originalRequest));
          })
          .catch((err: any) => {
            processQueue(err, null);
            reject(err);
          })
          .then(() => {
            isRefreshing = false;
          });
      });
    }

    return Promise.reject(error);
  };

export const httpApi = new DriverBuilder()
  //... build
  .withHandleInterceptorErrorAxios(interceptorError)
  .build();
```

# Author

### Name: Châu Lâm Đình Ái (alvin0)

### GitHub: https://github.com/alvin0

### email: chaulamdinhai@gmail.com
