/**
 * 消息提示工具
 * 替代 Element Plus 的 ElMessage
 */

type MessageType = 'success' | 'error' | 'warning' | 'info';

interface MessageOptions {
  message: string;
  type?: MessageType;
  duration?: number;
  showClose?: boolean;
}

// 创建消息元素
function createMessage(message: string, type: MessageType = 'info', duration: number = 2000): void {
  const colors: Record<MessageType, string> = {
    success: '#67c23a',
    error: '#f56c6c',
    warning: '#e6a23c',
    info: '#909399',
  };

  const el = document.createElement('div');
  el.textContent = message;
  el.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    padding: 10px 20px;
    border-radius: 4px;
    background: #fff;
    color: ${colors[type]};
    border: 1px solid ${colors[type]}40;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
    z-index: 10000;
    font-size: 14px;
    transition: opacity 0.3s, transform 0.3s;
    opacity: 0;
    transform: translateX(-50%) translateY(-10px);
  `;

  document.body.appendChild(el);

  // 触发动画
  requestAnimationFrame(() => {
    el.style.opacity = '1';
    el.style.transform = 'translateX(-50%) translateY(0)';
  });

  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateX(-50%) translateY(-10px)';
    setTimeout(() => {
      document.body.removeChild(el);
    }, 300);
  }, duration);
}

// 成功消息
export function successMsg(message: string, duration: number = 2000): void {
  createMessage(message, 'success', duration);
}

// 错误消息
export function errorMsg(message: string, duration: number = 2000): void {
  createMessage(message, 'error', duration);
}

// 警告消息
export function warningMsg(message: string, duration: number = 2000): void {
  createMessage(message, 'warning', duration);
}

// 普通消息
export function infoMsg(message: string, duration: number = 2000): void {
  createMessage(message, 'info', duration);
}

// 确认对话框
export function confirmMsg(message: string, title: string = "提示"): Promise<boolean> {
  return new Promise((resolve) => {
    const confirmed = window.confirm(`${title}\n\n${message}`);
    resolve(confirmed);
  });
}

// 默认导出所有方法
export default {
  success: successMsg,
  error: errorMsg,
  warning: warningMsg,
  info: infoMsg,
  confirm: confirmMsg,
};
