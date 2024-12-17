import type {
  ApiResponse,
  ApisauceInstance,
  AsyncRequestTransform,
  AsyncResponseTransform
} from "apisauce";
import { create } from "apisauce";
import { AxiosRequestConfig } from "axios";
import qs from "qs";
import type {
  DriverConfig,
  ResponseFormat,
  ServiceApi,
  ServiceUrlCompile,
} from "./utils/driver-contracts";
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
      /**
       * Executes a service call based on the service configuration.
       *
       * This function resolves the URL and method details of a service by
       * calling `compileUrlByService` and then executes the service call
       * using these details. If the service cannot be found, it returns
       * an error response using `responseFormat`.
       *
       * @param idService - An object containing the service ID and other relevant identifying information.
       * @param payload - Optional data to be passed with the service request. Can be in any format as required by the specific service.
       * @param options - Additional request options, such as headers, that may be needed for the request.
       *
       * @returns A promise that resolves to the result of the service call. This will return a formatted response if the service cannot be found, or the promise returned by executing the service call.
       */
      execService: async (
        idService: ServiceUrlCompile,
        payload?: any,
        options?: { [key: string]: any }
      ): Promise<ResponseFormat> => {
        const apiInfo = compileUrlByService(
          this.config,
          idService,
          payload,
          options
        );

        if (apiInfo == null) {
          return responseFormat({
            ok: false,
            duration: 0,
            status: 500,
            headers: null,
            data: null,
            problem: `Service ${idService.id} in driver not found`,
            originalError: `Service ${idService.id} in driver not found`,
          });
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

        return (await this.apiSauceInstance[apiInfo.method](
          apiInfo.pathname,
          payloadConvert,
          apiInfo.options
        )) as ResponseFormat;
      },
      /**
       * Executes a service call using the Fetch API based on service configuration.
       *
       * This function constructs the service URL and options by calling `compileUrlByService`
       * and then performs the service call using Fetch. It handles both success and error cases,
       * providing a standardized response format.
       *
       * @param idService - An object containing the service ID and other relevant identifying information.
       * @param payload - Optional data to be sent with the request. This data is formatted according to the request's content type.
       * @param options - Additional options for the request, such as custom headers.
       *
       * @returns A promise that resolves to the response of the fetch call. If the fetch operation fails, the promise resolves to an error response formatted by `responseFormat`.
       */
      execServiceByFetch: async (
        idService: ServiceUrlCompile,
        payload?: any,
        options?: { [key: string]: any }
      ): Promise<ResponseFormat> => {
        const apiInfo = compileUrlByService(
          this.config,
          idService,
          payload,
          options
        );

        if (apiInfo == null) {
          return responseFormat({
            ok: false,
            duration: 0,
            status: 500,
            headers: null,
            data: null,
            problem: `Service ${idService.id} in driver not found`,
            originalError: `Service ${idService.id} in driver not found`,
          });
        }

        try {
          let url: string = apiInfo.url;
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
          let data: string | null = null;

          try {
            resText = await res.text();
            data =
              JSON.parse(resText) == undefined ? resText : JSON.parse(resText);
          } catch (error) {
            data = resText;
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
      /**
       * Retrieves the full URL and request details for a specified service.
       *
       * This function constructs the full URL and other pertinent information
       * for a given service by utilizing the service configuration. If the
       * service method is 'GET' and payload data is provided, it appends the
       * payload as query parameters to the URL.
       *
       * @param {ServiceUrlCompile} idService - An object containing the service ID and other relevant identifying information.
       * @param {any} [payload] - Optional data to be converted into query parameters if the service method is 'GET'.
       *
       * @returns {object} - An object containing the following properties:
       *  - `fullUrl`: The complete URL including the base URL and service-specific path.
       *  - `pathname`: The service-specific path of the URL.
       *  - `method`: The HTTP method (e.g., 'GET', 'POST') associated with the service.
       *  - `payload`: The payload object (may be modified to include query parameters).
       *  - If the service cannot be found, returns an object with `fullUrl`, `method`, `url`, and `payload` set to `null`.
       */
      getInfoURL: (idService: ServiceUrlCompile, payload?: any) => {
        const apiInfo = compileService(idService, this.config.services);

        if (apiInfo != null) {
          if (Object.keys(payload).length > 0 && apiInfo.methods === "get") {
            const queryString = qs.stringify(payload);
            payload = {};
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
