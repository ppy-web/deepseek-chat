import { ref, computed, nextTick } from "vue";
import { defineStore } from "pinia";
import { v4 as uuidv4 } from "uuid";
import { useMitt } from "../hooks/useMitt";
import { useRefs } from "@/hooks/useRefs";
import { useHistoryStore, useAppStore, useCallwordStore } from "@/store";
import { EVENT_TYPE, MESSAGE_TYPE } from "@/constants";
import {
  type DeepSeekMessage,
} from "@/constants/deepseek";
import {
  buildChatRequestBody,
  buildChatRequestHeaders,
  getProviderModelByThinking,
} from "@/constants/llm";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { scrollTop, Timer, isEmpty } from "@/utils";
import { storage } from "@/utils";
import { getTalkTitle } from "@/service/api";

const { refs } = useRefs();

export interface ChatMessage {
  mid: string;
  type: "user" | "assistant";
  content: string;
  thinking: string;
  thinkFinished: boolean;
  thinkTime: number;
  isPending: boolean;
  isTextStreamEnd: boolean;
  opsStatus?: string;
  evaluate?: string;
}

interface DeepSeekStreamDelta {
  content?: string;
  reasoning_content?: string;
}

interface DeepSeekStreamChunk {
  choices: Array<{
    delta?: DeepSeekStreamDelta;
  }>;
}

const mitt = useMitt();

const useChatStore = defineStore("chat", () => {
  const messages = ref<ChatMessage[]>([]);
  const currentId = ref<string>('');
  const message = ref<ChatMessage | null>(null);
  const autoScroll = ref(true);
  let controller: AbortController | null = null;
  let timer: Timer | null = null;

  function initMessages(newId?: string): void {
    if (newId) {
      currentId.value = newId;
      loadMessages(newId);
    } else {
      currentId.value = '';
      message.value = null;
      messages.value = [];
    }
  }

  const loadMessages = (id: string): void => {
    try {
      const savedMessages = storage.get(`chat-messages-${id}`);
      messages.value = savedMessages ? JSON.parse(savedMessages) : [];
      nextTick(() => {
        scrollMessageBox(500);
      });
    } catch (error) {
      console.log(error);
      messages.value = [];
    }
  };

  const pushMessage = (msg: ChatMessage): void => {
    if (!currentId.value) {
      const history = useHistoryStore();
      const newId = history.createSession();
      initMessages(newId);
    }
    messages.value.push(msg);
  };

  const updateLastMessage = (msg: ChatMessage): void => {
    if (messages.value.length > 0) {
      messages.value[messages.value.length - 1] = { ...msg };
    }
  };

  const upDateData = (): void => {
    if (currentId.value) {
      storage.set(
        `chat-messages-${currentId.value}`,
        JSON.stringify(messages.value)
      );
    }
  };

  const removeLastMessage = (): void => {
    messages.value.pop();
    upDateData();
  };

  const setMessage = (data: ChatMessage | null): void => {
    message.value = data;
  };

  const evaluateMessage = (id: string, status: string): void => {
    try {
      const index = messages.value.findIndex((item) => item.mid === id);
      if (index !== -1) {
        messages.value[index].evaluate = status;
      }
    } catch (error) {
      console.error("点赞或踩失败:", error);
    }
  };

  const setAutoScroll = (val: boolean): void => {
    autoScroll.value = val;
  };

  const scrollMessageBox = (duration: number = 20): void => {
    if (refs.messageBoxRef && autoScroll.value) {
      nextTick(() => {
        const el = document.querySelector(".chat-component") as HTMLElement;
        if (el) {
          scrollTop(el, duration);
        }
      });
    }
  };

  const handleStreamMessage = (parsed: DeepSeekStreamChunk): void => {
    try {
      const delta = parsed.choices[0]?.delta;
      if (!delta) return;
      if (
        message.value?.isPending &&
        (delta.content || delta.reasoning_content)
      ) {
        message.value.isPending = false;
      }
      if (delta.reasoning_content) {
        if (isEmpty(timer)) {
          timer = new Timer();
        }
        if (message.value) {
          message.value.thinking =
            message.value.thinking + delta.reasoning_content;
        }
      }
      if (delta.content) {
        if (!isEmpty(timer) && message.value && !message.value.thinkFinished) {
          message.value.thinkTime = timer?.stopSecondsRounded() || 0;
          message.value.thinkFinished = true;
          timer = null;
        }
        if (message.value) {
          message.value.content += delta.content;
        }
      }
      scrollMessageBox();
    } catch (error) {
      console.error("处理流式消息失败:", error);
    }
  };

  const handleStreamError = (content = '对不起，我无法回答这个问题。'): void => {
    if (message.value) {
      message.value.content = content;
      message.value.isTextStreamEnd = true;
      message.value.isPending = false;
    }
  };

  const queryAnswer = (lastQuery?: boolean): void => {
    controller = new AbortController();
    const signal = controller.signal;

    const app = useAppStore();
    const callword = useCallwordStore();
    const apiKey = app.currentApiKey;

    if (!lastQuery) {
      const botMessage: ChatMessage = {
        mid: uuidv4(),
        type: MESSAGE_TYPE.BOT,
        content: "",
        thinking: "",
        thinkFinished: false,
        thinkTime: 0,
        isPending: true,
        isTextStreamEnd: false,
      };
      pushMessage(botMessage);
      setMessage(botMessage);
      scrollMessageBox(250);
    }

    if (!apiKey) {
      handleStreamError("请先配置当前模型的 API Key。");
      return;
    }

    const chatMessage: DeepSeekMessage[] = messages.value.slice(0, -1).map(
      (msg) => ({
        role: msg.type,
        content: msg.content,
        ...(msg.thinking
          ? {
            reasoning_content: msg.thinking,
          }
          : {}),
      })
    );

    const promtMessage: DeepSeekMessage = {
      content: callword.text,
      role: "system",
    };

    const queryParams = buildChatRequestBody({
      provider: app.provider,
      model: app.useModel,
      messages: [promtMessage, ...chatMessage],
      defaultParams: app.defaultParams,
      thinkingEnabled: app.isDeepseek,
    });

    mitt.emit(EVENT_TYPE.SEND_SUCCESS);

    fetchEventSource(`${app.baseURL}/chat/completions`, {
      method: "post",
      headers: buildChatRequestHeaders(app.provider, apiKey),
      signal,
      openWhenHidden: true,
      body: JSON.stringify(queryParams),
      onmessage: (event) => {
        if (event.data === "[DONE]") {
          if (message.value) {
            message.value.isTextStreamEnd = true;
          }
          updateLastMessage(message.value!);
          upDateData();
          getTalkTitleHandle();
          scrollMessageBox(500);
          return;
        }
        const parsed = JSON.parse(event.data) as DeepSeekStreamChunk;
        handleStreamMessage(parsed);
      },
      onerror: () => handleStreamError(),
    });
  };

  const checkToStopMessage = (): void => {
    if (message.value && !message.value.isTextStreamEnd && controller) {
      controller.abort();
    }
    checkDeleteLastMessage();
  };

  const sendMessage = (val: string): void => {
    checkToStopMessage();
    setAutoScroll(true);
    const userMessage: ChatMessage = {
      mid: uuidv4(),
      type: MESSAGE_TYPE.USER,
      content: val,
      thinking: "",
      thinkFinished: false,
      thinkTime: 0,
      isPending: false,
      isTextStreamEnd: true,
    };
    pushMessage(userMessage);
    setMessage(userMessage);
    queryAnswer();
    scrollMessageBox(250);
  };

  const cancelAnswer = (): void => {
    checkDeleteLastMessage();
    if (message.value) {
      message.value.isTextStreamEnd = true;
    }
    if (controller) {
      controller.abort();
      controller = null;
    }
  };

  const checkDeleteLastMessage = (): void => {
    if (message.value) {
      if (message.value.isPending) {
        removeLastMessage();
        setMessage(null);
      }
    }
  };

  const getTalkTitleHandle = async (): Promise<void> => {
    const app = useAppStore();
    const history = useHistoryStore();
    const sessionInfo = history.getSessionById(currentId.value);
    let messageText = '';

    if (sessionInfo && !sessionInfo.isSetTitle && messages.value.length > 1) {
      const forTimes = messages.value.length > 10 ? 10 : messages.value.length;
      for (let i = 0; i < forTimes; i++) {
        if (messages.value[i].type === MESSAGE_TYPE.USER) {
          messageText += `提问: ${messages.value[i].content}。`;
        } else {
          messageText += `回答: ${messages.value[i].content}。`;
        }
      }
    } else {
      return;
    }

    const param = buildChatRequestBody({
      provider: app.provider,
      messages: [
        {
          content:
            "请根据提问和回答，给出精准、简洁、可读性强的会话主题，尽量控制在5到20字以内，对话内容如下：/n" +
            messageText +
            "/n 直接输出对话主题，不要输出其他内容",
          role: "system",
        },
      ],
      model: getProviderModelByThinking(app.provider, false),
      defaultParams: {
        ...app.defaultParams,
        stream: false,
        max_tokens: 80,
        temperature: 1,
      },
      thinkingEnabled: false,
    });

    const { choices } = await getTalkTitle(param, {
      baseURL: app.baseURL,
      apiKey: app.currentApiKey,
      provider: app.provider,
    });
    if (choices && choices.length > 0) {
      history.updateSession(currentId.value, choices[0].message.content);
    }
  };

  return {
    chatList: computed(() => messages.value),
    sessionId: computed(() => currentId.value),
    isRunning: computed(() => {
      return !!message.value && (message.value.isPending || !message.value.isTextStreamEnd);
    }),
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

export default useChatStore;
