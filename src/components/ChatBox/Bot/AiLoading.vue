<!-- 用于展示AI头像和思考中状态 -->
<template>
  <div class="AI flex flex-row items-center text-sm text-gray-700 h-full">
    <img class="avatar self-start min-w-[50px] h-[50px] rounded-full" :src="botDefault as string" />
    <span v-if="props.pending" class="ml-2.5 text-gray-400">
      <i-svg-spinners:blocks-shuffle-3 width="20px" height="20px" />
    </span>
  </div>
</template>

<script setup lang="ts">
import botDefault from "@/assets/img/manman.png";

const props = withDefaults(defineProps<{
  pending?: boolean;
}>(), {
  pending: false,
});
</script>
