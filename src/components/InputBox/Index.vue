<!-- 输入框 -->
<template>
  <div class="input-container w-full sticky bottom-10">
    <div class="input-wrapper relative bg-[var(--bg-primary)] rounded-2xl py-px cursor-pointer">
      <div ref="inputRef" class="textarea block outline-none text-base min-h-[50px] max-h-[150px] overflow-auto m-3.5 p-0"
        contenteditable="true" rows="2" :data-placeholder="placeHolder"
        @input="onInput" @keydown="handleKeydown" @blur="onBlur" @paste="handlePaste"
        @compositionstart="isComposing = true" @compositionend="isComposing = false" />
      <div class="input-bottom-wrapper mx-3.5 mt-0 flex items-center justify-between">
        <div class="input-bottom-wrapper-left flex flex-1">
          <div class="deep-button transition-all duration-300 ease-in-out w-[100px] h-8 leading-8 rounded-[17px] border flex items-center justify-center text-sm select-none cursor-pointer"
            :class="{ 'active-btn': app.isDeepseek }" @click="checkTink">
            深度思考
          </div>
        </div>
        <div class="input-bottom-wrapper-right flex items-center">
          <span class="stop inline-flex items-center h-8 rounded-4 px-4 cursor-pointer text-red-600 font-medium hover:bg-[var(--hover-bg)]"
            @click.stop="cancelAnswer" v-if="chat.isRunning">
            <i-svg-spinners:270-ring-with-bg class="mr-2" />
            停止
          </span>
          <template v-else>
            <span class="send inline-flex items-center h-8 border border-teal-400 rounded-4 px-4 cursor-pointer font-medium text-green-500 select-none hover:bg-[var(--hover-bg)]"
              :class="{ 'opacity-50 cursor-not-allowed': !canSend }" @click.stop="sendInput">
              <i-streamline-stickies-color:sent-from-computer-duo class="mr-2" />
              发送
            </span>
          </template>
        </div>
      </div>
    </div>
    <div class="input-glow"></div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useMitt } from "@/hooks/useMitt";
import EVENT_TYPE from "@/constants/event_type";
import { useChatStore, useAppStore } from "@/store";
import { CHAT_CONFIG } from "@/constants";
import { getDeepSeekModelByThinking } from "@/constants/deepseek";

const mitt = useMitt();
const chat = useChatStore();
const app = useAppStore();

const inputVal = ref("");
const inputRef = ref<HTMLElement | null>(null);
const isComposing = ref(false);
const placeHolder = ref("试试与我互动吧~ Enter发送，Shift+Enter换行");

const canSend = computed(() => {
  return inputVal.value && inputVal.value.trim().length > 0;
});

const checkTink = () => {
  const thinkingEnabled = !app.isDeepseek;
  app.set({
    deepseek: thinkingEnabled,
  });
  app.setApiConfig({
    model: getDeepSeekModelByThinking(thinkingEnabled),
  });
};

const onInput = (e: Event) => {
  inputVal.value = (e.target as HTMLElement).innerText;
};

const onBlur = () => {
  if (inputRef.value && !inputRef.value.textContent?.trim()) {
    inputRef.value.innerHTML = "";
  }
};

const handleKeydown = (e: KeyboardEvent) => {
  if (isComposing.value) return;
  if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey) {
    e.preventDefault();
    sendInput();
  }
};

const handlePaste = (e: ClipboardEvent) => {
  e.preventDefault();
  const text = e.clipboardData?.getData("text/plain") || "";
  document.execCommand("insertText", false, text);
  if (inputRef.value) {
    inputRef.value.scrollTop = inputRef.value.scrollHeight;
  }
};

const sendInput = () => {
  if (inputVal.value.trim()) {
    chat.sendMessage(inputVal.value.trim());
    if (inputRef.value) {
      inputRef.value.innerText = "";
    }
    inputVal.value = "";
  }
};

const cancelAnswer = () => {
  mitt.emit(EVENT_TYPE.CANCEL_ANSWER);
  inputVal.value = "";
};

onMounted(() => {
  inputRef.value?.focus();
  mitt.on(EVENT_TYPE.SEND_SUCCESS, () => {
    inputVal.value = "";
  });
});

onUnmounted(() => {
  mitt.off(EVENT_TYPE.SEND_SUCCESS);
});
</script>

<style scoped>
.textarea[data-placeholder]:empty::before {
  content: attr(data-placeholder);
  color: var(--text-placeholder);
  cursor: text;
  font-size: 14px;
}

.input-container {
  max-width: v-bind('CHAT_CONFIG.MAX_CONTENT_WIDTH + "px"');
  margin-left: auto;
  margin-right: auto;
}

.textarea {
  color: var(--text-primary);
}

.input-wrapper::before {
  content: '';
  position: absolute;
  top: -1px;
  left: -1px;
  right: -1px;
  bottom: -1px;
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
  border-radius: 16px;
  z-index: -1;
}

.active-btn {
  background: linear-gradient(to right, #21f05f 0%, #21aef0 50%, #cd85f7 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  border: turquoise 1px solid;
}
</style>
