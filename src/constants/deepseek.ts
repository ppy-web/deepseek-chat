import {
  DEEPSEEK_API_BASE_URL,
  DEEPSEEK_MODELS,
  PROVIDERS,
  THINKING,
  buildChatRequestBody,
  getProviderModelByThinking,
  isModelThinkingDefault,
  normalizeChatModel,
  type ChatDefaultParams,
  type ChatMessageParam,
  type ChatModel,
  type ChatRequestBody,
  type ReasoningEffort,
  type ThinkingConfig,
  type ThinkingType,
} from "@/constants/llm";

export { DEEPSEEK_API_BASE_URL, DEEPSEEK_MODELS };
export const DEEPSEEK_THINKING = THINKING;

export type DeepSeekModel = ChatModel;
export type DeepSeekThinkingType = ThinkingType;
export type DeepSeekReasoningEffort = ReasoningEffort;
export type DeepSeekThinkingConfig = ThinkingConfig;
export type DeepSeekMessage = ChatMessageParam;
export type DeepSeekDefaultParams = ChatDefaultParams;
export type DeepSeekChatRequestBody = ChatRequestBody;

export function normalizeDeepSeekModel(model?: string): DeepSeekModel {
  return normalizeChatModel(model, PROVIDERS.DEEPSEEK);
}

export function getDeepSeekModelByThinking(
  thinkingEnabled: boolean
): DeepSeekModel {
  return getProviderModelByThinking(PROVIDERS.DEEPSEEK, thinkingEnabled);
}

export function isDeepSeekThinkingModel(model?: string): boolean {
  return isModelThinkingDefault(model);
}

export function buildDeepSeekChatRequestBody(params: {
  model?: string;
  messages: DeepSeekMessage[];
  defaultParams: DeepSeekDefaultParams;
  thinkingEnabled: boolean;
}): DeepSeekChatRequestBody {
  return buildChatRequestBody({
    provider: PROVIDERS.DEEPSEEK,
    ...params,
  });
}
