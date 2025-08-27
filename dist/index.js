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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DriverBuilder = exports.MethodAPI = void 0;
var axios_1 = __importDefault(require("axios"));
var qs = __importStar(require("qs"));
var driver_1 = require("./types/driver");
var errors_1 = require("./types/errors");
var error_handler_1 = require("./utils/error-handler");
var index_1 = require("./utils/index");
// Export enum as value
var driver_2 = require("./types/driver");
Object.defineProperty(exports, "MethodAPI", { enumerable: true, get: function () { return driver_2.MethodAPI; } });
var Driver = /** @class */ (function () {
    function Driver(config) {
        var _this = this;
        var _a;
        this.config = config;
        this.axiosInstance = axios_1.default.create({
            withCredentials: (_a = config.withCredentials) !== null && _a !== void 0 ? _a : true,
            baseURL: config.baseURL,
        });
        var isRefreshing = false;
        var failedQueue = [];
        var processQueue = function (error, token) {
            if (token === void 0) { token = null; }
            failedQueue.forEach(function (prom) {
                /* istanbul ignore next */
                if (error)
                    prom.reject(error);
                /* istanbul ignore next */
                else
                    prom.resolve(token);
            });
            failedQueue = [];
        };
        var defaultInterceptorError = function (_axiosInstance) { return function (error) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Promise.reject(error)];
            });
        }); }; };
        // Response error interceptor (token refresh pattern compatibility)
        this.axiosInstance.interceptors.response.use(function (response) { return response; }, this.config.handleInterceptorErrorAxios
            ? this.config.handleInterceptorErrorAxios(this.axiosInstance, processQueue, isRefreshing)
            : defaultInterceptorError(this.axiosInstance));
        // Request interceptor - sync + async transforms compatibility
        this.axiosInstance.interceptors.request.use(function (request) { return __awaiter(_this, void 0, void 0, function () {
            var transforms_2, registrar, _i, transforms_1, t, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Sync request transform (apisauce-style)
                        if (this.config.addRequestTransformAxios) {
                            try {
                                this.config.addRequestTransformAxios(request);
                            }
                            catch (e) {
                                // if transform throws, keep consistent behavior: propagate error
                                throw e;
                            }
                        }
                        if (!this.config.addAsyncRequestTransform) return [3 /*break*/, 7];
                        transforms_2 = [];
                        registrar = function (transform) {
                            transforms_2.push(transform);
                        };
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, , 7]);
                        // Invoke consumer to register transforms
                        this.config.addAsyncRequestTransform(registrar);
                        _i = 0, transforms_1 = transforms_2;
                        _a.label = 2;
                    case 2:
                        if (!(_i < transforms_1.length)) return [3 /*break*/, 5];
                        t = transforms_1[_i];
                        return [4 /*yield*/, t(request)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        e_1 = _a.sent();
                        throw e_1;
                    case 7: return [2 /*return*/, request];
                }
            });
        }); }, 
        /* istanbul ignore next */
        function (error) { return Promise.reject(error); });
        // Response interceptor - sync + async transforms compatibility
        this.axiosInstance.interceptors.response.use(function (response) { return __awaiter(_this, void 0, void 0, function () {
            var apiResponseLike, transforms_4, registrar, _i, transforms_3, t, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        // Sync response transform (apisauce-style): consumer expects ApiResponse-like
                        if (this.config.addTransformResponseAxios) {
                            apiResponseLike = Driver.mapAxiosToApiResponseLike(response);
                            try {
                                this.config.addTransformResponseAxios(apiResponseLike);
                            }
                            catch (e) {
                                // swallow to not block pipeline; apisauce executes transforms but shouldn't break successful response
                            }
                        }
                        if (!this.config.addAsyncResponseTransform) return [3 /*break*/, 7];
                        transforms_4 = [];
                        registrar = function (transform) {
                            transforms_4.push(transform);
                        };
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 6, , 7]);
                        this.config.addAsyncResponseTransform(registrar);
                        _i = 0, transforms_3 = transforms_4;
                        _b.label = 2;
                    case 2:
                        if (!(_i < transforms_3.length)) return [3 /*break*/, 5];
                        t = transforms_3[_i];
                        return [4 /*yield*/, t(response)];
                    case 3:
                        _b.sent();
                        _b.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        _a = _b.sent();
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/, response];
                }
            });
        }); }, 
        /* istanbul ignore next */
        function (error) { return Promise.reject(error); });
        return this;
    }
    Driver.prototype.appendExecService = function () {
        var _this = this;
        var httpDriver = Object.assign(this.axiosInstance, {
            execService: function (idService, payload, options) { return __awaiter(_this, void 0, void 0, function () {
                var apiInfo, payloadConvert, contentType, start, axiosCall, rawResult, methodLower, duration, normalized, error_1, axErr, status_1, headers, problem;
                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
                return __generator(this, function (_m) {
                    switch (_m.label) {
                        case 0:
                            _m.trys.push([0, 8, , 9]);
                            apiInfo = (0, index_1.compileUrlByService)(this.config, idService, payload, options);
                            if (apiInfo == null) {
                                throw new Error("Service ".concat(idService.id, " in driver not found"));
                            }
                            payloadConvert = apiInfo.payload;
                            // multipart hint compatibility (keep headers removal behavior for fetch only)
                            if (apiInfo.options.headers &&
                                typeof apiInfo.options.headers === "object" &&
                                ((_a = apiInfo.options.headers) === null || _a === void 0 ? void 0 : _a.hasOwnProperty("Content-Type"))) {
                                contentType = apiInfo.options.headers["Content-Type"];
                                if (typeof contentType === "string" && contentType.toLowerCase() === "multipart/form-data") {
                                    // axios handles multipart boundaries automatically with FormData
                                    // ensure body is FormData if consumer passed plain object
                                    // no header deletion here (axios expects headers)
                                }
                            }
                            // Support AbortController passed via either `signal` or `abortController.signal` on axios config
                            if (!((_b = apiInfo.options) === null || _b === void 0 ? void 0 : _b.signal) && ((_d = (_c = apiInfo.options) === null || _c === void 0 ? void 0 : _c.abortController) === null || _d === void 0 ? void 0 : _d.signal)) {
                                apiInfo.options.signal = apiInfo.options.abortController.signal;
                            }
                            start = performance.now();
                            axiosCall = (_e = this.axiosInstance[apiInfo.method]) === null || _e === void 0 ? void 0 : _e.bind(this.axiosInstance);
                            rawResult = void 0;
                            if (!axiosCall) return [3 /*break*/, 5];
                            methodLower = String(apiInfo.method).toLowerCase();
                            if (!(methodLower === "get" || methodLower === "delete" || methodLower === "head")) return [3 /*break*/, 2];
                            return [4 /*yield*/, axiosCall(apiInfo.pathname, apiInfo.options)];
                        case 1:
                            // For GET-like methods, the 2nd param is the config object.
                            rawResult = _m.sent();
                            return [3 /*break*/, 4];
                        case 2: return [4 /*yield*/, axiosCall(apiInfo.pathname, payloadConvert, apiInfo.options)];
                        case 3:
                            // For methods with body, pass data as 2nd param and config (includes signal) as 3rd.
                            rawResult = _m.sent();
                            _m.label = 4;
                        case 4: return [3 /*break*/, 7];
                        case 5: return [4 /*yield*/, this.axiosInstance.request(__assign({ method: apiInfo.method, url: apiInfo.pathname, data: payloadConvert }, apiInfo.options))];
                        case 6:
                            rawResult = _m.sent();
                            _m.label = 7;
                        case 7:
                            duration = parseFloat((performance.now() - start).toFixed(2));
                            if (!rawResult) {
                                return [2 /*return*/, (0, index_1.responseFormat)({
                                        ok: false,
                                        status: 500,
                                        headers: null,
                                        duration: duration,
                                        data: null,
                                        problem: "No response from service call",
                                        originalError: "No response from service call",
                                    })];
                            }
                            // If consumer mocked method to return already-normalized object, pass-through
                            if (typeof rawResult.ok === "boolean" && typeof rawResult.status === "number") {
                                return [2 /*return*/, rawResult];
                            }
                            normalized = Driver.axiosResponseToResponseFormat(rawResult, duration);
                            return [2 /*return*/, normalized];
                        case 8:
                            error_1 = _m.sent();
                            // AxiosError normalization
                            if (error_1.isAxiosError) {
                                axErr = error_1;
                                // Treat request cancellation via AbortController as timeout-equivalent
                                if ((axErr === null || axErr === void 0 ? void 0 : axErr.code) === "ERR_CANCELED" || (axErr === null || axErr === void 0 ? void 0 : axErr.name) === "CanceledError") {
                                    return [2 /*return*/, (0, index_1.responseFormat)((0, error_handler_1.handleErrorResponse)(new errors_1.TimeoutError()))];
                                }
                                status_1 = (_g = (_f = axErr.response) === null || _f === void 0 ? void 0 : _f.status) !== null && _g !== void 0 ? _g : 0;
                                headers = (_j = (_h = axErr.response) === null || _h === void 0 ? void 0 : _h.headers) !== null && _j !== void 0 ? _j : null;
                                problem = Driver.mapAxiosErrorToProblem(axErr);
                                return [2 /*return*/, (0, index_1.responseFormat)({
                                        ok: false,
                                        status: status_1,
                                        headers: Driver.normalizeAxiosHeaders(headers),
                                        duration: 0,
                                        data: (_l = (_k = axErr.response) === null || _k === void 0 ? void 0 : _k.data) !== null && _l !== void 0 ? _l : null,
                                        problem: problem,
                                        originalError: axErr,
                                    })];
                            }
                            if (error_1 instanceof Error) {
                                if (error_1.message.toLowerCase().includes("timeout")) {
                                    return [2 /*return*/, (0, index_1.responseFormat)((0, error_handler_1.handleErrorResponse)(new errors_1.TimeoutError()))];
                                }
                                if (error_1.message.toLowerCase().includes("network")) {
                                    return [2 /*return*/, (0, index_1.responseFormat)((0, error_handler_1.handleErrorResponse)(new errors_1.NetworkError()))];
                                }
                            }
                            return [2 /*return*/, (0, index_1.responseFormat)((0, error_handler_1.handleErrorResponse)(error_1))];
                        case 9: return [2 /*return*/];
                    }
                });
            }); },
            execServiceByFetch: function (idService, payload, options) { return __awaiter(_this, void 0, void 0, function () {
                var apiInfo, url, requestOptions, startFetchTime, res, endFetchTime, duration, data, responseType, contentType, resText, err_1, response, error_2, lower;
                var _a;
                var _b, _c, _d, _e, _f, _g, _h;
                return __generator(this, function (_j) {
                    switch (_j.label) {
                        case 0:
                            _j.trys.push([0, 19, , 20]);
                            apiInfo = (0, index_1.compileUrlByService)(this.config, idService, payload, options);
                            if (apiInfo == null) {
                                throw new Error("Service ".concat(idService.id, " in driver not found"));
                            }
                            url = apiInfo.url;
                            requestOptions = __assign({}, apiInfo.options);
                            // Support AbortController passed as either `signal` or `abortController.signal`
                            if (!requestOptions.signal && ((_b = requestOptions.abortController) === null || _b === void 0 ? void 0 : _b.signal)) {
                                requestOptions.signal = requestOptions.abortController.signal;
                            }
                            if (!((_c = requestOptions.headers) === null || _c === void 0 ? void 0 : _c.hasOwnProperty("Content-Type"))) {
                                requestOptions.headers = __assign(__assign({}, requestOptions.headers), { "Content-Type": "application/json" });
                            }
                            if (apiInfo.method.toUpperCase() != "GET") {
                                requestOptions = __assign(__assign({}, requestOptions), { method: apiInfo.method.toUpperCase(), body: (0, index_1.compileBodyFetchWithContextType)((_f = (_e = (_d = requestOptions.headers) === null || _d === void 0 ? void 0 : _d["Content-Type"]) === null || _e === void 0 ? void 0 : _e.toLowerCase) === null || _f === void 0 ? void 0 : _f.call(_e), apiInfo.payload) });
                                if ((_g = requestOptions.headers) === null || _g === void 0 ? void 0 : _g.hasOwnProperty("Content-Type")) {
                                    if (requestOptions.headers["Content-Type"].toLowerCase() ==
                                        "multipart/form-data")
                                        delete requestOptions["headers"];
                                }
                            }
                            if (this.config.addRequestTransformFetch) {
                                (_a = this.config.addRequestTransformFetch(url, requestOptions), url = _a.url, requestOptions = _a.requestOptions);
                            }
                            startFetchTime = performance.now();
                            return [4 /*yield*/, fetch(url, requestOptions)];
                        case 1:
                            res = _j.sent();
                            endFetchTime = performance.now();
                            duration = parseFloat((endFetchTime - startFetchTime).toFixed(2));
                            data = null;
                            responseType = options === null || options === void 0 ? void 0 : options.responseType;
                            contentType = ((_h = res.headers.get('content-type')) === null || _h === void 0 ? void 0 : _h.toLowerCase()) || '';
                            _j.label = 2;
                        case 2:
                            _j.trys.push([2, 17, , 18]);
                            if (!(responseType === 'blob')) return [3 /*break*/, 4];
                            return [4 /*yield*/, res.blob()];
                        case 3:
                            data = _j.sent();
                            return [3 /*break*/, 16];
                        case 4:
                            if (!(responseType === 'arraybuffer')) return [3 /*break*/, 6];
                            return [4 /*yield*/, res.arrayBuffer()];
                        case 5:
                            data = _j.sent();
                            return [3 /*break*/, 16];
                        case 6:
                            if (!(responseType === 'text')) return [3 /*break*/, 8];
                            return [4 /*yield*/, res.text()];
                        case 7:
                            data = _j.sent();
                            return [3 /*break*/, 16];
                        case 8:
                            if (!(contentType.startsWith('image/') ||
                                contentType.startsWith('application/pdf'))) return [3 /*break*/, 10];
                            return [4 /*yield*/, res.blob()];
                        case 9:
                            // Auto-detect blob types based on content-type when no explicit responseType
                            data = _j.sent();
                            return [3 /*break*/, 16];
                        case 10:
                            if (!(contentType.startsWith('application/octet-stream') && !responseType)) return [3 /*break*/, 12];
                            return [4 /*yield*/, res.blob()];
                        case 11:
                            // Only default to blob for octet-stream if no explicit responseType
                            data = _j.sent();
                            return [3 /*break*/, 16];
                        case 12:
                            if (!(contentType.startsWith('text/') && !contentType.includes('application/json'))) return [3 /*break*/, 14];
                            return [4 /*yield*/, res.text()];
                        case 13:
                            // Auto-detect text types when no explicit responseType
                            data = _j.sent();
                            return [3 /*break*/, 16];
                        case 14: return [4 /*yield*/, res.text()];
                        case 15:
                            resText = _j.sent();
                            if (!resText) {
                                throw new errors_1.MalformedResponseError("Malformed response");
                            }
                            // If content-type suggests JSON or no specific type, try to parse as JSON
                            if (contentType.includes('application/json') || !contentType) {
                                try {
                                    data = JSON.parse(resText);
                                }
                                catch (err) {
                                    throw new errors_1.MalformedResponseError("Malformed response");
                                }
                            }
                            else {
                                // Non-JSON content type, return as text
                                data = resText;
                            }
                            _j.label = 16;
                        case 16: return [3 /*break*/, 18];
                        case 17:
                            err_1 = _j.sent();
                            if (err_1 instanceof errors_1.MalformedResponseError) {
                                throw err_1;
                            }
                            throw new errors_1.MalformedResponseError("Failed to parse response");
                        case 18:
                            response = (0, index_1.responseFormat)({
                                ok: res.ok,
                                duration: duration,
                                status: res.status,
                                headers: res.headers,
                                data: data,
                                problem: !res.ok ? res.statusText : null,
                                originalError: !res.ok ? res.statusText : null,
                            });
                            return [2 /*return*/, this.config.addTransformResponseFetch
                                    ? this.config.addTransformResponseFetch(response)
                                    : response];
                        case 19:
                            error_2 = _j.sent();
                            if (error_2 instanceof errors_1.MalformedResponseError) {
                                return [2 /*return*/, (0, index_1.responseFormat)((0, error_handler_1.handleErrorResponse)(error_2))];
                            }
                            // Fetch aborts surface as DOMException with name "AbortError"
                            if ((error_2 === null || error_2 === void 0 ? void 0 : error_2.name) === "AbortError") {
                                return [2 /*return*/, (0, index_1.responseFormat)((0, error_handler_1.handleErrorResponse)(new errors_1.TimeoutError()))];
                            }
                            if (error_2 instanceof Error) {
                                lower = error_2.message.toLowerCase();
                                if (error_2.name === "AbortError" || lower.includes("aborted") || lower.includes("canceled")) {
                                    return [2 /*return*/, (0, index_1.responseFormat)((0, error_handler_1.handleErrorResponse)(new errors_1.TimeoutError()))];
                                }
                                if (lower.includes('timeout')) {
                                    return [2 /*return*/, (0, index_1.responseFormat)((0, error_handler_1.handleErrorResponse)(new errors_1.TimeoutError()))];
                                }
                                if (lower.includes('network')) {
                                    return [2 /*return*/, (0, index_1.responseFormat)((0, error_handler_1.handleErrorResponse)(new errors_1.NetworkError()))];
                                }
                            }
                            return [2 /*return*/, (0, index_1.responseFormat)((0, error_handler_1.handleErrorResponse)(error_2))];
                        case 20: return [2 /*return*/];
                    }
                });
            }); },
            getInfoURL: function (idService, payload) {
                var _a, _b;
                if (payload === void 0) { payload = {}; }
                var apiInfo = (0, index_1.compileService)(idService, _this.config.services);
                if (apiInfo != null) {
                    var fullUrl = void 0;
                    // Only use version building if explicitly enabled
                    if ((_a = _this.config.versionConfig) === null || _a === void 0 ? void 0 : _a.enabled) {
                        // Determine version to use: service version > global default version
                        var version = apiInfo.version || ((_b = _this.config.versionConfig) === null || _b === void 0 ? void 0 : _b.defaultVersion);
                        // Build URL with version injection
                        fullUrl = (0, index_1.buildUrlWithVersion)(_this.config.baseURL, apiInfo.url, version, _this.config.versionConfig);
                    }
                    else {
                        // Use simple baseURL + endpoint concatenation (ignore any service versions)
                        fullUrl = "".concat(_this.config.baseURL, "/").concat(apiInfo.url);
                    }
                    if (payload && Object.keys(payload).length > 0 && apiInfo.methods === driver_1.MethodAPI.get) {
                        var queryString = qs.stringify(payload);
                        var separator = fullUrl.includes('?') ? '&' : '?';
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
    };
    // Utilities for normalization and compatibility
    Driver.axiosResponseToResponseFormat = function (res, duration) {
        return (0, index_1.responseFormat)({
            ok: res.status >= 200 && res.status <= 299,
            status: res.status,
            data: res.data,
            headers: Driver.normalizeAxiosHeaders(res.headers),
            duration: duration,
            problem: res.status >= 400 ? res.statusText : null,
            originalError: null,
        });
    };
    Driver.normalizeAxiosHeaders = function (headers) {
        if (!headers)
            return null;
        var lowerize = function (obj) {
            var norm = {};
            Object.entries(obj || {}).forEach(function (_a) {
                var k = _a[0], v = _a[1];
                if (typeof v === "string") {
                    norm[k.toLowerCase()] = v;
                }
                else if (Array.isArray(v)) {
                    norm[k.toLowerCase()] = v.join(", ");
                }
            });
            return norm;
        };
        // Handle AxiosHeaders via toJSON, then normalize keys and array values
        if (typeof (headers === null || headers === void 0 ? void 0 : headers.toJSON) === "function") {
            return lowerize(headers.toJSON());
        }
        // Handle plain objects
        if (typeof headers === "object") {
            return lowerize(headers);
        }
        return null;
    };
    Driver.mapAxiosToApiResponseLike = function (res) {
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
    };
    Driver.mapAxiosErrorToProblem = function (error) {
        var code = (error.code || "").toUpperCase();
        if (code.includes("ECONNABORTED") || code.includes("ETIMEDOUT"))
            return "TIMEOUT_ERROR";
        if (!error.response)
            return "NETWORK_ERROR";
        var status = error.response.status;
        if (status >= 500)
            return "SERVER_ERROR";
        if (status >= 400)
            return "CLIENT_ERROR";
        return "UNKNOWN_ERROR";
    };
    return Driver;
}());
var DriverBuilder = /** @class */ (function () {
    function DriverBuilder() {
        this.config = {
            baseURL: "",
            services: [],
        };
    }
    DriverBuilder.prototype.withBaseURL = function (baseURL) {
        this.config.baseURL = baseURL;
        return this;
    };
    DriverBuilder.prototype.withServices = function (services) {
        this.config.services = services;
        return this;
    };
    DriverBuilder.prototype.withVersionConfig = function (versionConfig) {
        this.config.versionConfig = __assign(__assign({}, versionConfig), { enabled: versionConfig.enabled !== undefined ? versionConfig.enabled : true });
        return this;
    };
    DriverBuilder.prototype.withGlobalVersion = function (version) {
        if (!this.config.versionConfig) {
            this.config.versionConfig = {};
        }
        this.config.versionConfig.defaultVersion = version;
        return this;
    };
    DriverBuilder.prototype.withVersionTemplate = function (template) {
        if (!this.config.versionConfig) {
            this.config.versionConfig = {};
        }
        this.config.versionConfig.template = template;
        this.config.versionConfig.position = 'custom';
        this.config.versionConfig.enabled = true;
        return this;
    };
    DriverBuilder.prototype.enableVersioning = function (enabled) {
        if (enabled === void 0) { enabled = true; }
        if (!this.config.versionConfig) {
            this.config.versionConfig = {};
        }
        this.config.versionConfig.enabled = enabled;
        return this;
    };
    DriverBuilder.prototype.withAddAsyncRequestTransformAxios = function (callback) {
        this.config.addAsyncRequestTransform = callback;
        return this;
    };
    DriverBuilder.prototype.withAddAsyncResponseTransformAxios = function (callback) {
        this.config.addAsyncResponseTransform = callback;
        return this;
    };
    DriverBuilder.prototype.withAddRequestTransformAxios = function (callback) {
        this.config.addRequestTransformAxios = callback;
        return this;
    };
    DriverBuilder.prototype.withAddResponseTransformAxios = function (callback) {
        this.config.addTransformResponseAxios = callback;
        return this;
    };
    DriverBuilder.prototype.withHandleInterceptorErrorAxios = function (callback) {
        this.config.handleInterceptorErrorAxios = callback;
        return this;
    };
    DriverBuilder.prototype.withAddTransformResponseFetch = function (callback) {
        this.config.addTransformResponseFetch = callback;
        return this;
    };
    DriverBuilder.prototype.withAddRequestTransformFetch = function (callback) {
        this.config.addRequestTransformFetch = callback;
        return this;
    };
    DriverBuilder.prototype.build = function () {
        if (!this.config.baseURL || !this.config.services.length) {
            throw new Error("Missing required configuration values");
        }
        var driver = new Driver(this.config);
        return driver.appendExecService();
    };
    return DriverBuilder;
}());
exports.DriverBuilder = DriverBuilder;
