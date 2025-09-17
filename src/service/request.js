import axios from "axios";
import { API_CONFIG } from "@/constants/index";
import { showError } from "./errorHandler";

const service = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 添加 Authorization 头
    config.headers["Authorization"] = `Bearer ${API_CONFIG.apiKey}`;
    // 请求超时处理
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
  (response) => {
    const res = response.data;

    // 处理业务错误
    if (res.error) {
      showError(res.error);
      return Promise.reject(new Error(res.error.message || "请求失败"));
    }
    return res;
  },
  (error) => {
    // 处理 HTTP 错误
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
