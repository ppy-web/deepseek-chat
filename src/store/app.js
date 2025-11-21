import { defineStore } from "pinia";
import { computed, reactive } from "vue";
import { merge } from "lodash-es";
import { storage } from "@/utils";
import { API_CONFIG } from "@/constants";
import { formatDate } from '@/utils'

import doubao from "@/assets/img/manman.png";
const useAppStore = defineStore("app", function () {
  // 从本地存储中获取数据
  const insistance = storage.get("appInfo");
  const localInfo = storage.get("apiConfig");
  const info = reactive({
    logo: doubao,
    isSideBarVisible: insistance?.isSideBarVisible || false,
    isSmallPage: false,
    isSidebarFixed: false,
    isPageHide: true,
    isAvailable: true, // deepseek是否可用
    deepseek: insistance?.deepseek || false,
    localDateTime: new Date(),
    showWatermark: insistance?.showWatermark || false,
    balanceInfo: {},
    theme: insistance?.theme || 'light', // 主题：light 或 dark
  });
  const apiConfig = reactive({
    ...API_CONFIG,
    ...localInfo,
  })

  const apiInfo = computed(() => apiConfig);
  const logo = computed(() => info.logo);
  const balanceInfo = computed(() => info.balanceInfo);
  const isSideBarVisible = computed(() => info.isSideBarVisible);
  const isSidebarFixed = computed(() => info.isSidebarFixed);
  const isSmallPage = computed(() => info.isSmallPage);

  function set(data) {
    merge(info, data);
    storage.set("appInfo", info);
  }
  function setApiConfig(data) {
    merge(apiConfig, data);
    storage.set("apiConfig", info);
  }
  function clear() {
    storage.remove("appInfo");
    storage.remove("apiConfig");
  }
  const theme = computed(() => info.theme);
  const isDark = computed(() => info.theme === 'dark');
  
  function toggleTheme() {
    const newTheme = info.theme === 'light' ? 'dark' : 'light';
    set({ theme: newTheme });
    // 更新 HTML 根元素的类名
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  }

  return {
    logo,
    apiInfo,
    balanceInfo,
    isSideBarVisible,
    isSidebarFixed,
    isSmallPage,
    deepseek: computed(() => info.deepseek),
    useModel: computed(() => apiConfig.model),
    baseURL: computed(() => apiConfig.baseURL),
    apiKey: computed(() => apiConfig.apiKey),
    defaultParams: computed(() => apiConfig.defaultParams),
    localDateTime: computed(() => formatDate(info.localDateTime)),
    theme,
    isDark,
    toggleTheme,
    set,
    setApiConfig,
    clear,
  };
});
export default useAppStore