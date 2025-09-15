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

  // 语音相关事件
  CHANGE_VOICE_RECORD_OPEN_STATUS: "change-voice-record-open-status", // 改变语音录制打开状态事件
  PLAY_MP3: "play-mp3", // 播放MP3音效
  STREAM_PLAYER_END: "stream-player-end", // 语音流播放结束
  // 初始化成功
  INIT_SUCCESS: "init-success",
};

export default EVENT_TYPE;
