import EVENT_TYPE from "@/constants/event_type";
import MESSAGE_TYPE from "@/constants/message_type";
import MODELS from "@/constants/models";

// 流媒体播放器初始化所需的时间 至少1s
const STREAM_PALYER_INIT_TIMEOUT = 1000;
// 窄屏宽度
const NARROW_SCREEN_WIDTH = 768;

const API_CONFIG = {
  baseURL: "https://api.deepseek.com/v1", // DeepSeek API 基础URL
  apiKey: "sk-858ee51df95e456fa5e74fcde3e478e7",
  model: "deepseek-chat", // 模型名称
  timeout: 60000, // 超时时间
  defaultParams: {
    temperature: 0.7,
    max_tokens: 2000,
    top_p: 0.95,
    frequency_penalty: 0,
    presence_penalty: 0,
  },
};

const ERROR_TYPE = {
  APOLOGY: "Apology",
  TIMEOUT: "Timeout",
};

export {
  STREAM_PALYER_INIT_TIMEOUT,
  NARROW_SCREEN_WIDTH,
  API_CONFIG,
  ERROR_TYPE,
  EVENT_TYPE,
  MESSAGE_TYPE,
  MODELS
}