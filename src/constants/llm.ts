export const PROVIDERS = {
  DEEPSEEK: "deepseek",
  XIAOMI: "xiaomi",
} as const;

export const DEEPSEEK_API_BASE_URL = "https://api.deepseek.com";
export const XIAOMI_API_BASE_URL = "https://api.xiaomimimo.com/v1";
// export const XIAOMI_API_BASE_URL = "https://token-plan-cn.xiaomimimo.com/v1";

export const DEEPSEEK_MODELS = {
  FLASH: "deepseek-v4-flash",
  PRO: "deepseek-v4-pro",
} as const;

export const XIAOMI_MODELS = {
  PRO: "mimo-v2.5-pro",
  OMNI: "mimo-v2.5",
  FLASH: "mimo-v2-flash",
} as const;

const LEGACY_DEEPSEEK_MODELS = {
  "deepseek-chat": DEEPSEEK_MODELS.FLASH,
  "deepseek-reasoner": DEEPSEEK_MODELS.PRO,
} as const;

export const THINKING = {
  ENABLED: "enabled",
  DISABLED: "disabled",
} as const;

export type AIProvider = (typeof PROVIDERS)[keyof typeof PROVIDERS];
export type DeepSeekModel =
  (typeof DEEPSEEK_MODELS)[keyof typeof DEEPSEEK_MODELS];
export type XiaomiModel =
  (typeof XIAOMI_MODELS)[keyof typeof XIAOMI_MODELS];
export type ChatModel = DeepSeekModel | XiaomiModel;
export type ThinkingType = (typeof THINKING)[keyof typeof THINKING];
export type ReasoningEffort = "high" | "max";
export type ModelMode = "quick" | "deep";

export type ProviderApiKeys = Record<AIProvider, string>;

export interface ThinkingConfig {
  type: ThinkingType;
}

export interface ChatMessageParam {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  reasoning_content?: string;
}

export interface ChatDefaultParams {
  temperature: number;
  max_tokens: number;
  top_p: number;
  stream: boolean;
  stream_options: {
    include_usage: boolean;
  };
  frequency_penalty: number;
  presence_penalty: number;
}

export interface ChatRequestBody {
  model: ChatModel;
  messages: ChatMessageParam[];
  stream: boolean;
  max_tokens?: number;
  max_completion_tokens?: number;
  stream_options?: ChatDefaultParams["stream_options"];
  temperature?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  thinking: ThinkingConfig;
  reasoning_effort?: ReasoningEffort;
}

export interface BaseModelConfig {
  provider: AIProvider;
  text: string;
  label: string;
  value: ChatModel;
  description: string;
  supportsThinking: boolean;
  mode?: ModelMode;
}

export const MODEL_CONFIGS: BaseModelConfig[] = [
  {
    provider: PROVIDERS.DEEPSEEK,
    text: "V4 Flash效率优先",
    label: "V4 Flash",
    value: DEEPSEEK_MODELS.FLASH,
    description: "DeepSeek-V4-Flash，适合快速响应",
    supportsThinking: true,
    mode: "quick",
  },
  {
    provider: PROVIDERS.DEEPSEEK,
    text: "V4 Pro深度思考",
    label: "V4 Pro",
    value: DEEPSEEK_MODELS.PRO,
    description: "DeepSeek-V4-Pro，适合深度推理与复杂问题",
    supportsThinking: true,
    mode: "deep",
  },
  {
    provider: PROVIDERS.XIAOMI,
    text: "MiMo Flash快速",
    label: "MiMo Flash",
    value: XIAOMI_MODELS.FLASH,
    description: "MiMo-V2-Flash，适合低成本快速响应",
    supportsThinking: true,
    mode: "quick",
  },
  {
    provider: PROVIDERS.XIAOMI,
    text: "MiMo V2.5全能",
    label: "MiMo V2.5",
    value: XIAOMI_MODELS.OMNI,
    description: "MiMo-V2.5，支持文本与多模态理解",
    supportsThinking: true,
  },
  {
    provider: PROVIDERS.XIAOMI,
    text: "MiMo Pro深度",
    label: "MiMo Pro",
    value: XIAOMI_MODELS.PRO,
    description: "MiMo-V2.5-Pro，适合复杂推理和长文档处理",
    supportsThinking: true,
    mode: "deep",
  },
];

export function getProviderBaseURL(provider: AIProvider): string {
  return provider === PROVIDERS.XIAOMI
    ? XIAOMI_API_BASE_URL
    : DEEPSEEK_API_BASE_URL;
}

export function getModelConfig(model?: string): BaseModelConfig | undefined {
  return MODEL_CONFIGS.find((item) => item.value === model);
}

export function normalizeProvider(
  provider?: string,
  model?: string
): AIProvider {
  if (provider === PROVIDERS.DEEPSEEK || provider === PROVIDERS.XIAOMI) {
    return provider;
  }
  const modelConfig = getModelConfig(model);
  return modelConfig?.provider || PROVIDERS.DEEPSEEK;
}

export function normalizeChatModel(
  model?: string,
  provider: AIProvider = PROVIDERS.DEEPSEEK
): ChatModel {
  if (model && model in LEGACY_DEEPSEEK_MODELS) {
    return LEGACY_DEEPSEEK_MODELS[
      model as keyof typeof LEGACY_DEEPSEEK_MODELS
    ];
  }
  const modelConfig = getModelConfig(model);
  if (modelConfig && modelConfig.provider === provider) {
    return modelConfig.value;
  }
  return getProviderModelByThinking(provider, false);
}

export function getProviderModelByThinking(
  provider: AIProvider,
  thinkingEnabled: boolean
): ChatModel {
  const mode: ModelMode = thinkingEnabled ? "deep" : "quick";
  return (
    MODEL_CONFIGS.find(
      (item) => item.provider === provider && item.mode === mode
    )?.value || DEEPSEEK_MODELS.FLASH
  );
}

export function isModelThinkingDefault(model?: string): boolean {
  return getModelConfig(model)?.mode === "deep" || model === "deepseek-reasoner";
}

export function buildChatRequestHeaders(
  provider: AIProvider,
  apiKey: string
): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };

  if (!apiKey) {
    return headers;
  }

  if (provider === PROVIDERS.XIAOMI) {
    return {
      ...headers,
      "api-key": apiKey,
    };
  }

  return {
    ...headers,
    Authorization: `Bearer ${apiKey}`,
  };
}

export function buildChatRequestBody(params: {
  provider: AIProvider;
  model?: string;
  messages: ChatMessageParam[];
  defaultParams: ChatDefaultParams;
  thinkingEnabled: boolean;
}): ChatRequestBody {
  const model = normalizeChatModel(params.model, params.provider);
  const thinking: ThinkingConfig = {
    type: params.thinkingEnabled ? THINKING.ENABLED : THINKING.DISABLED,
  };
  const baseParams: ChatRequestBody = {
    model,
    messages: params.messages,
    stream: params.defaultParams.stream,
    thinking,
  };

  if (params.provider === PROVIDERS.XIAOMI) {
    baseParams.max_completion_tokens = params.defaultParams.max_tokens;
  } else {
    baseParams.max_tokens = params.defaultParams.max_tokens;
  }

  if (params.defaultParams.stream) {
    baseParams.stream_options = params.defaultParams.stream_options;
  }

  if (params.thinkingEnabled) {
    return {
      ...baseParams,
      reasoning_effort: "high",
    };
  }

  return {
    ...baseParams,
    temperature: params.defaultParams.temperature,
    top_p: params.defaultParams.top_p,
    frequency_penalty: params.defaultParams.frequency_penalty,
    presence_penalty: params.defaultParams.presence_penalty,
  };
}
