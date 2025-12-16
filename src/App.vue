<template>
  <el-container class="app-container" :class="{
    'small-page': app.isSmallPage,
    'hide-sidebar': !app.isSideBarVisible,
    'sidebar-fixed': app.isSidebarFixed,
  }">
    <SideBar class="sidebar-area" :class="{ 'sidebar-light': !app.isDark }" />
    <Assistant class="main-area" :need-transition="true">
      <router-view v-slot="{ Component, route }">
        <keep-alive>
          <component :is="Component" :key="route.path" v-if="route.meta.keepAlive" />
        </keep-alive>
        <component :is="Component" v-if="!route.meta.keepAlive" />
      </router-view>
    </Assistant>
  </el-container>
</template>

<script setup>
import { onMounted, watch } from "vue";
import { useBrowser } from "@/hooks/useBrowser.js";
import { useAppStore, useCallwordStore } from "@/store";
import { NARROW_SCREEN_WIDTH } from "@/constants/index";

import SideBar from "@/views/SideBar/Index.vue";
import Assistant from "@/views/Assistant/index.vue";
import * as service from "@/service/api";

const app = useAppStore();
const callword = useCallwordStore();
window.document.title = callword.name;
const { browser, onScreenChange } = useBrowser();

// 监听主题变化，更新 HTML 根元素的类名
watch(() => app.theme, (newTheme) => {
  if (newTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}, { immediate: true });
// 获取初始化配置
const getInitParam = async () => {
  const { is_available, balance_infos } = await service.getUserBalance();

  app.set({
    isAvailable: is_available,
    balanceInfo: balance_infos[0],
  });
};

getInitParam();
onMounted(() => {
  onScreenChange(() => {
    app.set({
      isSmallPage: browser.width < NARROW_SCREEN_WIDTH,
      isSidebarFixed: false,
      needTransition: true,
    });
    if (document.querySelector(".chat-box .chat-component")) {
      if (browser.width - 300 < 1200) {
        document.querySelector(".chat-box .chat-component").style.padding =
          "0 16px";
        document.querySelector(".chat-box .input-container").style.padding =
          "0 16px";
      } else {
        let p = (browser.width - 300 - 1200) / 2;
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
  --sidebar-width: 302px;
}

.app-container {
  width: 100vw;
  height: 100vh;

  .sidebar-light {
    display: border-box;
    border-right: 1px solid var(--border-color);
    margin-right: -1px;
    background: linear-gradient(to bottom,
        hsl(210, 15%, 92%) 0%,
        /* 天顶的淡蓝色 */
        #c1d5f0 60%,
        /* 中间过渡色 */
        #F0F8FF 100%
        /* 靠近地平线的更浅色 */
      );
  }
}

.sidebar-area {
  width: var(--sidebar-width);
  height: 100vh;
  background: var(--sidebar-bg);
  padding: 12px 12px 24px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  opacity: 1;
  z-index: 100;
  transform: translateX(0);
  transition: transform 0.3s cubic-bezier(0.38, 0, 0.24, 1),
    opacity 0.3s cubic-bezier(0.38, 0, 0.24, 1),
    background-color 0.3s ease,
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
