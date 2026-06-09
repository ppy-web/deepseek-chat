<!-- 用于统一修改弹窗标题和关闭按钮 -->
<script setup lang="ts">
const emit = defineEmits(["close"]);

withDefaults(defineProps<{
  title?: string;
  showClose?: boolean;
  fontSize?: string;
  icon?: string;
}>(), {
  title: "提示",
  showClose: true,
  fontSize: "18px",
  icon: "",
});
</script>

<template>
  <div class="header-container w-full flex items-center justify-between mb-2.5">
    <div class="hot-header-l flex items-center">
      <img v-if="icon" :src="icon" class="w-5 h-5 mr-1.5" />
      <span class="title font-bold text-[var(--text-primary)]" :style="`font-size:${fontSize};`">{{ title }}</span>
    </div>
    <div class="hot-header-r" v-if="showClose">
      <span class="close inline-block w-10 h-10 leading-10 text-center rounded-lg cursor-pointer hover:bg-gray-100"
        @click="emit('close')">×</span>
    </div>
  </div>
</template>
