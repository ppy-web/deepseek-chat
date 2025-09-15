/**
 * isSideBarVisible: 侧边栏是否可见
 * isSmallPage: 是否是小页面(宽度小于768)
 * isNewDialog: 是否为新对话
 * isSidebarFixed: 侧边栏是否是固定
 * needTransition: 主区域是否需要过渡动画
 * voicePlayFlag： // 1 默认静音 2 默认打开 3 不展示声音按钮且静音
 * muted: 麦克风是否静音   默认静音
 * voiceRecordIsOpen： 录音设备是否开启
 * voiceRecordOpenType: 录音打开的类型 1：电话模式打开   2：输入框里面的语音识别打开
 * localModelIndex: 本地可选模型索引
 * networkStatus:  联网搜索
 * showInterruptBtn: 输入框是否展示中断按钮
 * isPlayMp3:  是否正在播放mp3
 * isPlayStream:  是否正在播放流
 * hasInitStreamPlayer: 是否初始化流媒体播放器
 * isPageHide:  页面是否隐藏
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
    sessionId: insistance?.sessionId || "",
    isSideBarVisible: true,
    isSmallPage: false,
    isSidebarFixed: false,
    isNewDialog: true,
    needTransition: true,
    voicePlayFlag: 1,
    muted: null,
    voiceRecordIsOpen: false,
    voiceRecordOpenType: 0,
    showInterruptBtn: false,
    localModelIndex: insistance?.localModelIndex || 0,
    networkStatus: insistance?.networkStatus || false,
    isPlayMp3: false,
    isPlayStream: false,
    hasInitStreamPlayer: false,
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
