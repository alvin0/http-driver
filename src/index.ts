import type {
  ApiResponse,
  ApisauceInstance,
  AsyncRequestTransform,
  AsyncResponseTransform
} from "apisauce";
import { create } from "apisauce";
import { AxiosRequestConfig } from "axios";
import * as qs from "qs";
import { MalformedResponseError, NetworkError, TimeoutError } from "./utils/custom-errors";
import type {
  DriverConfig,
  ResponseFormat,
  ServiceApi,
  ServiceUrlCompile,
} from "./utils/driver-contracts";
import { handleErrorResponse } from "./utils/error-handler";
import {
  compileBodyFetchWithContextType,
  compileService,
  compileUrlByService,
  responseFormat,
} from "./utils/index";

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
      baseURL: config.baseURL,
    });

    let isRefreshing: boolean = false;
    let failedQueue: {
      resolve: (value?: any) => void;
      reject: (reason?: any) => void;
    }[] = [];

    const processQueue = (error: any, token: string | null = null) => {
      failedQueue.forEach((prom) => {
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
      this.config.handleInterceptorErrorAxios
        ? this.config.handleInterceptorErrorAxios(
            this.apiSauceInstance.axiosInstance,
            processQueue,
            isRefreshing
          )
        : interceptorError(this.apiSauceInstance.axiosInstance)
    );

    this.apiSauceInstance.addRequestTransform((transform) => {
      if (this.config.addRequestTransformAxios) {
        this.config.addRequestTransformAxios(transform);
      }
    });

    this.apiSauceInstance.addResponseTransform((transform) => {
      if (this.config.addTransformResponseAxios) {
        this.config.addTransformResponseAxios(transform);
      }
    });

    this.apiSauceInstance.addAsyncRequestTransform(async (transform) => {
      if (this.config.addAsyncRequestTransformAxios) {
        await this.config.addAsyncRequestTransformAxios(transform);
      }
    });

    this.apiSauceInstance.addAsyncResponseTransform(async (transform) => {
      if (this.config.addAsyncTransformResponseAxios) {
        await this.config.addAsyncTransformResponseAxios(transform);
      }
    });

    return this;
  }

  appendExecService() {
    const httpProAskDriver = Object.assign(this.apiSauceInstance, {
      execService: async (
        idService: ServiceUrlCompile,
        payload?: any,
        options?: { [key: string]: any }
      ): Promise<ResponseFormat> => {
        try {
          const apiInfo = compileUrlByService(
            this.config,
            idService,
            payload,
            options
          );

          if (apiInfo == null) {
            throw new Error(`Service ${idService.id} in driver not found`);
          }

          let payloadConvert: any = apiInfo.payload;

          if (
            apiInfo.options.headers &&
            typeof apiInfo.options.headers === "object" &&
            apiInfo.options.headers?.hasOwnProperty("Content-Type")
          ) {
            const contentType = (apiInfo.options.headers as any)["Content-Type"];
            if (contentType.toLowerCase() === "multipart/form-data") {
              // delete apiInfo.options.headers;
              // payloadConvert = compileBodyFetchWithContextType(contentType.toLowerCase(), apiInfo.payload)
            }
          }

          const result = await this.apiSauceInstance[apiInfo.method](
            apiInfo.pathname,
            payloadConvert,
            apiInfo.options
          );
          
          if (!result) {
            throw new Error("No response from service call");
          }

          return result as ResponseFormat;
        } catch (error) {
          if (error instanceof Error) {
            if (error.message.toLowerCase().includes('timeout')) {
              return responseFormat(handleErrorResponse(new TimeoutError()));
            }
            if (error.message.toLowerCase().includes('network')) {
              return responseFormat(handleErrorResponse(new NetworkError()));
            }
          }
          return responseFormat(handleErrorResponse(error));
        }
      },

      execServiceByFetch: async (
        idService: ServiceUrlCompile,
        payload?: any,
        options?: { [key: string]: any }
      ): Promise<ResponseFormat> => {
        try {
          const apiInfo = compileUrlByService(
            this.config,
            idService,
            payload,
            options
          );

          if (apiInfo == null) {
            throw new Error(`Service ${idService.id} in driver not found`);
          }

          let url: string = apiInfo.url;
          url = this.config.baseURL + "/" + url;
          let requestOptions = {
            ...apiInfo.options,
          } as {
            [key: string]: any;
          };

          if (!requestOptions.headers?.hasOwnProperty("Content-Type")) {
            requestOptions.headers = {
              ...requestOptions.headers,
              "Content-Type": "application/json",
            };
          }

          if (apiInfo.method.toUpperCase() != "GET") {
            requestOptions = {
              ...requestOptions,
              method: apiInfo.method.toUpperCase(),
              body: compileBodyFetchWithContextType(
                requestOptions.headers?.["Content-Type"].toLowerCase(),
                apiInfo.payload
              ),
            };

            if (requestOptions.headers?.hasOwnProperty("Content-Type")) {
              if (
                requestOptions.headers["Content-Type"].toLowerCase() ==
                "multipart/form-data"
              )
                delete requestOptions["headers"];
            }
          }

          if (this.config.addRequestTransformFetch) {
            ({ url, requestOptions } = this.config.addRequestTransformFetch(
              url,
              requestOptions
            ));
          }

          const startFetchTime = performance.now();
          const res = await fetch(url, requestOptions);
          const endFetchTime = performance.now();
          const duration = parseFloat(
            (endFetchTime - startFetchTime).toFixed(2)
          );
          
          let resText: string | null = null;
          let data: any = null;

          resText = await res.text();
          if (!resText) {
            throw new MalformedResponseError("Malformed response");
          }
          try {
            data = JSON.parse(resText);
            } catch (err) {
              throw new MalformedResponseError("Malformed response");
            }

          const response = responseFormat({
            ok: res.ok,
            duration: duration,
            status: res.status,
            headers: res.headers,
            data: data,
            problem: !res.ok ? res.statusText : null,
            originalError: !res.ok ? res.statusText : null,
          });

          return this.config.addTransformResponseFetch
            ? this.config.addTransformResponseFetch(response)
            : response;
        } catch (error) {
          if (error instanceof MalformedResponseError) {
            return responseFormat(handleErrorResponse(error));
          }

          if (error instanceof Error) {
            if (error.message.toLowerCase().includes('timeout')) {
              return responseFormat(handleErrorResponse(new TimeoutError()));
            }
            
            if (error.message.toLowerCase().includes('network')) {
              return responseFormat(handleErrorResponse(new NetworkError()));
            }
          }

          return responseFormat(handleErrorResponse(error));
        }
      },

      getInfoURL: (idService: ServiceUrlCompile, payload: any = {}) => {
        const apiInfo = compileService(idService, this.config.services);

        if (apiInfo != null) {
          if (payload && Object.keys(payload).length > 0 && apiInfo.methods === "get") {
            const queryString = qs.stringify(payload);
            payload = null;
            apiInfo.url = apiInfo.url + "?" + queryString;
          }

          return {
            fullUrl: this.config.baseURL + "/" + apiInfo.url,
            pathname: apiInfo.url,
            method: apiInfo.methods,
            payload: payload,
          };
        }

        return {
          fullUrl: null,
          method: null,
          url: null,
          payload: null,
        };
      },
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

  withAddAsyncRequestTransformAxios(
    callback: (transform: AsyncRequestTransform) => void
  ) {
    this.config.addAsyncRequestTransform = callback;

    return this;
  }

  withAddAsyncResponseTransformAxios(
    callback: (transform: AsyncResponseTransform) => void
  ) {
    this.config.addAsyncResponseTransform = callback;

    return this;
  }

  withAddRequestTransformAxios(
    callback: (request: AxiosRequestConfig) => void
  ) {
    this.config.addRequestTransformAxios = callback;

    return this;
  }

  withAddResponseTransformAxios(
    callback: (response: ApiResponse<any>) => void
  ) {
    this.config.addTransformResponseAxios = callback;

    return this;
  }

  withHandleInterceptorErrorAxios(
    callback: (
      axiosInstance: any,
      processQueue: (error: any, token: string | null) => void,
      isRefreshing: boolean
    ) => (error: any) => Promise<any>
  ) {
    this.config.handleInterceptorErrorAxios = callback;

    return this;
  }

  withAddTransformResponseFetch(
    callback: (response: ResponseFormat) => ResponseFormat
  ) {
    this.config.addTransformResponseFetch = callback;

    return this;
  }

  withAddRequestTransformFetch(
    callback: (
      url: string,
      requestOptions: { [key: string]: any }
    ) => { url: string; requestOptions: { [key: string]: any } }
  ) {
    this.config.addRequestTransformFetch = callback;

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
