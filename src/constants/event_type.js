/**
 * 事件类型常量定义
 * 按功能模块分组，便于维护和查找
 */
const EVENT_TYPE = {
  // 消息相关事件
  SEND_SUCCESS: "send-success", // 消息发送成功事件
  SEND_MESSAGE: "send-message", // 发送消息事件
  CANCEL_ANSWER: "cancel-answer", // 取消回答事件
  SHOW_CHAT_HISTORY: "show-chat-history", // 显示聊天记录
  // 初始化成功
  INIT_SUCCESS: "init-success",
};

export default EVENT_TYPE;
