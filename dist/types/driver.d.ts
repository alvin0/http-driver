import { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
export declare enum MethodAPI {
    get = "get",
    delete = "delete",
    head = "head",
    post = "post",
    put = "put",
    patch = "patch",
    link = "link",
    unlink = "unlink"
}
export interface ServiceApi {
    id: string;
    url: string;
    method: MethodAPI;
    version?: number | string;
    options?: {
        [key: string]: any;
    };
    showSuccess?: boolean;
}
export interface ServiceUrlCompile<T = string> {
    id: T | string;
    params?: {
        [key: string]: any;
    };
}
export interface DriverInformation {
    baseURL: string;
    services: any;
    [key: string]: any;
}
/**
 * Problem code set used for normalized error mapping.
 * This replaces apisauce's PROBLEM_CODE.
 */
export type PROBLEM_CODE = "CLIENT_ERROR" | "SERVER_ERROR" | "TIMEOUT_ERROR" | "NETWORK_ERROR" | "UNKNOWN_ERROR";
/**
 * Headers record type replacement for apisauce HEADERS in HttpDriverResponse.
 */
export type HEADERS = Record<string, string>;
/**
 * ApiResponse-like shape exposed to Axios response transforms, replacing apisauce ApiResponse.
 */
export interface ApiResponseLike<T = any> {
    ok: boolean;
    status: number;
    data: T | null;
    headers?: Record<string, string> | Headers | null;
    config?: AxiosRequestConfig;
    problem?: string | null;
    originalError?: any;
    duration?: number;
}
/**
 * Registrar types for async transforms (replaces apisauce Async*Transform types).
 * Consumers call the provided registrar with their transform function.
 */
export type AsyncRequestTransform = (transform: (request: AxiosRequestConfig) => void | Promise<void>) => void;
export type AsyncResponseTransform = (transform: (response: AxiosResponse) => void | Promise<void>) => void;
export interface VersionConfig {
    /**
     * Position where version should be injected in the URL
     * - 'after-base': baseURL/v1/endpoint (default)
     * - 'before-endpoint': baseURL/endpoint/v1
     * - 'prefix': v1.baseURL/endpoint
     * - 'custom': use custom template
     */
    position?: 'after-base' | 'before-endpoint' | 'prefix' | 'custom';
    /**
     * Custom template for version placement
     * Use {baseURL}, {version}, {endpoint} as placeholders
     * Example: "{baseURL}/api/{version}/{endpoint}"
     */
    template?: string;
    /**
     * Version prefix (default: 'v')
     * Set to empty string to use version without prefix
     */
    prefix?: string;
    /**
     * Global version to apply to all services without explicit version
     */
    defaultVersion?: string | number;
}
export interface DriverConfig {
    baseURL: string;
    services: ServiceApi[];
    withCredentials?: boolean;
    versionConfig?: VersionConfig;
    addRequestTransformAxios?: (request: AxiosRequestConfig) => void;
    addTransformResponseAxios?: (response: ApiResponseLike<any>) => void;
    addAsyncRequestTransform?: AsyncRequestTransform;
    addAsyncResponseTransform?: AsyncResponseTransform;
    handleInterceptorErrorAxios?: (axiosInstance: any, processQueue: (error: any, token: string | null) => void, isRefreshing: boolean) => (error: any) => Promise<any>;
    addTransformResponseFetch?: (response: ResponseFormat) => ResponseFormat;
    addRequestTransformFetch?: (url: string, requestOptions: {
        [key: string]: any;
    }) => {
        url: string;
        requestOptions: {
            [key: string]: any;
        };
    };
    [key: string]: any;
}
export interface HttpDriverResponse<T> {
    duration: number;
    problem: null;
    originalError: null;
    ok: boolean;
    status: number;
    messageFieldValidate: DataObject;
    data?: T;
    headers?: HEADERS;
    config?: AxiosRequestConfig;
}
interface DataObject {
    [key: string]: any;
}
export interface BaseApiResponse {
    ok: boolean;
    problem: string | null;
    originalError: string | null;
    data: any | null;
    status: number;
    headers: Headers | null;
    duration: number;
}
export interface UrlBuilder {
    url: string;
    method: MethodAPI;
    param?: {
        [key: string]: any;
    };
}
export interface CompileUrlResult {
    url: string;
    payload: {
        [key: string]: any;
    };
    method: MethodAPI;
    pathname: string;
    options: {
        [key: string]: object | string;
    };
}
export interface ResponseFormat<T = any> {
    ok: boolean;
    problem: string | null | PROBLEM_CODE;
    originalError: string | null | AxiosError;
    data: T;
    status: number;
    config?: AxiosRequestConfig;
    headers?: Headers | null;
    duration: number;
}
export interface CompiledServiceInfo {
    url: string;
    methods: MethodAPI;
    version: number | string | undefined;
    options: Record<string, any>;
}
export {};
