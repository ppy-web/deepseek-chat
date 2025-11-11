import EVENT_TYPE from "@/constants/event_type";
import MESSAGE_TYPE from "@/constants/message_type";
import MODELS from "@/constants/models";

// 窄屏宽度
const NARROW_SCREEN_WIDTH = 768;

const API_CONFIG = {
  baseURL: "https://api.deepseek.com", // DeepSeek API 基础URL
  apiKey: "sk-858ee51df95e456fa5e74fcde3e478e7",
  model: "deepseek-chat", // 模型名称
  timeout: 60000, // 超时时间
  defaultParams: {
    temperature: 1.5,
    max_tokens: 2000,
    top_p: 1, // 默认值为1，不建议与temperature同时修改
    stream: true,
    stream_options: {
      include_usage: true,
    },
    frequency_penalty: 0,
    presence_penalty: 0,
  },
};

const ERROR_TYPE = {
  APOLOGY: "Apology",
  TIMEOUT: "Timeout",
};

export {
  NARROW_SCREEN_WIDTH,
  API_CONFIG,
  ERROR_TYPE,
  EVENT_TYPE,
  MESSAGE_TYPE,
  MODELS
}