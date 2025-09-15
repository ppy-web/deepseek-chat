/**
 * 浏览器信息和屏幕尺寸监听工具
 * 提供浏览器环境信息获取和屏幕尺寸变化监听功能
 */
import { useEventListener } from "@vueuse/core";
import { reactive, watch } from "vue";
import { getBrowser } from "../utils";

/**
 * 响应式浏览器信息对象
 * 包含浏览器类型、版本、屏幕尺寸等信息
 * @type {Object}
 */
const browser = reactive(getBrowser());

/**
 * 屏幕变化事件监听器数组
 * 存储所有注册的屏幕尺寸变化回调函数
 * @type {Function[]}
 */
const events = [];

/**
 * 监听浏览器屏幕尺寸变化
 * 当屏幕尺寸变化时，触发所有已注册的回调函数
 */
watch(
  () => browser.width,
  () => {
    events.forEach((ev) => ev());
  }
);

/**
 * 注册窗口resize事件监听器
 * 当窗口大小变化时，更新浏览器信息对象
 */
useEventListener(window, "resize", () => {
  Object.assign(browser, getBrowser());
});

/**
 * 浏览器信息和屏幕监听工具函数
 * @returns {Object} 包含浏览器信息和事件注册方法的对象
 * @property {Object} browser - 响应式浏览器信息对象
 * @property {Function} onScreenChange - 注册屏幕尺寸变化事件的回调函数
 */
export function useBrowser() {
  return {
    browser,
    /**
     * 注册屏幕尺寸变化事件回调
     * @param {Function} ev - 屏幕尺寸变化时触发的回调函数
     * @param {boolean} [immediate=true] - 是否立即执行一次回调
     */
    onScreenChange(ev, immediate = true) {
      events.push(ev);

      if (immediate) {
        ev();
      }
    },
  };
}
