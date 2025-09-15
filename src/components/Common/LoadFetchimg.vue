<!-- 用于加载fetch图片（主要是联网搜索的网址图标），失败的图片使用默认图片 -->
<template>
  <img :src="imageSrc" :alt="altText" @error="handleImageError" />
</template>

<script setup>
import { ref, toRefs, onMounted } from "vue";

const props = defineProps({
  url: String, // 传入的图片 URL
  alt: {
    // alt 描述文本
    type: String,
    default: "",
  },
  fallback: {
    // 默认回退图片 URL
    type: String,
    default: "",
  },
});
const { url } = toRefs(props);

const altText = ref(props.alt);
const imageSrc = ref(props.fallback);
async function fetchImage() {
  try {
    const response = await fetch(props.url);
    if (!response.ok) throw new Error("请求失败");
    const blob = await response.blob(); // 获取 Blob 对象
    const objectUrl = URL.createObjectURL(blob); // 转换为本地可用的 URL
    imageSrc.value = objectUrl;
  } catch (error) {
    // console.error('获取图标失败:' + props.url, error)
    imageSrc.value = props.fallback; // 返回默认图片
  }
}

// 图片加载失败时触发
const handleImageError = (e) => {
  e.target.src = props.fallback;
  if (imageSrc.value !== props.fallback) {
    imageSrc.value = props.fallback; // 回退到默认图片
  }
};
onMounted(() => {
  fetchImage();
});
</script>
