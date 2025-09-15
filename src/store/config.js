/**
 * 存储数字人配置数据
 */
import { defineStore } from "pinia";
import { reactive } from "vue";
import { merge } from "lodash-es";
import { storage } from "@/utils";

export const useConfigStore = defineStore("config", function () {
  const info = reactive({});

  function set(data) {
    merge(info, data);
    storage.set("configInfo", info);
  }

  function clear() {
    storage.remove("configInfo");
    Object.keys(info).forEach((key) => {
      delete info[key];
    });
  }

  return {
    info,
    set,
    clear,
  };
});
