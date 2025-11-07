import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { storage } from "@/utils";
import { v4 as uuidv4 } from "uuid";

export const useHistoryStore = defineStore("history", () => {
  const list = ref([])

  // getter
  const sessions = computed(() => {
    return list.value
  })

  // 创建新会话
  const createSession = () => {
    const session = {
      id: uuidv4(),
      name: `新会话 ${list.value.length + 1}`,
      timestamp: Date.now(),
    };
    list.value.push(session);
    saveSessions();
    return session.id;
  };
  // 初始化 从本地存储加载会话数据
  const loadSessions = () => {
    try {
      const savedSessions = storage.get("chat-sessions");
      if (savedSessions) {
        list.value = JSON.parse(savedSessions);
      } else {
        createSession();
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
          list.value.splice(index, 1);
          storage.remove(`chat-messages-${id}`);
          // 如果删除的是当前会话，则切换到新会话
          // if (history.sessionId === id) {
          //   createSession();
          // }
          saveToStorage();
          resolve('删除成功');
        } else {
          reject(new Error("会话不存在"));
        }
      } catch (error) {
        reject(error)
      }
    })

  };

  return {
    sessions,
    saveSessions,
    createSession,
    deleteSession,
    loadSessions,
  };
}
)
export default useHistoryStore