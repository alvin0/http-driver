import type { ApisauceInstance } from "apisauce";
import type { ResponseFormat, ServiceApi, ServiceUrlCompile } from "./utils/driver-contracts";
export interface DriverResponse {
    ok: boolean;
    problem: string;
    originalError: Error | null;
    data: any | null;
    status: number;
    headers: Headers | null;
    duration: number;
}
export declare class DriverBuilder {
    private config;
    withBaseURL(baseURL: string): this;
    withServices(services: ServiceApi[]): this;
    withAddRequestTransformAxios(callback: (response: any) => void): this;
    withAddTransformResponseAxios(callback: (response: any) => void): this;
    withHandleInterceptorErrorAxios(callback: (axiosInstance: any, processQueue: (error: any, token: string | null) => void, isRefreshing: boolean) => (error: any) => Promise<any>): this;
    withAddTransformResponseFetch(callback: (response: ResponseFormat) => ResponseFormat): this;
    withAddRequestTransformFetch(callback: (url: string, requestOptions: {
        [key: string]: any;
    }) => {
        url: string;
        requestOptions: {
            [key: string]: any;
        };
    }): this;
    build(): ApisauceInstance & {
        /**
         * Executes a service call based on the service configuration.
         *
         * This function resolves the URL and method details of a service by
         * calling `compileUrlByService` and then executes the service call
         * using these details. If the service cannot be found, it returns
         * an error response using `responseFormat`.
         *
         * @param idService - An object containing the service ID and other relevant identifying information.
         * @param payload - Optional data to be passed with the service request. Can be in any format as required by the specific service.
         * @param options - Additional request options, such as headers, that may be needed for the request.
         *
         * @returns A promise that resolves to the result of the service call. This will return a formatted response if the service cannot be found, or the promise returned by executing the service call.
         */
        execService: (idService: ServiceUrlCompile<string>, payload?: any, options?: {
            [key: string]: any;
        } | undefined) => Promise<ResponseFormat<any>>;
        /**
         * Executes a service call using the Fetch API based on service configuration.
         *
         * This function constructs the service URL and options by calling `compileUrlByService`
         * and then performs the service call using Fetch. It handles both success and error cases,
         * providing a standardized response format.
         *
         * @param idService - An object containing the service ID and other relevant identifying information.
         * @param payload - Optional data to be sent with the request. This data is formatted according to the request's content type.
         * @param options - Additional options for the request, such as custom headers.
         *
         * @returns A promise that resolves to the response of the fetch call. If the fetch operation fails, the promise resolves to an error response formatted by `responseFormat`.
         */
        execServiceByFetch: (idService: ServiceUrlCompile<string>, payload?: any, options?: {
            [key: string]: any;
        } | undefined) => Promise<ResponseFormat<any>>;
        /**
         * Retrieves the full URL and request details for a specified service.
         *
         * This function constructs the full URL and other pertinent information
         * for a given service by utilizing the service configuration. If the
         * service method is 'GET' and payload data is provided, it appends the
         * payload as query parameters to the URL.
         *
         * @param {ServiceUrlCompile} idService - An object containing the service ID and other relevant identifying information.
         * @param {any} [payload] - Optional data to be converted into query parameters if the service method is 'GET'.
         *
         * @returns {object} - An object containing the following properties:
         *  - `fullUrl`: The complete URL including the base URL and service-specific path.
         *  - `pathname`: The service-specific path of the URL.
         *  - `method`: The HTTP method (e.g., 'GET', 'POST') associated with the service.
         *  - `payload`: The payload object (may be modified to include query parameters).
         *  - If the service cannot be found, returns an object with `fullUrl`, `method`, `url`, and `payload` set to `null`.
         */
        getInfoURL: (idService: ServiceUrlCompile<string>, payload?: any) => {
            fullUrl: string;
            pathname: string;
            method: import("./utils/driver-contracts").MethodAPI;
            payload: any;
            url?: undefined;
        } | {
            fullUrl: null;
            method: null;
            url: null;
            payload: null;
            pathname?: undefined;
        };
    };
}
