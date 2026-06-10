<script setup lang="ts">
import { NAvatar, NButton, NTooltip } from "naive-ui";
import { IconSidebarCollapse } from "@/icons";
import { useAppStore, useCallwordStore } from "@/store";
import CallWord from "./CallWord.vue";

const app = useAppStore();
const callword = useCallwordStore();

const toggleSideBar = () => {
  app.set({
    isSideBarVisible: false,
  });
};
</script>

<template>
  <div class="sidebar-top">
    <NAvatar :size="44" round :src="app.logo" />
    <div class="assistant-meta">
      <div class="assistant-name">{{ callword.name }}</div>
      <div class="assistant-status">AI 助手</div>
    </div>
    <CallWord />
    <NTooltip trigger="hover">
      <template #trigger>
        <NButton class="sidebar-icon-button" quaternary size="small" aria-label="收起侧边栏" @click="toggleSideBar">
          <template #icon>
            <IconSidebarCollapse />
          </template>
        </NButton>
      </template>
      收起侧边栏
    </NTooltip>
  </div>
</template>

<style scoped>
.sidebar-top {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 56px;
  padding: 2px 0 8px;
}

.assistant-meta {
  min-width: 0;
  flex: 1;
}

.assistant-name {
  overflow: hidden;
  color: var(--text-primary);
  font-size: 17px;
  font-weight: 700;
  line-height: 1.35;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.assistant-status {
  margin-top: 2px;
  color: var(--text-tertiary);
  font-size: 12px;
  line-height: 1.2;
}

.sidebar-icon-button {
  width: 32px;
  height: 32px;
  color: var(--text-primary);
}
</style>
