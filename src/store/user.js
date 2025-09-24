/**
 * 存储用户信息
 */
import { defineStore } from "pinia";
import { reactive, ref } from "vue";
import { merge } from "lodash-es";

import * as service from "@/service/api";
import { storage } from "@/utils";
import { useMitt } from "@/hooks/useMitt";

export const useUserStore = defineStore("user", function () {
  const mitt = useMitt();

  const info = reactive(merge({}, storage.get("userInfo")), {
  });

  const accessToken = ref(storage.get("accessToken"));
  const options = reactive({});
  // 设置用户信息
  function set(data) {
    merge(info, data);
    storage.set("userInfo", info);
  }

  // 设置标识
  function setToken(data) {
    // 请求的唯一标识accessToken
    if (data.accessToken) {
      accessToken.value = data.accessToken;
      storage.set("accessToken", data.accessToken);
    }

    // 刷新 token 的唯一标识
    if (data.refreshToken) {
      storage.set("refreshToken", data.refreshToken);
    }
  }

  // 清除用户
  function clear() {
    storage.remove("userInfo");
    storage.remove("appInfo");
    storage.remove("configInfo");
    storage.remove("accessToken");
    storage.remove("refreshToken");
    accessToken.value = "";
    Object.keys(info).forEach((key) => {
      delete info[key];
    });
  }
  return {
    info,
    accessToken,
    setToken,
    set,
    clear,
  };
});
