import request from "./request";
/**
 * 获取可用模型列表
 */
export async function getModels() {
  try {
    const response = await request({
      url: "/models",
      method: "get",
    });
    return response;
  } catch (error) {
    console.error("Get Models Error:", error);
    throw new Error("获取模型列表失败");
  }
}
