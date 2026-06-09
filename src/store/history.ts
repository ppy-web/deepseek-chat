import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { storage } from "@/utils";
import { v4 as uuidv4 } from "uuid";
import { useChatStore } from "@/store";

export interface Session {
  id: string;
  name: string;
  isSetTitle: boolean;
  timestamp: number;
  active?: boolean;
  showPopover?: boolean;
}

export const useHistoryStore = defineStore("history", () => {
  const list = ref<Session[]>([]);

  const createSession = (): string => {
    const session: Session = {
      id: uuidv4(),
      name: '新会话',
      isSetTitle: false,
      timestamp: Date.now(),
    };
    list.value.unshift(session);
    saveSessions();
    return session.id;
  };

  const loadSessions = (): void => {
    try {
      const savedSessions = storage.get("chat-sessions");
      if (savedSessions) {
        const parsed = JSON.parse(savedSessions);
        // 确保解析后的数据是数组
        if (Array.isArray(parsed)) {
          list.value = parsed;
        } else {
          console.warn("会话数据格式不正确，重置为空数组");
          list.value = [];
          storage.remove("chat-sessions");
        }
      }
    } catch (error) {
      console.error("加载会话数据失败:", error);
      list.value = [];
      storage.remove("chat-sessions");
      createSession();
    }
  };

  const saveSessions = (): void => {
    try {
      storage.set("chat-sessions", JSON.stringify(list.value));
    } catch (error) {
      console.error("保存数据失败:", error);
    }
  };

  const deleteSession = (id: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      try {
        const index = list.value.findIndex((s) => s.id === id);
        if (index > -1) {
          const chat = useChatStore();
          if (chat.sessionId === id) {
            chat.checkToStopMessage();
            chat.initMessages();
          }
          list.value.splice(index, 1);
          storage.remove(`chat-messages-${id}`);
          saveSessions();
          resolve('删除成功');
        } else {
          reject(new Error("会话不存在"));
        }
      } catch (error) {
        reject(error);
      }
    });
  };

  const updateSession = (id: string, name: string): void => {
    const index = list.value.findIndex((s) => s.id === id);
    if (index > -1) {
      list.value[index].name = name;
      list.value[index].isSetTitle = true;
      saveSessions();
    }
  };

  const getSessionById = (id: string): Session | undefined => {
    return list.value.find((s) => s.id === id);
  };

  return {
    sessions: computed(() => list.value),
    saveSessions,
    getSessionById,
    createSession,
    deleteSession,
    updateSession,
    loadSessions,
  };
});

export default useHistoryStore;
