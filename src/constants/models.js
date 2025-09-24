/**
 * AI模型配置列表
 * 定义了系统支持的所有AI对话模型及其元信息
 * 包含模型名称、标识符、描述和图标等信息
 */
import deepseek from "@/assets/img/deepseek.svg";
const MODELS = [
  {
    text: "V3.1效率优先",
    value: "deepseek-chat",
    description: "全面升级，效率、速度优先",
    icon: deepseek,
  },
  {
    text: "V3.1深度思考",
    value: "deepseek-reasoner",
    description: "深度思考，逻辑推理，更精准",
    icon: deepseek,
  },
];

export default MODELS;