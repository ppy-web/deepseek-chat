import { ref, computed, nextTick } from "vue";
import { defineStore } from "pinia";
import { v4 as uuidv4 } from "uuid";
import { useMitt } from "../hooks/useMitt"; // 事件总线
import { useRefs } from "@/hooks/useRefs"; // DOM引用管理
import { useMarkdown } from "../hooks/useMarkdown"; // Markdown渲染
import useHistoryStore from "./history";
import useAppStore from "./app";
import {
  EVENT_TYPE,
  MESSAGE_TYPE
} from "@/constants";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { scrollTop, Timer, isEmpty, storage } from "@/utils"; // 工具函数
const { refs } = useRefs();
const { markdown } = useMarkdown();
const mitt = useMitt();

const useChatStore = defineStore("chat", () => {
  const messages = ref([]); // 消息列表
  const currentId = ref(''); // 当前会话id
  const message = ref(null); // 当前消息
  const autoScroll = ref(true); // 是否自动滚动
  let controller = null; // 请求控制器
  let timer = null; // 计时器

  const sessionId = computed(() => currentId.value);

  function initMessages(newId) {
    if (!currentId.value) {
      currentId.value = newId;
      loadMessages(newId);
    }
  }

  // 获取本地消息内容
  const loadMessages = (id) => {
    try {
      const savedMessages = storage.get(`chat-messages-${id}`);
      messages.value = savedMessages ? JSON.parse(savedMessages) : [];
    } catch (error) {
      messages.value = [];
    }
  };

  // 新增消息
  const pushMessage = (msg) => {
    if (!currentId.value) {
      const newId = useHistoryStore().createSession();
      initMessages(newId);
    }
    messages.value.push(msg);
    upDateData();
  };
  // 更新消息
  const updateLastMessage = (message) => {
    if (messages.value.length > 0) {
      messages.value[messages.value.length - 1] = { ...message };
    }
  };
  // 保存会话消息
  const upDateData = () => {
    if (currentId.value) {
      storage.set(
        `chat-messages-${currentId.value}`,
        JSON.stringify(messages.value)
      );
    }
  }
  // 移除最后一条消息
  const removeLastMessage = () => {
    messages.value.pop();
    upDateData();
  };
  // 设置当前消息
  const setMessage = (data) => {
    message.value = data;
  };
  // 点赞或踩
  const evaluateMessage = (id, status) => {
    try {
      const index = messages.value.findIndex((item) => item.id === id);
      if (index !== -1) {
        messages.value[index].evaluate = status;
      }
    } catch (error) {
      console.error("点赞或踩失败:", error);
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
      handleStreamError();
    }
  };
  const handleStreamError = () => {
    // 根据错误类型设置相应的提示内容
    message.value.content = '对不起，我无法回答这个问题。';
    message.value.htmlStr = markdown.render(message.value.content);
    message.value.isTextStreamEnd = true; // 标记流已结束
    message.value.isPending = false;
  };
  const queryAnswer = (lastQuery) => {
    // 创建新的中断控制器，用于后续可能的请求中断
    controller = new AbortController();
    const signal = controller.signal;
    let ask, botMessage, queryParams;
    const app = useAppStore();
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
      model: app.useModel,
      messages: messages.value.slice(0, -1).map((msg) => ({
        role: msg.type,
        content: msg.content,
      })),
      ...app.defaultParams
    };

    // 显示打断按钮
    mitt.emit(EVENT_TYPE.SEND_SUCCESS); // 触发发送成功事件
    // 发起流式请求
    fetchEventSource(`${app.baseURL}/chat/completions`, {
      method: "post",
      headers: {
        'Accept': 'application/json',
        "Content-Type": "application/json",
        Authorization: `Bearer ${app.apiKey}`, // 认证令牌
      },
      signal,
      openWhenHidden: true,
      body: JSON.stringify(queryParams),
      onmessage: (event) => {
        debugger
        if (event.data === "[DONE]") {
          message.value.isTextStreamEnd = true;
          updateLastMessage(message.value);
          scrollMessageBox(500);
          return;
        }
        const parsed = JSON.parse(event.data);
        handleStreamMessage(parsed);
      },
      // 错误
      onerror: () => handleStreamError(),
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
  };
  // 如果上一条消息 正在pending 需要删除
  const checkDeleteLastMessage = () => {
    // 如果这条消息还在pending状态, 或者问数进度不问空 则删除当前message
    if (message.value) {
      if (message.value.isPending) {
        removeLastMessage();
        setMessage(null);
      }
    }
  };
  return {
    messages,
    sessionId,
    initMessages,
    loadMessages,
    setMessage,
    pushMessage,
    sendMessage,
    cancelAnswer,
    setAutoScroll,
    evaluateMessage,
    checkToStopMessage,
  };
});

export default useChatStore