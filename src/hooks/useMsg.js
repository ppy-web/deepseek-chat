import { ElMessage, ElMessageBox, ElNotification } from "element-plus";
import "element-plus/theme-chalk/el-message.css";
import "element-plus/theme-chalk/el-message-box.css";
import "element-plus/theme-chalk/el-notification.css";
import "element-plus/theme-chalk/el-button.css";
// 成功消息
export function successMsg(message, duration = 2000) {
  return ElMessage({
    message,
    type: "success",
    duration,
    showClose: false,
  });
}

// 错误消息
export function errorMsg(message, duration = 2000) {
  return ElMessage({
    message,
    type: "error",
    duration,
    showClose: true,
  });
}

// 警告消息
export function warningMsg(message, duration = 2000) {
  return ElMessage({
    message,
    type: "warning",
    duration,
    showClose: true,
  });
}

// 普通消息
export function infoMsg(message, duration = 2000) {
  return ElMessage({
    message,
    type: "info",
    duration,
    showClose: true,
  });
}

// 确认对话框
export function confirmMsg(message, title = "提示", options = {}) {
  return ElMessageBox.confirm(message, title, {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
    ...options,
  })
    .then(() => {
      // 消息关闭后执行的操作
    })
    .catch(() => {
      // 消息关闭后执行的操作
    });
}

// 通知提示
export function notify(title, message, type = "success", duration = 3000) {
  return ElNotification({
    title,
    message,
    type,
    duration,
    position: "top-right",
  });
}

// 默认导出所有方法
export default {
  success: successMsg,
  error: errorMsg,
  warning: warningMsg,
  info: infoMsg,
  confirm: confirmMsg,
  notify,
};
