/**
 * AI模型配置列表
 * 定义了系统支持的所有AI对话模型及其元信息
 * 包含模型名称、标识符、描述和图标等信息
 */
import deepseek from "@/assets/img/deepseek.png";
import deepseekV3 from "@/assets/img/deepseek.png";

/**
 * AI模型配置数组
 * @type {Array<Object>} 包含各模型详细配置的数组
 * 每个模型对象包含:text(显示名称), value(唯一标识), description(功能描述), icon(显示图标)
 */
const models = [
  {
    text: "DeepSeek-R1",
    value: "deepSeek-r1",
    description: "深度思考，大幅度提升了在数学、代码、自然语言能力的推理模型",
    icon: deepseek,
  },
  {
    text: "DeepSeek-V3",
    value: "deepSeek-v3",
    description: "全面升级，效率、速度优先",
    icon: deepseek,
  },
];

export { models };
