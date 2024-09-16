import type { ApisauceInstance } from "apisauce";
import { create } from "apisauce";
import qs from 'qs';
import {
    compileBodyFetchWithContextType,
    compileService,
    compileUrlByService,
    responseFormat
} from "./utils";
import type {
    DriverConfig,
    ServiceApi,
    ServiceUrlCompile
} from "./utils/driver-contracts";

export interface DriverResponse {
    ok: boolean;
    problem: string;
    originalError: Error | null;
    data: any | null;
    status: number;
    headers: Headers | null;
    duration: number;
}
class Driver {
    private config: DriverConfig;
    private apiSauceInstance: ApisauceInstance;

    constructor(config: DriverConfig) {
        this.config = config;

        this.apiSauceInstance = create({
            withCredentials: config.withCredentials ?? true,
            baseURL: config.baseURL
        });

        let isRefreshing: boolean = false;
        let failedQueue: { resolve: (value?: any) => void, reject: (reason?: any) => void }[] = [];

        const processQueue = (error: any, token: string | null = null) => {
            failedQueue.forEach(prom => {
                if (error) {
                    prom.reject(error);
                } else {
                    prom.resolve(token);
                }
            });

            failedQueue = [];
        };

        const interceptorError = (axiosInstance: any) => async (error: any) => {
            return Promise.reject(error);
        };

        this.apiSauceInstance.axiosInstance.interceptors.response.use(
            undefined,
            this.config.handleInterceptorError
                ? this.config.handleInterceptorError(this.apiSauceInstance.axiosInstance, processQueue, isRefreshing)
                : interceptorError(this.apiSauceInstance.axiosInstance)
        );

        this.apiSauceInstance.addRequestTransform((request: any) => {
            // console.log("Start========LogAxiosRequest========Start",request, "End========LogAxiosRequest========End")
            if (this.config.addRequestTransform) {
                this.config.addRequestTransform(request);
            }
        });

        this.apiSauceInstance.addResponseTransform((response: any) => {
            // console.log("Start========LogAxiosResponse========Start",response, "End========LogAxiosResponse========End")
            if (this.config.addTransformResponse) {
                this.config.addTransformResponse(response);
            }
        });


        return this;
    }

    appendExecService() {
        const httpProAskDriver = Object.assign(this.apiSauceInstance, {
            execService: async (idService: ServiceUrlCompile, payload?: any, options?: { [key: string]: any }) => {
                const apiInfo = compileUrlByService(this.config, idService, payload, options);

                if (apiInfo == null) {
                    return responseFormat({
                        ok: false,
                        duration: 0,
                        status: 500,
                        headers: null,
                        data: null,
                        problem: `Service ${idService.id} in driver not found`,
                        originalError: `Service ${idService.id} in driver not found`
                    })
                }

                let payloadConvert: any = apiInfo.payload;

                if (apiInfo.options.headers &&
                    typeof apiInfo.options.headers === 'object' &&
                    apiInfo.options.headers?.hasOwnProperty('Content-Type')) {
                    const contentType = (apiInfo.options.headers as any)['Content-Type'];
                    if (contentType.toLowerCase() === 'multipart/form-data') {
                        // delete apiInfo.options.headers;
                        // payloadConvert = compileBodyFetchWithContextType(contentType.toLowerCase(), apiInfo.payload)
                    }
                }

                return await this.apiSauceInstance[apiInfo.method](apiInfo.pathname, payloadConvert, apiInfo.options);
            },
            execServiceByFetch: async (idService: ServiceUrlCompile, payload?: any, options?: { [key: string]: any }) => {
                const apiInfo = compileUrlByService(this.config, idService, payload, options);

                if (apiInfo == null) {
                    return responseFormat({
                        ok: false,
                        duration: 0,
                        status: 500,
                        headers: null,
                        data: null,
                        problem: `Service ${idService.id} in driver not found`,
                        originalError: `Service ${idService.id} in driver not found`
                    })
                }

                try {
                    let optionsRequest = {
                        ...apiInfo.options
                    } as {
                        [key: string]: any
                    };

                    if (!optionsRequest.headers?.hasOwnProperty('Content-Type')) {
                        optionsRequest.headers = {
                            ...optionsRequest.headers,
                            'Content-Type': 'application/json'
                        }
                    }

                    if (apiInfo.method.toUpperCase() != "GET") {
                        optionsRequest = {
                            ...optionsRequest,
                            method: apiInfo.method.toUpperCase(),
                            body: compileBodyFetchWithContextType(optionsRequest.headers?.['Content-Type'].toLowerCase(), apiInfo.payload)
                        }

                        if (optionsRequest.headers?.hasOwnProperty('Content-Type')) {
                            if (optionsRequest.headers['Content-Type'].toLowerCase() == "multipart/form-data")
                                delete optionsRequest['headers']
                        }
                    }

                    const startFetchTime = performance.now();
                    const res = await fetch(apiInfo.url, optionsRequest);
                    const endFetchTime = performance.now();
                    const duration = parseFloat((endFetchTime - startFetchTime).toFixed(2));
                    let resText = null;
                    let data = null;

                    try {
                        resText = await res.text()
                        data = JSON.parse(resText) == undefined ? resText : JSON.parse(resText);
                    } catch (error) {
                        data = resText
                    }

                    if (!res.ok) {
                        return responseFormat({
                            ok: res.ok,
                            duration: duration,
                            status: res.status,
                            headers: res.headers,
                            data: data,
                            problem: res.statusText,
                            originalError: res.statusText
                        });
                    }

                    return responseFormat({
                        ok: res.ok,
                        duration: duration,
                        status: res.status,
                        headers: res.headers,
                        data: data,
                        problem: null,
                        originalError: null
                    });
                } catch (error) {
                    return responseFormat({
                        ok: false,
                        duration: 0,
                        originalError: `${error}`,
                        problem: `Error fetching data ${error}`,
                        data: null,
                        status: 500,
                    });
                }
            },
            getInfoURL: (idService: ServiceUrlCompile, payload?: any) => {
                const apiInfo = compileService(idService, this.config.services)

                if (apiInfo != null) {
                    if (Object.keys(payload).length > 0 && apiInfo.methods === 'get') {
                        const queryString = qs.stringify(payload)
                        payload = {}
                        apiInfo.url = apiInfo.url + '?' + queryString
                    }

                    return {
                        fullUrl: this.config.baseURL + "/" + apiInfo.url,
                        pathname: apiInfo.url,
                        method: apiInfo.methods,
                        payload: payload
                    }
                }

                return {
                    fullUrl: null,
                    method: null,
                    url: null,
                    payload: null
                }
            }
        });

        return httpProAskDriver;
    }
}

export class DriverBuilder {
    private config: DriverConfig = {
        baseURL: "",
        services: [],
    };

    withBaseURL(baseURL: string) {
        this.config.baseURL = baseURL;
        return this;
    }

    withServices(services: ServiceApi[]) {
        this.config.services = services;
        return this;
    }

    withAddTransformResponse(callback: (response: any) => void) {
        this.config.addTransformResponse = callback;

        return this;
    }

    withAddRequestTransform(callback: (response: any) => void) {
        this.config.addRequestTransform = callback;

        return this;
    }

    withHandleInterceptorError(
        callback: (
            axiosInstance: any,
            processQueue: (error: any, token: string | null) => void,
            isRefreshing: boolean
        ) => (error: any) => Promise<any>) {
        this.config.handleInterceptorError = callback;

        return this;
    }

    build() {
        if (!this.config.baseURL || !this.config.services.length) {
            throw new Error("Missing required configuration values");
        }

        const driver = new Driver(this.config);

        return driver.appendExecService();
    }
}