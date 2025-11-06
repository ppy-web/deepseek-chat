/**
 * isSideBarVisible: 侧边栏是否可见
 * isSmallPage: 是否是小页面(宽度小于768)
 * isNewDialog: 是否为新对话
 * isSidebarFixed: 侧边栏是否是固定
 * needTransition: 主区域是否需要过渡动画
 * showInterruptBtn: 输入框是否展示中断按钮
 * showWatermark: 是否展示水印
 */
import { defineStore } from "pinia";
import { reactive } from "vue";
import { merge } from "lodash-es";
import { storage } from "@/utils";

export const useAppStore = defineStore("app", function () {
  // 从本地存储中获取数据
  const insistance = storage.get("appInfo");

  const info = reactive({
    sessionId: "",
    isSideBarVisible: true,
    isSmallPage: false,
    isSidebarFixed: false,
    isNewDialog: true,
    needTransition: true,
    showInterruptBtn: false,
    localModelIndex: insistance?.localModelIndex || 0,
    networkStatus: insistance?.networkStatus || false,
    isPageHide: false,
    showWatermark: false,
  });

  function set(data) {
    merge(info, data);
    storage.set("appInfo", info);
  }

  function clear() {
    storage.remove("appInfo");
  }

  return {
    info,
    set,
    clear,
  };
});
