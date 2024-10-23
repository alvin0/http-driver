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
import qs from "qs";
import { compileBodyFetchWithContextType, compileService, compileUrlByService, responseFormat, } from "./utils";
class Driver {
    constructor(config) {
        var _a;
        this.config = config;
        this.apiSauceInstance = create({
            withCredentials: (_a = config.withCredentials) !== null && _a !== void 0 ? _a : true,
            baseURL: config.baseURL,
        });
        let isRefreshing = false;
        let failedQueue = [];
        const processQueue = (error, token = null) => {
            failedQueue.forEach((prom) => {
                if (error) {
                    prom.reject(error);
                }
                else {
                    prom.resolve(token);
                }
            });
            failedQueue = [];
        };
        const interceptorError = (axiosInstance) => (error) => __awaiter(this, void 0, void 0, function* () {
            return Promise.reject(error);
        });
        this.apiSauceInstance.axiosInstance.interceptors.response.use(undefined, this.config.handleInterceptorError
            ? this.config.handleInterceptorError(this.apiSauceInstance.axiosInstance, processQueue, isRefreshing)
            : interceptorError(this.apiSauceInstance.axiosInstance));
        this.apiSauceInstance.addRequestTransform((request) => {
            // console.log("Start========LogAxiosRequest========Start",request, "End========LogAxiosRequest========End")
            if (this.config.addRequestTransform) {
                this.config.addRequestTransform(request);
            }
        });
        this.apiSauceInstance.addResponseTransform((response) => {
            // console.log("Start========LogAxiosResponse========Start",response, "End========LogAxiosResponse========End")
            if (this.config.addTransformResponse) {
                this.config.addTransformResponse(response);
            }
        });
        return this;
    }
    appendExecService() {
        const httpProAskDriver = Object.assign(this.apiSauceInstance, {
            execService: (idService, payload, options) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                const apiInfo = compileUrlByService(this.config, idService, payload, options);
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
                let payloadConvert = apiInfo.payload;
                if (apiInfo.options.headers &&
                    typeof apiInfo.options.headers === "object" &&
                    ((_a = apiInfo.options.headers) === null || _a === void 0 ? void 0 : _a.hasOwnProperty("Content-Type"))) {
                    const contentType = apiInfo.options.headers["Content-Type"];
                    if (contentType.toLowerCase() === "multipart/form-data") {
                        // delete apiInfo.options.headers;
                        // payloadConvert = compileBodyFetchWithContextType(contentType.toLowerCase(), apiInfo.payload)
                    }
                }
                return yield this.apiSauceInstance[apiInfo.method](apiInfo.pathname, payloadConvert, apiInfo.options);
            }),
            execServiceByFetch: (idService, payload, options) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b, _c;
                const apiInfo = compileUrlByService(this.config, idService, payload, options);
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
                    let optionsRequest = Object.assign({}, apiInfo.options);
                    if (!((_a = optionsRequest.headers) === null || _a === void 0 ? void 0 : _a.hasOwnProperty("Content-Type"))) {
                        optionsRequest.headers = Object.assign(Object.assign({}, optionsRequest.headers), { "Content-Type": "application/json" });
                    }
                    if (apiInfo.method.toUpperCase() != "GET") {
                        optionsRequest = Object.assign(Object.assign({}, optionsRequest), { method: apiInfo.method.toUpperCase(), body: compileBodyFetchWithContextType((_b = optionsRequest.headers) === null || _b === void 0 ? void 0 : _b["Content-Type"].toLowerCase(), apiInfo.payload) });
                        if ((_c = optionsRequest.headers) === null || _c === void 0 ? void 0 : _c.hasOwnProperty("Content-Type")) {
                            if (optionsRequest.headers["Content-Type"].toLowerCase() ==
                                "multipart/form-data")
                                delete optionsRequest["headers"];
                        }
                    }
                    const startFetchTime = performance.now();
                    const res = yield fetch(apiInfo.url, optionsRequest);
                    const endFetchTime = performance.now();
                    const duration = parseFloat((endFetchTime - startFetchTime).toFixed(2));
                    let resText = null;
                    let data = null;
                    try {
                        resText = yield res.text();
                        data =
                            JSON.parse(resText) == undefined ? resText : JSON.parse(resText);
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
            }),
            getInfoURL: (idService, payload) => {
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
    constructor() {
        this.config = {
            baseURL: "",
            services: [],
        };
    }
    withBaseURL(baseURL) {
        this.config.baseURL = baseURL;
        return this;
    }
    withServices(services) {
        this.config.services = services;
        return this;
    }
    withAddTransformResponse(callback) {
        this.config.addTransformResponse = callback;
        return this;
    }
    withAddRequestTransform(callback) {
        this.config.addRequestTransform = callback;
        return this;
    }
    withHandleInterceptorError(callback) {
        this.config.handleInterceptorError = callback;
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
