<!-- 操作栏 -->
<template>
  <div class="action-container mt-2.5">
    <div class="action-list flex items-center gap-2.5">
      <div class="action-item cursor-pointer text-lg" :class="{ 'animate-bounce-once': isClickCopy }" @click="onHandleCopy">
        <div class="tooltip-wrapper">
          <IconCopy class="action-icon" />
          <span class="tooltip-text">复制</span>
        </div>
      </div>
      <div class="action-item cursor-pointer text-lg" :class="{ 'animate-bounce-once': isClickLike }" @click="onHandleLike">
        <div class="tooltip-wrapper">
          <IconLike class="action-icon" />
          <span class="tooltip-text">喜欢</span>
        </div>
      </div>
      <div class="action-item cursor-pointer text-lg" :class="{ 'animate-bounce-once': isClickUnLike }" @click="onHandleTread">
        <div class="tooltip-wrapper">
          <IconDislike class="action-icon" />
          <span class="tooltip-text">不喜欢</span>
        </div>
      </div>
      <button
        type="button"
        class="action-item speech-action cursor-pointer text-lg"
        :class="{ active: isReading || isSpeechConnecting || isSpeechPaused }"
        :aria-label="speechTitle"
        :title="speechTitle"
        @click="onHandleSpeech"
      >
        <div class="tooltip-wrapper">
          <span v-if="isSpeechConnecting" class="speech-loading" aria-hidden="true"></span>
          <IconPlayerPause v-else-if="isReading" class="action-icon" />
          <IconPlayerPlay v-else-if="isSpeechPaused" class="action-icon" />
          <IconVolume v-else class="action-icon" />
          <span class="tooltip-text">{{ speechTitle }}</span>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref } from "vue";
import { smartCopy } from "@/utils";
import message from "@/hooks/useMsg";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { IconCopy, IconDislike, IconLike, IconPlayerPause, IconPlayerPlay, IconVolume } from "@/icons";

const emit = defineEmits(["like", "unlike"]);

const props = defineProps<{
  content: string;
  speechId?: string;
  status?: string;
}>();

const isClickCopy = ref(false);
const isClickLike = ref(false);
const isClickUnLike = ref(false);
const {
  playbackStatus,
  currentSpeechId,
  lastError,
  speakText,
  pauseSpeech,
  resumeSpeech,
  stopSpeech,
} = useSpeechSynthesis();

const speechId = computed(() => {
  return props.speechId || props.content || "local-message";
});

const isCurrentSpeech = computed(() => currentSpeechId.value === speechId.value);
const isReading = computed(() => isCurrentSpeech.value && playbackStatus.value === "playing");
const isSpeechConnecting = computed(() => isCurrentSpeech.value && playbackStatus.value === "connecting");
const isSpeechPaused = computed(() => isCurrentSpeech.value && playbackStatus.value === "paused");
const speechTitle = computed(() => {
  if (isSpeechConnecting.value) return "语音加载中";
  if (isReading.value) return "暂停朗读";
  if (isSpeechPaused.value) return "继续朗读";
  return "语音朗读";
});

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

const onHandleSpeech = async () => {
  if (isSpeechConnecting.value || isReading.value) {
    pauseSpeech();
    return;
  }

  if (isSpeechPaused.value) {
    resumeSpeech();
    return;
  }

  const started = await speakText(props.content, { id: speechId.value });
  if (!started) {
    message.warning(lastError.value || "暂无可朗读内容");
  }
};

onUnmounted(() => {
  if (isCurrentSpeech.value) {
    stopSpeech();
  }
});
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
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
}

.speech-action {
  border: 0;
  padding: 0;
  color: var(--text-tertiary);
  background: transparent;
  line-height: 1;
}

.speech-action.active {
  color: #0f9f8f;
}

.action-icon {
  width: 18px;
  height: 18px;
}

.speech-loading {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(20, 184, 166, 0.22);
  border-top-color: #0f9f8f;
  border-radius: 50%;
  animation: speech-loading-rotate 0.8s linear infinite;
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

@keyframes speech-loading-rotate {
  to {
    transform: rotate(360deg);
  }
}
</style>
