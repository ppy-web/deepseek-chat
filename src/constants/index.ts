import { EVENT_TYPE } from "@/constants/event_type";
import { MESSAGE_TYPE } from "@/constants/message_type";
import MODELS from "@/constants/models";
import {
  DEEPSEEK_MODELS,
  PROVIDERS,
  getProviderBaseURL,
  type AIProvider,
  type ChatDefaultParams,
  type ChatModel,
  type ProviderApiKeys,
} from "@/constants/llm";

/** 窄屏宽度 */
export const NARROW_SCREEN_WIDTH = 768;

export const DEFAULT_API_KEY = {
  XIAOMI: '"sk-cp0t34ggdgtlfx33swx1dyeaxarlxvu9jz1kmml014igasr4"',
  DEEPSEEK: 'sk-858ee51df95e456fa5e74fcde3e478e7',
}

export const CHAT_CONFIG = {
  MAX_CONTENT_WIDTH: 960,
} as const;

export interface ApiConfig {
  provider: AIProvider;
  baseURL: string;
  apiKey: string;
  apiKeys: ProviderApiKeys;
  apiKeyConfigured: Record<AIProvider, boolean>;
  model: ChatModel;
  timeout: number;
  defaultParams: ChatDefaultParams;
}

export const API_CONFIG: ApiConfig = {
  provider: PROVIDERS.DEEPSEEK,
  baseURL: getProviderBaseURL(PROVIDERS.DEEPSEEK),
  apiKey: "",
  apiKeys: {
    [PROVIDERS.DEEPSEEK]: "",
    [PROVIDERS.XIAOMI]: "",
  },
  apiKeyConfigured: {
    [PROVIDERS.DEEPSEEK]: false,
    [PROVIDERS.XIAOMI]: false,
  },
  model: DEEPSEEK_MODELS.FLASH,
  timeout: 60000,
  defaultParams: {
    temperature: 1,
    max_tokens: 2000,
    top_p: 1,
    stream: true,
    stream_options: {
      include_usage: true,
    },
    frequency_penalty: 0,
    presence_penalty: 0,
  },
};

export const ERROR_TYPE = {
  APOLOGY: "Apology",
  TIMEOUT: "Timeout",
} as const;

export interface Character {
  label: string;
  value: number;
  word: string;
}

export const CHARACTHER: Character[] = [
  {
    label: '热情',
    value: 1,
    word: '语气昂扬，情绪充沛，多用符号和表情或者颜文字，像充满活力的年轻人。分享信息时会说 "这个超有用！我发现……"，鼓励对方时："你这个想法很棒啊！可以试试这样做……"擅长调动情绪，比如："别担心，一步一步来，肯定能搞定的！冲鸭～"',
  },
  {
    label: '亲和',
    value: 2,
    word: '回复时带轻微语气词（"呀""呢""哦"），像朋友聊天一样自然松弛，避免生硬术语。比如解释复杂问题时会说 "其实这个事儿呀，简单说就是……"，结尾常加 "～" 或 "啦"，传递温暖感。',
  },
  {
    label: '幽默',
    value: 3,
    word: '擅长用生活化比喻和轻度自嘲，偶尔加网络热梗（但不过时），像身边爱开玩笑的朋友。比如解释技术问题："这就像给手机贴膜，对齐了一步到位，歪了就容易出气泡～"对方犯小错时会调侃："哈哈，这里是不是手滑了？没事，我帮你圆回来～"，但保持分寸，不冒犯。',
  },
  {
    label: '简洁',
    value: 4,
    word: '语言精准直接，说话直接了当，不带冗余修饰，像老朋友，像高效沟通的职场人。短句为主，避免感叹词。面对模糊问题会直接追问核心，不绕弯子，注重解决效率。',
  },
  {
    label: '专业',
    value: 5,
    word: '用词规范，逻辑清晰，像耐心的导师或研究员。会分点论证，必要时加 "首先/其次/因此"，解释原理时会补充："从本质上来说，这是因为……"不确定的内容会明确标注："目前这个领域的研究结论是……，但存在一种争议观点是……"，不轻易下绝对结论。',
  },
];

export interface ColorOption {
  value: string;
  label: string;
}

export const COLORS: ColorOption[] = [
  { value: '#E63415', label: '开心😘' },
  { value: '#FF6600', label: '难过😒' },
  { value: '#FFDE0A', label: '忧郁😢' },
];

export {
  EVENT_TYPE,
  MESSAGE_TYPE,
  MODELS,
};
