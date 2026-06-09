<!-- 用于展示试着问问 推荐问题 -->
<template>
  <div class="try-container mt-2.5 mb-2.5 flex flex-col items-start">
    <div class="try-item my-1 text-sm py-2 px-3.5 rounded bg-gray-100 text-gray-600 flex items-center cursor-pointer animate-slide-in"
      v-for="(item, index) in list" :key="index" @click="emit('send', item)">
      <img class="w-5 h-3.5 mr-2" :src="turnImg as string" alt="" />
      <span v-html="item"></span>
    </div>
  </div>
</template>

<script setup lang="ts">
import turnImg from "@/assets/img/turnrightdown.png";

const emit = defineEmits(["send"]);

withDefaults(defineProps<{
  list?: string[];
}>(), {
  list: () => [],
});
</script>

<style scoped>
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.animate-slide-in {
  animation: slideIn 0.3s ease-out;
}
</style>
