import { defineStore } from "pinia";
import { computed, reactive } from "vue";
import { storage } from "@/utils";
import { API_CONFIG } from "@/constants";
import { formatDate } from "@/utils";
import {
  isDeepSeekThinkingModel,
  normalizeDeepSeekModel,
  type DeepSeekDefaultParams,
  type DeepSeekModel,
} from "@/constants/deepseek";

import doubao from "@/assets/img/manman.png";

interface AppInfo {
  logo: string;
  isSideBarVisible: boolean;
  isSmallPage: boolean;
  isSidebarFixed: boolean;
  isPageHide: boolean;
  isAvailable: boolean;
  deepseek: boolean;
  localDateTime: Date;
  showWatermark: boolean;
  balanceInfo: Record<string, unknown>;
  theme: 'light' | 'dark';
}

interface ApiConfig {
  baseURL: string;
  apiKey: string;
  model: DeepSeekModel;
  timeout: number;
  defaultParams: DeepSeekDefaultParams;
}

const useAppStore = defineStore("app", function () {
  const insistance = storage.get("appInfo");
  const localInfo = storage.get("apiConfig");

  let parsedInsistance: Partial<AppInfo> = {};
  let parsedLocalInfo: Partial<Omit<ApiConfig, "model">> & {
    model?: string;
  } = {};

  try {
    if (insistance) parsedInsistance = JSON.parse(insistance);
  } catch (e) {
    console.warn("Failed to parse appInfo from storage");
  }
  try {
    if (localInfo) parsedLocalInfo = JSON.parse(localInfo);
  } catch (e) {
    console.warn("Failed to parse apiConfig from storage");
  }

  const info = reactive<AppInfo>({
    logo: doubao as string,
    isSideBarVisible: parsedInsistance?.isSideBarVisible || false,
    isSmallPage: false,
    isSidebarFixed: false,
    isPageHide: true,
    isAvailable: true,
    deepseek: parsedInsistance?.deepseek || false,
    localDateTime: new Date(),
      showWatermark: parsedInsistance?.showWatermark || false,
      balanceInfo: {},
      theme: parsedInsistance?.theme || 'light',
  });

  const normalizedModel = normalizeDeepSeekModel(parsedLocalInfo?.model);

  const apiConfig = reactive<ApiConfig>({
    ...API_CONFIG,
    ...parsedLocalInfo,
    model: normalizedModel,
  });

  info.deepseek = parsedInsistance?.deepseek ?? isDeepSeekThinkingModel(normalizedModel);

  function merge<T extends Record<string, unknown>>(target: T, source: Partial<T>): void {
    Object.keys(source).forEach((key) => {
      if (source[key] !== undefined) {
        (target as Record<string, unknown>)[key] = source[key];
      }
    });
  }

  function set(data: Partial<AppInfo>): void {
    merge(info as Record<string, unknown>, data as Record<string, unknown>);
    storage.set("appInfo", JSON.stringify(info));
  }

  function setApiConfig(data: Partial<ApiConfig>): void {
    merge(apiConfig as Record<string, unknown>, data as Record<string, unknown>);
    storage.set("apiConfig", JSON.stringify(apiConfig));
  }

  function clear(): void {
    storage.remove("appInfo");
    storage.remove("apiConfig");
  }

  function toggleTheme(): void {
    const newTheme = info.theme === 'light' ? 'dark' : 'light';
    set({ theme: newTheme });
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  }

  return {
    logo: computed(() => info.logo),
    apiInfo: computed(() => apiConfig),
    balanceInfo: computed(() => info.balanceInfo),
    isSideBarVisible: computed(() => info.isSideBarVisible),
    isSidebarFixed: computed(() => info.isSidebarFixed),
    isSmallPage: computed(() => info.isSmallPage),
    isDeepseek: computed(() => info.deepseek),
    useModel: computed(() => apiConfig.model),
    baseURL: computed(() => apiConfig.baseURL),
    apiKey: computed(() => apiConfig.apiKey),
    defaultParams: computed(() => apiConfig.defaultParams),
    localDateTime: computed(() => formatDate(info.localDateTime)),
    theme: computed(() => info.theme),
    isDark: computed(() => info.theme === 'dark'),
    toggleTheme,
    set,
    setApiConfig,
    clear,
  };
});

export default useAppStore;
