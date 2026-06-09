<script setup lang="ts">
import { ref, computed } from "vue";
import { getDayjsCategory } from "@/utils/index";
import { useChatStore, useHistoryStore, useAppStore } from "@/store";
import { successMsg, errorMsg, warningMsg } from "@/hooks/useMsg";
import DialogTitle from "@/components/Common/DialogTitle.vue";

interface HistoryItem {
  id: string;
  name: string;
  timestamp: number;
  isSetTitle?: boolean;
  active?: boolean;
  showPopover?: boolean;
  type?: string;
  content?: string;
}

const selectedId = ref("");
const renameValue = ref("");
const show = ref(false);
const renameRef = ref<HTMLInputElement | null>(null);
const showDel = ref(false);
const activeDialog = ref<HistoryItem | null>(null);
const handleLoading = ref(false);
let currentDateType: string | null = null;

const app = useAppStore();
const chat = useChatStore();
const history = useHistoryStore();
history.loadSessions();

const list = computed(() => {
  const data: HistoryItem[] = [];
  currentDateType = null;
  
  // 添加防御性检查，确保 history.sessions 是数组
  const sessions = Array.isArray(history.sessions) ? history.sessions : [];
  
  sessions.forEach((item) => {
    const { timestamp } = item;
    const dateType = getDayjsCategory(timestamp);
    if (dateType !== currentDateType) {
      data.push({
        id: `title-${dateType}`,
        name: '',
        timestamp: 0,
        type: "title",
        content: dateType,
      });
      currentDateType = dateType;
    }
    data.push({
      ...item,
      active: chat.sessionId === item.id,
      showPopover: false,
    });
  });
  return data;
});

const handleClickDialog = (item: HistoryItem) => {
  try {
    const { id } = item;
    if (chat.sessionId === id) return;
    chat.initMessages(id);
    app.set({
      isSideBarVisible: false,
    });
  } catch (err) {
    console.log("获取对话记录失败", err);
  }
};

const handleRename = (item: HistoryItem) => {
  activeDialog.value = item;
  renameValue.value = item.name;
  show.value = true;
};

const handleDelete = (item: HistoryItem) => {
  activeDialog.value = item;
  showDel.value = true;
};

const handleConfirm = async () => {
  if (renameValue.value.trim() === "") {
    warningMsg("请输入新的对话标题");
    return;
  }
  if (renameValue.value.trim() === activeDialog.value?.name) {
    warningMsg("新标题不能和原标题相同");
    return;
  }
  try {
    handleLoading.value = true;
    if (activeDialog.value) {
      history.updateSession(activeDialog.value.id, renameValue.value);
    }
    show.value = false;
    renameValue.value = "";
  } catch (error) {
    errorMsg(String(error));
  } finally {
    handleLoading.value = false;
  }
};

const handleConfirmDelete = async () => {
  try {
    handleLoading.value = true;
    if (activeDialog.value) {
      await history.deleteSession(activeDialog.value.id);
    }
    successMsg("删除成功");
    showDel.value = false;
  } catch (error) {
    errorMsg(String(error));
  } finally {
    handleLoading.value = false;
  }
};
</script>

<template>
  <div class="sidebar-history-title flex items-center justify-between pt-4 pb-2.5 text-sm text-[var(--text-tertiary)]"
    style="border-top: 1px solid var(--border-color)">
    <span>历史会话</span>
    <i-streamline-stickies-color:time />
  </div>
  <div class="history-list h-full text-sm overflow-y-auto">
    <div class="history-item" v-for="item in list" :key="item.id">
      <div v-if="item.type === 'title'" class="text-[var(--text-tertiary)] my-3 text-xs px-1.5">
        {{ item.content }}
      </div>
      <div v-else class="history-content flex items-center justify-between cursor-pointer rounded-xl px-1.5 pl-4 h-[42px] leading-[42px] mb-1"
        :class="{ 'active-item': chat.sessionId == item.id }">
        <span class="flex-1 overflow-hidden whitespace-nowrap text-ellipsis"
          @click.stop="handleClickDialog(item)">{{ item.name }}</span>
        <span class="options opacity-0 mr-2.5 ml-2.5 rounded">
          <div class="relative inline-block">
            <i-streamline-stickies-color:wrench @click="selectedId = item.id" class="cursor-pointer" />
            <div v-if="selectedId == item.id" class="popover-menu absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border p-2 z-50 min-w-[120px]">
              <div class="popover-item flex items-center p-2 cursor-pointer rounded hover:bg-gray-100"
                @click.stop="handleRename(item)">
                <span class="ml-2 font-medium">重命名</span>
              </div>
              <div class="popover-item flex items-center p-2 cursor-pointer rounded hover:bg-gray-100 text-red-500"
                @click.stop="handleDelete(item)">
                <span class="ml-2 font-medium">删除</span>
              </div>
            </div>
          </div>
        </span>
      </div>
    </div>
    <div class="finished mt-5 text-center text-[var(--text-tertiary)] text-xs">
      {{ list.length > 0 ? "没有更多了~" : "" }}
    </div>

    <!-- 重命名弹窗 -->
    <div v-if="show" class="modal-overlay" @click.self="show = false">
      <div class="modal-content">
        <DialogTitle title="编辑对话名称" @close="show = false; renameValue = '';" />
        <div class="py-4">
          <input ref="renameRef" v-model="renameValue" type="text" placeholder="请输入对话名称"
            :maxlength="20" autofocus
            class="w-full h-11 px-3 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div class="flex justify-center gap-3 pb-5">
          <button class="px-4 h-8 rounded text-sm border hover:bg-gray-50" @click="show = false; renameValue = '';">
            取消
          </button>
          <button class="px-4 h-8 rounded text-sm text-white bg-gradient-to-r from-blue-400 to-blue-600 hover:opacity-90"
            @click="handleConfirm">
            确认
          </button>
        </div>
      </div>
    </div>

    <!-- 删除确认弹窗 -->
    <div v-if="showDel" class="modal-overlay" @click.self="showDel = false">
      <div class="modal-content">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center">
            <img src="@/assets/img/warning.png" class="w-5 h-5 mr-2" />
            <span class="font-bold text-lg">删除对话？</span>
          </div>
          <button class="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100"
            @click="showDel = false">×</button>
        </div>
        <div class="py-4 text-gray-500">删除后不可恢复。</div>
        <div class="flex justify-center gap-3 pb-5">
          <button class="px-4 h-8 rounded text-sm border hover:bg-gray-50" @click="showDel = false">
            取消
          </button>
          <button class="px-4 h-8 rounded text-sm text-white bg-red-500 hover:opacity-90 disabled:opacity-50"
            @click="handleConfirmDelete" :disabled="handleLoading">
            删除
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.history-list {
  scrollbar-width: thin;
  scrollbar-color: var(--text-tertiary) var(--bg-secondary);
}

.history-list::-webkit-scrollbar {
  width: 6px;
}

.history-list::-webkit-scrollbar-track {
  background-color: var(--bg-secondary);
}

.history-list::-webkit-scrollbar-thumb {
  background-color: var(--text-tertiary);
  border-radius: 3px;
}

.history-content {
  color: var(--sidebar-text);
  position: relative;
}

.history-content:hover {
  background-color: var(--hover-bg);
}

.history-content:hover .options {
  opacity: 1;
}

.active-item {
  background-color: #e4edfd;
  color: #4b6deb;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 20px;
  min-width: 350px;
  max-width: 500px;
}

.popover-menu {
  box-shadow: 0px 6px 40px 0px rgba(0, 0, 0, 0.1);
}
</style>
