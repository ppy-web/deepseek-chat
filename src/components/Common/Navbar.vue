<!-- 预留的操作栏 -->
<template>
  <div class="navbar-container flex items-center h-12 leading-12 w-full shadow-sm mb-auto px-4">
    <div class="left flex-1 font-bold text-2xl text-[var(--text-primary)]">
      <NTooltip v-if="app.isSmallPage || !app.isSideBarVisible" trigger="hover">
        <template #trigger>
          <NButton
            class="navbar-icon-button"
            quaternary
            size="small"
            aria-label="打开侧边栏"
            @click="clickToggleSideBar"
          >
            <template #icon>
              <i-streamline-stickies-color:app-window class="text-lg" />
            </template>
          </NButton>
        </template>
        打开侧边栏
      </NTooltip>
    </div>
    <div class="right flex ml-2.5 items-center gap-2.5">
      <slot></slot>
      <ThemeToggle />
      <NTooltip trigger="hover">
        <template #trigger>
          <NTag class="balance-tag" size="small" :bordered="false" round>
            <template #icon>
              <i-streamline-stickies-color:pile-of-money class="text-lg" />
            </template>
            ￥{{ balanceText }}
          </NTag>
        </template>
        账户余额
      </NTooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { NButton, NTag, NTooltip } from "naive-ui";
import { useAppStore } from "@/store";
import ThemeToggle from "./ThemeToggle.vue";

const app = useAppStore();

const balanceText = computed(() => {
  return app.balanceInfo.total_balance ?? "0";
});

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

.balance-tag {
  height: 32px;
  padding: 0 9px;
  color: var(--text-primary);
  background: var(--bg-secondary);
  cursor: default;
  user-select: none;
}

:deep(.balance-tag .n-tag__content) {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
}
</style>
