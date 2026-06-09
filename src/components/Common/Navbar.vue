<!-- 预留的操作栏 -->
<template>
  <div class="navbar-container flex items-center h-12 leading-12 w-inherit shadow-sm mb-auto px-4">
    <div class="left flex-1 font-bold text-2xl text-[var(--text-primary)]">
      <div class="navbar-sidebar-toggle flex items-center justify-center w-8 h-8 rounded-lg cursor-pointer transition-all duration-300 z-[999] bg-[var(--bg-secondary)] hover:bg-[var(--hover-bg)]"
        @click="clickToggleSideBar" v-if="app.isSmallPage || !app.isSideBarVisible">
        <i-streamline-stickies-color:app-window class="text-lg" />
      </div>
    </div>
    <div class="right flex ml-2.5 items-center gap-2.5">
      <slot></slot>
      <ThemeToggle />
      <div class="balance text-sm flex items-center justify-center h-8 px-2 rounded-lg cursor-pointer transition-all duration-300 bg-[var(--bg-secondary)] text-[var(--text-primary)] select-none hover:bg-[var(--hover-bg)]">
        <i-streamline-stickies-color:pile-of-money class="text-lg" />
        <span class="balance-value">￥{{ app.balanceInfo.total_balance }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
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
