import request from "./request";

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
