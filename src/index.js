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
import qs from "qs";
import { compileBodyFetchWithContextType, compileService, compileUrlByService, responseFormat, } from "./utils/index";
var Driver = /** @class */ (function () {
    function Driver(config) {
        var _this = this;
        var _a;
        this.config = config;
        this.apiSauceInstance = create({
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
        this.apiSauceInstance.axiosInstance.interceptors.response.use(undefined, this.config.handleInterceptorError
            ? this.config.handleInterceptorError(this.apiSauceInstance.axiosInstance, processQueue, isRefreshing)
            : interceptorError(this.apiSauceInstance.axiosInstance));
        this.apiSauceInstance.addRequestTransform(function (request) {
            // console.log("Start========LogAxiosRequest========Start",request, "End========LogAxiosRequest========End")
            if (_this.config.addRequestTransform) {
                _this.config.addRequestTransform(request);
            }
        });
        this.apiSauceInstance.addResponseTransform(function (response) {
            // console.log("Start========LogAxiosResponse========Start",response, "End========LogAxiosResponse========End")
            if (_this.config.addTransformResponse) {
                _this.config.addTransformResponse(response);
            }
        });
        return this;
    }
    Driver.prototype.appendExecService = function () {
        var _this = this;
        var httpProAskDriver = Object.assign(this.apiSauceInstance, {
            execService: function (idService, payload, options) { return __awaiter(_this, void 0, void 0, function () {
                var apiInfo, payloadConvert, contentType;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            apiInfo = compileUrlByService(this.config, idService, payload, options);
                            if (apiInfo == null) {
                                return [2 /*return*/, responseFormat({
                                        ok: false,
                                        duration: 0,
                                        status: 500,
                                        headers: null,
                                        data: null,
                                        problem: "Service ".concat(idService.id, " in driver not found"),
                                        originalError: "Service ".concat(idService.id, " in driver not found"),
                                    })];
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
                        case 1: return [2 /*return*/, _b.sent()];
                    }
                });
            }); },
            execServiceByFetch: function (idService, payload, options) { return __awaiter(_this, void 0, void 0, function () {
                var apiInfo, optionsRequest, startFetchTime, res, endFetchTime, duration, resText, data, error_1, error_2;
                var _a, _b, _c;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0:
                            apiInfo = compileUrlByService(this.config, idService, payload, options);
                            if (apiInfo == null) {
                                return [2 /*return*/, responseFormat({
                                        ok: false,
                                        duration: 0,
                                        status: 500,
                                        headers: null,
                                        data: null,
                                        problem: "Service ".concat(idService.id, " in driver not found"),
                                        originalError: "Service ".concat(idService.id, " in driver not found"),
                                    })];
                            }
                            _d.label = 1;
                        case 1:
                            _d.trys.push([1, 7, , 8]);
                            optionsRequest = __assign({}, apiInfo.options);
                            if (!((_a = optionsRequest.headers) === null || _a === void 0 ? void 0 : _a.hasOwnProperty("Content-Type"))) {
                                optionsRequest.headers = __assign(__assign({}, optionsRequest.headers), { "Content-Type": "application/json" });
                            }
                            if (apiInfo.method.toUpperCase() != "GET") {
                                optionsRequest = __assign(__assign({}, optionsRequest), { method: apiInfo.method.toUpperCase(), body: compileBodyFetchWithContextType((_b = optionsRequest.headers) === null || _b === void 0 ? void 0 : _b["Content-Type"].toLowerCase(), apiInfo.payload) });
                                if ((_c = optionsRequest.headers) === null || _c === void 0 ? void 0 : _c.hasOwnProperty("Content-Type")) {
                                    if (optionsRequest.headers["Content-Type"].toLowerCase() ==
                                        "multipart/form-data")
                                        delete optionsRequest["headers"];
                                }
                            }
                            startFetchTime = performance.now();
                            return [4 /*yield*/, fetch(apiInfo.url, optionsRequest)];
                        case 2:
                            res = _d.sent();
                            endFetchTime = performance.now();
                            duration = parseFloat((endFetchTime - startFetchTime).toFixed(2));
                            resText = null;
                            data = null;
                            _d.label = 3;
                        case 3:
                            _d.trys.push([3, 5, , 6]);
                            return [4 /*yield*/, res.text()];
                        case 4:
                            resText = _d.sent();
                            data =
                                JSON.parse(resText) == undefined ? resText : JSON.parse(resText);
                            return [3 /*break*/, 6];
                        case 5:
                            error_1 = _d.sent();
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
                            error_2 = _d.sent();
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
            }); },
            getInfoURL: function (idService, payload) {
                var apiInfo = compileService(idService, _this.config.services);
                if (apiInfo != null) {
                    if (Object.keys(payload).length > 0 && apiInfo.methods === "get") {
                        var queryString = qs.stringify(payload);
                        payload = {};
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
    DriverBuilder.prototype.withAddTransformResponse = function (callback) {
        this.config.addTransformResponse = callback;
        return this;
    };
    DriverBuilder.prototype.withAddRequestTransform = function (callback) {
        this.config.addRequestTransform = callback;
        return this;
    };
    DriverBuilder.prototype.withHandleInterceptorError = function (callback) {
        this.config.handleInterceptorError = callback;
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
export { DriverBuilder };
