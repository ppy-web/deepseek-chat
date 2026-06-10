# 进度记录

## 2026-06-10
- 已读取当前项目输入框、聊天消息、操作栏、store、接口层、图标导出。
- 已读取 `xiaomei/apps/pc` 的 `SpeechButton.vue`、`Input/index.vue`、`MessageOps.vue` 及相关搜索结果。
- 决策：STT 使用浏览器 `SpeechRecognition` 优先，缺失时走假接口占位；TTS 使用 Web Speech API 优先，保留假异步接口层便于后续替换。
- 已新增 `src/service/speech.ts`、`src/hooks/useSpeechInput.ts`、`src/hooks/useSpeechSynthesis.ts`、`src/components/InputBox/SpeechButton.vue`。
- 已在输入框接入语音输入按钮，在机器人消息操作栏接入朗读/暂停/继续按钮。
- `pnpm run typecheck` 已通过。
- `pnpm run build` 已通过；Vite 仅提示已有大 chunk 警告。
- 小修后再次运行 `pnpm run typecheck`，已通过。
- 已根据真实服务替换假接口：语音输入改为录制 WAV data URL 后调用 `https://tts.lideyong.fun/api/v1/speech/recognize`。
- 已把 TTS 改为 WebSocket PCM 流式播放，默认连接 `wss://tts.lideyong.fun/virtualhuman/speech/synthesis/1103?...`。
- 已加入 Vite 代理：`/speech-api` 转发 HTTP 识别接口，`/tts-ws` 转发 WebSocket TTS，规避浏览器跨域预检问题。
- 最终 `pnpm run typecheck` 和 `pnpm run build` 均通过；Vite 仍只有既有大 chunk 警告。
- 已验证 `http://127.0.0.1:3020/tts-ws/...` WebSocket 代理可握手并收到 `connect-success`。
- 已验证 `/speech-api` 能转发到服务端；用无效 WAV 测试数据返回 502，符合识别失败路径。
- 已修复本地录音 `navigator.mediaDevices` 为空时的崩溃：录音前会检测安全上下文、标准/旧版 `getUserMedia` 与 `AudioContext` 支持，并给出可操作的中文错误提示。
- 兼容修复后再次运行 `pnpm run typecheck` 和 `pnpm run build`，均通过；Vite 仍只有既有大 chunk 警告。
