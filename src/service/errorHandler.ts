/**
 * API 错误代码映射
 */
const ERROR_CODES: Record<string, string> = {
  'invalid_api_key': 'API密钥无效',
  'invalid_request': '无效的请求参数',
  'rate_limit_exceeded': '请求频率超限',
  'model_not_found': '模型不可用',
  'context_length_exceeded': '上下文长度超出限制',
  'server_error': '服务器错误',
};

/**
 * 网络错误处理
 */
export function handleNetworkError(error: { code?: string }): string {
  if (!navigator.onLine) {
    return '网络连接已断开';
  }
  if (error.code === 'ECONNABORTED') {
    return '请求超时，请检查网络连接';
  }
  return '网络请求失败，请稍后重试';
}

/**
 * API 错误处理
 */
export function handleApiError(error: {
  response?: { data?: { error?: { code?: string; message?: string } } };
}): string {
  const errorCode = error.response?.data?.error?.code;
  const errorMessage = error.response?.data?.error?.message;
  return (errorCode ? ERROR_CODES[errorCode] : null) || errorMessage || '未知错误';
}

interface AxiosLikeError {
  isAxiosError?: boolean;
  response?: unknown;
  message?: string;
  code?: string;
}

/**
 * 统一错误处理
 */
export function showError(error: AxiosLikeError | string, type: string = 'error'): string {
  let message = '';

  if (typeof error === 'string') {
    message = error;
  } else if (error.isAxiosError) {
    message = handleNetworkError(error as { code?: string });
  } else if (error.response) {
    message = handleApiError(error as {
      response?: { data?: { error?: { code?: string; message?: string } } };
    });
  } else {
    message = error.message || '发生未知错误';
  }

  console.error(`[${type}]`, message);
  return message;
}
