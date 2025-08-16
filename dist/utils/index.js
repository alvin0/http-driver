"use strict";
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeNullValues = exports.httpClientFetch = exports.compileBodyFetchWithContextType = exports.compileUrl = exports.responseFormat = exports.compileUrlByService = exports.buildUrlWithVersion = exports.compileService = exports.findServiceApi = exports.replaceParamsInUrl = void 0;
var qs = __importStar(require("qs"));
/**
 * Replaces placeholders in a URL with corresponding parameter values.
 *
 * @param {string} url - The URL template containing placeholders in the format `{param}`.
 * @param {Record<string, string>} params - An object where keys correspond to parameter names in the URL and values are the replacements.
 * @returns {string} - The URL with all placeholders replaced by their corresponding parameters.
 */
function replaceParamsInUrl(url, params) {
    return url.replace(/\{(\w+)\}/g, function (match, paramName) { return params[paramName]; });
}
exports.replaceParamsInUrl = replaceParamsInUrl;
/**
 * Finds a service by ID within a list of services.
 *
 * @param {ServiceApi[]} services - An array of service API objects.
 * @param {string} idToFind - The ID of the service to find.
 * @returns {ServiceApi | null} - The service object if found, otherwise null.
 */
function findServiceApi(services, idToFind) {
    var service = services.find(function (service) { return service.id === idToFind; });
    if (service) {
        return service;
    }
    else {
        return null;
    }
}
exports.findServiceApi = findServiceApi;
/**
 * Compiles service information based on the service ID and an array of services.
 *
 * @param {ServiceUrlCompile} idService - The service identifier with parameters.
 * @param {ServiceApi[]} services - The array of service configurations.
 * @returns {CompiledServiceInfo | null} - An object containing the compiled service URL, method, version, and options, or null if the service is not found.
 */
function compileService(idService, services) {
    var _a, _b;
    var serviceExec = findServiceApi(services, idService.id);
    if (serviceExec) {
        return {
            url: replaceParamsInUrl(serviceExec.url, (_a = idService.params) !== null && _a !== void 0 ? _a : {}),
            methods: serviceExec.method,
            version: serviceExec.version,
            options: (_b = serviceExec.options) !== null && _b !== void 0 ? _b : {},
        };
    }
    return null;
}
exports.compileService = compileService;
/**
 * Builds URL with version injection based on configuration
 * Returns simple URL concatenation if version building is disabled or not configured
 *
 * @param {string} baseURL - The base URL
 * @param {string} endpoint - The endpoint path
 * @param {string | number | undefined} version - Version to inject
 * @param {VersionConfig} versionConfig - Version configuration
 * @returns {string} - Complete URL with version injected (or simple concatenation if disabled)
 */
function buildUrlWithVersion(baseURL, endpoint, version, versionConfig) {
    // If version building is not enabled, return simple concatenation
    if (!(versionConfig === null || versionConfig === void 0 ? void 0 : versionConfig.enabled)) {
        return "".concat(baseURL, "/").concat(endpoint);
    }
    // If no version provided and version building is enabled, return simple concatenation
    if (!version) {
        return "".concat(baseURL, "/").concat(endpoint);
    }
    var config = versionConfig;
    var position = config.position || 'after-base';
    var prefix = config.prefix !== undefined ? config.prefix : 'v';
    var versionString = "".concat(prefix).concat(version);
    switch (position) {
        case 'prefix':
            // v1.example.com/endpoint
            var urlParts = baseURL.split('://');
            if (urlParts.length === 2) {
                return "".concat(urlParts[0], "://").concat(versionString, ".").concat(urlParts[1], "/").concat(endpoint);
            }
            return "".concat(versionString, ".").concat(baseURL, "/").concat(endpoint);
        case 'before-endpoint':
            // baseURL/endpoint/v1
            return "".concat(baseURL, "/").concat(endpoint, "/").concat(versionString);
        case 'custom':
            if (config.template) {
                return config.template
                    .replace('{baseURL}', baseURL)
                    .replace('{version}', versionString)
                    .replace('{endpoint}', endpoint);
            }
            // If no template provided but custom position selected, throw error
            throw new Error('Custom version position requires a template. Please provide a template in versionConfig.');
        case 'after-base':
        default:
            // baseURL/v1/endpoint (most common pattern)
            return "".concat(baseURL, "/").concat(versionString, "/").concat(endpoint);
    }
}
exports.buildUrlWithVersion = buildUrlWithVersion;
/**
 * Compiles the full URL and request details for a given service.
 *
 * @param {DriverConfig} configServices - Configuration object containing baseURL and services.
 * @param {ServiceUrlCompile} idService - The service identifier with parameters.
 * @param {any} [payload] - Optional request payload.
 * @param {object} [options] - Additional request options such as headers.
 * @returns {CompileUrlResult | null} - The compiled URL information or null if the service is not found.
 */
function compileUrlByService(configServices, idService, payload, options) {
    var _a, _b;
    var apiInfo = compileService(idService, configServices.services);
    if (apiInfo != null) {
        var finalUrl = void 0;
        // Only use version building if explicitly enabled
        if ((_a = configServices.versionConfig) === null || _a === void 0 ? void 0 : _a.enabled) {
            // Determine version to use: service version > global default version
            var version = apiInfo.version || ((_b = configServices.versionConfig) === null || _b === void 0 ? void 0 : _b.defaultVersion);
            // Build URL with version injection
            finalUrl = buildUrlWithVersion(configServices.baseURL, apiInfo.url, version, configServices.versionConfig);
        }
        else {
            // Use simple baseURL + endpoint concatenation (ignore any service versions)
            finalUrl = "".concat(configServices.baseURL, "/").concat(apiInfo.url);
        }
        return compileUrl(finalUrl, apiInfo.methods, payload !== null && payload !== void 0 ? payload : {}, options);
    }
    console.error("Service ".concat(idService.id, " in driver not found"));
    return null;
}
exports.compileUrlByService = compileUrlByService;
/**
 * Formats a response object with standard details including status, data, and error information.
 *
 * @param {ResponseFormat<any | null>} response - An object containing response details such as status, data, headers, etc.
 * @returns {ResponseFormat} - A formatted response object.
 */
function responseFormat(_a) {
    var status = _a.status, data = _a.data, headers = _a.headers, originalError = _a.originalError, duration = _a.duration, problem = _a.problem;
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
exports.responseFormat = responseFormat;
/**
 * Compiles a URL using a payload as query parameters if the method is GET.
 *
 * @param {string} url - The base URL.
 * @param {MethodAPI} method - The HTTP method (e.g., GET, POST).
 * @param {object} [payload] - Request payload to be sent.
 * @param {object} [options] - Additional request options.
 * @returns {CompileUrlResult} - An object containing the compiled URL, method, payload, options, and pathname.
 */
function compileUrl(url, method, payload, options) {
    var optionRequest = options !== null && options !== void 0 ? options : {};
    if (Object.keys(payload !== null && payload !== void 0 ? payload : {}).length > 0 && method === "get") {
        // compile query string
        var queryString = qs.stringify(payload);
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
exports.compileUrl = compileUrl;
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
function compileBodyFetchWithContextType(contextType, payload) {
    switch (contextType) {
        case "multipart/form-data":
            return objectToFormData(payload);
        case "application/json":
            return JSON.stringify(payload);
        default:
            return JSON.stringify(payload);
    }
}
exports.compileBodyFetchWithContextType = compileBodyFetchWithContextType;
/**
 * Performs an HTTP fetch request using the given URL builder, payload, and options.
 *
 * @param {UrlBuilder} urlBuilder - An object defining URL and request method.
 * @param {object} [payload] - The request payload.
 * @param {object} [options] - Additional fetch options like headers.
 * @returns {Promise<ResponseFormat>} - A promise resolving to the standardized response format.
 */
function httpClientFetch(urlBuilder, payload, options) {
    var _a, _b, _c, _d;
    return __awaiter(this, void 0, void 0, function () {
        var finalUrl, request, requestOptions, startFetchTime, res, endFetchTime, duration, resText, data, error_1, error_2;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    finalUrl = replaceParamsInUrl(urlBuilder.url, (_a = urlBuilder.param) !== null && _a !== void 0 ? _a : {});
                    request = compileUrl(finalUrl, urlBuilder.method, payload, options);
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
                    data =
                        JSON.parse(resText) == undefined ? resText : JSON.parse(resText);
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
exports.httpClientFetch = httpClientFetch;
/**
 * Removes null and undefined values from an object, recursively processing nested objects.
 *
 * @param {T} obj - The object to clean.
 * @returns {T} - The cleaned object without null or undefined values.
 */
function removeNullValues(obj) {
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
exports.removeNullValues = removeNullValues;
/**
 * Checks if a value is File-like or Blob-like object (compatible with both browser and Node.js polyfills)
 * @param value - The value to check
 * @returns true if the value has File-like or Blob-like properties
 */
function isFileOrBlobObject(value) {
    var _a, _b;
    if (!value || typeof value !== 'object') {
        return false;
    }
    // Check for File-like object (has name and lastModified)
    var hasFileProps = typeof value.name === 'string' &&
        typeof value.lastModified === 'number';
    // Check for Blob-like object (has size, type, and stream/text methods)
    var hasBlobProps = typeof value.size === 'number' &&
        typeof value.type === 'string' &&
        (typeof value.stream === 'function' || typeof value.text === 'function');
    // Check constructor names or toString representations
    var constructorName = (_a = value.constructor) === null || _a === void 0 ? void 0 : _a.name;
    var objectString = (_b = value.toString) === null || _b === void 0 ? void 0 : _b.call(value);
    var isFileType = constructorName === 'File' ||
        objectString === '[object File]' ||
        constructorName === 'MockFile';
    var isBlobType = constructorName === 'Blob' ||
        objectString === '[object Blob]' ||
        constructorName === 'MockBlob';
    // Return true if any condition matches
    return hasFileProps || hasBlobProps || isFileType || isBlobType;
}
/**
 * Converts an object payload to FormData, handling nested objects and arrays.
 *
 * @param {any} payload - The payload to convert to FormData.
 * @param {FormData} [formData] - The FormData object to append to (default is a new FormData instance).
 * @param {string | null} [parentKey] - The key of the parent object in a nested structure.
 * @returns {FormData} - FormData populated with the payload data.
 */
function objectToFormData(payload, formData, parentKey) {
    if (formData === void 0) { formData = new FormData(); }
    if (parentKey === void 0) { parentKey = null; }
    // remove property has null value
    payload = removeNullValues(payload);
    var _loop_1 = function (key) {
        if (payload.hasOwnProperty(key)) {
            var value = payload[key];
            var formKey_1 = parentKey ? "".concat(parentKey, ".").concat(key) : key;
            if (Array.isArray(value)) {
                value.forEach(function (subValue, index) {
                    if (isFileOrBlobObject(subValue)) {
                        formData.append("".concat(formKey_1, "[").concat(index, "]"), subValue);
                    }
                    else if (typeof subValue === "object" && subValue !== null) {
                        objectToFormData(subValue, formData, "".concat(formKey_1, "[").concat(index, "]"));
                    }
                    else {
                        formData.append("".concat(formKey_1, "[").concat(index, "]"), String(subValue));
                    }
                });
            }
            else if (isFileOrBlobObject(value)) {
                formData.append(formKey_1, value);
            }
            else if (typeof value === "object" && value !== null) {
                objectToFormData(value, formData, formKey_1);
            }
            else {
                formData.append(formKey_1, String(value));
            }
        }
    };
    for (var key in payload) {
        _loop_1(key);
    }
    return formData;
}
