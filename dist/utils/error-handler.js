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
Object.defineProperty(exports, "__esModule", { value: true });
exports.isEmptyResponse = exports.isMalformedResponse = exports.handleErrorResponse = exports.normalizeError = void 0;
var errors_1 = require("../types/errors");
// ErrorResponse must match ResponseFormat structure
function normalizeError(error) {
    var baseError = {
        ok: false,
        duration: 0,
        headers: null,
        data: null
    };
    if (error instanceof errors_1.HTTPError) {
        return __assign(__assign({}, baseError), { status: error.status || 500, problem: error.message, originalError: error.message, data: error.data || null });
    }
    if (error instanceof Error) {
        return __assign(__assign({}, baseError), { status: 500, problem: error.message, originalError: error.message });
    }
    // Handle unexpected error types
    return __assign(__assign({}, baseError), { status: 500, problem: 'An unknown error occurred', originalError: String(error) });
}
exports.normalizeError = normalizeError;
function handleErrorResponse(error) {
    if (error instanceof errors_1.AuthenticationError) {
        return normalizeError(error);
    }
    if (error instanceof errors_1.TimeoutError) {
        return normalizeError(error);
    }
    if (error instanceof errors_1.NetworkError) {
        return normalizeError(error);
    }
    if (error instanceof errors_1.RedirectError) {
        return normalizeError(error);
    }
    if (error instanceof errors_1.TLSError) {
        return normalizeError(error);
    }
    if (error instanceof errors_1.MalformedResponseError) {
        return normalizeError(error);
    }
    return normalizeError(error);
}
exports.handleErrorResponse = handleErrorResponse;
function isMalformedResponse(response) {
    if (!response)
        return true;
    if (typeof response === 'string') {
        try {
            JSON.parse(response);
            return false;
        }
        catch (_a) {
            return true;
        }
    }
    return false;
}
exports.isMalformedResponse = isMalformedResponse;
function isEmptyResponse(response) {
    return response === '' || response === null || response === undefined;
}
exports.isEmptyResponse = isEmptyResponse;
