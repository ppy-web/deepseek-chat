<template>
  <el-container class="app-container" :class="{
    'small-page': app.isSmallPage,
    'hide-sidebar': !app.isSideBarVisible,
    'sidebar-fixed': app.isSidebarFixed,
  }">
    <SideBar class="sidebar-area" />
    <MainContent class="main-area" :need-transition="true">
      <router-view v-slot="{ Component, route }">
        <keep-alive>
          <component :is="Component" :key="route.path" v-if="route.meta.keepAlive" />
        </keep-alive>
        <component :is="Component" v-if="!route.meta.keepAlive" />
      </router-view>
    </MainContent>
  </el-container>
</template>

<script setup>
import { onMounted } from "vue";
import { useBrowser } from "@/hooks/useBrowser.js";
import { useAppStore } from "@/store";
import { NARROW_SCREEN_WIDTH } from "@/constants/index";

import SideBar from "@/views/SideBar/Index.vue";
import MainContent from "@/views/MainContent.vue";
import * as service from "@/service/api";

const app = useAppStore();
const { browser, onScreenChange } = useBrowser();
// 获取初始化配置
const getInitParam = async () => {
  const { is_available, balance_infos } = await service.getUserBalance();
  const data = await service.getModels();
  console.log('modeldata', data);
  app.set({
    isAvailable: is_available,
    balanceInfo: balance_infos[0],
  });
};

onMounted(() => {
  getInitParam();
  onScreenChange(() => {
    app.set({
      isSmallPage: browser.width < NARROW_SCREEN_WIDTH,
    });
    if (document.querySelector(".chat-box .chat-component")) {
      if (browser.width - 300 < 960) {
        document.querySelector(".chat-box .chat-component").style.padding =
          "0 16px";
        document.querySelector(".chat-box .input-container").style.padding =
          "0 16px";
      } else {
        let p = (browser.width - 300 - 960) / 2;
        document.querySelector(
          ".chat-box .chat-component"
        ).style.padding = `0px ${p}px`;
        document.querySelector(
          ".chat-box .input-container"
        ).style.padding = `0px ${p}px`;
      }
      if (document.getElementById("network-text")) {
        document.getElementById("network-text").style.display =
          browser.width < 430 ? "none" : "block";
      }
    }
  });
});
</script>

<style lang="scss">
:root {
  --sidebar-width: 300px;
}

.app-container {
  width: 100vw;
  height: 100vh;
}

.sidebar-area {
  width: var(--sidebar-width);
  height: 100vh;
  background: #f4f5f6;
  padding: 30px 12px 24px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  opacity: 1;
  z-index: 100;
  transform: translateX(0);
  transition: transform 0.3s cubic-bezier(0.38, 0, 0.24, 1),
    opacity 0.3s cubic-bezier(0.38, 0, 0.24, 1),
    -webkit-transform 0.3s cubic-bezier(0.38, 0, 0.24, 1);
}

.main-area {
  margin: 0 0 0 0;
  transition: margin 0.3s cubic-bezier(0.7, 0.3, 0.1, 1);
}

.small-page {
  .sidebar-area {
    opacity: 0;
    transform: translateX(-100%);
  }

  .main-area {
    margin: 0 0 0 calc(-1 * var(--sidebar-width));
    transition: none;
  }
}

.hide-sidebar {
  .sidebar-area {
    transform: translateX(-100%);
  }

  .main-area {
    margin: 0 0 0 calc(-1 * var(--sidebar-width));
  }
}

.sidebar-fixed {
  .sidebar-area {
    position: absolute;
    z-index: 1500;
    opacity: 1;
    transform: translateX(0);
    border-radius: 0 10px 10px 0;
    box-shadow: 12px 12px 36px 0px rgba(0, 0, 0, 0.15);
  }

  .main-area {
    margin: 0 0 0 0;
  }
}

.need-transition {
  transition: margin 0.3s cubic-bezier(0.7, 0.3, 0.1, 1) !important;
}

.hide-sidebar.sidebar-fixed {
  .sidebar-area {
    opacity: 0;
    transform: translateX(-100%);
  }
}
</style>
