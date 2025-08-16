import type { ResponseFormat } from "../types/driver";
export declare function normalizeError(error: unknown): ResponseFormat;
export declare function handleErrorResponse(error: unknown): ResponseFormat;
export declare function isMalformedResponse(response: unknown): boolean;
export declare function isEmptyResponse(response: unknown): boolean;
