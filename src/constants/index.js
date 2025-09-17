// 流媒体播放器初始化所需的时间 至少1s
export const STREAM_PALYER_INIT_TIMEOUT = 1000;
// 窄屏宽度
export const NARROW_SCREEN_WIDTH = 768;

export const API_CONFIG = {
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