import { create } from "apisauce";
import QueryString from "qs";
import type {
    CompileUrlResult,
    DriverConfig,
    MethodAPI,
    ResponseFormat,
    ServiceApi,
    ServiceUrlCompile,
    UrlBuilder
} from "./driver-contracts";

/**
 * @param url: string
 * @param params: Record<string
 * @param mixed string>
 *
 * @return string
 */
export function replaceParamsInUrl(url: string, params: Record<string, string>): string {
    return url.replace(/\{(\w+)\}/g, (match: string, paramName: string) => params[paramName]);
}

/**
 * @param services: ServiceApi[]
 * @param idToFind: string
 *
 * @return ServiceApi
 */
export function findServiceApi(services: ServiceApi[], idToFind: string): ServiceApi | null {
    const service = services.find((service) => service.id === idToFind);
    if (service) {
        return service;
    } else {
        return null;
    }
}

export function compileService(idService: ServiceUrlCompile, services: ServiceApi[]) {
    const serviceExec = findServiceApi(services, idService.id);

    if (serviceExec) {
        return {
            url: replaceParamsInUrl(serviceExec.url, idService.param ?? {}),
            methods: serviceExec.method,
            version: serviceExec.version,
            options: serviceExec.options ?? {}
        };
    }

    return null;
}

export function compileUrlByService(
    configServices: DriverConfig,
    idService: ServiceUrlCompile,
    parameters?: any,
    options?: { [key: string]: any }
): (CompileUrlResult | null) {
    const apiInfo = compileService(idService, configServices.services);
    let payload = parameters ?? {};

    if (apiInfo != null) {
        return compileUrl(configServices.baseURL + "/" + apiInfo.url, apiInfo.methods, payload, options);
    }

    console.error(`Service ${idService.id} in driver not found`)

    return null;
}

export function responseFormat(
    { status, data, headers, originalError, duration = 0, problem = null }
        : ResponseFormat<any | null>) {
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

export function compileUrl(url: string,
    method: MethodAPI,
    payload?: { [key: string]: object | string },
    options?: { [key: string]: object | string }): CompileUrlResult {
    let optionRequest = options ?? {}

    if (Object.keys(payload ?? {}).length > 0 && method === 'get') {
        // compile query string
        const queryString = QueryString.stringify(payload);
        // clear payload
        payload = {};
        // generate url 
        url = url + '?' + queryString;
    }

    return {
        url: url,
        payload: payload ?? {},
        method: method,
        pathname: url,
        options: optionRequest
    };
}

export function compileBodyFetchWithContextType(contextType: string, payload: { [key: string]: any }) {
    switch (contextType) {
        case "multipart/form-data":
            return objectToFormData(payload);
        case "application/json":
            return JSON.stringify(payload);
        default:
            return JSON.stringify(payload);
    }
}

export async function httpClientFetch(
    urlBuilder: UrlBuilder,
    parameters?: { [key: string]: string | object },
    options?: { [key: string]: any }
) {
    const finalUrl = replaceParamsInUrl(urlBuilder.url, urlBuilder.param ?? {});
    const request = compileUrl(finalUrl, urlBuilder.method, parameters, options);
    let requestOptions = { ...options };

    if (!requestOptions.headers?.hasOwnProperty('Content-Type')) {
        requestOptions.headers = {
            ...requestOptions.headers,
            'Content-Type': 'application/json'
        };
    }

    try {
        if (request.method.toUpperCase() != "GET") {
            requestOptions = {
                ...requestOptions,
                method: request.method.toUpperCase(),
                body: compileBodyFetchWithContextType(requestOptions.headers?.['Content-Type'].toLowerCase(), request.payload)
            };

            if (requestOptions.headers?.hasOwnProperty('Content-Type')) {
                if (requestOptions.headers['Content-Type'].toLowerCase() == "multipart/form-data")
                    delete requestOptions['headers'];
            }
        }

        const startFetchTime = performance.now();
        const res = await fetch(request.url, requestOptions);
        const endFetchTime = performance.now();
        const duration = parseFloat((endFetchTime - startFetchTime).toFixed(2));
        let resText = null;
        let data = null;

        try {
            resText = await res.text()
            data = JSON.parse(resText) == undefined ? resText : JSON.parse(resText);
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
}

export function removeNullValues<T extends Record<string, any>>(obj: T): T {
    const result: Record<string, any> = {};

    for (const key in obj) {
        const value = obj[key];

        if (value !== null && value !== undefined) {
            if (typeof value === 'object' && !Array.isArray(value)) {
                // Recursively remove null values for nested objects
                result[key] = removeNullValues(value as Record<string, any>);
            } else {
                result[key] = value;
            }
        }
    }

    return result as T;
}

function objectToFormData(payload: any, formData: FormData = new FormData(), parentKey: string | null = null): FormData {
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
                    }
                    else if (typeof value === 'object' && value !== null) {
                        objectToFormData(subValue, formData, `${formKey}[${index}]`);
                    } else {
                        formData.append(`${formKey}[${index}]`, String(value));
                    }
                });
            } else if (typeof value === 'object' && value !== null) {
                objectToFormData(value, formData, formKey);
            } else {
                formData.append(formKey, String(value));
            }
        }
    }
    return formData;
}

export const httpClientApisauce = create({
    baseURL: ""
});