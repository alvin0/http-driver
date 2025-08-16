import axios, { AxiosRequestConfig } from "axios";
import type { ApiResponseLike, AsyncRequestTransform, AsyncResponseTransform, ResponseFormat, ServiceApi, ServiceUrlCompile, VersionConfig } from "./types/driver";
import { MethodAPI } from "./types/driver";
export interface DriverResponse {
    ok: boolean;
    problem: string;
    originalError: Error | null;
    data: any | null;
    status: number;
    headers: any | null;
    duration: number;
}
export declare class DriverBuilder {
    private config;
    withBaseURL(baseURL: string): this;
    withServices(services: ServiceApi[]): this;
    withVersionConfig(versionConfig: VersionConfig): this;
    withGlobalVersion(version: string | number): this;
    withVersionTemplate(template: string): this;
    enableVersioning(enabled?: boolean): this;
    withAddAsyncRequestTransformAxios(callback: AsyncRequestTransform): this;
    withAddAsyncResponseTransformAxios(callback: AsyncResponseTransform): this;
    withAddRequestTransformAxios(callback: (request: AxiosRequestConfig) => void): this;
    withAddResponseTransformAxios(callback: (response: ApiResponseLike<any>) => void): this;
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
    build(): axios.AxiosInstance & {
        execService: (idService: ServiceUrlCompile<string>, payload?: any, options?: {
            [key: string]: any;
        } | undefined) => Promise<ResponseFormat<any>>;
        execServiceByFetch: (idService: ServiceUrlCompile<string>, payload?: any, options?: {
            [key: string]: any;
        } | undefined) => Promise<ResponseFormat<any>>;
        getInfoURL: (idService: ServiceUrlCompile<string>, payload?: any) => {
            fullUrl: string;
            pathname: string;
            method: MethodAPI;
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
