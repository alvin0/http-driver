import type { ApisauceInstance } from "apisauce";
import type { ServiceApi, ServiceUrlCompile } from "./utils/driver-contracts";
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
    withAddTransformResponse(callback: (response: any) => void): this;
    withAddRequestTransform(callback: (response: any) => void): this;
    withHandleInterceptorError(callback: (axiosInstance: any, processQueue: (error: any, token: string | null) => void, isRefreshing: boolean) => (error: any) => Promise<any>): this;
    build(): ApisauceInstance & {
        execService: (idService: ServiceUrlCompile<string>, payload?: any, options?: {
            [key: string]: any;
        } | undefined) => Promise<import("./utils/driver-contracts").ResponseFormat<any> | import("apisauce").ApiResponse<unknown, unknown>>;
        execServiceByFetch: (idService: ServiceUrlCompile<string>, payload?: any, options?: {
            [key: string]: any;
        } | undefined) => Promise<import("./utils/driver-contracts").ResponseFormat<any>>;
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
