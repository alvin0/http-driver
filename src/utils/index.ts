import { create } from "apisauce";
import * as qs from "qs";
import type {
  CompiledServiceInfo,
  CompileUrlResult,
  DriverConfig,
  MethodAPI,
  ResponseFormat,
  ServiceApi,
  ServiceUrlCompile,
  UrlBuilder,
} from "./driver-contracts";

/**
 * Replaces placeholders in a URL with corresponding parameter values.
 *
 * @param {string} url - The URL template containing placeholders in the format `{param}`.
 * @param {Record<string, string>} params - An object where keys correspond to parameter names in the URL and values are the replacements.
 * @returns {string} - The URL with all placeholders replaced by their corresponding parameters.
 */
export function replaceParamsInUrl(
  url: string,
  params: Record<string, string>
): string {
  return url.replace(
    /\{(\w+)\}/g,
    (match: string, paramName: string) => params[paramName]
  );
}

/**
 * Finds a service by ID within a list of services.
 *
 * @param {ServiceApi[]} services - An array of service API objects.
 * @param {string} idToFind - The ID of the service to find.
 * @returns {ServiceApi | null} - The service object if found, otherwise null.
 */
export function findServiceApi(
  services: ServiceApi[],
  idToFind: string
): ServiceApi | null {
  const service = services.find((service) => service.id === idToFind);
  if (service) {
    return service;
  } else {
    return null;
  }
}

/**
 * Compiles service information based on the service ID and an array of services.
 *
 * @param {ServiceUrlCompile} idService - The service identifier with parameters.
 * @param {ServiceApi[]} services - The array of service configurations.
 * @returns {CompiledServiceInfo | null} - An object containing the compiled service URL, method, version, and options, or null if the service is not found.
 */
export function compileService(
  idService: ServiceUrlCompile,
  services: ServiceApi[]
): CompiledServiceInfo | null {
  const serviceExec = findServiceApi(services, idService.id);

  if (serviceExec) {
    return {
      url: replaceParamsInUrl(serviceExec.url, idService.params ?? {}),
      methods: serviceExec.method,
      version: serviceExec.version,
      options: serviceExec.options ?? {},
    };
  }

  return null;
}

/**
 * Compiles the full URL and request details for a given service.
 *
 * @param {DriverConfig} configServices - Configuration object containing baseURL and services.
 * @param {ServiceUrlCompile} idService - The service identifier with parameters.
 * @param {any} [payload] - Optional request payload.
 * @param {object} [options] - Additional request options such as headers.
 * @returns {CompileUrlResult | null} - The compiled URL information or null if the service is not found.
 */
export function compileUrlByService(
  configServices: DriverConfig,
  idService: ServiceUrlCompile,
  payload?: any,
  options?: { [key: string]: any }
): CompileUrlResult | null {
  const apiInfo = compileService(idService, configServices.services);

  if (apiInfo != null) {
    return compileUrl(
      configServices.baseURL + "/" + apiInfo.url,
      apiInfo.methods,
      payload ?? {},
      options
    );
  }

  console.error(`Service ${idService.id} in driver not found`);

  return null;
}

/**
 * Formats a response object with standard details including status, data, and error information.
 *
 * @param {ResponseFormat<any | null>} response - An object containing response details such as status, data, headers, etc.
 * @returns {ResponseFormat} - A formatted response object.
 */
export function responseFormat({
  status,
  data,
  headers,
  originalError,
  duration,
  problem,
}: ResponseFormat<any | null>): ResponseFormat {
  let ok: boolean = false;

  if (status >= 200 && status <= 299) {
    ok = true;
  }

  return {
    ok: ok,
    problem: problem,
    originalError: originalError,
    data: data,
    status: status,
    headers: headers,
    duration: duration,
  } as ResponseFormat;
}

/**
 * Compiles a URL using a payload as query parameters if the method is GET.
 *
 * @param {string} url - The base URL.
 * @param {MethodAPI} method - The HTTP method (e.g., GET, POST).
 * @param {object} [payload] - Request payload to be sent.
 * @param {object} [options] - Additional request options.
 * @returns {CompileUrlResult} - An object containing the compiled URL, method, payload, options, and pathname.
 */
export function compileUrl(
  url: string,
  method: MethodAPI,
  payload?: { [key: string]: object | string },
  options?: { [key: string]: object | string }
): CompileUrlResult {
  let optionRequest = options ?? {};

  if (Object.keys(payload ?? {}).length > 0 && method === "get") {
    // compile query string
    const queryString = qs.stringify(payload);
    // clear payload
    payload = {};
    // generate url
    url = url + "?" + queryString;
  }

  return {
    url: url,
    payload: payload ?? {},
    method: method,
    pathname: url,
    options: optionRequest,
  };
}

/**
 * Formats the payload based on the specified content type.
 *
 * Depending on the content type, the function converts the payload into a suitable
 * format for HTTP transmission, such as a JSON string or FormData.
 *
 * @param {string} contextType - The content type of the request (e.g., "application/json", "multipart/form-data").
 * @param {object} payload - The payload object to be formatted.
 * @returns {string | FormData} - The formatted payload as a string for JSON, or as FormData for multipart data.
 */
export function compileBodyFetchWithContextType(
  contextType: string,
  payload: { [key: string]: any }
): string | FormData {
  switch (contextType) {
    case "multipart/form-data":
      return objectToFormData(payload);
    case "application/json":
      return JSON.stringify(payload);
    default:
      return JSON.stringify(payload);
  }
}

/**
 * Performs an HTTP fetch request using the given URL builder, payload, and options.
 *
 * @param {UrlBuilder} urlBuilder - An object defining URL and request method.
 * @param {object} [payload] - The request payload.
 * @param {object} [options] - Additional fetch options like headers.
 * @returns {Promise<ResponseFormat>} - A promise resolving to the standardized response format.
 */
export async function httpClientFetch(
  urlBuilder: UrlBuilder,
  payload?: {
    [key: string]: string | object;
  },
  options?: {
    [key: string]: any;
  }
): Promise<ResponseFormat<any>> {
  const finalUrl = replaceParamsInUrl(urlBuilder.url, urlBuilder.param ?? {});
  const request = compileUrl(finalUrl, urlBuilder.method, payload, options);
  let requestOptions = { ...options };

  if (!requestOptions.headers?.hasOwnProperty("Content-Type")) {
    requestOptions.headers = {
      ...requestOptions.headers,
      "Content-Type": "application/json",
    };
  }

  try {
    if (request.method.toUpperCase() != "GET") {
      requestOptions = {
        ...requestOptions,
        method: request.method.toUpperCase(),
        body: compileBodyFetchWithContextType(
          requestOptions.headers?.["Content-Type"].toLowerCase(),
          request.payload
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

    const startFetchTime = performance.now();
    const res = await fetch(request.url, requestOptions);
    const endFetchTime = performance.now();
    const duration = parseFloat((endFetchTime - startFetchTime).toFixed(2));
    let resText: string | null = null;
    let data: string | null = null;

    try {
      resText = await res.text();
      data =
        JSON.parse(resText) == undefined ? resText : JSON.parse(resText);
    } catch (error) {
      data = resText;
    }

    if (!res.ok) {
      return responseFormat({
        ok: res.ok,
        duration: duration,
        status: res.status,
        headers: res.headers,
        data: data,
        problem: res.statusText,
        originalError: res.statusText,
      });
    }

    return responseFormat({
      ok: res.ok,
      duration: duration,
      status: res.status,
      headers: res.headers,
      data: data,
      problem: null,
      originalError: null,
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
}

/**
 * Removes null and undefined values from an object, recursively processing nested objects.
 *
 * @param {T} obj - The object to clean.
 * @returns {T} - The cleaned object without null or undefined values.
 */
export function removeNullValues<T extends Record<string, any>>(obj: T): T {
  const result: Record<string, any> = {};

  for (const key in obj) {
    const value = obj[key];

    if (value !== null && value !== undefined) {
      if (typeof value === "object" && !Array.isArray(value)) {
        // Recursively remove null values for nested objects
        result[key] = removeNullValues(value as Record<string, any>);
      } else {
        result[key] = value;
      }
    }
  }

  return result as T;
}

/**
 * Converts an object payload to FormData, handling nested objects and arrays.
 *
 * @param {any} payload - The payload to convert to FormData.
 * @param {FormData} [formData] - The FormData object to append to (default is a new FormData instance).
 * @param {string | null} [parentKey] - The key of the parent object in a nested structure.
 * @returns {FormData} - FormData populated with the payload data.
 */
function objectToFormData(
  payload: any,
  formData: FormData = new FormData(),
  parentKey: string | null = null
): FormData {
  // remove property has null value
  payload = removeNullValues(payload);

  for (const key in payload) {
    if (payload.hasOwnProperty(key)) {
      const value = payload[key];
      const formKey = parentKey ? `${parentKey}.${key}` : key;

      if (Array.isArray(value)) {
        value.forEach((subValue: any, index: number) => {
          if (subValue instanceof File) {
            formData.append(`${formKey}[${index}]`, subValue);
          } else if (typeof value === "object" && value !== null) {
            objectToFormData(subValue, formData, `${formKey}[${index}]`);
          } else {
            formData.append(`${formKey}[${index}]`, String(value));
          }
        });
      } else if (typeof value === "object" && value !== null) {
        objectToFormData(value, formData, formKey);
      } else {
        formData.append(formKey, String(value));
      }
    }
  }
  return formData;
}

export const httpClientApiSauce = create({
  baseURL: ""
});
