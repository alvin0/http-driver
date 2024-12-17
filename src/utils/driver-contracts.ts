import type { ApiResponse, AsyncRequestTransform, AsyncResponseTransform, HEADERS, PROBLEM_CODE } from "apisauce";
import { AxiosError, AxiosRequestConfig } from "axios";
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
  version?: number | string;
  options?: { [key: string]: any };
  showSuccess?: boolean;
}

export interface ServiceUrlCompile<T = string> {
  id: T | string;
  params?: { [key: string]: any };
}

export interface DriverInformation {
  baseURL: string;
  services: any;
  [key: string]: any;
}

export interface DriverConfig {
  baseURL: string;
  services: ServiceApi[];
  withCredentials?: boolean;
  addRequestTransformAxios?: (request: AxiosRequestConfig) => void;
  addTransformResponseAxios?: (response: ApiResponse<any>) => void;
  addAsyncRequestTransform?: (transform: AsyncRequestTransform) => void;
  addAsyncResponseTransform?: (transform: AsyncResponseTransform) => void;
  handleInterceptorErrorAxios?: (
    axiosInstance: any,
    processQueue: (error: any, token: string | null) => void,
    isRefreshing: boolean
  ) => (error: any) => Promise<any>;
  addTransformResponseFetch?: (response: ResponseFormat) => ResponseFormat;
  addRequestTransformFetch?: (
    url: string,
    requestOptions: { [key: string]: any }
  ) => { url: string; requestOptions: { [key: string]: any } };
  [key: string]: any;
}

export interface HttpDriverResponse<T> {
  duration: number;
  problem: null;
  originalError: null;
  ok: boolean;
  status: number;
  messageFieldValidate: DataObject;
  data?: T;
  headers?: HEADERS;
  config?: AxiosRequestConfig;
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
  url: string;
  method: MethodAPI;
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
  problem: string | null | PROBLEM_CODE;
  originalError: string | null | AxiosError;
  data: T;
  status: number;
  config?: AxiosRequestConfig;
  headers?: Headers | null;
  duration: number;
}

export interface CompiledServiceInfo {
  url: string;
  methods: MethodAPI; // Assuming 'method' is a string. Use a more specific type if available.
  version: number | string | undefined; // Adjust this type based on the actual data structure.
  options: Record<string, any>; // Replace 'any' with a more specific type if possible.
}
