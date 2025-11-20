import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { storage } from "@/utils";
import { v4 as uuidv4 } from "uuid";
import { useChatStore } from "@/store";

export const useHistoryStore = defineStore("history", () => {
  const list = ref([])

  // 创建新会话
  const createSession = () => {
    const session = {
      id: uuidv4(),
      name: '新会话',
      isSetTitle: false,
      timestamp: Date.now(),
    };
    list.value.unshift(session);
    saveSessions();
    return session.id;
  };
  // 初始化 从本地存储加载会话数据
  const loadSessions = () => {
    try {
      const savedSessions = storage.get("chat-sessions");
      if (savedSessions) {
        list.value = JSON.parse(savedSessions);
      }
    } catch (error) {
      console.error("加载会话数据失败:", error);
      createSession();
    }
  };
  // 保存历史会话列表
  const saveSessions = () => {
    try {
      storage.set("chat-sessions", JSON.stringify(list.value));
      // if (history.sessionId && messages) {
      //   storage.set(
      //     `chat-messages-${history.sessionId}`,
      //     JSON.stringify(messages)
      //   );
      // }
    } catch (error) {
      console.error("保存数据失败:", error);
    }
  };
  // 删除一条会话
  const deleteSession = (id) => {
    return new Promise((resolve, reject) => {
      try {
        const index = list.value.findIndex((s) => s.id === id);
        if (index > -1) {
          // 如果删除的是当前会话，则切换到新会话
          const chat = useChatStore();
          if (chat.sessionId === id) {
            chat.checkToStopMessage();
            chat.initMessages()
          }
          list.value.splice(index, 1);
          storage.remove(`chat-messages-${id}`);
          saveSessions();
          resolve('删除成功');
        } else {
          reject(new Error("会话不存在"));
        }
      } catch (error) {
        reject(error)
      }
    })
  };

  // 修改一条会话
  const updateSession = (id, name) => {
    const index = list.value.findIndex((s) => s.id === id);
    if (index > -1) {
      list.value[index].name = name;
      list.value[index].isSetTitle = true;
      saveSessions();
    }
  }

  const getSessionById = (id) => {
    return list.value.find((s) => s.id === id);
  }

  return {
    sessions: computed(() => list.value),
    saveSessions,
    getSessionById,
    createSession,
    deleteSession,
    updateSession,
    loadSessions,
  };
}
)
export default useHistoryStore