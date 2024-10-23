var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { create } from "apisauce";
import QueryString from "qs";
/**
 * @param url: string
 * @param params: Record<string
 * @param mixed string>
 *
 * @return string
 */
export function replaceParamsInUrl(url, params) {
    return url.replace(/\{(\w+)\}/g, (match, paramName) => params[paramName]);
}
/**
 * @param services: ServiceApi[]
 * @param idToFind: string
 *
 * @return ServiceApi
 */
export function findServiceApi(services, idToFind) {
    const service = services.find((service) => service.id === idToFind);
    if (service) {
        return service;
    }
    else {
        return null;
    }
}
export function compileService(idService, services) {
    var _a, _b;
    const serviceExec = findServiceApi(services, idService.id);
    if (serviceExec) {
        return {
            url: replaceParamsInUrl(serviceExec.url, (_a = idService.param) !== null && _a !== void 0 ? _a : {}),
            methods: serviceExec.method,
            version: serviceExec.version,
            options: (_b = serviceExec.options) !== null && _b !== void 0 ? _b : {},
        };
    }
    return null;
}
export function compileUrlByService(configServices, idService, parameters, options) {
    const apiInfo = compileService(idService, configServices.services);
    let payload = parameters !== null && parameters !== void 0 ? parameters : {};
    if (apiInfo != null) {
        return compileUrl(configServices.baseURL + "/" + apiInfo.url, apiInfo.methods, payload, options);
    }
    console.error(`Service ${idService.id} in driver not found`);
    return null;
}
export function responseFormat({ status, data, headers, originalError, duration = 0, problem = null, }) {
    let ok = false;
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
    };
}
export function compileUrl(url, method, payload, options) {
    let optionRequest = options !== null && options !== void 0 ? options : {};
    if (Object.keys(payload !== null && payload !== void 0 ? payload : {}).length > 0 && method === "get") {
        // compile query string
        const queryString = QueryString.stringify(payload);
        // clear payload
        payload = {};
        // generate url
        url = url + "?" + queryString;
    }
    return {
        url: url,
        payload: payload !== null && payload !== void 0 ? payload : {},
        method: method,
        pathname: url,
        options: optionRequest,
    };
}
export function compileBodyFetchWithContextType(contextType, payload) {
    switch (contextType) {
        case "multipart/form-data":
            return objectToFormData(payload);
        case "application/json":
            return JSON.stringify(payload);
        default:
            return JSON.stringify(payload);
    }
}
export function httpClientFetch(urlBuilder, parameters, options) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        const finalUrl = replaceParamsInUrl(urlBuilder.url, (_a = urlBuilder.param) !== null && _a !== void 0 ? _a : {});
        const request = compileUrl(finalUrl, urlBuilder.method, parameters, options);
        let requestOptions = Object.assign({}, options);
        if (!((_b = requestOptions.headers) === null || _b === void 0 ? void 0 : _b.hasOwnProperty("Content-Type"))) {
            requestOptions.headers = Object.assign(Object.assign({}, requestOptions.headers), { "Content-Type": "application/json" });
        }
        try {
            if (request.method.toUpperCase() != "GET") {
                requestOptions = Object.assign(Object.assign({}, requestOptions), { method: request.method.toUpperCase(), body: compileBodyFetchWithContextType((_c = requestOptions.headers) === null || _c === void 0 ? void 0 : _c["Content-Type"].toLowerCase(), request.payload) });
                if ((_d = requestOptions.headers) === null || _d === void 0 ? void 0 : _d.hasOwnProperty("Content-Type")) {
                    if (requestOptions.headers["Content-Type"].toLowerCase() ==
                        "multipart/form-data")
                        delete requestOptions["headers"];
                }
            }
            const startFetchTime = performance.now();
            const res = yield fetch(request.url, requestOptions);
            const endFetchTime = performance.now();
            const duration = parseFloat((endFetchTime - startFetchTime).toFixed(2));
            let resText = null;
            let data = null;
            try {
                resText = yield res.text();
                data = JSON.parse(resText) == undefined ? resText : JSON.parse(resText);
            }
            catch (error) {
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
        }
        catch (error) {
            return responseFormat({
                ok: false,
                duration: 0,
                originalError: `${error}`,
                problem: `Error fetching data ${error}`,
                data: null,
                status: 500,
            });
        }
    });
}
export function removeNullValues(obj) {
    const result = {};
    for (const key in obj) {
        const value = obj[key];
        if (value !== null && value !== undefined) {
            if (typeof value === "object" && !Array.isArray(value)) {
                // Recursively remove null values for nested objects
                result[key] = removeNullValues(value);
            }
            else {
                result[key] = value;
            }
        }
    }
    return result;
}
function objectToFormData(payload, formData = new FormData(), parentKey = null) {
    // remove property has null value
    payload = removeNullValues(payload);
    for (const key in payload) {
        if (payload.hasOwnProperty(key)) {
            const value = payload[key];
            const formKey = parentKey ? `${parentKey}.${key}` : key;
            if (Array.isArray(value)) {
                value.forEach((subValue, index) => {
                    if (subValue instanceof File) {
                        formData.append(`${formKey}[${index}]`, subValue);
                    }
                    else if (typeof value === "object" && value !== null) {
                        objectToFormData(subValue, formData, `${formKey}[${index}]`);
                    }
                    else {
                        formData.append(`${formKey}[${index}]`, String(value));
                    }
                });
            }
            else if (typeof value === "object" && value !== null) {
                objectToFormData(value, formData, formKey);
            }
            else {
                formData.append(formKey, String(value));
            }
        }
    }
    return formData;
}
export const httpClientApiSauce = create({
    baseURL: "",
});
