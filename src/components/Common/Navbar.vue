<!-- 预留的操作栏，目前只有语音开关功能 -->
<template>
  <div class="navbar-container">
    <div class="left">
      <div class="navbar-sidebar-toggle" @click="clickToggleSideBar"
        v-if="app.isSmallPage || !app.isSideBarVisible">
        <i-streamline-stickies-color:app-window class="sidebar-toggle-icon" />
      </div>
    </div>
    <div class="right">
      <slot></slot>
      <ThemeToggle />
      <div class="balance">
        <i-streamline-stickies-color:pile-of-money class="balance-icon" />
        <span class="balance-value">￥{{ app.balanceInfo.total_balance }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAppStore } from "@/store";
import ThemeToggle from "./ThemeToggle.vue";

const app = useAppStore();
const clickToggleSideBar = () => {
  if (app.isSmallPage) {
    app.set({
      isSideBarVisible: true,
      isSidebarFixed: true,
      needTransition: false,
    });
  }
  app.set({
    isSideBarVisible: true,
  });
};

</script>

<style lang="scss" scoped>
.navbar-container {
  display: flex;
  align-items: center;
  height: 48px;
  line-height: 48px;
  width: inherit;
  box-shadow:  0 1px 2px 0 rgba(0, 0, 0, 0.05);
  margin-bottom: auto;
  padding: 0 16px;
  .navbar-sidebar-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    z-index: 999;
    background-color: var(--bg-secondary);
    .sidebar-toggle-icon {
      font-size: 18px;
    }
    &:hover {
      background-color: var(--hover-bg);
    }
  }

  .left {
    flex: 1;
    font-weight: 700;
    font-size: 24px;
    color: var(--text-primary);
  }

  .right {
    display: flex;
    margin-left: 10px;
    align-items: center;
    gap: 10px;

    .balance {
      font-size: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 32px;
      padding-left: 8px;
      padding-right: 8px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      background-color: var(--bg-secondary);
      color: var(--text-primary);
      user-select: none;

      &:hover {
        background-color: var(--hover-bg);
      }

      .balance-icon {
        font-size: 18px;
      }

    }
  }
}
</style>
