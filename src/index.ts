import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import * as qs from "qs";
import type {
  ApiResponseLike,
  AsyncRequestTransform,
  AsyncResponseTransform,
  DriverConfig,
  HttpDriverInstance,
  ResponseFormat,
  ServiceApi,
  ServiceUrlCompile,
  VersionConfig,
} from "./types/driver";
import { MethodAPI } from "./types/driver";
import { MalformedResponseError, NetworkError, TimeoutError } from "./types/errors";
import { handleErrorResponse } from "./utils/error-handler";
import {
  buildUrlWithVersion,
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
  headers: any | null;
  duration: number;
}

// Export types for client usage
export type {
  DriverConfig, HttpDriverInstance,
  ResponseFormat,
  ServiceApi,
  ServiceUrlCompile, VersionConfig
} from "./types/driver";

// Export enum as value
export { MethodAPI } from "./types/driver";

class Driver {
  private config: DriverConfig;
  private axiosInstance: AxiosInstance;

  constructor(config: DriverConfig) {
    this.config = config;

    this.axiosInstance = axios.create({
      withCredentials: config.withCredentials ?? true,
      baseURL: config.baseURL,
    });

    let isRefreshing = false;
    let failedQueue: {
      resolve: (value?: any) => void;
      reject: (reason?: any) => void;
    }[] = [];

    const processQueue = (error: any, token: string | null = null) => {
      failedQueue.forEach((prom) => {
        /* istanbul ignore next */
        if (error) prom.reject(error);
        /* istanbul ignore next */
        else prom.resolve(token);
      });
      failedQueue = [];
    };

    const defaultInterceptorError = (_axiosInstance: any) => async (error: any) => {
      return Promise.reject(error);
    };

    // Response error interceptor (token refresh pattern compatibility)
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      this.config.handleInterceptorErrorAxios
        ? this.config.handleInterceptorErrorAxios(
            this.axiosInstance,
            processQueue,
            isRefreshing
          )
        : defaultInterceptorError(this.axiosInstance)
    );

    // Request interceptor - sync + async transforms compatibility
    this.axiosInstance.interceptors.request.use(
      async (request) => {
        // Sync request transform (apisauce-style)
        if (this.config.addRequestTransformAxios) {
          try {
            this.config.addRequestTransformAxios(request as AxiosRequestConfig);
          } catch (e) {
            // if transform throws, keep consistent behavior: propagate error
            throw e;
          }
        }

        // Async request transforms (align to contract names)
        if (this.config.addAsyncRequestTransform) {
          // The contract expects a function receiving a transform registrar.
          // We emulate apisauce by letting consumer provide a transform that mutates request.
          const transforms: Array<(req: AxiosRequestConfig) => Promise<void> | void> = [];
          const registrar = (transform: (req: AxiosRequestConfig) => Promise<void> | void) => {
            transforms.push(transform);
          };
          try {
            // Invoke consumer to register transforms
            this.config.addAsyncRequestTransform(registrar as any);
            // Apply them sequentially
            for (const t of transforms) {
              await t(request as AxiosRequestConfig);
            }
          } catch (e) {
            throw e;
          }
        }

        return request;
      },
      /* istanbul ignore next */
      (error) => Promise.reject(error)
    );

    // Response interceptor - sync + async transforms compatibility
    this.axiosInstance.interceptors.response.use(
      async (response) => {
        // Sync response transform (apisauce-style): consumer expects ApiResponse-like
        if (this.config.addTransformResponseAxios) {
          const apiResponseLike = Driver.mapAxiosToApiResponseLike(response);
          try {
            this.config.addTransformResponseAxios(apiResponseLike as any);
          } catch (e) {
            // swallow to not block pipeline; apisauce executes transforms but shouldn't break successful response
          }
        }

        // Async response transforms (contract names)
        if (this.config.addAsyncResponseTransform) {
          const transforms: Array<(res: AxiosResponse) => Promise<void> | void> = [];
          const registrar = (transform: (res: AxiosResponse) => Promise<void> | void) => {
            transforms.push(transform);
          };
          try {
            this.config.addAsyncResponseTransform(registrar as any);
            for (const t of transforms) {
              await t(response);
            }
          } catch {
            // ignore to keep success flow
          }
        }

        return response;
      },
      /* istanbul ignore next */
      (error) => Promise.reject(error)
    );

    return this;
  }

  appendExecService(): HttpDriverInstance & AxiosInstance {
    const httpDriver = Object.assign(this.axiosInstance, {
      execService: async <T = any>(
        idService: ServiceUrlCompile,
        payload?: any,
        options?: { [key: string]: any }
      ): Promise<ResponseFormat<T>> => {
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

          // multipart hint compatibility (keep headers removal behavior for fetch only)
          if (
            apiInfo.options.headers &&
            typeof apiInfo.options.headers === "object" &&
            (apiInfo.options.headers as any)?.hasOwnProperty("Content-Type")
          ) {
            const contentType = (apiInfo.options.headers as any)["Content-Type"];
            if (typeof contentType === "string" && contentType.toLowerCase() === "multipart/form-data") {
              // axios handles multipart boundaries automatically with FormData
              // ensure body is FormData if consumer passed plain object
              // no header deletion here (axios expects headers)
            }
          }

          // Support AbortController passed via either `signal` or `abortController.signal` on axios config
          if (!(apiInfo.options as any)?.signal && (apiInfo.options as any)?.abortController?.signal) {
            (apiInfo.options as any).signal = (apiInfo.options as any).abortController.signal;
          }

          const start = performance.now();
          // Use method-call style to maintain backward-compatibility with tests that mock driver.get/post/etc.
          // Properly forward config (including AbortController signal) for GET/DELETE/HEAD.
          const axiosCall = (this.axiosInstance as any)[apiInfo.method]?.bind(this.axiosInstance);
          let rawResult: any;
          if (axiosCall) {
            const methodLower = String(apiInfo.method).toLowerCase();
            if (methodLower === "get" || methodLower === "delete" || methodLower === "head") {
              // For GET-like methods, the 2nd param is the config object.
              rawResult = await axiosCall(apiInfo.pathname, apiInfo.options);
            } else {
              // For methods with body, pass data as 2nd param and config (includes signal) as 3rd.
              rawResult = await axiosCall(apiInfo.pathname, payloadConvert, apiInfo.options);
            }
          } else {
            rawResult = await this.axiosInstance.request({
              method: apiInfo.method,
              url: apiInfo.pathname,
              data: payloadConvert,
              ...apiInfo.options,
            });
          }
          const duration = parseFloat((performance.now() - start).toFixed(2));

          if (!rawResult) {
            return responseFormat({
              ok: false,
              status: 500,
              headers: null,
              duration,
              data: null,
              problem: "No response from service call",
              originalError: "No response from service call",
            } as any);
          }

          // If consumer mocked method to return already-normalized object, pass-through
          if (typeof (rawResult as any).ok === "boolean" && typeof (rawResult as any).status === "number") {
            return rawResult as ResponseFormat;
          }

          const normalized = Driver.axiosResponseToResponseFormat(rawResult as AxiosResponse, duration);
          return normalized;
        } catch (error: any) {
          // AxiosError normalization
          if ((error as AxiosError).isAxiosError) {
            const axErr = error as AxiosError;

            // Treat request cancellation via AbortController as timeout-equivalent
            if ((axErr as any)?.code === "ERR_CANCELED" || (axErr as any)?.name === "CanceledError") {
              return responseFormat(handleErrorResponse(new TimeoutError()));
            }

            const status = axErr.response?.status ?? 0;
            const headers = axErr.response?.headers ?? null;
            const problem = Driver.mapAxiosErrorToProblem(axErr);
            return responseFormat({
              ok: false,
              status,
              headers: Driver.normalizeAxiosHeaders(headers),
              duration: 0,
              data: axErr.response?.data ?? null,
              problem,
              originalError: axErr as any,
            } as any);
          }

          if (error instanceof Error) {
            if (error.message.toLowerCase().includes("timeout")) {
              return responseFormat(handleErrorResponse(new TimeoutError()));
            }
            if (error.message.toLowerCase().includes("network")) {
              return responseFormat(handleErrorResponse(new NetworkError()));
            }
          }
          return responseFormat(handleErrorResponse(error));
        }
      },

      execServiceByFetch: async <T = any>(
        idService: ServiceUrlCompile,
        payload?: any,
        options?: { [key: string]: any }
      ): Promise<ResponseFormat<T>> => {
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

          // apiInfo.url is already absolute (compileUrlByService prepends baseURL)
          let url: string = apiInfo.url;
          let requestOptions = {
            ...apiInfo.options,
          } as {
            [key: string]: any;
          };

          // Support AbortController passed as either `signal` or `abortController.signal`
          if (!requestOptions.signal && requestOptions.abortController?.signal) {
            requestOptions.signal = requestOptions.abortController.signal;
          }

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
                (requestOptions.headers?.["Content-Type"] as string)?.toLowerCase?.(),
                apiInfo.payload
              ),
            };

            if (requestOptions.headers?.hasOwnProperty("Content-Type")) {
              if (
                (requestOptions.headers["Content-Type"] as string).toLowerCase() ==
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
          
          let data: any = null;
          
          // Determine response type from options or content-type header
          const responseType = (options as any)?.responseType;
          const contentType = res.headers.get('content-type')?.toLowerCase() || '';
          
          try {
            if (responseType === 'blob') {
              data = await res.blob();
            } else if (responseType === 'arraybuffer') {
              data = await res.arrayBuffer();
            } else if (responseType === 'text') {
              data = await res.text();
            } else if (contentType.startsWith('image/') || 
                       contentType.startsWith('application/pdf')) {
              // Auto-detect blob types based on content-type when no explicit responseType
              data = await res.blob();
            } else if (contentType.startsWith('application/octet-stream') && !responseType) {
              // Only default to blob for octet-stream if no explicit responseType
              data = await res.blob();
            } else if (contentType.startsWith('text/') && !contentType.includes('application/json')) {
              // Auto-detect text types when no explicit responseType
              data = await res.text();
            } else {
              // Default behavior: try JSON, fallback to text
              const resText = await res.text();
              if (!resText) {
                throw new MalformedResponseError("Malformed response");
              }
              
              // If content-type suggests JSON or no specific type, try to parse as JSON
              if (contentType.includes('application/json') || !contentType) {
                try {
                  data = JSON.parse(resText);
                } catch (err) {
                  throw new MalformedResponseError("Malformed response");
                }
              } else {
                // Non-JSON content type, return as text
                data = resText;
              }
            }
          } catch (err) {
            if (err instanceof MalformedResponseError) {
              throw err;
            }
            throw new MalformedResponseError("Failed to parse response");
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

          // Fetch aborts surface as DOMException with name "AbortError"
          if ((error as any)?.name === "AbortError") {
            return responseFormat(handleErrorResponse(new TimeoutError()));
          }

          if (error instanceof Error) {
            const lower = error.message.toLowerCase();
            if (error.name === "AbortError" || lower.includes("aborted") || lower.includes("canceled")) {
              return responseFormat(handleErrorResponse(new TimeoutError()));
            }
            if (lower.includes('timeout')) {
              return responseFormat(handleErrorResponse(new TimeoutError()));
            }
            
            if (lower.includes('network')) {
              return responseFormat(handleErrorResponse(new NetworkError()));
            }
          }

          return responseFormat(handleErrorResponse(error));
        }
      },

      getInfoURL: (idService: ServiceUrlCompile, payload: any = {}) => {
        const apiInfo = compileService(idService, this.config.services);

        if (apiInfo != null) {
          let fullUrl: string;
          
          // Only use version building if explicitly enabled
          if (this.config.versionConfig?.enabled) {
            // Determine version to use: service version > global default version
            const version = apiInfo.version || this.config.versionConfig?.defaultVersion;
            
            // Build URL with version injection
            fullUrl = buildUrlWithVersion(
              this.config.baseURL,
              apiInfo.url,
              version,
              this.config.versionConfig
            );
          } else {
            // Use simple baseURL + endpoint concatenation (ignore any service versions)
            fullUrl = `${this.config.baseURL}/${apiInfo.url}`;
          }

          if (payload && Object.keys(payload).length > 0 && apiInfo.methods === MethodAPI.get) {
            const queryString = qs.stringify(payload);
            const separator = fullUrl.includes('?') ? '&' : '?';
            return {
              fullUrl: fullUrl + separator + queryString,
              pathname: apiInfo.url + "?" + queryString,
              method: apiInfo.methods,
              payload: null,
            };
          }

          return {
            fullUrl: fullUrl,
            pathname: apiInfo.url,
            method: apiInfo.methods,
            payload: payload,
          };
        }

        return {
          fullUrl: null,
          pathname: null,
          method: null,
          payload: null,
        };
      },
    });

    return httpDriver;
  }

  // Utilities for normalization and compatibility
  private static axiosResponseToResponseFormat<T = any>(
    res: AxiosResponse<T>,
    duration: number
  ): ResponseFormat<T> {
    return responseFormat({
      ok: res.status >= 200 && res.status <= 299,
      status: res.status,
      data: res.data,
      headers: Driver.normalizeAxiosHeaders(res.headers),
      duration,
      problem: res.status >= 400 ? res.statusText : null,
      originalError: null as any,
    } as any);
  }

  private static normalizeAxiosHeaders(headers: any): any | null {
    if (!headers) return null;

    const lowerize = (obj: any) => {
      const norm: Record<string, string> = {};
      Object.entries(obj || {}).forEach(([k, v]) => {
        if (typeof v === "string") {
          norm[k.toLowerCase()] = v;
        } else if (Array.isArray(v)) {
          norm[k.toLowerCase()] = v.join(", ");
        }
      });
      return norm;
    };

    // Handle AxiosHeaders via toJSON, then normalize keys and array values
    if (typeof (headers as any)?.toJSON === "function") {
      return lowerize((headers as any).toJSON());
    }

    // Handle plain objects
    if (typeof headers === "object") {
      return lowerize(headers);
    }

    return null;
  }

  private static mapAxiosToApiResponseLike(res: AxiosResponse) {
    return {
      ok: res.status >= 200 && res.status <= 299,
      problem: res.status >= 400 ? res.statusText : null,
      originalError: null,
      data: res.data,
      status: res.status,
      headers: res.headers,
      config: res.config,
      duration: 0,
    };
  }

  private static mapAxiosErrorToProblem(error: AxiosError): string {
    const code = (error.code || "").toUpperCase();
    if (code.includes("ECONNABORTED") || code.includes("ETIMEDOUT")) return "TIMEOUT_ERROR";
    if (!error.response) return "NETWORK_ERROR";
    const status = error.response.status;
    if (status >= 500) return "SERVER_ERROR";
    if (status >= 400) return "CLIENT_ERROR";
    return "UNKNOWN_ERROR";
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

  withVersionConfig(versionConfig: VersionConfig) {
    this.config.versionConfig = {
      ...versionConfig,
      enabled: versionConfig.enabled !== undefined ? versionConfig.enabled : true
    };
    return this;
  }

  withGlobalVersion(version: string | number) {
    if (!this.config.versionConfig) {
      this.config.versionConfig = {};
    }
    this.config.versionConfig.defaultVersion = version;
    return this;
  }

  withVersionTemplate(template: string) {
    if (!this.config.versionConfig) {
      this.config.versionConfig = {};
    }
    this.config.versionConfig.template = template;
    this.config.versionConfig.position = 'custom';
    this.config.versionConfig.enabled = true;
    return this;
  }

  enableVersioning(enabled: boolean = true) {
    if (!this.config.versionConfig) {
      this.config.versionConfig = {};
    }
    this.config.versionConfig.enabled = enabled;
    return this;
  }

  withAddAsyncRequestTransformAxios(
    callback: AsyncRequestTransform
  ) {
    this.config.addAsyncRequestTransform = callback;

    return this;
  }

  withAddAsyncResponseTransformAxios(
    callback: AsyncResponseTransform
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
    callback: (response: ApiResponseLike<any>) => void
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

  build(): HttpDriverInstance & AxiosInstance {
    if (!this.config.baseURL || !this.config.services.length) {
      throw new Error("Missing required configuration values");
    }

    const driver = new Driver(this.config);

    return driver.appendExecService();
  }
}
