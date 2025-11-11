import { defineStore } from "pinia";
import { computed, reactive } from "vue";
import { merge } from "lodash-es";
import { storage } from "@/utils";
import { API_CONFIG } from "@/constants";
import doubao from "@/assets/img/doubao.png";
const useAppStore = defineStore("app", function () {
  // 从本地存储中获取数据
  const insistance = storage.get("appInfo");
  const localInfo = storage.get("apiConfig");
  const info = reactive({
    logo: doubao,
    appName: "袁小漫",
    isSideBarVisible: true,
    isSmallPage: false,
    isSidebarFixed: false,
    isPageHide: false,
    isAvailable: true,
    deepseek: false,
    localDateTime: new Date(),
    showWatermark: insistance?.showWatermark || false,
    balanceInfo: {},
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
  return {
    logo,
    apiInfo,
    balanceInfo,
    isSideBarVisible,
    isSidebarFixed,
    isSmallPage,
    deepseek: computed(() => info.deepseek),
    appName: computed(() => info.appName),
    useModel: computed(() => apiConfig.model),
    baseURL: computed(() => apiConfig.baseURL),
    apiKey: computed(() => apiConfig.apiKey),
    defaultParams: computed(() => apiConfig.defaultParams),
    localDateTime: computed(() => info.localDateTime),
    set,
    setApiConfig,
    clear,
  };
});
export default useAppStore