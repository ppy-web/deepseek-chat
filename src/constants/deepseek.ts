export const DEEPSEEK_API_BASE_URL = "https://api.deepseek.com";

export const DEEPSEEK_MODELS = {
  FLASH: "deepseek-v4-flash",
  PRO: "deepseek-v4-pro",
} as const;

const LEGACY_DEEPSEEK_MODELS = {
  "deepseek-chat": DEEPSEEK_MODELS.FLASH,
  "deepseek-reasoner": DEEPSEEK_MODELS.PRO,
} as const;

export const DEEPSEEK_THINKING = {
  ENABLED: "enabled",
  DISABLED: "disabled",
} as const;

export type DeepSeekModel =
  (typeof DEEPSEEK_MODELS)[keyof typeof DEEPSEEK_MODELS];

export type DeepSeekThinkingType =
  (typeof DEEPSEEK_THINKING)[keyof typeof DEEPSEEK_THINKING];

export type DeepSeekReasoningEffort = "high" | "max";

export interface DeepSeekThinkingConfig {
  type: DeepSeekThinkingType;
}

export interface DeepSeekMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  reasoning_content?: string;
}

export interface DeepSeekDefaultParams {
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

export interface DeepSeekChatRequestBody {
  model: DeepSeekModel;
  messages: DeepSeekMessage[];
  stream: boolean;
  max_tokens: number;
  stream_options?: DeepSeekDefaultParams["stream_options"];
  temperature?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  thinking: DeepSeekThinkingConfig;
  reasoning_effort?: DeepSeekReasoningEffort;
}

export function normalizeDeepSeekModel(model?: string): DeepSeekModel {
  if (model === DEEPSEEK_MODELS.FLASH || model === DEEPSEEK_MODELS.PRO) {
    return model;
  }
  if (model && model in LEGACY_DEEPSEEK_MODELS) {
    return LEGACY_DEEPSEEK_MODELS[
      model as keyof typeof LEGACY_DEEPSEEK_MODELS
    ];
  }
  return DEEPSEEK_MODELS.FLASH;
}

export function getDeepSeekModelByThinking(
  thinkingEnabled: boolean
): DeepSeekModel {
  return thinkingEnabled ? DEEPSEEK_MODELS.PRO : DEEPSEEK_MODELS.FLASH;
}

export function isDeepSeekThinkingModel(model?: string): boolean {
  return (
    model === DEEPSEEK_MODELS.PRO ||
    model === "deepseek-reasoner"
  );
}

export function buildDeepSeekChatRequestBody(params: {
  model?: string;
  messages: DeepSeekMessage[];
  defaultParams: DeepSeekDefaultParams;
  thinkingEnabled: boolean;
}): DeepSeekChatRequestBody {
  const baseParams: DeepSeekChatRequestBody = {
    model: normalizeDeepSeekModel(params.model),
    messages: params.messages,
    max_tokens: params.defaultParams.max_tokens,
    stream: params.defaultParams.stream,
    thinking: {
      type: params.thinkingEnabled
        ? DEEPSEEK_THINKING.ENABLED
        : DEEPSEEK_THINKING.DISABLED,
    },
  };

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
