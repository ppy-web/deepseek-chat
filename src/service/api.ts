import request from "./request";
import type {
  DeepSeekChatRequestBody,
  DeepSeekMessage,
} from "@/constants/deepseek";
import {
  buildChatRequestHeaders,
  PROVIDERS,
  type AIProvider,
  type ChatModel,
} from "@/constants/llm";

type TalkTitleParam = Pick<
  DeepSeekChatRequestBody,
  "messages" | "model" | "stream" | "thinking"
> &
  Partial<
    Pick<
      DeepSeekChatRequestBody,
      | "temperature"
      | "top_p"
      | "max_tokens"
      | "frequency_penalty"
      | "presence_penalty"
      | "reasoning_effort"
    >
  > & {
    messages: DeepSeekMessage[];
    model: ChatModel;
  };

interface ChatCompletionResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

interface ModelsResponse {
  data: Array<{
    id: string;
    [key: string]: unknown;
  }>;
}

/**
 * 用于总结内容标题
 */
export function getTalkTitle(
  data: TalkTitleParam,
  options?: {
    baseURL?: string;
    apiKey?: string;
    provider?: AIProvider;
  }
): Promise<ChatCompletionResponse> {
  return request({
    baseURL: options?.baseURL,
    url: '/chat/completions',
    method: "post",
    headers: {
      ...buildChatRequestHeaders(options?.provider || PROVIDERS.DEEPSEEK, options?.apiKey || ""),
    },
    data: data,
  });
}

/**
 * 获取可用模型列表
 */
export async function getModels(): Promise<ModelsResponse> {
  return request({
    url: '/models',
    method: "get",
  });
}
