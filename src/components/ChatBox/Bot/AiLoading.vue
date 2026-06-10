<!-- 用于展示AI头像和思考中状态 -->
<template>
  <div class="AI flex flex-row items-center text-sm text-gray-700 h-full">
    <span v-if="props.pending" class="ml-2.5 text-gray-400">
      <IconLoading class="loading-icon" />
    </span>
  </div>
</template>

<script setup lang="ts">
import botDefault from "@/assets/img/manman.png";
import { IconLoading } from "@/icons";

const props = withDefaults(defineProps<{
  pending?: boolean;
}>(), {
  pending: false,
});
</script>

<style scoped>
.loading-icon {
  width: 20px;
  height: 20px;
  animation: icon-spin 1s linear infinite;
}

@keyframes icon-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
