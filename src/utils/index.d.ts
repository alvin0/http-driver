import type { CompileUrlResult, DriverConfig, MethodAPI, ResponseFormat, ServiceApi, ServiceUrlCompile, UrlBuilder } from "./driver-contracts";
/**
 * @param url: string
 * @param params: Record<string
 * @param mixed string>
 *
 * @return string
 */
export declare function replaceParamsInUrl(url: string, params: Record<string, string>): string;
/**
 * @param services: ServiceApi[]
 * @param idToFind: string
 *
 * @return ServiceApi
 */
export declare function findServiceApi(services: ServiceApi[], idToFind: string): ServiceApi | null;
export declare function compileService(idService: ServiceUrlCompile, services: ServiceApi[]): {
    url: string;
    methods: MethodAPI;
    version: number | undefined;
    options: {
        [key: string]: any;
    };
} | null;
export declare function compileUrlByService(configServices: DriverConfig, idService: ServiceUrlCompile, parameters?: any, options?: {
    [key: string]: any;
}): CompileUrlResult | null;
export declare function responseFormat({ status, data, headers, originalError, duration, problem, }: ResponseFormat<any | null>): ResponseFormat<any>;
export declare function compileUrl(url: string, method: MethodAPI, payload?: {
    [key: string]: object | string;
}, options?: {
    [key: string]: object | string;
}): CompileUrlResult;
export declare function compileBodyFetchWithContextType(contextType: string, payload: {
    [key: string]: any;
}): string | FormData;
export declare function httpClientFetch(urlBuilder: UrlBuilder, parameters?: {
    [key: string]: string | object;
}, options?: {
    [key: string]: any;
}): Promise<ResponseFormat<any>>;
export declare function removeNullValues<T extends Record<string, any>>(obj: T): T;
export declare const httpClientApiSauce: import("apisauce").ApisauceInstance;
