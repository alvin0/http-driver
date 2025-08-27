import { AxiosInstance, AxiosRequestConfig } from "axios";
import type { ApiResponseLike, AsyncRequestTransform, AsyncResponseTransform, HttpDriverInstance, ResponseFormat, ServiceApi, VersionConfig } from "./types/driver";
export interface DriverResponse {
    ok: boolean;
    problem: string;
    originalError: Error | null;
    data: any | null;
    status: number;
    headers: any | null;
    duration: number;
}
export type { DriverConfig, HttpDriverInstance, ResponseFormat, ServiceApi, ServiceUrlCompile, VersionConfig } from "./types/driver";
export { MethodAPI } from "./types/driver";
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
    build(): HttpDriverInstance & AxiosInstance;
}
