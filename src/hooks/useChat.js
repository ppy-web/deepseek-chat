import { ref, computed, nextTick } from "vue";
import { defineStore } from "pinia";
import { v4 as uuidv4 } from "uuid";
import { useStore } from "./useStore"; // 全局状态管理
import { useMitt } from "./useMitt"; // 事件总线
import { useRefs } from "@/hooks/useRefs"; // DOM引用管理
import { useMarkdown } from "./useMarkdown"; // Markdown渲染
import { ElMessageBox } from "element-plus";
import {
  EVENT_TYPE,
  MESSAGE_TYPE,
  API_CONFIG,
  MODELS,
  ERROR_TYPE,
} from "@/constants";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { scrollTop, Timer, isEmpty, storage } from "@/utils"; // 工具函数

export function useChat() {
  // 全局状态引用
  const { app, config, user } = useStore();
  const { refs } = useRefs();
  const { markdown } = useMarkdown();
  const apologyHint = computed(() => config.info.apologyHint); // 错误提示文本
  const timeoutHint = computed(() => config.info.timeoutHint); // 超时提示文本
  const localModelIndex = computed(() => app.info.localModelIndex); // 当前选中模型索引
  const model = computed(() => MODELS[localModelIndex.value].value); // 当前模型名称
  const sessionId = computed(() => app.info.sessionId);
  const baseURL = computed(() => config.baseURL);
  const apiKey = computed(() => config.apiKey);
  const options = computed(() => user.options);
  const mitt = useMitt();

  const store = defineStore("chat", () => {
    const sessions = ref([]); // 会话列表
    const messages = ref([]); // 消息列表
    const message = ref(null); // 当前消息
    const autoScroll = ref(true); // 是否自动滚动
    let controller = null; // 请求控制器
    let timer = null; // 计时器
    // 创建会话
    const createSession = () => {
      const session = {
        id: Date.now().toString(),
        name: `会话 ${sessions.value.length + 1}`,
        timestamp: Date.now(),
      };
      sessions.value.push(session);
      app.set({
        sessionId: session.id,
      })
      saveToStorage();
    };
    const loadFromStorage = () => {
      try {
        const savedSessions = storage.get("chat-sessions");
        if (savedSessions) {
          sessions.value = JSON.parse(savedSessions);
          if (sessions.value.length > 0) {
            app.set({
              sessionId: sessions.value[0].id,
            })
            loadSessionMessages(sessions.value[0].id);
          } else {
            createSession();
          }
        } else {
          createSession();
        }
      } catch (error) {
        console.error("加载会话数据失败:", error);
        createSession();
      }
    };
    // 加载会话消息
    const loadSessionMessages = (sessionId) => {
      try {
        const savedMessages = storage.get(`chat-messages-${sessionId}`);
        console.log('savedMessages', savedMessages)
        messages.value = savedMessages ? JSON.parse(savedMessages) : [];
        nextTick(() => {
          scrollMessageBox(500);
        });
      } catch (error) {
        console.error("加载消息失败:", error);
        messages.value = [];
      }
    };
    const saveToStorage = () => {
      try {
        storage.set("chat-sessions", JSON.stringify(sessions.value));
        if (sessionId.value) {
          storage.set(
            `chat-messages-${sessionId.value}`,
            JSON.stringify(messages.value)
          );
        }
      } catch (error) {
        console.error("保存数据失败:", error);
      }
    };
    // 删除会话
    const deleteSession = (id) => {
      const index = sessions.value.findIndex((s) => s.id === sessionId);
      if (index > -1) {
        sessions.value.splice(index, 1);
        storage.remove(`chat-messages-${id}`);
        if (sessionId.value === id) {
          if (sessions.value.length > 0) {
            sessionId.value = sessions.value[0].id;
            loadSessionMessages(sessions.value[0].id);
          } else {
            createSession();
          }
        }
        saveToStorage();
      }
    };
    // 新增消息
    const pushMessage = (msg) => {
      if (!sessionId.value) {
        createSession();
      }
      messages.value.push(msg);
      // saveSessionMessages();
    };
    // 更新最后一条消息
    const updateLastMessage = (message) => {
      if (messages.value.length > 0) {
        messages.value[messages.value.length - 1] = { ...message };
        if (sessionId.value) {
          storage.set(
            `chat-messages-${sessionId.value}`,
            JSON.stringify(messages.value)
          );
        }
      }
    };

    // 移除最后一条消息
    const removeLastMessage = () => {
      messages.value.pop();
      if (sessionId.value) {
        storage.set(
          `chat-messages-${sessionId.value}`,
          JSON.stringify(messages.value)
        );
      }
    };
    // 保存会话消息
    const saveSessionMessages = () => {
      if (sessionId.value) {
        try {
          storage.set(
            `chat-messages-${sessionId.value}`,
            JSON.stringify(messages.value)
          );
        } catch (error) {
          console.error("保存消息失败:", error);
        }
      }
    };
    // 删除消息
    const popMessage = () => {
      messages.value.pop();
    };
    // 清空消息列表
    const clearMessages = () => {
      messages.value = [];
      app.set({
        sessionId: '',
      })
    };

    // 清空当前会话
    const clearCurrentSession = async () => {
      try {
        await ElMessageBox.confirm(
          "确定要清空当前会话吗？此操作不可恢复。",
          "清空会话",
          {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          }
        );
        if (sessionId.value) {
          // 清空消息
          messages.value = [];
          storage.set(
            `chat-messages-${sessionId.value}`,
            JSON.stringify([])
          );
          // 更新会话名称
          const currentSession = sessions.value.find(
            (s) => s.id === sessionId.value
          );
          if (currentSession) {
            currentSession.name = `会话 ${
              sessions.value.indexOf(currentSession) + 1
            }`;
            saveToStorage();
          }
        }
      } catch {
        // 用户取消操作
      }
    };

    // 设置当前消息
    const setMessage = (data) => {
      message.value = data;
    };
    // 点赞或踩
    const evaluateMessage = (status) => {
      try {
        messages.value[messages.value.length - 1].opsStatus = status;
        scrollMessageBox(500);
        return true;
      } catch (error) {
        return false;
      }
    };
    // 设置自动滚动状态
    const setAutoScroll = (val) => {
      autoScroll.value = val;
    };
    // 滚动消息框到底部
    const scrollMessageBox = (duration = 20) => {
      if (refs.messageBoxRef && autoScroll.value) {
        nextTick(() => {
          scrollTop(
            document.querySelector(".chat-component .el-scrollbar__wrap"),
            duration
          );
        });
      }
    };
    // 处理文字流消息
    const handleStreamMessage = (parsed) => {
      try {
        const { delta } = parsed.choices[0];
        // handleTextStream(delta);
        // 第一次获取到可展示的文本 认为pending结束
        if (
          message.value.isPending &&
          (delta.content || delta.reasoning_content)
        ) {
          message.value.isPending = false;
        }
        if (delta.reasoning_content) {
          if (isEmpty(timer)) {
            timer = new Timer();
          }
          message.value.thinking =
            message.value.thinking + delta.reasoning_content;
        }
        // 流式内容
        if (delta.content) {
          // 是否启动思考计时器
          if (!isEmpty(timer) && !message.value.thinkFinished) {
            message.value.thinkTime = timer?.stopSecondsRounded();
            message.value.thinkFinished = true;
            timer = null;
          }
          message.value.content += delta.content;
        }
        // 正常文本内容 md格式
        message.value.htmlStr = markdown.render(message.value.content);
        message.value.htmlThinking = markdown.render(message.value.thinking);
        // 每次处理文本消息后尝试滚动到底部
        scrollMessageBox();
      } catch (error) {
        console.error("处理流式消息失败:", error);
        handleStreamError(ERROR_TYPE.APOLOGY);
      }
    };
    const handleStreamError = (errorType) => {
      // 根据错误类型设置相应的提示内容
      message.value.content =
        errorType === ERROR_TYPE.APOLOGY
          ? apologyHint.value
          : timeoutHint.value;
      message.value.htmlStr = markdown.render(message.value.content);
      message.value.isTextStreamEnd = true; // 标记流已结束
      message.value.isPending = false;
      app.set({ showInterruptBtn: false }); // 隐藏打断按钮
    };
    const queryAnswer = (lastQuery) => {
      // 创建新的中断控制器，用于后续可能的请求中断
      controller = new AbortController();
      const signal = controller.signal;
      let ask, botMessage, queryParams;
      if (!lastQuery) {
        // 创建AI回复消息对象
        botMessage = {
          ask,
          mid: uuidv4(),
          type: MESSAGE_TYPE.BOT,
          content: "", // 原始文本内容
          htmlStr: "", // Markdown渲染后的HTML
          thinking: "", // 思考文本
          htmlThinking: "", // 思考文本HTML
          thinkFinished: false, // 思考结束
          thinkTime: 0, // 思考用时
          isPending: true, // 是否正在处理
          isTextStreamEnd: false,
        };
        pushMessage(botMessage);
        setMessage(botMessage);
        scrollMessageBox(250);
      }
      queryParams = {
        model: model.value,
        messages: messages.value.slice(0, -1).map((msg) => ({
          role: msg.type,
          content: msg.content,
        })),
        stream: true,
        ...API_CONFIG.defaultParams,
        ...options.value,
      };

      // 显示打断按钮
      app.set({ showInterruptBtn: true });
      app.set({ isPlayStream: false });
      mitt.emit(EVENT_TYPE.SEND_SUCCESS); // 触发发送成功事件
      // 发起流式请求
      fetchEventSource(`${baseURL.value}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey.value}`, // 认证令牌
        },
        signal,
        openWhenHidden: true,
        body: JSON.stringify(queryParams),
        onmessage: (event) => {
          if (event.data === "[DONE]") {
            app.set({ showInterruptBtn: false });
            message.value.isTextStreamEnd = true;
            updateLastMessage(message.value);
            scrollMessageBox(500);
            return;
          }
          const parsed = JSON.parse(event.data);
          handleStreamMessage(parsed);
        },
        // 处理错误
        onerror: () => handleStreamError(ERROR_TYPE.TIMEOUT),
      });
    };
    // 检测停止
    const checkToStopMessage = () => {
      if (message.value && !message.value.isTextStreamEnd && controller) {
        controller.abort();
      }
      checkDeleteLastMessage();
    };
    const sendMessage = (val) => {
      checkToStopMessage();
      setAutoScroll(true);
      const userMessage = {
        mid: uuidv4(),
        type: MESSAGE_TYPE.USER,
        content: val,
      };
      pushMessage(userMessage);
      setMessage(userMessage);
      queryAnswer(); // 触发AI查询
      scrollMessageBox(250);
    };
    // 切换会话
    const switchSession = (id) => {
      if (sessionId.value !== id) {
        app.set({
          sessionId: id
        })
        loadSessionMessages(id);
      }
    };
    // 取消当前回答请求
    const cancelAnswer = () => {
      checkDeleteLastMessage();
      if (message.value) {
        message.value.isTextStreamEnd = true; // 标记流结束
      }
      if (controller) {
        controller.abort(); // 中断请求
        controller = null;
      }
      app.set({ showInterruptBtn: false }); // 隐藏打断按钮
    };
    // 如果上一条消息 正在pending 需要删除
    const checkDeleteLastMessage = () => {
      // 如果这条消息还在pending状态, 或者问数进度不问空 则删除当前message
      if (message.value) {
        if (message.value.isPending) {
          popMessage();
          setMessage(null);
        }
      }
    };
    loadFromStorage();

    return {
      messages,
      sessions,
      sessionId,
      clearMessages,
      switchSession,
      setMessage,
      pushMessage,
      sendMessage,
      cancelAnswer,
      setAutoScroll,
      evaluateMessage,
      checkToStopMessage,
    };
  });

  return store();
}
