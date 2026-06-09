/**
 * AI 模型配置列表
 */
import deepseek from "@/assets/img/deepseek.svg";
import { DEEPSEEK_MODELS, type DeepSeekModel } from "@/constants/deepseek";

export interface ModelConfig {
  text: string;
  value: DeepSeekModel;
  description: string;
  icon: string;
}

const MODELS: ModelConfig[] = [
  {
    text: "V4 Flash效率优先",
    value: DEEPSEEK_MODELS.FLASH,
    description: "DeepSeek-V4-Flash，支持非思考与思考模式",
    icon: deepseek as string,
  },
  {
    text: "V4 Pro深度思考",
    value: DEEPSEEK_MODELS.PRO,
    description: "DeepSeek-V4-Pro，适合深度推理与复杂问题",
    icon: deepseek as string,
  },
];

export default MODELS;
