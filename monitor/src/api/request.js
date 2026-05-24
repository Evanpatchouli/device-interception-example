// request.js

import { Toast } from "evp-design-ui";
import appConfig from "../../../app.config";

const DEFAULT_TIMEOUT = 5000; // 默认超时时间为 5 秒

const isMonitorRuntime = () => {
  const pathname = globalThis.location?.pathname;
  const monitorPath = appConfig.monitor.path.replace(/\/+$/, '');
  return pathname === monitorPath || pathname?.startsWith(`${monitorPath}/`);
};

const getApiUrl = (url) => {
  if (!(url || "").startsWith("/api")) {
    return url;
  }

  if (isMonitorRuntime()) {
    return url;
  }

  return appConfig.apiPath().concat(url.replace(/\/api/, ''));
};

/**
 * 处理 fetch 请求的响应
 * @param {Response} response - fetch 请求的响应对象
 * @returns {Promise<any>} - 解析后的响应数据
 */
const handleResponse = async (response) => {
  if (!response.ok) {
    let msg = "";
    switch (response.status) {
      case 500:
        msg = '接口异常，请稍后再试';
        break;
      default:
        msg = response.statusText;
        break;
    }
    throw new Error(msg || '接口请求失败');
  }
  return response.json();
};

/**
 * 处理 fetch 请求的错误
 * @param {Error} error - fetch 请求的错误对象
 * @returns {Promise<never>} - 抛出错误
 */
const handleError = (error) => {
  console.error('请求失败:', error);
  Toast.error('请求失败：' + error.message);
  throw error;
};

/**
 * 带有超时处理的 fetch 请求
 * @param {string} url - 请求的 URL
 * @param {object} options - fetch 请求的选项
 * @param {number} timeout - 超时时间，单位为毫秒
 * @returns {Promise<any>} - 返回一个 Promise 对象
 */
const fetchWithTimeout = (url, options, timeout = DEFAULT_TIMEOUT) => {
  const controller = new AbortController();
  const { signal } = controller;

  url = getApiUrl(url);

  let timeoutId;

  const fetchPromise = fetch(url, { ...options, signal })
    .then(response => {
      clearTimeout(timeoutId); // 请求成功时清除超时处理
      return handleResponse(response);
    })
    .catch(error => {
      clearTimeout(timeoutId); // 请求失败时清除超时处理
      return handleError(error);
    });

  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      Toast.error('接口请求超时');
      reject(new Error('接口请求超时'));
      controller.abort(); // 取消 fetch 请求
    }, timeout);
  });

  return Promise.race([fetchPromise, timeoutPromise]);
};


/**
 * Performs a GET request to the specified URL with the given options and timeout.
 * @type {API.GET}
 */
export function GET(url, options = {}, timeout) {
  return fetchWithTimeout(url, { ...options, method: 'GET' }, timeout);
}


/**
 * Performs a POST request to the specified URL with the given data, options, and timeout.
 *
 * @type {API.POST}
 * If the request fails or times out, the Promise will be rejected with an Error object.
 * 
 * @example
 * ```
 * POST('http://localhost:3000/api', { key: 'value' }, 
 *   { 
 *     headers: { 
 *       'Authorization':
 *        'Bearer token' 
 *     }
 *   }, 5000)
 *   .then(response => console.log(response))
 *   .catch(error => console.error(error));
 * ```
 */
export function POST(url, data, options = {}, timeout) {
  return fetchWithTimeout(
    url,
    { ...options, method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json', ...options.headers } },
    timeout
  );
}

/**
 * Performs a PUT request to the specified URL with the given data, options, and timeout.
 * 
 * @param {string} url - The URL to which the PUT request will be sent.
 * @param {object} data - The data to be sent as the body of the PUT request.
 * @param {object} options - Additional options for the fetch request.
 * @param {number} timeout - The timeout for the request in milliseconds.
 * 
 * @returns {Promise<any>} - A Promise that resolves to the parsed JSON response of the PUT request.
 */
export function PUT(url, data, options = {}, timeout) {
  return fetchWithTimeout(
    url,
    { ...options, method: 'PUT', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json', ...options.headers } },
    timeout
  );
};

/**
 * Performs a DELETE request to the specified URL with the given options and timeout.
 *
 * @param {string} url - The URL to which the DELETE request will be sent.
 * @param {object} [options={}] - Additional options for the fetch request.
 * @param {number} [timeout=DEFAULT_TIMEOUT] - The timeout for the request in milliseconds.
 *
 * @returns {Promise<any>} - A Promise that resolves to the parsed JSON response of the DELETE request.
 * If the request fails or times out, the Promise will be rejected with an Error object.
 */
export function DELETE(url, options = {}, timeout) {
  return fetchWithTimeout(url, { ...options, method: 'DELETE' }, timeout);
}

const request = {
  GET,
  POST,
  PUT,
  DELETE,
};

export default request;
