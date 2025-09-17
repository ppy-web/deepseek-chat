/**
 * 存储配置数据
 */
import { defineStore } from "pinia";
import { ref, reactive } from "vue";
import { merge } from "lodash-es";
import { storage } from "@/utils";

export const useConfigStore = defineStore("config", function () {
  const info = reactive({});
  const baseURL = ref("https://api.deepseek.com/v1");
  const apiKey = ref("sk-858ee51df95e456fa5e74fcde3e478e7");
  const model = ref("deepseek-chat");
  const temperature = ref(0.7);
  const maxTokens = ref(2000);
  const topP = ref(0.95);
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

  // 初始化配置
  const initConfig = () => {
    const savedConfig = localStorage.getItem("api-config");
    if (savedConfig) {
      const config = JSON.parse(savedConfig);
      baseURL.value = config.baseURL;
      apiKey.value = config.apiKey;
      model.value = config.model;
      temperature.value = config.temperature;
      maxTokens.value = config.maxTokens;
      topP.value = config.topP;
    }
  };

  // 保存配置
  const saveConfig = () => {
    const config = {
      baseURL: baseURL.value,
      apiKey: apiKey.value,
      model: model.value,
      temperature: temperature.value,
      maxTokens: maxTokens.value,
      topP: topP.value,
    };
    localStorage.setItem("api-config", JSON.stringify(config));
  };

  // 获取当前配置
  const getCurrentConfig = () => {
    return {
      baseURL: baseURL.value,
      apiKey: apiKey.value,
      model: model.value,
      defaultParams: {
        temperature: temperature.value,
        max_tokens: maxTokens.value,
        top_p: topP.value,
        frequency_penalty: 0,
        presence_penalty: 0,
      },
    };
  };

  return {
    baseURL,
    apiKey,
    model,
    temperature,
    maxTokens,
    topP,
    initConfig,
    saveConfig,
    getCurrentConfig,
    info,
    set,
    clear,
  };
});
