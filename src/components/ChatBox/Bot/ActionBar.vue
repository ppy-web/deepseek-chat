<!-- 操作栏 -->
<template>
  <div class="action-container mt-2.5">
    <div class="action-list flex items-center gap-2.5">
      <div class="action-item cursor-pointer text-lg" :class="{ 'animate-bounce-once': isClickCopy }" @click="onHandleCopy">
        <div class="tooltip-wrapper">
          <i-lucide:copy />
          <span class="tooltip-text">复制</span>
        </div>
      </div>
      <div class="action-item cursor-pointer text-lg" :class="{ 'animate-bounce-once': isClickLike }" @click="onHandleLike">
        <div class="tooltip-wrapper">
          <i-lucide:heart />
          <span class="tooltip-text">喜欢</span>
        </div>
      </div>
      <div class="action-item cursor-pointer text-lg" :class="{ 'animate-bounce-once': isClickUnLike }" @click="onHandleTread">
        <div class="tooltip-wrapper">
          <i-lucide:heart-crack />
          <span class="tooltip-text">不喜欢</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { smartCopy } from "@/utils";
import message from "@/hooks/useMsg";

const emit = defineEmits(["like", "unlike"]);

const props = defineProps<{
  content: string;
  status?: string;
}>();

const isClickCopy = ref(false);
const isClickLike = ref(false);
const isClickUnLike = ref(false);

const onHandleCopy = async () => {
  isClickCopy.value = true;
  setTimeout(() => {
    isClickCopy.value = false;
  }, 1000);
  const result = await smartCopy(props.content);
  result.success && message.success("复制成功");
};

const onHandleLike = () => {
  isClickLike.value = true;
  emit("like");
  setTimeout(() => {
    isClickLike.value = false;
  }, 1000);
};

const onHandleTread = () => {
  isClickUnLike.value = true;
  setTimeout(() => {
    isClickUnLike.value = false;
  }, 1000);
};
</script>

<style scoped>
@keyframes bounceOnce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.3); }
}

.animate-bounce-once {
  animation: bounceOnce 0.5s ease;
}

.tooltip-wrapper {
  position: relative;
  display: inline-flex;
}

.tooltip-text {
  visibility: hidden;
  opacity: 0;
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  padding: 4px 8px;
  border-radius: 4px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 12px;
  white-space: nowrap;
  transition: opacity 0.2s;
  pointer-events: none;
  margin-bottom: 4px;
}

.tooltip-wrapper:hover .tooltip-text {
  visibility: visible;
  opacity: 1;
}
</style>
