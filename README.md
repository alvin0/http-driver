# HttpDriver

## Installer

```bash
    npm i apisauce qs @types/qs 
```

## Target

HttpDriver will help you manage APIs on a per-service basis. HttpDriver utilizes `apisauce` to wrap `axios` and also provides support for `fetch`.

## Make a driver

### Service

A `service` is the lowest-level component declared within the `driver`, and it is recommended to declare it for each group of services within an API.


```typescript
    import { MethodAPI, ServiceApi } from "@/utils/httpDrivers/utils/DriverContracts";

    export default [
        {
            id: "login.auth",
            url: "login/auth",
            method: MethodAPI.post,
            version: 1,
        },
        {
            id: "getUser",
            url: "getUser/{id}",
            method: MethodAPI.get,
            version: 1,
        }
    ] as ServiceApi[]
```

### Register

To use the `services`, you need to create a `driver`. This registration class allows you to customize the API's `baseUrl` and register the `services` used for this driver.

```typescript
    // Register Driver
    import { DriverInformation, ServiceApi } from "@/utils/httpDrivers/utils/DriverContracts";
    import AuthenticationServices from "./AuthenticationServices";

    const baseURL: string = 'http://localhost/api';

    // Register services into the driver.
    export const services: ServiceApi[] = [
        ...AuthenticationServices,
    ]

    const TestDriver: DriverInformation = {
        baseURL: baseURL,
        services: services
    }

    export default TestDriver;
```
### DriverBuilder

`DriverBuilder` is the final step in turning a `driver` into a Promise-based HTTP client class.

```typescript
    export const httpTestApi = new DriverBuilder()
    .withBaseURL(TestDriver.baseURL)
    .withServices(TestDriver.services)
    .withAddRequestTransform((request) => {
        // coding...
    })
    .withAddTransformResponse((response: any) => {
        // coding...
    })
    .build();
```

## Using

There are two ways to call the API: using `execService` with `axios` and `execServiceByFetch` with `fetch`. 

Both methods have a similar usage and differ only in the underlying instance used to make the API call.

### execService 

```typescript
    // execService: async (idService: ServiceUrlCompile, parameters?: any, options?: { [key: string]: any })

    const res = await httpTestApi.execService({ id: "login.auth" }, {
        username: "alvin0",
        password: "chaulamdinhai@gmail.com"
    });
```

### execServiceByFetch 

```typescript
    // execServiceByFetch: async (idService: ServiceUrlCompile, parameters?: any, options?: { [key: string]: any })

    const res = await httpTestApi.execServiceByFetch({ id: "login.auth" }, {
        username: "alvin0",
        password: "chaulamdinhai@gmail.com"
    });
```

## Tips

### Serivce Url Parameters

```typescript
export default [
    {
        id: "getUser",
        url: "getUser/{id}",
        method: MethodAPI.get,
        version: 1,
    }
] as ServiceApi[]
```

```typescript
    const res = await httpTestApi.execServiceByFetch({ id: "getUser", param: { id: '1', other: 'alvin0' } });

    // url compile: http://localhost/api/getUser/1?other=alvin0
```

Make sure that the parameter names match the parameter names registered in the service. Any parameters that are not registered will automatically be converted into query parameters.

### Payload 

Please note that for services with the `GET` method, your payload will be automatically converted into query parameters.

```typescript
    const res = await httpTestApi.execServiceByFetch({ id: "getUser", param: { id: '1'} }, { other: 'alvin0' });

    // url compile: http://localhost/api/getUser/1?other=alvin0
```

### Make a hook with SWR

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
        httpTestApi.execService(
            idService,
            payload,
            optional?.requestOptions
        );
    const swr = useSWR(keySwr, axios, optional?.swrOptions);

    return {
        ...swr
    };
}
```

### refresh token with interceptor error axios

```typescript
import { httpClientApisauce } from "@/utils/httpDrivers/utils";
import { DriverBuilder } from "@/utils/httpDrivers/DriverBuilder";

const interceptorError = (
    axiosInstance: any,
    processQueue: (error: any, token: string | null) => void,
    isRefreshing: boolean
) => async (error: any) => {
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
            httpClientApisauce.post("/refresh-token").then((refreshAccessToken: any) => {
                originalRequest.headers['Authorization'] = 'Bearer ' + refreshAccessToken.accessToken;

                processQueue(null, refreshAccessToken.accessToken);

                resolve(_axios(originalRequest));
            }).catch((err: any) => {
                processQueue(err, null);
                reject(err);
            }).then(() => { isRefreshing = false });
        })
    }

    return Promise.reject(error);
}

export const httpApi = new DriverBuilder()
    //... build
    .withHandleInterceptorError(interceptorError)
    .build();
```


# Author
### Name: Châu Lâm Đình Ái (alvin0)
### email: chaulamdinhai@gmail.com
