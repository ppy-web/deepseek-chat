import request from "./request";

// 用于总结内容标题 https://api.deepseek.com/chat/completions
export function getTalkTitle(data) {
  return request({
    url: '/chat/completions',
    method: "post",
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    data: data
  });
}

export function getUserBalance() {
  return request({
    url: '/user/balance',
    method: "get",
  });
}
/**
 * 获取可用模型列表
 */
export async function getModels() {
  return request({
    url: '/models',
    method: "get",
  });
}
