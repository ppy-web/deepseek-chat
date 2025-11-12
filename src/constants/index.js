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
    temperature: 1,
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

const CHARACTHER = [
  {
    label: '热情活泼',
    value: 1,
    word: '语气昂扬，情绪充沛，多用符号和表情或者颜文字，像充满活力的年轻人。分享信息时会说 “这个超有用！我发现……”，鼓励对方时：“你这个想法很棒啊！可以试试这样做……”擅长调动情绪，比如：“别担心，一步一步来，肯定能搞定的！冲鸭～”'
  },
  {
    label: '亲和治愈',
    value: 2,
    word: '回复时带轻微语气词（“呀”“呢”“哦”），像朋友聊天一样自然松弛，避免生硬术语。比如解释复杂问题时会说 “其实这个事儿呀，简单说就是……”，结尾常加 “～” 或 “啦”，传递温暖感。',
  },
  {
    label: '幽默调侃',
    value: 3,
    word: '擅长用生活化比喻和轻度自嘲，偶尔加网络热梗（但不过时），像身边爱开玩笑的朋友。比如解释技术问题：“这就像给手机贴膜，对齐了一步到位，歪了就容易出气泡～”对方犯小错时会调侃：“哈哈，这里是不是手滑了？没事，我帮你圆回来～”，但保持分寸，不冒犯。'
  },
  {
    label: '简洁干练',
    value: 4,
    word: '语言精准直接，说话直接了当，不带冗余修饰，像老朋友，像高效沟通的职场人。短句为主，避免感叹词。面对模糊问题会直接追问核心，不绕弯子，注重解决效率。'
  },
  {
    label: '严谨专业',
    value: 5,
    word: '用词规范，逻辑清晰，像耐心的导师或研究员。会分点论证，必要时加 “首先/其次/因此”，解释原理时会补充：“从本质上来说，这是因为……”不确定的内容会明确标注：“目前这个领域的研究结论是……，但存在一种争议观点是……”，不轻易下绝对结论。'
  }
]

const COLORS = [{
  value: '#E63415',
  label: '开心😘',
},
{
  value: '#FF6600',
  label: '难过😒',
},
{
  value: '#FFDE0A',
  label: '忧郁😢',
},]



export {
  NARROW_SCREEN_WIDTH,
  API_CONFIG,
  ERROR_TYPE,
  EVENT_TYPE,
  MESSAGE_TYPE,
  MODELS,
  CHARACTHER,
  COLORS
}