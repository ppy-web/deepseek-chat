import request from "./request";
import type {
  DeepSeekChatRequestBody,
  DeepSeekMessage,
  DeepSeekModel,
} from "@/constants/deepseek";

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
    model: DeepSeekModel;
  };

interface ChatCompletionResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

interface BalanceResponse {
  is_available: boolean;
  balance_infos: Array<{
    total_balance: number;
    [key: string]: unknown;
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
  }
): Promise<ChatCompletionResponse> {
  return request({
    baseURL: options?.baseURL,
    url: '/chat/completions',
    method: "post",
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(options?.apiKey
        ? {
          Authorization: `Bearer ${options.apiKey}`,
        }
        : {}),
    },
    data: data,
  });
}

/**
 * 获取用户余额
 */
export function getUserBalance(): Promise<BalanceResponse> {
  return request({
    url: '/user/balance',
    method: "get",
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
