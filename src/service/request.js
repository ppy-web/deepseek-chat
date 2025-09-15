import axios from "axios";
import qs from "qs";
import { useStore } from "@/hooks/useStore";

const service = axios.create({
  timeout: 60000,
});

let isRefreshing = false; // 标记当前是否正在刷新token
let refreshTokenPromise = null; // 刷新token的Promise，避免重复请求

service.defaults.baseURL = "/apis";

service.defaults.headers["Content-Type"] =
  "application/x-www-form-urlencoded;charset=UTF-8";

// request interceptor
service.interceptors.request.use(
  (config) => {
    const { user } = useStore();

    if (config.headers["Content-Type"] !== "multipart/form-data") {
      config.data = qs.stringify(config.data);
    }
    if (config.authorization) {
      config.headers["Blade-Auth"] = "bearer " + user.accessToken;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// response interceptor
service.interceptors.response.use(
  (response) => {
    const res = response.data;
    if (res.code === 200) {
      return Promise.resolve(res.data);
    } else {
      return Promise.reject(res.error || res.msg || "接口报错");
    }
  },
  (error) => {
    return Promise.reject(error.response);
  }
);

export default service;
