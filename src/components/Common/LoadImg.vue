<!-- 用于加载图片，失败的图片使用默认图片 -->
<template>
  <img :src="imageUrl" @error="handleImageError" :key="imgKey" :alt="altText" />
</template>

<script setup>
import { ref } from "vue";

const props = defineProps({
  src: String,
  fallback: {
    type: String,
    required: true,
  },
  alt: String,
});

const imageUrl = ref(props.src);
const altText = ref(props.alt);
const imgKey = ref(0);

const handleImageError = () => {
  // 切换到备用图片
  imageUrl.value = props.fallback;
  imgKey.value++;
  // 可以添加错误日志记录
  // console.log(`图片加载失败，切换到备用图片: ${props.src}`);
};
</script>
