/**
 * 浏览器信息和屏幕尺寸监听工具
 */
import { useEventListener } from "@vueuse/core";
import { reactive, watch } from "vue";
import { getBrowser, type BrowserInfo } from "../utils";

const browser = reactive<BrowserInfo>(getBrowser());

const events: Array<() => void> = [];

watch(
  () => browser.width,
  () => {
    events.forEach((ev) => ev());
  }
);

useEventListener(window, "resize", () => {
  Object.assign(browser, getBrowser());
});

export function useBrowser() {
  return {
    browser,
    onScreenChange(ev: () => void, immediate: boolean = true): void {
      events.push(ev);
      if (immediate) {
        ev();
      }
    },
  };
}
