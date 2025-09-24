<template>
  <el-container
    class="app-container"
    :class="{
      'small-page': isSmallPage,
      'hide-sidebar': !isSideBarVisible,
      'sidebar-fixed': isSidebarFixed,
    }"
  >
    <SideBar class="sidebar-area" />
    <MainContent class="main-area" :need-transition="needTransition">
      <router-view v-slot="{ Component, route }">
        <keep-alive>
          <component
            :is="Component"
            :key="route.path"
            v-if="route.meta.keepAlive"
          />
        </keep-alive>
        <component :is="Component" v-if="!route.meta.keepAlive" />
      </router-view>
    </MainContent>
  </el-container>
</template>

<script setup>
import { onMounted, onUnmounted, computed } from "vue";

import SideBar from "@/views/SideBar/Index.vue";
import MainContent from "@/views/MainContent.vue";
import { useBrowser } from "@/hooks/useBrowser.js";
import { useStore } from "@/hooks/useStore";
import { useMitt } from "@/hooks/useMitt.js";
import { useRouter } from "vue-router";

import {
  NARROW_SCREEN_WIDTH,
} from "@/constants/index";
import EVENT_TYPE from "@/constants/event_type";

import * as service from "@/service/api";

const router = useRouter();
const { user, app, config } = useStore();
const { browser, onScreenChange } = useBrowser();
const mitt = useMitt();
// 是否初始化流式播放器
const hasInitStreamPlayer = computed(() => app.info.hasInitStreamPlayer);
// 是否展示侧边栏
const isSideBarVisible = computed(() => app.info.isSideBarVisible);
// 屏幕宽度是否小于NARROW_SCREEN_WIDTH
const isSmallPage = computed(() => app.info.isSmallPage);
// 是否是fixed定位Siderbar
const isSidebarFixed = computed(() => app.info.isSidebarFixed);
// 主区域MainContent是否需要过渡动画
const needTransition = computed(() => app.info.needTransition);
// 获取初始化配置
const getInitParam = async (type) => {
  // document.title = "deepseek";
  const { is_available, balance_infos } = await service.getUserBalance();
  config.set({
    
  });
  app.set({
    isAvailable: is_available,
    balanceInfo: balance_infos[0],
  });
};

onMounted(() => {
  getInitParam();
  mitt.on(EVENT_TYPE.INIT_SUCCESS, () => {
    app.set({
      sessionId: "",
    });
    getInitParam();
  });
  onScreenChange(() => {
    app.set({
      isSmallPage: browser.width < NARROW_SCREEN_WIDTH,
      needTransition: true,
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

onUnmounted(() => {
  mitt.off(EVENT_TYPE.INIT_SUCCESS);
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
