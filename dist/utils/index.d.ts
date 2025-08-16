import type { CompiledServiceInfo, CompileUrlResult, DriverConfig, MethodAPI, ResponseFormat, ServiceApi, ServiceUrlCompile, UrlBuilder, VersionConfig } from "../types/driver";
/**
 * Replaces placeholders in a URL with corresponding parameter values.
 *
 * @param {string} url - The URL template containing placeholders in the format `{param}`.
 * @param {Record<string, string>} params - An object where keys correspond to parameter names in the URL and values are the replacements.
 * @returns {string} - The URL with all placeholders replaced by their corresponding parameters.
 */
export declare function replaceParamsInUrl(url: string, params: Record<string, string>): string;
/**
 * Finds a service by ID within a list of services.
 *
 * @param {ServiceApi[]} services - An array of service API objects.
 * @param {string} idToFind - The ID of the service to find.
 * @returns {ServiceApi | null} - The service object if found, otherwise null.
 */
export declare function findServiceApi(services: ServiceApi[], idToFind: string): ServiceApi | null;
/**
 * Compiles service information based on the service ID and an array of services.
 *
 * @param {ServiceUrlCompile} idService - The service identifier with parameters.
 * @param {ServiceApi[]} services - The array of service configurations.
 * @returns {CompiledServiceInfo | null} - An object containing the compiled service URL, method, version, and options, or null if the service is not found.
 */
export declare function compileService(idService: ServiceUrlCompile, services: ServiceApi[]): CompiledServiceInfo | null;
/**
 * Builds URL with version injection based on configuration
 * Returns simple URL concatenation if version building is disabled or not configured
 *
 * @param {string} baseURL - The base URL
 * @param {string} endpoint - The endpoint path
 * @param {string | number | undefined} version - Version to inject
 * @param {VersionConfig} versionConfig - Version configuration
 * @returns {string} - Complete URL with version injected (or simple concatenation if disabled)
 */
export declare function buildUrlWithVersion(baseURL: string, endpoint: string, version: string | number | undefined, versionConfig?: VersionConfig): string;
/**
 * Compiles the full URL and request details for a given service.
 *
 * @param {DriverConfig} configServices - Configuration object containing baseURL and services.
 * @param {ServiceUrlCompile} idService - The service identifier with parameters.
 * @param {any} [payload] - Optional request payload.
 * @param {object} [options] - Additional request options such as headers.
 * @returns {CompileUrlResult | null} - The compiled URL information or null if the service is not found.
 */
export declare function compileUrlByService(configServices: DriverConfig, idService: ServiceUrlCompile, payload?: any, options?: {
    [key: string]: any;
}): CompileUrlResult | null;
/**
 * Formats a response object with standard details including status, data, and error information.
 *
 * @param {ResponseFormat<any | null>} response - An object containing response details such as status, data, headers, etc.
 * @returns {ResponseFormat} - A formatted response object.
 */
export declare function responseFormat({ status, data, headers, originalError, duration, problem, }: ResponseFormat<any | null>): ResponseFormat;
/**
 * Compiles a URL using a payload as query parameters if the method is GET.
 *
 * @param {string} url - The base URL.
 * @param {MethodAPI} method - The HTTP method (e.g., GET, POST).
 * @param {object} [payload] - Request payload to be sent.
 * @param {object} [options] - Additional request options.
 * @returns {CompileUrlResult} - An object containing the compiled URL, method, payload, options, and pathname.
 */
export declare function compileUrl(url: string, method: MethodAPI, payload?: {
    [key: string]: object | string;
}, options?: {
    [key: string]: object | string;
}): CompileUrlResult;
/**
 * Formats the payload based on the specified content type.
 *
 * Depending on the content type, the function converts the payload into a suitable
 * format for HTTP transmission, such as a JSON string or FormData.
 *
 * @param {string} contextType - The content type of the request (e.g., "application/json", "multipart/form-data").
 * @param {object} payload - The payload object to be formatted.
 * @returns {string | FormData} - The formatted payload as a string for JSON, or as FormData for multipart data.
 */
export declare function compileBodyFetchWithContextType(contextType: string, payload: {
    [key: string]: any;
}): string | FormData;
/**
 * Performs an HTTP fetch request using the given URL builder, payload, and options.
 *
 * @param {UrlBuilder} urlBuilder - An object defining URL and request method.
 * @param {object} [payload] - The request payload.
 * @param {object} [options] - Additional fetch options like headers.
 * @returns {Promise<ResponseFormat>} - A promise resolving to the standardized response format.
 */
export declare function httpClientFetch(urlBuilder: UrlBuilder, payload?: {
    [key: string]: string | object;
}, options?: {
    [key: string]: any;
}): Promise<ResponseFormat<any>>;
/**
 * Removes null and undefined values from an object, recursively processing nested objects.
 *
 * @param {T} obj - The object to clean.
 * @returns {T} - The cleaned object without null or undefined values.
 */
export declare function removeNullValues<T extends Record<string, any>>(obj: T): T;
