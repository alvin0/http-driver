import type { ApiResponse, ApisauceInstance, AsyncRequestTransform, AsyncResponseTransform } from "apisauce";
import { AxiosRequestConfig } from "axios";
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
    withAddAsyncRequestTransformAxios(callback: (transform: AsyncRequestTransform) => void): this;
    withAddAsyncResponseTransformAxios(callback: (transform: AsyncResponseTransform) => void): this;
    withAddRequestTransformAxios(callback: (request: AxiosRequestConfig) => void): this;
    withAddResponseTransformAxios(callback: (response: ApiResponse<any>) => void): this;
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
        execService: (idService: ServiceUrlCompile<string>, payload?: any, options?: {
            [key: string]: any;
        } | undefined) => Promise<ResponseFormat<any>>;
        execServiceByFetch: (idService: ServiceUrlCompile<string>, payload?: any, options?: {
            [key: string]: any;
        } | undefined) => Promise<ResponseFormat<any>>;
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
