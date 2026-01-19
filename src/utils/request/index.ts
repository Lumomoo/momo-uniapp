// 引入配置
import type { HttpRequestConfig, HttpResponse } from 'uview-plus/libs/luch-request/index';
import Request from 'uview-plus/libs/luch-request/index';
import { requestInterceptors, responseInterceptors } from './interceptors';
import type { IResponse } from './type';
import { buildEncryptPayload } from './encrypt';

const http = new Request();

// 引入拦截器配置
export function setupRequest() {
  http.setConfig((defaultConfig: HttpRequestConfig) => {
    /* defaultConfig 为默认全局配置 */
    defaultConfig.baseURL = import.meta.env.VITE_APP_BASE_API;
    return defaultConfig;
  });
  requestInterceptors(http);
  responseInterceptors(http);
}

export function request<T = any>(config: HttpRequestConfig): Promise<T> {
  return new Promise((resolve) => {
    http.request(config).then((res: HttpResponse<IResponse<T>> | IResponse<T> | T) => {
      const responseData = (res as HttpResponse<IResponse<T>>)?.data ?? res;
      const data = (responseData as IResponse<T>)?.data ?? (responseData as IResponse<T>)?.result ?? responseData;
      resolve(data as T);
    });
  });
}

export function get<T = any>(config: HttpRequestConfig): Promise<T> {
  return request({ ...config, method: 'GET' });
}

export function post<T = any>(config: HttpRequestConfig): Promise<T> {
  return request({ ...config, method: 'POST' });
}

/**
 * 发送加密POST请求
 */
export function postEncrypt<T = any>(config: HttpRequestConfig): Promise<T> {
  const { encryptKey, encryptData } = buildEncryptPayload((config.data || {}) as Record<string, any>);
  const header = { ...(config.header || {}), 'encrypt-key': encryptKey };
  return request({ ...config, method: 'POST', header, data: encryptData });
}

export function upload<T = any>(config: HttpRequestConfig): Promise<T> {
  return request({ ...config, method: 'UPLOAD' });
}

export function download<T = any>(config: HttpRequestConfig): Promise<T> {
  return request({ ...config, method: 'DOWNLOAD' });
}

export default setupRequest;
