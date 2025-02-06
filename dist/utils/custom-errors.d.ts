export declare class HTTPError extends Error {
    status?: number;
    data?: any;
    constructor(message: string, status?: number, data?: any);
}
export declare class TimeoutError extends HTTPError {
    constructor(message?: string);
}
export declare class NetworkError extends HTTPError {
    constructor(message?: string);
}
export declare class RedirectError extends HTTPError {
    constructor(message?: string);
}
export declare class MalformedResponseError extends HTTPError {
    constructor(message?: string);
}
export declare class AuthenticationError extends HTTPError {
    constructor(message?: string);
}
export declare class TLSError extends HTTPError {
    constructor(message?: string);
}
