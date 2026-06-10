<!-- 预留的操作栏 -->
<template>
  <div class="navbar-container flex items-center h-12 leading-12 w-full mb-auto px-4">
    <div class="left flex-1 font-bold text-2xl text-[var(--text-primary)]">
      <NTooltip v-if="app.isSmallPage || !app.isSideBarVisible" trigger="hover">
        <template #trigger>
          <NButton class="navbar-icon-button" quaternary size="small" aria-label="打开侧边栏" @click="clickToggleSideBar">
            <template #icon>
              <IconSidebarOpen class="text-lg" />
            </template>
          </NButton>
        </template>
        打开侧边栏
      </NTooltip>
    </div>
    <div class="right flex ml-2.5 items-center gap-2.5">
      <slot></slot>
      <ThemeToggle />
    </div>
  </div>
</template>

<script setup lang="ts">
import { NButton, NTooltip } from "naive-ui";
import { IconSidebarOpen } from "@/icons";
import { useAppStore } from "@/store";
import ThemeToggle from "./ThemeToggle.vue";

const app = useAppStore();

const clickToggleSideBar = () => {
  if (app.isSmallPage) {
    app.set({
      isSideBarVisible: true,
      isSidebarFixed: true,
    });
  }
  app.set({
    isSideBarVisible: true,
  });
};
</script>

<style scoped>
.navbar-icon-button {
  width: 32px;
  height: 32px;
  color: var(--text-primary);
  background: var(--bg-secondary);
}

.navbar-icon-button:hover {
  background: var(--hover-bg);
}
</style>
