/**
 * AI 模型配置列表
 */
import deepseek from "@/assets/img/deepseek.svg";
import xiaomi from "@/assets/img/doubao.png";
import {
  MODEL_CONFIGS,
  PROVIDERS,
  type AIProvider,
  type ChatModel,
} from "@/constants/llm";

export interface ModelConfig {
  text: string;
  label: string;
  value: ChatModel;
  provider: AIProvider;
  description: string;
  icon: string;
  supportsThinking: boolean;
  mode?: "quick" | "deep";
}

const MODELS: ModelConfig[] = MODEL_CONFIGS.map((model) => ({
  ...model,
  icon: model.provider === PROVIDERS.XIAOMI
    ? (xiaomi as string)
    : (deepseek as string),
}));

export default MODELS;
