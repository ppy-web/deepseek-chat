import request from "./request";

// 初始化配置参数
export function getInitParam(data) {
  return request({
    url: "/init",
    method: "post",
    data: {
      ...data,
    },
  });
}
// 历史记录列表
export function sessionLogList(data) {
  return request({
    url: "/list",
    method: "post",
    data: {
      ...data,
      wxToken: token,
    },
  });
}

export function sessionLogDetail(id) {
  return request({
    url: `/detail`,
    method: "get",
  });
}
// 评价
export function evaluate(data) {
  return request({
    url: "/evaluate",
    method: "post",
    data: {
      ...data,
      wxToken: token,
    },
  });
}
// 语音转文字
export function stt(data) {
  return request({
    url: "/sstapi",
    method: "post",
    data,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

// 上传图片
export function uploadImg(data) {
  return request({
    url: "/uploadImg",
    method: "post",
    data,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

// 查询所有对话记录
export function sessionLog(data) {
  return request({
    url: `/sessionLog`,
    method: "get",
    timeout: 5000,
  });
}
// 修改对话记录标题 esSessionLogApi/submitContent
export function updateSessionLog(data, showLoading = true) {
  return request({
    url: `/rename`,
    method: "get",
  });
}

// 删除一条历史记录esSessionLogApi/deleteSessionLog  post 请求 sessionId
export function deleteOneSessionLog(params, showLoading = true) {
  return request({
    url: `/deleteOneSessionLog`,
    method: "post",
    data: {
      sessionId: params,
      wxToken: token,
    },
  });
}
// 停止对话 question/modelStop
export function stopSession(data) {
  return request({
    url: `/stop`,
    method: "get",
  });
}

// 试着问问 /question/tryAsking
export function tryAsking(data) {
  return request({
    url: `/tryAsking`,
    method: "get",
  });
}
