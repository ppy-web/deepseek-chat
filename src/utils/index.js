import { isArray, isNumber, isString, orderBy } from "lodash-es";
import { resolveComponent } from "vue";
import { Timer } from "./timer.js";

import dayjs from "dayjs";
import storage from "./storage";
import validator from "./validator";
/**
 * 判断值是否为空
 * @param {*} value - 要检查的值
 * @returns {boolean} - 如果值为空返回true，否则返回false
 */
export function isEmpty(value) {
  // 检查null或undefined
  if (value === null || value === undefined) {
    return true;
  }

  // 检查空字符串
  if (typeof value === "string" && value.trim() === "") {
    return true;
  }

  // 检查数组是否为空
  if (Array.isArray(value) && value.length === 0) {
    return true;
  }

  // 检查对象是否为空
  if (typeof value === "object" && !Array.isArray(value)) {
    return Object.keys(value).length === 0;
  }

  // 其他情况视为非空
  return false;
}

// 首字母大写
export function firstUpperCase(value) {
  return value.replace(/\b(\w)(\w*)/g, function ($0, $1, $2) {
    return $1.toUpperCase() + $2;
  });
}

// 获取方法名
export function getNames(value) {
  return Object.getOwnPropertyNames(value.constructor.prototype);
}

// 路径名称
export function basename(path) {
  let index = path.lastIndexOf("/");
  index = index > -1 ? index : path.lastIndexOf("\\");
  if (index < 0) {
    return path;
  }
  return path.substring(index + 1);
}

// 文件扩展名
export function extname(path) {
  return path.substring(path.lastIndexOf(".") + 1).split(/(\?|&)/)[0];
}

// 横杠转驼峰
export function toCamel(str) {
  return str.replace(/([^-])(?:-+([^-]))/g, function ($0, $1, $2) {
    return $1 + $2.toUpperCase();
  });
}

// uuid
export function uuid(separator = "-") {
  const s = [];
  const hexDigits = "0123456789abcdef";
  for (let i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
  }
  s[14] = "4";
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);
  s[8] = s[13] = s[18] = s[23] = separator;

  return s.join("");
}

// 浏览器信息
export function getBrowser() {
  const { clientHeight, clientWidth } = document.documentElement;

  // 浏览器信息
  const ua = navigator.userAgent.toLowerCase();

  // 浏览器类型
  let type = (ua.match(/firefox|chrome|safari|opera/g) || "other")[0];

  if ((ua.match(/msie|trident/g) || [])[0]) {
    type = "msie";
  }

  // 平台标签
  let tag = "";

  const isTocuh =
    "ontouchstart" in window ||
    ua.indexOf("touch") !== -1 ||
    ua.indexOf("mobile") !== -1;
  if (isTocuh) {
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

  // 浏览器内核
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

  // 操作平台
  const plat =
    ua.indexOf("android") > 0 ? "android" : navigator.platform.toLowerCase();

  // 屏幕信息
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

  // 是否 ios
  const isIos = !!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);

  // 是否安卓
  const isAndroid = plat === "android";

  // 是否 PC 端
  const isPC = tag === "pc";

  // 是否移动端
  const isMobile = isPC ? false : true;

  // 是否移动端 + 屏幕宽过小
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

// 路径转数组
export function deepPaths(paths, splitor) {
  const list = [];

  paths.forEach((e) => {
    const arr = e.split(splitor || "/").filter(Boolean);

    let c = list;

    arr.forEach((a, i) => {
      let d = c.find((e) => e.label == a);

      if (!d) {
        d = {
          label: a,
          value: a,
          children: arr[i + 1] ? [] : null,
        };

        c.push(d);
      }

      if (d.children) {
        c = d.children;
      }
    });
  });

  return list;
}

// 列表转树形
export function deepTree(list, sort) {
  const newList = [];
  const map = {};

  orderBy(list, "orderNum", sort)
    .map((e) => {
      map[e.id] = e;
      return e;
    })
    .forEach((e) => {
      const parent = map[e.parentId];

      if (parent) {
        (parent.children || (parent.children = [])).push(e);
      } else {
        newList.push(e);
      }
    });

  return newList;
}

// 树形转列表
export function revDeepTree(list) {
  const arr = [];
  let id = 0;

  function deep(list, parentId) {
    list.forEach((e) => {
      if (!e.id) {
        e.id = ++id;
      }

      if (!e.parentId) {
        e.parentId = parentId;
      }

      arr.push(e);

      if (e.children && isArray(e.children) && e.id) {
        deep(e.children, e.id);
      }
    });
  }

  deep(list || [], 0);

  return arr;
}

// 路径转对象
export function path2Obj(list) {
  const data = {};

  list.forEach(({ path, value }) => {
    if (path) {
      const arr = path.split("/");
      const parents = arr.slice(0, arr.length - 1);
      const name = basename(path).replace(".ts", "");

      let curr = data;

      parents.forEach((k) => {
        if (!curr[k]) {
          curr[k] = {};
        }

        curr = curr[k];
      });

      curr[name] = value;
    }
  });

  return data;
}

// 是否是组件
export function isComponent(name) {
  return !isString(resolveComponent(name));
}

// 是否Promise
export function isPromise(val) {
  return val && Object.prototype.toString.call(val) === "[object Promise]";
}

// 单位转换
export function parsePx(val) {
  return isNumber(val) ? `${val}px` : val;
}

// 延迟
export function sleep(duration) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, duration);
  });
}

// 日期分类
export function getDayjsCategory(createTime) {
  // 创建一个dayjs日期对象
  const date = dayjs(createTime);
  // 创建各种比较时间点
  const today = dayjs().startOf("day"); // 今天零点
  const yesterday = dayjs().subtract(1, "day").startOf("day"); // 昨天零点
  const oneWeekAgo = dayjs().subtract(1, "week").startOf("day"); // 一周前零点
  const oneMonthAgo = dayjs().subtract(1, "month").startOf("day"); // 一月前零点
  if (date.isAfter(today)) {
    return "今天";
  } else if (date.isAfter(yesterday)) {
    return "昨天";
  } else if (date.isAfter(oneWeekAgo)) {
    return "近一周";
  } else if (date.isAfter(oneMonthAgo)) {
    return "近一个月";
  } else {
    const monthName = date.format("M月"); // 获取月份全名
    const year = date.year();
    const currentYear = dayjs().year();
    return monthName + (year === currentYear ? "" : ` ${year}`);
  }
}

// 解码html实体  和 escapeHTML 函数相反
export function decodeHTML(str) {
  const elem = document.createElement("textarea");
  elem.innerHTML = str;
  return elem.textContent;
}

// 移除图片标签
export function removeImageTags(htmlString, str) {
  // 使用正则表达式匹配<img>标签并替换为空字符串
  return htmlString.replace(/<img[^>]*>/g, str || "");
}

// 滚动到顶部
export function scrollTop(el, duration = 20) {
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

// 16进制字符串转对象URL
export function toObjectURL(byteString) {
  const arrayBuffer = hexStringToByteArray(byteString);
  const mp3Blob = new Blob([arrayBuffer], { type: "audio/mpeg" });
  const src = URL.createObjectURL(mp3Blob);
  return src;
}

// 16进制转字节数组
export function hexStringToByteArray(hexString) {
  if (!hexString) return;
  const byteArray = [];
  for (let i = 0; i < hexString.length; i += 2) {
    byteArray.push(parseInt(hexString.substring(i, i + 2), 16));
  }
  return byteArray;
}

// 解析地址栏url
export function parseURL(url) {
  const reg = /^([a-zA-z]+):\/\/((?:[\w-]+\.)+[\w]+)(\/?.*)(\?.+)?(#.+)?$/gi;
  if (reg.test(url)) {
    const a = document.createElement("a");
    a.href = url;
    return {
      href: url,
      protocol: a.protocol,
      host: a.hostname,
      port: a.port,
      search: a.search,
      hash: a.hash,
      path: a.pathname,
    };
  } else {
    throw new Error("invalid url");
  }
}

// 获取地址栏参数
export function getUrlParam(name) {
  const reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
  const r = window.location.search.substr(1).match(reg);
  if (r != null) return decodeURIComponent(r[2]);
  return null;
}

// 获取url参数
export function getUrlSearchObj(url, key) {
  let urlObj;
  try {
    urlObj = parseURL(url);
  } catch (e) {
    return e.message;
  }
  const query = urlObj.search.substring(1);
  const attr = {};
  let match;
  const pl = /\+/g;
  const search = /([^&=]+)=?([^&]*)/g;
  const decode = (s) => {
    return decodeURIComponent(s.replace(pl, " "));
  };
  while ((match = search.exec(query))) {
    attr[decode(match[1])] = decode(match[2]);
  }

  if (key) {
    return attr[key] || "";
  } else {
    return attr;
  }
}

// 添加token到url
export function addTokenToUrl(url, putTokenKey, getTokenKey) {
  const token = getUrlParam(getTokenKey);
  let urlObj;
  try {
    urlObj = parseURL(url);
  } catch (e) {
    return e.message;
  }
  const hash = urlObj.hash;
  const protocol = urlObj.protocol;
  const host = urlObj.host;
  const port = urlObj.port;
  let search = urlObj.search;
  const path = urlObj.path;
  if (search) {
    search = `${search}&${putTokenKey}=${token}`;
  } else {
    search = `?${putTokenKey}=${token}`;
  }
  return `${protocol}//${host}${port ? `:${port}` : ""}${path}${search}${hash}`;
}

// 判断是否是图片
export function isImg(src) {
  const exts = ["png", "jpg", "bmp", "webp", "gif"];
  return exts.indexOf(extname(src).toLowerCase()) !== -1;
}

// 获取queto所有img的src
export function getAllSrc(htmlString) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, "text/html");
  const imgElements = doc.querySelectorAll("img");
  const imgList = Array.from(imgElements).map((img) => {
    return img.src;
  });
  return imgList.filter((src) => {
    return isImg(src);
  });
}

// 统一跳转http链接
export function jumpHttp(url) {
  window.open(url, "_blank", "noopener,noreferrer");
}

/**
 * 格式化并验证URL
 * @param {string} url - 要处理的URL
 * @param {Object} [params] - 查询参数
 * @returns {string|false} 格式化后的URL或false(无效时)
 */
export const formatExternalUrl = (url, params = {}) => {
  try {
    // 处理无协议的情况
    if (!url.match(/^https?:\/\//i)) {
      url = "https://" + url;
    }
    const urlObj = new URL(url);
    // 添加查询参数
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        urlObj.searchParams.append(key, String(value));
      }
    });
    // 安全协议检查
    if (!["http:", "https:"].includes(urlObj.protocol)) {
      console.warn("不安全的URL协议:", urlObj.protocol);
      // return false
    }
    return urlObj.toString();
  } catch (error) {
    console.error("URL格式化失败:", error);
    return false;
  }
};

/**
 * 复制文本到剪贴板
 * @param {HTMLElement|string} content - 要复制的DOM元素或字符串
 * @param {object} [options] - 配置选项
 * @param {string} [options.successMessage] - 成功提示
 * @param {string} [options.errorMessage] - 失败提示
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const copyToClipboard = (content, options = {}) => {
  return new Promise((resolve) => {
    const { successMessage = "已复制到剪贴板", errorMessage = "复制失败" } =
      options;

    let text = "";

    // 如果是DOM元素，获取其文本内容
    if (content instanceof HTMLElement) {
      text = content.textContent || content.innerText;
    } else if (typeof content === "string") {
      text = content;
    } else {
      const result = {
        success: false,
        message: "无效的内容类型",
      };
      resolve(result);
      return;
    }

    // 创建临时textarea元素（更好的兼容性）
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.width = 0;
    textarea.style.left = "-999px";
    textarea.style.top = "10px";
    textarea.style.position = "fixed"; // 避免滚动到底部
    textarea.setAttribute("readonly", "readonly");
    document.body.appendChild(textarea);
    textarea.select();

    try {
      const successful = document.execCommand("copy");
      const result = {
        success: successful,
        message: successful ? successMessage : errorMessage,
      };
      resolve(result);
    } catch (err) {
      const result = {
        success: false,
        message: errorMessage,
        error: err,
      };
      resolve(result);
    } finally {
      document.body.removeChild(textarea);
    }
  });
};

/**
 * 现代浏览器使用的Clipboard API方法
 * @param {string} text - 要复制的文本
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const copyWithClipboardAPI = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return { success: true, message: "已复制到剪贴板" };
  } catch (err) {
    return { success: false, message: "复制失败", error: err };
  }
};

/**
 * 自动选择最佳复制方法
 * @param {HTMLElement|string} content
 * @param {object} [options]
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const smartCopy = async (content, options = {}) => {
  // 如果是字符串或现代浏览器，优先使用Clipboard API
  if (typeof content === "string" && navigator.clipboard) {
    return copyWithClipboardAPI(content, options);
  }
  // 否则使用兼容性方法
  return copyToClipboard(content, options);
};

/**
 * 下载excel
 * @param {blob} fileArrayBuffer 文件流
 * @param {String} filename 文件名称
 */
export function downloadXls(fileArrayBuffer, filename) {
  let data = new Blob([fileArrayBuffer], {
    type: "application/vnd.ms-excel,charset=utf-8",
  });
  if (typeof window.chrome !== "undefined") {
    // Chrome
    var link = document.createElement("a");
    link.href = window.URL.createObjectURL(data);
    link.download = filename;
    link.click();
  } else if (typeof window.navigator.msSaveBlob !== "undefined") {
    // IE
    var blob = new Blob([data], { type: "application/force-download" });
    window.navigator.msSaveBlob(blob, filename);
  } else {
    // Firefox
    var file = new File([data], filename, {
      type: "application/force-download",
    });
    window.open(URL.createObjectURL(file));
  }
}

export { storage };
export { validator };
export { Timer };
