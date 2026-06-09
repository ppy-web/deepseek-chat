import dayjs from "dayjs";
import storage from "./storage";
import validator from "./validator";
import { Timer } from "./timer";

/**
 * 判断值是否为空
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) {
    return true;
  }
  if (typeof value === "string" && value.trim() === "") {
    return true;
  }
  if (Array.isArray(value) && value.length === 0) {
    return true;
  }
  if (typeof value === "object" && !Array.isArray(value)) {
    return Object.keys(value as object).length === 0;
  }
  return false;
}

/**
 * 首字母大写
 */
export function firstUpperCase(value: string): string {
  return value.replace(/\b(\w)(\w*)/g, function ($0, $1, $2) {
    return $1.toUpperCase() + $2;
  });
}

/**
 * 文件扩展名
 */
export function extname(path: string): string {
  return path.substring(path.lastIndexOf(".") + 1).split(/(\?|&)/)[0];
}

/**
 * 路径名称
 */
export function basename(path: string): string {
  let index = path.lastIndexOf("/");
  index = index > -1 ? index : path.lastIndexOf("\\");
  if (index < 0) {
    return path;
  }
  return path.substring(index + 1);
}

/**
 * 横杠转驼峰
 */
export function toCamel(str: string): string {
  return str.replace(/([^-])(?:-+([^-]))/g, function ($0, $1, $2) {
    return $1 + $2.toUpperCase();
  });
}

/**
 * 浏览器信息
 */
export interface BrowserInfo {
  height: number;
  width: number;
  type: string;
  plat: string;
  tag: string;
  prefix: string;
  isMobile: boolean;
  isIos: boolean;
  isAndroid: boolean;
  isPC: boolean;
  isMini: boolean;
  screen: string;
}

export function getBrowser(): BrowserInfo {
  const { clientHeight, clientWidth } = document.documentElement;
  const ua = navigator.userAgent.toLowerCase();

  let type = (ua.match(/firefox|chrome|safari|opera/g) || ["other"])[0];
  if ((ua.match(/msie|trident/g) || [])[0]) {
    type = "msie";
  }

  let tag = "";
  const isTouch =
    "ontouchstart" in window ||
    ua.indexOf("touch") !== -1 ||
    ua.indexOf("mobile") !== -1;
  if (isTouch) {
    if (ua.indexOf("ipad") !== -1) {
      tag = "pad";
    } else if (ua.indexOf("mobile") !== -1) {
      tag = "mobile";
    } else if (ua.indexOf("android") !== -1) {
      tag = "androidPad";
    } else {
      tag = "pc";
    }
  } else {
    tag = "pc";
  }

  let prefix = "";
  switch (type) {
    case "chrome":
    case "safari":
    case "mobile":
      prefix = "webkit";
      break;
    case "msie":
      prefix = "ms";
      break;
    case "firefox":
      prefix = "Moz";
      break;
    case "opera":
      prefix = "O";
      break;
    default:
      prefix = "webkit";
      break;
  }

  const plat =
    ua.indexOf("android") > 0 ? "android" : navigator.platform.toLowerCase();

  let screen = "full";
  if (clientWidth < 768) {
    screen = "xs";
  } else if (clientWidth < 992) {
    screen = "sm";
  } else if (clientWidth < 1200) {
    screen = "md";
  } else if (clientWidth < 1920) {
    screen = "xl";
  } else {
    screen = "full";
  }

  const isIos = !!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
  const isAndroid = plat === "android";
  const isPC = tag === "pc";
  const isMobile = !isPC;
  const isMini = screen === "xs" || isMobile;

  return {
    height: clientHeight,
    width: clientWidth,
    type,
    plat,
    tag,
    prefix,
    isMobile,
    isIos,
    isAndroid,
    isPC,
    isMini,
    screen,
  };
}

/**
 * 是否Promise
 */
export function isPromise(val: unknown): val is Promise<unknown> {
  return !!val && Object.prototype.toString.call(val) === "[object Promise]";
}

/**
 * 单位转换
 */
export function parsePx(val: number | string): string {
  return typeof val === "number" ? `${val}px` : val;
}

/**
 * 延迟
 */
export function sleep(duration: number): Promise<boolean> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, duration);
  });
}

/**
 * 日期格式化
 */
export function formatDate(date: string | number | Date, format?: string): string {
  return dayjs(date).format(format || "YYYY-MM-DD");
}

/**
 * 日期分类
 */
export function getDayjsCategory(createTime: number): string {
  const date = dayjs(createTime);
  const today = dayjs().startOf("day");
  const yesterday = dayjs().subtract(1, "day").startOf("day");
  const oneWeekAgo = dayjs().subtract(1, "week").startOf("day");
  const oneMonthAgo = dayjs().subtract(1, "month").startOf("day");

  if (date.isAfter(today)) {
    return "今天";
  } else if (date.isAfter(yesterday)) {
    return "昨天";
  } else if (date.isAfter(oneWeekAgo)) {
    return "近一周";
  } else if (date.isAfter(oneMonthAgo)) {
    return "近一个月";
  } else {
    const monthName = date.format("M月");
    const year = date.year();
    const currentYear = dayjs().year();
    return monthName + (year === currentYear ? "" : ` ${year}`);
  }
}

/**
 * 滚动到底部
 */
export function scrollTop(el: HTMLElement, duration: number = 20): void {
  let currentScrollTop = el.scrollTop;
  const height = Math.floor(el.clientHeight);
  const desScrollTop = el.scrollHeight - height;
  const delta = Math.ceil(desScrollTop - currentScrollTop);

  function scroll() {
    currentScrollTop = currentScrollTop + delta / (duration / 20);
    el.scrollTop = currentScrollTop;
    if (currentScrollTop < desScrollTop) {
      requestAnimationFrame(scroll);
    }
  }
  scroll();
}

/**
 * 复制文本到剪贴板
 */
export const copyToClipboard = (
  content: HTMLElement | string,
  options: { successMessage?: string; errorMessage?: string } = {}
): Promise<{ success: boolean; message: string }> => {
  return new Promise((resolve) => {
    const { successMessage = "已复制到剪贴板", errorMessage = "复制失败" } =
      options;

    let text = "";
    if (content instanceof HTMLElement) {
      text = content.textContent || content.innerText;
    } else if (typeof content === "string") {
      text = content;
    } else {
      resolve({ success: false, message: "无效的内容类型" });
      return;
    }

    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.width = "0";
    textarea.style.left = "-999px";
    textarea.style.top = "10px";
    textarea.style.position = "fixed";
    textarea.setAttribute("readonly", "readonly");
    document.body.appendChild(textarea);
    textarea.select();

    try {
      const successful = document.execCommand("copy");
      resolve({
        success: successful,
        message: successful ? successMessage : errorMessage,
      });
    } catch (err) {
      resolve({ success: false, message: errorMessage });
    } finally {
      document.body.removeChild(textarea);
    }
  });
};

/**
 * 现代浏览器使用的 Clipboard API 方法
 */
export const copyWithClipboardAPI = async (
  text: string
): Promise<{ success: boolean; message: string }> => {
  try {
    await navigator.clipboard.writeText(text);
    return { success: true, message: "已复制到剪贴板" };
  } catch (err) {
    return { success: false, message: "复制失败" };
  }
};

/**
 * 自动选择最佳复制方法
 */
export const smartCopy = async (
  content: HTMLElement | string,
  options: Record<string, unknown> = {}
): Promise<{ success: boolean; message: string }> => {
  if (typeof content === "string" && navigator.clipboard) {
    return copyWithClipboardAPI(content);
  }
  return copyToClipboard(content, options);
};

export { storage };
export { validator };
export { Timer };
