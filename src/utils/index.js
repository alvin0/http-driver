var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
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
    return url.replace(/\{(\w+)\}/g, function (match, paramName) { return params[paramName]; });
}
/**
 * @param services: ServiceApi[]
 * @param idToFind: string
 *
 * @return ServiceApi
 */
export function findServiceApi(services, idToFind) {
    var service = services.find(function (service) { return service.id === idToFind; });
    if (service) {
        return service;
    }
    else {
        return null;
    }
}
export function compileService(idService, services) {
    var _a, _b;
    var serviceExec = findServiceApi(services, idService.id);
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
    var apiInfo = compileService(idService, configServices.services);
    var payload = parameters !== null && parameters !== void 0 ? parameters : {};
    if (apiInfo != null) {
        return compileUrl(configServices.baseURL + "/" + apiInfo.url, apiInfo.methods, payload, options);
    }
    console.error("Service ".concat(idService.id, " in driver not found"));
    return null;
}
export function responseFormat(_a) {
    var status = _a.status, data = _a.data, headers = _a.headers, originalError = _a.originalError, _b = _a.duration, duration = _b === void 0 ? 0 : _b, _c = _a.problem, problem = _c === void 0 ? null : _c;
    var ok = false;
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
    var optionRequest = options !== null && options !== void 0 ? options : {};
    if (Object.keys(payload !== null && payload !== void 0 ? payload : {}).length > 0 && method === "get") {
        // compile query string
        var queryString = QueryString.stringify(payload);
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
    var _a, _b, _c, _d;
    return __awaiter(this, void 0, void 0, function () {
        var finalUrl, request, requestOptions, startFetchTime, res, endFetchTime, duration, resText, data, error_1, error_2;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    finalUrl = replaceParamsInUrl(urlBuilder.url, (_a = urlBuilder.param) !== null && _a !== void 0 ? _a : {});
                    request = compileUrl(finalUrl, urlBuilder.method, parameters, options);
                    requestOptions = __assign({}, options);
                    if (!((_b = requestOptions.headers) === null || _b === void 0 ? void 0 : _b.hasOwnProperty("Content-Type"))) {
                        requestOptions.headers = __assign(__assign({}, requestOptions.headers), { "Content-Type": "application/json" });
                    }
                    _e.label = 1;
                case 1:
                    _e.trys.push([1, 7, , 8]);
                    if (request.method.toUpperCase() != "GET") {
                        requestOptions = __assign(__assign({}, requestOptions), { method: request.method.toUpperCase(), body: compileBodyFetchWithContextType((_c = requestOptions.headers) === null || _c === void 0 ? void 0 : _c["Content-Type"].toLowerCase(), request.payload) });
                        if ((_d = requestOptions.headers) === null || _d === void 0 ? void 0 : _d.hasOwnProperty("Content-Type")) {
                            if (requestOptions.headers["Content-Type"].toLowerCase() ==
                                "multipart/form-data")
                                delete requestOptions["headers"];
                        }
                    }
                    startFetchTime = performance.now();
                    return [4 /*yield*/, fetch(request.url, requestOptions)];
                case 2:
                    res = _e.sent();
                    endFetchTime = performance.now();
                    duration = parseFloat((endFetchTime - startFetchTime).toFixed(2));
                    resText = null;
                    data = null;
                    _e.label = 3;
                case 3:
                    _e.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, res.text()];
                case 4:
                    resText = _e.sent();
                    data = JSON.parse(resText) == undefined ? resText : JSON.parse(resText);
                    return [3 /*break*/, 6];
                case 5:
                    error_1 = _e.sent();
                    data = resText;
                    return [3 /*break*/, 6];
                case 6:
                    if (!res.ok) {
                        return [2 /*return*/, responseFormat({
                                ok: res.ok,
                                duration: duration,
                                status: res.status,
                                headers: res.headers,
                                data: data,
                                problem: res.statusText,
                                originalError: res.statusText,
                            })];
                    }
                    return [2 /*return*/, responseFormat({
                            ok: res.ok,
                            duration: duration,
                            status: res.status,
                            headers: res.headers,
                            data: data,
                            problem: null,
                            originalError: null,
                        })];
                case 7:
                    error_2 = _e.sent();
                    return [2 /*return*/, responseFormat({
                            ok: false,
                            duration: 0,
                            originalError: "".concat(error_2),
                            problem: "Error fetching data ".concat(error_2),
                            data: null,
                            status: 500,
                        })];
                case 8: return [2 /*return*/];
            }
        });
    });
}
export function removeNullValues(obj) {
    var result = {};
    for (var key in obj) {
        var value = obj[key];
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
function objectToFormData(payload, formData, parentKey) {
    if (formData === void 0) { formData = new FormData(); }
    if (parentKey === void 0) { parentKey = null; }
    // remove property has null value
    payload = removeNullValues(payload);
    var _loop_1 = function (key) {
        if (payload.hasOwnProperty(key)) {
            var value_1 = payload[key];
            var formKey_1 = parentKey ? "".concat(parentKey, ".").concat(key) : key;
            if (Array.isArray(value_1)) {
                value_1.forEach(function (subValue, index) {
                    if (subValue instanceof File) {
                        formData.append("".concat(formKey_1, "[").concat(index, "]"), subValue);
                    }
                    else if (typeof value_1 === "object" && value_1 !== null) {
                        objectToFormData(subValue, formData, "".concat(formKey_1, "[").concat(index, "]"));
                    }
                    else {
                        formData.append("".concat(formKey_1, "[").concat(index, "]"), String(value_1));
                    }
                });
            }
            else if (typeof value_1 === "object" && value_1 !== null) {
                objectToFormData(value_1, formData, formKey_1);
            }
            else {
                formData.append(formKey_1, String(value_1));
            }
        }
    };
    for (var key in payload) {
        _loop_1(key);
    }
    return formData;
}
export var httpClientApiSauce = create({
    baseURL: "",
});
