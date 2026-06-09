# DeepSeek Chat

一个基于 Vue 3 + Vite 构建的 DeepSeek 聊天助手前端。项目支持流式输出、快速/深度模式切换、会话历史本地保存、个性化助手设定和明暗主题切换，适合用作个人 AI 助手、DeepSeek API 调试界面或二次开发模板。

![项目预览](./image.png)

## 功能特性

- 接入 DeepSeek Chat Completions API，支持 SSE 流式响应。
- 支持快速模式和深度模式切换，对应 `deepseek-v4-flash` 与 `deepseek-v4-pro`。
- 深度模式下展示推理过程，并记录思考耗时。
- 会话历史保存在浏览器本地，支持新建、切换、重命名和删除。
- 自动根据对话内容生成简短会话标题。
- 支持个性化助手配置，包括助手昵称、性格、用户信息和自定义指令。
- 支持 Markdown、代码高亮和 KaTeX 数学公式渲染。
- 支持亮色/暗色主题和窄屏适配。
- 顶部显示 DeepSeek 账户余额。

## 技术栈

- Vue 3
- TypeScript
- Vite
- Pinia
- Vue Router
- Naive UI
- Tailwind CSS
- Axios
- `@microsoft/fetch-event-source`
- Markstream Vue
- KaTeX

## 本地运行

建议使用 Node.js 18+，包管理器建议使用 pnpm。

```bash
pnpm install
pnpm dev
```

开发服务默认运行在：

```text
http://localhost:3010/deepseek-chat/
```

## 构建与类型检查

```bash
pnpm typecheck
pnpm build
```

构建产物会输出到根目录下的 `dist`。

## API 配置

默认 API 配置位于 `src/constants/index.ts`：

```ts
export const API_CONFIG = {
  baseURL: DEEPSEEK_API_BASE_URL,
  apiKey: "你的 DeepSeek API Key",
  model: DEEPSEEK_MODELS.FLASH,
  timeout: 60000,
  defaultParams: {
    temperature: 1,
    max_tokens: 2000,
    top_p: 1,
    stream: true,
    stream_options: {
      include_usage: true,
    },
    frequency_penalty: 0,
    presence_penalty: 0,
  },
};
```

如需使用自己的密钥，请替换 `apiKey`。如果要部署到公开环境，建议改造成环境变量或后端代理方式，不要把真实 API Key 提交到公开仓库。

## 模式说明

项目内置两种模型模式：

| 模式 | 模型 | 说明 |
| --- | --- | --- |
| 快速 | `deepseek-v4-flash` | 适合日常问答和轻量任务 |
| 深度 | `deepseek-v4-pro` | 适合复杂问题，会开启 thinking 配置 |

切换逻辑位于 `src/components/InputBox/Index.vue`，请求体构建逻辑位于 `src/constants/deepseek.ts`。

## 数据存储

项目使用 `localStorage` 保存以下数据：

- 会话列表：`chat-sessions`
- 单个会话消息：`chat-messages-{sessionId}`
- 个性化助手配置：`callWord`
- 应用配置和主题：`appInfo`、`apiConfig`

这些数据只保存在当前浏览器本地，不会主动上传到其他服务。

## 项目结构

```text
src
├─ assets          静态图片资源
├─ components      通用组件、输入框、聊天消息节点
├─ constants       API、模型、事件、Markdown 等常量
├─ hooks           复用 hooks
├─ service         Axios 请求封装和 API 方法
├─ store           Pinia 状态管理
├─ utils           工具函数和本地存储封装
├─ views           主聊天页和侧边栏视图
├─ App.vue         应用布局
├─ main.ts         应用入口
└─ router.ts       路由配置
```

## 部署

项目已配置 GitHub Pages 相关脚本：

```bash
pnpm build
pnpm deploy
```

当前 Vite `base` 和路由 `base` 均为 `/deepseek-chat/`。如果部署到其他路径，需要同步调整 `vite.config.ts` 和 `src/router.ts` 中的基础路径。

## 常见问题

### 401 或无权限

检查 `apiKey` 是否正确、是否已过期，以及当前账号是否有对应模型权限。

### 请求太频繁

如果接口返回 429，说明请求频率过高或额度限制触发，需要稍后重试。

### 页面刷新后历史还在吗

会话历史保存在浏览器 `localStorage` 中。同一浏览器、同一域名下通常会保留；如果清理浏览器数据或更换设备，历史不会自动同步。

## 联系

如果这个项目对你有帮助，欢迎点一个 Star。

作者微信：`V892433804`
