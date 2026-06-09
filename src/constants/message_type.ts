/**
 * 消息类型常量定义
 */
export const MESSAGE_TYPE = {
  USER: "user",
  BOT: "assistant",
} as const;

export type MessageType = typeof MESSAGE_TYPE[keyof typeof MESSAGE_TYPE];
