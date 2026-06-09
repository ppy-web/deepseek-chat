<!-- 用于展示深度思考内容 -->
<script setup lang="ts">
import { ref } from "vue";

const props = defineProps<{
  html?: string;
  finished?: boolean;
  second?: number;
}>();

const show = ref(true);
</script>

<template>
  <div class="thinking-wrap mb-2.5" v-if="html" :class="{ 'thinking-hide': !show }">
    <div class="thinking select-none w-fit text-gray-500 rounded-xl flex items-center text-sm italic cursor-pointer"
      @click="show = !show">
      <i-svg-spinners:blocks-wave v-if="!finished" width="20px" height="20px" />
      <span>{{ finished ? `思考完成 用时(${second}秒)` : "思考中" }}</span>
      <span class="arrows inline-block transition-transform duration-300" :class="{ 'rotate-0': !show, '-rotate-180': show }">
        ↓
      </span>
    </div>
    <Transition>
      <span v-if="show" class="rich-text-thinking inline-block relative pl-3 text-gray-400 text-sm leading-relaxed mt-1.5"
        style="border-left: 2px solid #e5e5e5;">
        {{ html }}
      </span>
    </Transition>
  </div>
</template>

<style scoped>
.thinking-hide .rich-text-thinking {
  display: none;
}
</style>
