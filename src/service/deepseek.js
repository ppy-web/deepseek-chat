import request from "./request";
import { API_CONFIG } from "@/constants";
import { showError } from "@/service/errorHandler";
import { useStore } from "@/hooks/useStore";
// import { useApiConfigStore } from "../stores/apiConfig";

/**
 * 创建聊天完成请求
 * @param {Array} messages - 消息历史记录
 * @param {Object} options - 可选参数
 * @returns {Promise}
 */
export async function createChatCompletion(messages, options = {}) {
  try {
    const response = await request({
      url: "/chat/completions",
      method: "post",
      data: {
        model: API_CONFIG.model,
        messages: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        stream: false,
        ...API_CONFIG.defaultParams,
        ...options,
      },
    });

    return response;
  } catch (error) {
    showError(error);
    throw error;
  }
}

/**
 * 创建流式聊天完成请求
 * @param {Array} messages - 消息历史记录
 * @param {Function} onMessage - 消息回调函数
 * @param {Object} options - 可选参数
 */
export async function createStreamChatCompletion(
  messages,
  onMessage,
  options = {}
) {
  const { config } = useStore();
  const curConfig = config.getCurrentConfig();

  try {
    const response = await fetch(`${curConfig.baseURL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${curConfig.apiKey}`,
      },
      body: JSON.stringify({
        model: curConfig.model,
        messages: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        stream: true,
        ...curConfig.defaultParams,
        ...options,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "流式请求失败");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter((line) => line.trim() !== "");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content;
              if (content) {
                onMessage(content);
              }
            } catch (e) {
              console.error("解析SSE消息失败:", e);
            }
          }
        }
      }
    } catch (error) {
      showError("流式响应处理失败");
      throw error;
    } finally {
      reader.releaseLock();
    }
  } catch (error) {
    showError(error);
    throw error;
  }
}

/**
 * 获取可用模型列表
 */
export async function getModels() {
  try {
    const response = await request({
      url: "/models",
      method: "get",
    });
    return response;
  } catch (error) {
    console.error("Get Models Error:", error);
    throw new Error("获取模型列表失败");
  }
}
