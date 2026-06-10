<script setup lang="ts">
import { computed, h, ref } from "vue";
import type { DropdownOption } from "naive-ui";
import {
  NButton,
  NDropdown,
  NEmpty,
  NInput,
  NIcon,
  NModal,
  NScrollbar,
  NText,
} from "naive-ui";
import { IconHistory, IconSessionAction } from "@/icons";
import { getDayjsCategory } from "@/utils/index";
import { useChatStore, useHistoryStore, useAppStore } from "@/store";
import { successMsg, errorMsg, warningMsg } from "@/hooks/useMsg";
import type { Session } from "@/store/history";

interface HistoryGroupItem {
  id: string;
  name: string;
  timestamp: number;
  type?: "title";
  content?: string;
  active?: boolean;
  isSetTitle?: boolean;
}

const renameValue = ref("");
const showRename = ref(false);
const showDelete = ref(false);
const activeDialog = ref<HistoryGroupItem | null>(null);
const handleLoading = ref(false);

const app = useAppStore();
const chat = useChatStore();
const history = useHistoryStore();
history.loadSessions();

const actionOptions: DropdownOption[] = [
  {
    label: "重命名",
    key: "rename",
  },
  {
    label: () => h("span", { class: "danger-option" }, "删除"),
    key: "delete",
  },
];

const list = computed<HistoryGroupItem[]>(() => {
  const data: HistoryGroupItem[] = [];
  let currentDateType: string | null = null;
  const sessions = Array.isArray(history.sessions) ? history.sessions : [];

  sessions.forEach((item: Session) => {
    const dateType = getDayjsCategory(item.timestamp);
    if (dateType !== currentDateType) {
      data.push({
        id: `title-${dateType}`,
        name: "",
        timestamp: 0,
        type: "title",
        content: dateType,
      });
      currentDateType = dateType;
    }
    data.push({
      ...item,
      active: chat.sessionId === item.id,
    });
  });
  return data;
});

const sessionCount = computed(() => {
  return Array.isArray(history.sessions) ? history.sessions.length : 0;
});

const handleClickDialog = (item: HistoryGroupItem) => {
  try {
    if (item.type === "title") return;
    if (chat.sessionId === item.id) return;
    chat.initMessages(item.id);
    app.set({
      isSideBarVisible: false,
    });
  } catch (err) {
    console.log("获取对话记录失败", err);
  }
};

const openRename = (item: HistoryGroupItem) => {
  activeDialog.value = item;
  renameValue.value = item.name;
  showRename.value = true;
};

const openDelete = (item: HistoryGroupItem) => {
  activeDialog.value = item;
  showDelete.value = true;
};

const handleSelectAction = (key: string | number, item: HistoryGroupItem) => {
  if (key === "rename") {
    openRename(item);
    return;
  }
  if (key === "delete") {
    openDelete(item);
  }
};

const closeRename = () => {
  showRename.value = false;
  renameValue.value = "";
};

const handleConfirm = async () => {
  const nextName = renameValue.value.trim();
  if (nextName === "") {
    warningMsg("请输入新的对话标题");
    return;
  }
  if (nextName === activeDialog.value?.name) {
    warningMsg("新标题不能和原标题相同");
    return;
  }
  try {
    handleLoading.value = true;
    if (activeDialog.value) {
      history.updateSession(activeDialog.value.id, nextName);
    }
    closeRename();
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
    showDelete.value = false;
  } catch (error) {
    errorMsg(String(error));
  } finally {
    handleLoading.value = false;
  }
};
</script>

<template>
  <section class="history-panel">
    <header class="history-header">
      <div>
        <div class="history-title"> <span v-if="sessionCount > 0"> {{ sessionCount }}个</span>历史会话</div>
      </div>
      <NIcon class="history-icon" size="18">
        <IconHistory />
      </NIcon>
    </header>

    <div v-if="sessionCount === 0" class="history-empty">
      <NEmpty description="暂无历史会话" size="small" />
    </div>

    <NScrollbar v-else class="history-scroll">
      <div class="history-list">
        <template v-for="item in list" :key="item.id">
          <div v-if="item.type === 'title'" class="history-section">
            {{ item.content }}
          </div>
          <div v-else class="history-content" :class="{ 'active-item': item.active }">
            <button class="history-name" type="button" @click.stop="handleClickDialog(item)">
              {{ item.name }}
            </button>
            <NDropdown trigger="click" placement="bottom-end" :options="actionOptions"
              @select="(key) => handleSelectAction(key, item)">
              <NButton class="history-more" quaternary circle size="tiny" aria-label="会话操作">
                <template #icon>
                  <IconSessionAction />
                </template>
              </NButton>
            </NDropdown>
          </div>
        </template>
        <div class="history-finished">没有更多了~</div>
      </div>
    </NScrollbar>

    <NModal v-model:show="showRename" preset="dialog" title="编辑对话名称" :show-icon="false">
      <div class="rename-body">
        <NInput v-model:value="renameValue" type="text" placeholder="请输入对话名称" :maxlength="20" show-count autofocus
          @keyup.enter="handleConfirm" />
      </div>
      <template #action>
        <NButton @click="closeRename">取消</NButton>
        <NButton type="primary" :loading="handleLoading" @click="handleConfirm">确认</NButton>
      </template>
    </NModal>

    <NModal v-model:show="showDelete" preset="dialog" type="warning" title="删除对话？">
      <NText depth="3">删除后不可恢复。</NText>
      <template #action>
        <NButton @click="showDelete = false">取消</NButton>
        <NButton type="error" :loading="handleLoading" @click="handleConfirmDelete">删除</NButton>
      </template>
    </NModal>
  </section>
</template>

<style scoped>
.history-panel {
  display: flex;
  height: 100%;
  min-height: 0;
  flex-direction: column;
  border-top: 1px solid var(--border-color);
}

.history-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 0 0 auto;
  padding: 12px 2px 10px;
}

.history-title {
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 700;
  line-height: 1.2;
}

.history-icon {
  flex: 0 0 auto;
  color: var(--text-tertiary);
}

.history-empty {
  display: flex;
  min-height: 180px;
  align-items: center;
  justify-content: center;
}

.history-scroll {
  min-height: 0;
  flex: 1;
}

.history-list {
  padding-right: 4px;
}

.history-section {
  margin: 14px 0 6px;
  padding: 0 8px;
  color: var(--text-tertiary);
  font-size: 12px;
  font-weight: 600;
  line-height: 1.2;
}

.history-content {
  display: flex;
  align-items: center;
  gap: 4px;
  min-height: 40px;
  margin-bottom: 4px;
  padding: 0 4px 0 12px;
  border: 1px solid transparent;
  border-radius: 8px;
  color: var(--sidebar-text);
  transition:
    background-color 0.18s ease,
    border-color 0.18s ease,
    color 0.18s ease;
}

.history-content:hover {
  background-color: var(--hover-bg);
}

.active-item {
  border-color: rgba(16, 185, 129, 0.2);
  background: rgba(16, 185, 129, 0.12);
  color: #0f766e;
}

:global(:root.dark) .active-item {
  border-color: rgba(45, 212, 191, 0.22);
  background: rgba(45, 212, 191, 0.12);
  color: #5eead4;
}

.history-name {
  min-width: 0;
  flex: 1;
  overflow: hidden;
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font: inherit;
  line-height: 40px;
  outline: none;
  padding: 0;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.history-more {
  flex: 0 0 auto;
  opacity: 0;
  transition: opacity 0.18s ease;
}

.history-content:hover .history-more,
.history-more:focus-visible {
  opacity: 1;
}

.active-item .history-more {
  opacity: 1;
}

.history-finished {
  padding: 16px 0 6px;
  color: var(--text-tertiary);
  font-size: 12px;
  text-align: center;
}

.rename-body {
  padding-top: 6px;
}

:global(.danger-option) {
  color: #dc2626;
}
</style>
