<!-- 将文本分割并高亮匹配部分 -->
<template>
  <div class="highlight-container">
    <span
      v-for="(part, index) in highlightedParts"
      :key="index"
      :class="{ highlight: part.highlight }"
    >
      {{ part.text }}
    </span>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  // 原始文本内容
  content: {
    type: String,
    default: "",
  },
  // 要高亮的关键词(可以是字符串或正则表达式)
  keyword: {
    type: [String, RegExp],
    default: "",
  },
  // 是否区分大小写
  caseSensitive: {
    type: Boolean,
    default: false,
  },
  // 高亮样式类名
  highlightClass: {
    type: String,
    default: "highlight",
  },
});

// 将文本分割为高亮和非高亮部分
const highlightedParts = computed(() => {
  if (!props.keyword || !props.content) {
    return [{ text: props.content, highlight: false }];
  }

  const flags = props.caseSensitive ? "g" : "gi";
  const keywordRegex =
    typeof props.keyword === "string"
      ? new RegExp(escapeRegExp(props.keyword), flags)
      : props.keyword;

  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = keywordRegex.exec(props.content)) !== null) {
    // 添加非高亮部分
    if (match.index > lastIndex) {
      parts.push({
        text: props.content.slice(lastIndex, match.index),
        highlight: false,
      });
    }

    // 添加高亮部分
    parts.push({
      text: match[0],
      highlight: true,
    });

    lastIndex = match.index + match[0].length;

    // 如果正则表达式没有全局标志，避免无限循环
    if (!keywordRegex.global) break;
  }

  // 添加剩余的非高亮部分
  if (lastIndex < props.content.length) {
    parts.push({
      text: props.content.slice(lastIndex),
      highlight: false,
    });
  }

  return parts;
});

// 转义正则表达式特殊字符
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
</script>

<style scoped>
.highlight {
  background-color: yellow;
  color: #000;
  padding: 0 2px;
  border-radius: 2px;
}
</style>
