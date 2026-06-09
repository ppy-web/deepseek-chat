/**
 * 事件类型常量定义
 */
export const EVENT_TYPE = {
  SEND_SUCCESS: "send-success",
  SEND_MESSAGE: "send-message",
  CANCEL_ANSWER: "cancel-answer",
  SHOW_CHAT_HISTORY: "show-chat-history",
  INIT_SUCCESS: "init-success",
} as const;

export type EventTypes = typeof EVENT_TYPE[keyof typeof EVENT_TYPE];

export default EVENT_TYPE;
