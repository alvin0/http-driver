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
exports.DriverBuilder = void 0;
var apisauce_1 = require("apisauce");
var qs = __importStar(require("qs"));
var custom_errors_1 = require("./utils/custom-errors");
var error_handler_1 = require("./utils/error-handler");
var index_1 = require("./utils/index");
var Driver = /** @class */ (function () {
    function Driver(config) {
        var _this = this;
        var _a;
        this.config = config;
        this.apiSauceInstance = (0, apisauce_1.create)({
            withCredentials: (_a = config.withCredentials) !== null && _a !== void 0 ? _a : true,
            baseURL: config.baseURL,
        });
        var isRefreshing = false;
        var failedQueue = [];
        var processQueue = function (error, token) {
            if (token === void 0) { token = null; }
            failedQueue.forEach(function (prom) {
                if (error) {
                    prom.reject(error);
                }
                else {
                    prom.resolve(token);
                }
            });
            failedQueue = [];
        };
        var interceptorError = function (axiosInstance) { return function (error) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Promise.reject(error)];
            });
        }); }; };
        this.apiSauceInstance.axiosInstance.interceptors.response.use(undefined, this.config.handleInterceptorErrorAxios
            ? this.config.handleInterceptorErrorAxios(this.apiSauceInstance.axiosInstance, processQueue, isRefreshing)
            : interceptorError(this.apiSauceInstance.axiosInstance));
        this.apiSauceInstance.addRequestTransform(function (transform) {
            if (_this.config.addRequestTransformAxios) {
                _this.config.addRequestTransformAxios(transform);
            }
        });
        this.apiSauceInstance.addResponseTransform(function (transform) {
            if (_this.config.addTransformResponseAxios) {
                _this.config.addTransformResponseAxios(transform);
            }
        });
        this.apiSauceInstance.addAsyncRequestTransform(function (transform) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.config.addAsyncRequestTransformAxios) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.config.addAsyncRequestTransformAxios(transform)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        }); });
        this.apiSauceInstance.addAsyncResponseTransform(function (transform) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.config.addAsyncTransformResponseAxios) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.config.addAsyncTransformResponseAxios(transform)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        }); });
        return this;
    }
    Driver.prototype.appendExecService = function () {
        var _this = this;
        var httpProAskDriver = Object.assign(this.apiSauceInstance, {
            execService: function (idService, payload, options) { return __awaiter(_this, void 0, void 0, function () {
                var apiInfo, payloadConvert, contentType, result, error_1;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 2, , 3]);
                            apiInfo = (0, index_1.compileUrlByService)(this.config, idService, payload, options);
                            if (apiInfo == null) {
                                throw new Error("Service ".concat(idService.id, " in driver not found"));
                            }
                            payloadConvert = apiInfo.payload;
                            if (apiInfo.options.headers &&
                                typeof apiInfo.options.headers === "object" &&
                                ((_a = apiInfo.options.headers) === null || _a === void 0 ? void 0 : _a.hasOwnProperty("Content-Type"))) {
                                contentType = apiInfo.options.headers["Content-Type"];
                                if (contentType.toLowerCase() === "multipart/form-data") {
                                    // delete apiInfo.options.headers;
                                    // payloadConvert = compileBodyFetchWithContextType(contentType.toLowerCase(), apiInfo.payload)
                                }
                            }
                            return [4 /*yield*/, this.apiSauceInstance[apiInfo.method](apiInfo.pathname, payloadConvert, apiInfo.options)];
                        case 1:
                            result = _b.sent();
                            if (!result) {
                                throw new Error("No response from service call");
                            }
                            return [2 /*return*/, result];
                        case 2:
                            error_1 = _b.sent();
                            if (error_1 instanceof Error) {
                                if (error_1.message.toLowerCase().includes('timeout')) {
                                    return [2 /*return*/, (0, index_1.responseFormat)((0, error_handler_1.handleErrorResponse)(new custom_errors_1.TimeoutError()))];
                                }
                                if (error_1.message.toLowerCase().includes('network')) {
                                    return [2 /*return*/, (0, index_1.responseFormat)((0, error_handler_1.handleErrorResponse)(new custom_errors_1.NetworkError()))];
                                }
                            }
                            return [2 /*return*/, (0, index_1.responseFormat)((0, error_handler_1.handleErrorResponse)(error_1))];
                        case 3: return [2 /*return*/];
                    }
                });
            }); },
            execServiceByFetch: function (idService, payload, options) { return __awaiter(_this, void 0, void 0, function () {
                var apiInfo, url, requestOptions, startFetchTime, res, endFetchTime, duration, resText, data, response, error_2;
                var _a;
                var _b, _c, _d;
                return __generator(this, function (_e) {
                    switch (_e.label) {
                        case 0:
                            _e.trys.push([0, 3, , 4]);
                            apiInfo = (0, index_1.compileUrlByService)(this.config, idService, payload, options);
                            if (apiInfo == null) {
                                throw new Error("Service ".concat(idService.id, " in driver not found"));
                            }
                            url = apiInfo.url;
                            url = this.config.baseURL + "/" + url;
                            requestOptions = __assign({}, apiInfo.options);
                            if (!((_b = requestOptions.headers) === null || _b === void 0 ? void 0 : _b.hasOwnProperty("Content-Type"))) {
                                requestOptions.headers = __assign(__assign({}, requestOptions.headers), { "Content-Type": "application/json" });
                            }
                            if (apiInfo.method.toUpperCase() != "GET") {
                                requestOptions = __assign(__assign({}, requestOptions), { method: apiInfo.method.toUpperCase(), body: (0, index_1.compileBodyFetchWithContextType)((_c = requestOptions.headers) === null || _c === void 0 ? void 0 : _c["Content-Type"].toLowerCase(), apiInfo.payload) });
                                if ((_d = requestOptions.headers) === null || _d === void 0 ? void 0 : _d.hasOwnProperty("Content-Type")) {
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
                            res = _e.sent();
                            endFetchTime = performance.now();
                            duration = parseFloat((endFetchTime - startFetchTime).toFixed(2));
                            resText = null;
                            data = null;
                            return [4 /*yield*/, res.text()];
                        case 2:
                            resText = _e.sent();
                            if (!resText) {
                                throw new custom_errors_1.MalformedResponseError("Malformed response");
                            }
                            try {
                                data = JSON.parse(resText);
                            }
                            catch (err) {
                                throw new custom_errors_1.MalformedResponseError("Malformed response");
                            }
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
                        case 3:
                            error_2 = _e.sent();
                            if (error_2 instanceof custom_errors_1.MalformedResponseError) {
                                return [2 /*return*/, (0, index_1.responseFormat)((0, error_handler_1.handleErrorResponse)(error_2))];
                            }
                            if (error_2 instanceof Error) {
                                if (error_2.message.toLowerCase().includes('timeout')) {
                                    return [2 /*return*/, (0, index_1.responseFormat)((0, error_handler_1.handleErrorResponse)(new custom_errors_1.TimeoutError()))];
                                }
                                if (error_2.message.toLowerCase().includes('network')) {
                                    return [2 /*return*/, (0, index_1.responseFormat)((0, error_handler_1.handleErrorResponse)(new custom_errors_1.NetworkError()))];
                                }
                            }
                            return [2 /*return*/, (0, index_1.responseFormat)((0, error_handler_1.handleErrorResponse)(error_2))];
                        case 4: return [2 /*return*/];
                    }
                });
            }); },
            getInfoURL: function (idService, payload) {
                if (payload === void 0) { payload = {}; }
                var apiInfo = (0, index_1.compileService)(idService, _this.config.services);
                if (apiInfo != null) {
                    if (payload && Object.keys(payload).length > 0 && apiInfo.methods === "get") {
                        var queryString = qs.stringify(payload);
                        payload = null;
                        apiInfo.url = apiInfo.url + "?" + queryString;
                    }
                    return {
                        fullUrl: _this.config.baseURL + "/" + apiInfo.url,
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
