"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.TLSError = exports.AuthenticationError = exports.MalformedResponseError = exports.RedirectError = exports.NetworkError = exports.TimeoutError = exports.HTTPError = void 0;
var HTTPError = /** @class */ (function (_super) {
    __extends(HTTPError, _super);
    function HTTPError(message, status, data) {
        var _this = _super.call(this, message) || this;
        _this.status = status;
        _this.data = data;
        // Ensure proper prototype chain
        Object.setPrototypeOf(_this, HTTPError.prototype);
        return _this;
    }
    return HTTPError;
}(Error));
exports.HTTPError = HTTPError;
var TimeoutError = /** @class */ (function (_super) {
    __extends(TimeoutError, _super);
    function TimeoutError(message) {
        if (message === void 0) { message = 'timeout'; }
        var _this = _super.call(this, message, 408) || this;
        Object.setPrototypeOf(_this, TimeoutError.prototype);
        return _this;
    }
    return TimeoutError;
}(HTTPError));
exports.TimeoutError = TimeoutError;
var NetworkError = /** @class */ (function (_super) {
    __extends(NetworkError, _super);
    function NetworkError(message) {
        if (message === void 0) { message = 'Network error occurred'; }
        var _this = _super.call(this, message, 503) || this;
        Object.setPrototypeOf(_this, NetworkError.prototype);
        return _this;
    }
    return NetworkError;
}(HTTPError));
exports.NetworkError = NetworkError;
var RedirectError = /** @class */ (function (_super) {
    __extends(RedirectError, _super);
    function RedirectError(message) {
        if (message === void 0) { message = 'Maximum redirects exceeded'; }
        var _this = _super.call(this, message, 310) || this;
        Object.setPrototypeOf(_this, RedirectError.prototype);
        return _this;
    }
    return RedirectError;
}(HTTPError));
exports.RedirectError = RedirectError;
var MalformedResponseError = /** @class */ (function (_super) {
    __extends(MalformedResponseError, _super);
    function MalformedResponseError(message) {
        if (message === void 0) { message = 'Malformed response'; }
        var _this = _super.call(this, message, 500) || this;
        Object.setPrototypeOf(_this, MalformedResponseError.prototype);
        return _this;
    }
    return MalformedResponseError;
}(HTTPError));
exports.MalformedResponseError = MalformedResponseError;
var AuthenticationError = /** @class */ (function (_super) {
    __extends(AuthenticationError, _super);
    function AuthenticationError(message) {
        if (message === void 0) { message = 'Authentication failed'; }
        var _this = _super.call(this, message, 401) || this;
        Object.setPrototypeOf(_this, AuthenticationError.prototype);
        return _this;
    }
    return AuthenticationError;
}(HTTPError));
exports.AuthenticationError = AuthenticationError;
var TLSError = /** @class */ (function (_super) {
    __extends(TLSError, _super);
    function TLSError(message) {
        if (message === void 0) { message = 'TLS/SSL error occurred'; }
        var _this = _super.call(this, message, 525) || this;
        Object.setPrototypeOf(_this, TLSError.prototype);
        return _this;
    }
    return TLSError;
}(HTTPError));
exports.TLSError = TLSError;
