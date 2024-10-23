import type { HEADERS } from "apisauce";
import { AxiosRequestConfig } from 'axios';
export enum MethodAPI {
    get = "get",
    delete = "delete",
    head = "head",
    post = "post",
    put = "put",
    patch = "patch",
    link = "link",
    unlink = "unlink",
}

export interface ServiceApi {
    id: string;
    url: string;
    method: MethodAPI;
    version?: number;
    options?: { [key: string]: any };
    showSuccess?: boolean;
}

export interface ServiceUrlCompile<T = string> {
    id: T | string,
    param?: { [key: string]: any };
}

export interface DriverInformation {
    baseURL: string,
    services: any,
    [key: string]: any
}

export interface DriverConfig {
    baseURL: string;
    services: ServiceApi[];
    withCredentials?: boolean;
    [key: string]: any;
}

export interface HttpDriverResponse<T> {
    duration: number;
    problem: null;
    originalError: null;
    ok: boolean;
    status: number;
    messageFieldValidate: DataObject;
    data?: T
    headers?: HEADERS
    config?: AxiosRequestConfig
}


interface DataObject {
    [key: string]: any;
}

export interface BaseApiResponse {
    ok: boolean;
    problem: string | null;
    originalError: string | null;
    data: any | null;
    status: number;
    headers: Headers | null;
    duration: number;
}


export interface UrlBuilder {
    url: string,
    method: MethodAPI,
    param?: { [key: string]: any };
}


export interface CompileUrlResult {
    url: string;
    payload: { [key: string]: any };
    method: MethodAPI;
    pathname: string;
    options: { [key: string]: object | string };
}

export interface ResponseFormat<T = any> {
    ok: boolean;
    problem: string | null;
    originalError: string | null;
    data: T;
    status: number;
    headers?: Headers | null;
    duration: number;
}