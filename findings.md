# 迁移发现

## 当前项目
- `src/components/InputBox/Index.vue` 使用 `contenteditable` 作为输入框，底部已有模型模式、模型选择、发送/停止按钮。
- `src/components/ChatBox/Bot/ActionBar.vue` 目前包含复制、喜欢、不喜欢，可以加入朗读按钮。
- 项目已使用 Naive UI 和 `@vicons/tabler`，适合继续用现有图标体系。

## xiaomei/apps/pc
- 语音输入入口是 `src/components/Input/SpeechButton.vue`，依赖 `@xiaomei/core/hooks/useVoiceRecord.js` 录音和 `stt` 接口。
- 文字转语音入口在 `src/components/Chat/MessageOps.vue`，依赖 `@xiaomei/core/hooks/useWebSocketAudio.js`。
- 本次不能直接迁内部 `@xiaomei/core` 依赖，当前项目先用浏览器原生录音/Web Audio 实现。

## 真实语音服务
- 语音识别使用 `POST https://tts.lideyong.fun/api/v1/speech/recognize`，请求体为 `{ "audio_data": "data:audio/wav;base64,...", "language": "auto" }`。
- 本地 `tts-mimo` schema 要求 `audio_data` 是 data URL，不接受裸 Base64。
- 文字转语音使用 `wss://tts.lideyong.fun/virtualhuman/speech/synthesis/1103?...`，连接后发送纯文本，服务端返回 16k PCM 二进制分片。
- 远端识别接口对 `OPTIONS` 返回 405，浏览器直连 JSON POST 可能被 CORS 预检拦截；本项目通过 Vite `/speech-api` 代理访问。
- TTS 是 WebSocket 路由，HTTP GET 返回 404 属于预期；本项目通过 Vite `/tts-ws` 代理访问。
