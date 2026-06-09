import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from "axios";
import { API_CONFIG } from "@/constants/index";
import { showError } from "./errorHandler";

const service: AxiosInstance = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    if (!config.headers["Authorization"] && API_CONFIG.apiKey) {
      config.headers["Authorization"] = `Bearer ${API_CONFIG.apiKey}`;
    }
    config.timeout = config.timeout || 30000;
    return config;
  },
  (error) => {
    showError(error);
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    const res = response.data;
    if (res.error) {
      showError(res.error);
      return Promise.reject(new Error(res.error.message || "请求失败"));
    }
    return res;
  },
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          showError("API密钥无效或已过期");
          break;
        case 403:
          showError("没有访问权限");
          break;
        case 429:
          showError("请求太频繁，请稍后再试");
          break;
        case 500:
          showError("服务器错误，请稍后重试");
          break;
        default:
          showError(error);
      }
    } else {
      showError(error);
    }
    return Promise.reject(error);
  }
);

export default service;
