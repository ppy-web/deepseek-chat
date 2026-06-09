import { defineStore } from "pinia";
import { computed, reactive } from "vue";
import { storage } from "@/utils";
import { API_CONFIG } from "@/constants";
import { formatDate } from "@/utils";
import {
  getProviderBaseURL,
  isModelThinkingDefault,
  normalizeChatModel,
  normalizeProvider,
  PROVIDERS,
  type AIProvider,
  type ChatDefaultParams,
  type ChatModel,
  type ProviderApiKeys,
} from "@/constants/llm";

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
  provider: AIProvider;
  baseURL: string;
  apiKey: string;
  apiKeys: ProviderApiKeys;
  apiKeyConfigured: Record<AIProvider, boolean>;
  model: ChatModel;
  timeout: number;
  defaultParams: ChatDefaultParams;
}

const useAppStore = defineStore("app", function () {
  const insistance = storage.get("appInfo");
  const localInfo = storage.get("apiConfig");

  let parsedInsistance: Partial<AppInfo> = {};
  let parsedLocalInfo: Partial<Omit<ApiConfig, "model" | "provider">> & {
    model?: string;
    provider?: string;
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

  const normalizedProvider = normalizeProvider(
    parsedLocalInfo?.provider,
    parsedLocalInfo?.model
  );
  const normalizedModel = normalizeChatModel(
    parsedLocalInfo?.model,
    normalizedProvider
  );
  const normalizedApiKeyConfigured: Record<AIProvider, boolean> = {
    ...API_CONFIG.apiKeyConfigured,
    ...(parsedLocalInfo?.apiKeyConfigured || {}),
  };
  const normalizedApiKeys: ProviderApiKeys = {
    [PROVIDERS.DEEPSEEK]: normalizedApiKeyConfigured[PROVIDERS.DEEPSEEK]
      ? parsedLocalInfo?.apiKeys?.[PROVIDERS.DEEPSEEK] || ""
      : "",
    [PROVIDERS.XIAOMI]: normalizedApiKeyConfigured[PROVIDERS.XIAOMI]
      ? parsedLocalInfo?.apiKeys?.[PROVIDERS.XIAOMI] || ""
      : "",
  };

  const apiConfig = reactive<ApiConfig>({
    ...API_CONFIG,
    ...parsedLocalInfo,
    provider: normalizedProvider,
    baseURL: getProviderBaseURL(normalizedProvider),
    apiKey: normalizedApiKeys[normalizedProvider] || "",
    apiKeys: normalizedApiKeys,
    apiKeyConfigured: normalizedApiKeyConfigured,
    model: normalizedModel,
  });

  info.deepseek = parsedInsistance?.deepseek ?? isModelThinkingDefault(normalizedModel);
  storage.set("apiConfig", JSON.stringify(apiConfig));

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
    const nextData = { ...data };
    if (nextData.provider) {
      nextData.baseURL = getProviderBaseURL(nextData.provider);
      nextData.apiKey = nextData.apiKey ?? apiConfig.apiKeys[nextData.provider];
    }
    if (nextData.apiKey !== undefined) {
      const provider = nextData.provider || apiConfig.provider;
      nextData.apiKeys = {
        ...apiConfig.apiKeys,
        ...(nextData.apiKeys || {}),
        [provider]: nextData.apiKey,
      };
      nextData.apiKeyConfigured = {
        ...apiConfig.apiKeyConfigured,
        ...(nextData.apiKeyConfigured || {}),
        [provider]: Boolean(nextData.apiKey),
      };
    }
    merge(apiConfig as Record<string, unknown>, nextData as Record<string, unknown>);
    storage.set("apiConfig", JSON.stringify(apiConfig));
  }

  function setProviderApiKey(provider: AIProvider, apiKey: string): void {
    setApiConfig({
      provider,
      apiKey,
      apiKeys: {
        ...apiConfig.apiKeys,
        [provider]: apiKey,
      },
    });
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
    provider: computed(() => apiConfig.provider),
    useModel: computed(() => apiConfig.model),
    baseURL: computed(() => apiConfig.baseURL),
    apiKey: computed(() => apiConfig.apiKey),
    apiKeys: computed(() => apiConfig.apiKeys),
    currentApiKey: computed(() => apiConfig.apiKeys[apiConfig.provider]),
    defaultParams: computed(() => apiConfig.defaultParams),
    localDateTime: computed(() => formatDate(info.localDateTime)),
    theme: computed(() => info.theme),
    isDark: computed(() => info.theme === 'dark'),
    toggleTheme,
    set,
    setApiConfig,
    setProviderApiKey,
    clear,
  };
});

export default useAppStore;
