<template>
  <button
    type="button"
    class="speech-button"
    :class="{ 'is-recording': isRecording, 'is-loading': isRecognizing }"
    :disabled="buttonDisabled"
    :title="buttonTitle"
    :aria-label="buttonTitle"
    @click.stop="toggleSpeech"
  >
    <span v-if="isRecording || isRecognizing" class="voice-orbit" aria-hidden="true">
      <span class="voice-halo"></span>
      <span class="voice-core">
        <span v-for="index in 3" :key="index" class="voice-wave" :style="{ animationDelay: `${index * 0.07}s` }"></span>
      </span>
    </span>
    <IconMicrophone v-else class="speech-icon" />
  </button>
</template>

<script setup lang="ts">
import { computed, onUnmounted } from "vue";
import { IconMicrophone } from "@/icons";
import message from "@/hooks/useMsg";
import { useSpeechInput } from "@/hooks/useSpeechInput";

const props = withDefaults(
  defineProps<{
    disabled?: boolean;
  }>(),
  {
    disabled: false,
  }
);

const emit = defineEmits<{
  recognized: [text: string];
}>();

const { isRecording, isRecognizing, remainSeconds, start, stop, cancel } = useSpeechInput({
  onRecognized: (text) => {
    emit("recognized", text);
    message.success("语音识别完成");
  },
  onError: (text) => {
    message.warning(text);
  },
});

const buttonDisabled = computed(() => {
  return isRecognizing.value || (props.disabled && !isRecording.value);
});

const buttonTitle = computed(() => {
  if (isRecognizing.value) return "语音识别中";
  if (isRecording.value) return `点击结束录音，剩余 ${remainSeconds.value} 秒`;
  if (props.disabled) return "回答生成中，暂不可语音输入";
  return "语音输入";
});

const toggleSpeech = () => {
  if (buttonDisabled.value) return;
  if (isRecording.value) {
    stop();
    return;
  }
  void start();
};

onUnmounted(() => {
  cancel();
});
</script>

<style scoped>
.speech-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  color: var(--text-tertiary);
  background: var(--bg-secondary);
  cursor: pointer;
  position: relative;
  overflow: visible;
  transition:
    background-color 0.18s ease,
    border-color 0.18s ease,
    color 0.18s ease,
    transform 0.18s ease,
    box-shadow 0.18s ease,
    opacity 0.18s ease;
}

.speech-button:hover,
.speech-button.is-recording,
.speech-button.is-loading {
  border-color: rgba(20, 184, 166, 0.5);
  color: #0f9f8f;
  background: rgba(20, 184, 166, 0.09);
}

.speech-button:hover {
  transform: translateY(-1px);
}

.speech-button:disabled {
  cursor: not-allowed;
  opacity: 0.58;
  transform: none;
}

.speech-icon {
  width: 18px;
  height: 18px;
}

.voice-orbit {
  width: 24px;
  height: 24px;
  display: grid;
  place-items: center;
  position: relative;
}

.voice-halo {
  position: absolute;
  inset: 0;
  border-radius: 999px;
  background:
    radial-gradient(circle at 50% 50%, rgba(20, 184, 166, 0.2), transparent 58%),
    conic-gradient(from 90deg, rgba(20, 184, 166, 0), rgba(20, 184, 166, 0.58), rgba(96, 165, 250, 0.42), rgba(20, 184, 166, 0));
  animation: voice-halo 1.8s ease-in-out infinite;
}

.voice-core {
  width: 18px;
  height: 14px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  position: relative;
  background: rgba(255, 255, 255, 0.9);
  box-shadow:
    inset 0 0 0 1px rgba(20, 184, 166, 0.16),
    0 4px 12px rgba(20, 184, 166, 0.18);
}

.voice-wave {
  width: 2px;
  height: 8px;
  border-radius: 999px;
  background: linear-gradient(180deg, #10b981 0%, #0891b2 100%);
  transform-origin: center;
  animation: voice-wave 0.95s cubic-bezier(0.45, 0, 0.2, 1) infinite;
}

:global(:root.dark) .voice-core {
  background: rgba(15, 23, 42, 0.88);
}

@keyframes voice-wave {
  0%,
  100% {
    transform: scaleY(0.35);
    opacity: 0.55;
  }

  50% {
    transform: scaleY(1.15);
    opacity: 1;
  }
}

@keyframes voice-halo {
  0%,
  100% {
    opacity: 0.58;
    transform: scale(0.92) rotate(0deg);
  }

  50% {
    opacity: 1;
    transform: scale(1.08) rotate(145deg);
  }
}
</style>
