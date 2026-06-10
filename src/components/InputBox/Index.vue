<!-- 输入框 -->
<template>
  <div class="input-container">
    <div class="input-wrapper" :class="{ 'is-focused': isFocused }" @click="focusInput">
      <div ref="inputRef" class="textarea" contenteditable="true" role="textbox" aria-multiline="true"
        :aria-label="inputAriaLabel" :data-placeholder="placeHolder" @input="onInput" @keydown="handleKeydown"
        @focus="isFocused = true" @blur="onBlur" @paste="handlePaste" @compositionstart="isComposing = true"
        @compositionend="handleCompositionEnd"></div>

      <div class="input-bottom-wrapper">
        <div class="mode-area">
          <div class="mode-switch" role="group" aria-label="模型模式">
            <button type="button" class="mode-option quick-mode" :class="{ active: !app.isDeepseek }"
              :aria-pressed="!app.isDeepseek" title="快速模式" @click.stop="setThinking(false)">
              <IconQuickMode class="mode-icon" />
              <span>快速</span>
            </button>
            <button type="button" class="mode-option deep-mode" :class="{ active: app.isDeepseek }"
              :aria-pressed="app.isDeepseek" title="深度模式" @click.stop="setThinking(true)">
              <IconDeepMode class="mode-icon" />
              <span>深度</span>
            </button>
          </div>
          <div class="model-pill" :class="{ 'is-disabled': chat.isRunning }" aria-live="polite" @click.stop>
            <IconModel class="model-icon" />
            <NSelect class="model-select" aria-label="切换模型" :value="app.useModel" :options="modelOptions"
              :disabled="chat.isRunning" :bordered="false" :consistent-menu-width="false" size="small"
              @update:value="selectModel" />
          </div>
        </div>

        <div class="action-area">
          <SpeechButton :disabled="chat.isRunning" @recognized="handleVoiceRecognized" />
          <button v-if="chat.isRunning" type="button" class="stop-button" aria-label="停止生成" title="停止生成"
            @click.stop="cancelAnswer">
            <IconStop class="action-icon" />
          </button>
          <button v-else type="button" class="send-button" :class="{ 'is-ready': canSend }" :disabled="!canSend"
            aria-label="发送消息" title="发送" @click.stop="sendInput">
            <IconSend class="action-icon" />
          </button>
        </div>
      </div>
    </div>

    <div v-if="showKeyDialog" class="key-dialog-backdrop" @click.self="cancelKeyDialog">
      <div class="key-dialog" role="dialog" aria-modal="true" aria-labelledby="key-dialog-title">
        <div class="key-dialog-title" id="key-dialog-title">配置{{ pendingProviderName }} API Key</div>
        <input v-model="apiKeyInput" class="key-input" type="password" autocomplete="off"
          :placeholder="apiKeyPlaceholder" @keydown.enter="saveApiKey" />
        <div class="key-dialog-actions">
          <button type="button" class="key-button default" :disabled="!hasDefaultApiKey" @click="importDefaultApiKey">
            导入默认值
          </button>
          <div class="key-dialog-main-actions">
            <button type="button" class="key-button ghost" @click="cancelKeyDialog">取消</button>
            <button type="button" class="key-button primary" @click="saveApiKey">保存</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from "vue";
import { NSelect, type SelectOption } from "naive-ui";
import { IconDeepMode, IconModel, IconQuickMode, IconSend, IconStop } from "@/icons";
import SpeechButton from "./SpeechButton.vue";
import { useMitt } from "@/hooks/useMitt";
import EVENT_TYPE from "@/constants/event_type";
import { useChatStore, useAppStore } from "@/store";
import { CHAT_CONFIG, DEFAULT_API_KEY, MODELS } from "@/constants";
import {
  getModelConfig,
  getProviderBaseURL,
  getProviderModelByThinking,
  PROVIDERS,
  type AIProvider,
  type ChatModel,
} from "@/constants/llm";

const mitt = useMitt();
const chat = useChatStore();
const app = useAppStore();

const inputVal = ref("");
const inputRef = ref<HTMLElement | null>(null);
const isComposing = ref(false);
const isFocused = ref(false);
const showKeyDialog = ref(false);
const apiKeyInput = ref("");
const pendingProvider = ref<AIProvider | null>(null);
const pendingModel = ref<ChatModel | null>(null);

const models = MODELS;
const modelOptions = computed<SelectOption[]>(() => {
  return models.map((model) => ({
    label: model.text,
    value: model.value,
  }));
});

const providerNames: Record<AIProvider, string> = {
  [PROVIDERS.DEEPSEEK]: "DeepSeek",
  [PROVIDERS.XIAOMI]: "小米 MiMo",
};

const defaultApiKeys: Record<AIProvider, string> = {
  [PROVIDERS.DEEPSEEK]: DEFAULT_API_KEY.DEEPSEEK,
  [PROVIDERS.XIAOMI]: DEFAULT_API_KEY.XIAOMI,
};

const canSend = computed(() => {
  return inputVal.value.trim().length > 0 && !chat.isRunning;
});

const pendingProviderName = computed(() => {
  return providerNames[pendingProvider.value || app.provider];
});

const apiKeyPlaceholder = computed(() => {
  return pendingProvider.value === PROVIDERS.XIAOMI
    ? "请输入 MIMO_API_KEY"
    : "请输入 DeepSeek API Key";
});

const currentDefaultApiKey = computed(() => {
  const provider = pendingProvider.value || app.provider;
  return (defaultApiKeys[provider] || "").trim().replace(/^['"]|['"]$/g, "");
});

const hasDefaultApiKey = computed(() => {
  return currentDefaultApiKey.value.length > 0;
});

const placeHolder = computed(() => {
  return app.isDeepseek
    ? "把复杂问题交给我，我会多想一步"
    : "问点什么，马上开始";
});

const inputAriaLabel = computed(() => {
  return app.isDeepseek ? "深度模式输入框" : "快速模式输入框";
});

const setThinking = (thinkingEnabled: boolean) => {
  if (thinkingEnabled === app.isDeepseek) return;
  const model = getProviderModelByThinking(app.provider, thinkingEnabled);
  app.set({
    deepseek: thinkingEnabled,
  });
  app.setApiConfig({
    model,
  });
};

const setModel = (model: ChatModel) => {
  const modelConfig = getModelConfig(model);
  if (!modelConfig) return;

  app.setApiConfig({
    provider: modelConfig.provider,
    baseURL: getProviderBaseURL(modelConfig.provider),
    model,
  });

  if (modelConfig.mode) {
    app.set({
      deepseek: modelConfig.mode === "deep",
    });
  }
};

const hasProviderApiKey = (provider: AIProvider) => {
  return Boolean(app.apiKeys[provider]);
};

const openKeyDialog = (provider: AIProvider, model?: ChatModel) => {
  pendingProvider.value = provider;
  pendingModel.value = model || null;
  apiKeyInput.value = "";
  showKeyDialog.value = true;
};

const selectModel = (value: string | number) => {
  const model = value as ChatModel;
  const modelConfig = getModelConfig(model);
  if (!modelConfig) return;

  if (!hasProviderApiKey(modelConfig.provider)) {
    openKeyDialog(modelConfig.provider, model);
    return;
  }

  setModel(model);
};

const saveApiKey = () => {
  const provider = pendingProvider.value || app.provider;
  const apiKey = apiKeyInput.value.trim();
  if (!apiKey) return;
  app.setProviderApiKey(provider, apiKey);
  if (pendingModel.value) {
    setModel(pendingModel.value);
  }
  showKeyDialog.value = false;
  pendingProvider.value = null;
  pendingModel.value = null;
  apiKeyInput.value = "";
};

const importDefaultApiKey = () => {
  if (!hasDefaultApiKey.value) return;
  apiKeyInput.value = currentDefaultApiKey.value;
};

const cancelKeyDialog = () => {
  showKeyDialog.value = false;
  pendingProvider.value = null;
  pendingModel.value = null;
  apiKeyInput.value = "";
};

const syncInputValue = () => {
  inputVal.value = inputRef.value?.innerText || "";
};

const focusInput = () => {
  inputRef.value?.focus();
};

const moveCaretToEnd = () => {
  const el = inputRef.value;
  if (!el) return;
  const selection = window.getSelection();
  const range = document.createRange();
  range.selectNodeContents(el);
  range.collapse(false);
  selection?.removeAllRanges();
  selection?.addRange(range);
};

const setInputText = async (text: string) => {
  const normalizedText = text.trim();
  inputVal.value = normalizedText;
  if (!inputRef.value) return;
  inputRef.value.innerText = normalizedText;
  await nextTick();
  focusInput();
  moveCaretToEnd();
  inputRef.value.scrollTop = inputRef.value.scrollHeight;
};

const onInput = (e: Event) => {
  inputVal.value = (e.target as HTMLElement).innerText;
};

const onBlur = () => {
  isFocused.value = false;
  if (inputRef.value && !inputRef.value.textContent?.trim()) {
    inputRef.value.innerHTML = "";
  }
};

const handleCompositionEnd = () => {
  isComposing.value = false;
  syncInputValue();
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
  syncInputValue();
  if (inputRef.value) {
    inputRef.value.scrollTop = inputRef.value.scrollHeight;
  }
};

const handleVoiceRecognized = (text: string) => {
  void setInputText(text);
};

const sendInput = () => {
  if (!canSend.value) return;
  if (!hasProviderApiKey(app.provider)) {
    openKeyDialog(app.provider);
    return;
  }
  chat.sendMessage(inputVal.value.trim());
  if (inputRef.value) {
    inputRef.value.innerText = "";
  }
  inputVal.value = "";
  focusInput();
};

const cancelAnswer = () => {
  mitt.emit(EVENT_TYPE.CANCEL_ANSWER);
  focusInput();
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
.input-container {
  position: sticky;
  bottom: 28px;
  width: 100%;
  max-width: v-bind('CHAT_CONFIG.MAX_CONTENT_WIDTH + "px"');
  margin-left: auto;
  margin-right: auto;
  padding: 0 50px;
  z-index: 8;
}

.textarea[data-placeholder]:empty::before {
  content: attr(data-placeholder);
  color: var(--text-placeholder);
  cursor: text;
  pointer-events: none;
}

.textarea {
  display: block;
  min-height: 58px;
  max-height: 176px;
  margin: 0;
  padding: 16px 18px 12px;
  overflow: auto;
  outline: none;
  color: var(--text-primary);
  font-size: 15px;
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-word;
  cursor: text;
}

.input-wrapper {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(20, 184, 166, 0.25);
  border-radius: 18px;
  background: var(--bg-primary);
  box-shadow:
    0 18px 52px -36px rgba(15, 23, 42, 0.5),
    0 0 0 1px rgba(255, 255, 255, 0.5) inset;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.input-wrapper::after {
  content: '';
  position: absolute;
  top: 0;
  left: 18px;
  right: 18px;
  height: 1px;
  background: linear-gradient(90deg, transparent, #20c997, #60a5fa, transparent);
  opacity: 0.65;
  pointer-events: none;
}

.input-wrapper.is-focused {
  border-color: rgba(20, 184, 166, 0.65);
  box-shadow:
    0 18px 56px -34px rgba(15, 23, 42, 0.55),
    0 0 0 3px rgba(20, 184, 166, 0.11);
}

.input-bottom-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 52px;
  padding: 8px 10px 10px;
  border-top: 1px solid var(--border-color);
}

.mode-area {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 10px;
}

.mode-switch {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 3px;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  background: var(--bg-secondary);
}

.mode-option {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-width: 72px;
  height: 30px;
  padding: 0 10px;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  color: var(--text-tertiary);
  font-size: 13px;
  font-weight: 600;
  line-height: 1;
  cursor: pointer;
  transition:
    background-color 0.18s ease,
    border-color 0.18s ease,
    color 0.18s ease,
    box-shadow 0.18s ease;
}

.mode-option:hover {
  color: var(--text-primary);
}

.mode-option.active {
  border-color: rgba(20, 184, 166, 0.28);
  background: var(--bg-primary);
  color: #0f9f8f;
  box-shadow: 0 4px 14px -12px rgba(15, 23, 42, 0.6);
}

.deep-mode.active {
  color: #2563eb;
  border-color: rgba(37, 99, 235, 0.25);
}

.mode-icon,
.model-icon,
.action-icon {
  flex: 0 0 auto;
}

.mode-icon {
  width: 15px;
  height: 15px;
}

.model-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 30px;
  min-width: 138px;
  padding: 0 6px 0 10px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-tertiary);
  font-size: 12px;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.38);
  cursor: pointer;
}

.model-icon {
  width: 14px;
  height: 14px;
}

.model-select {
  width: 112px;
  height: 100%;
}

:deep(.model-select .n-base-selection) {
  --n-height: 28px !important;
  --n-border-radius: 6px !important;
  background-color: transparent;
}

:deep(.model-select .n-base-selection__border),
:deep(.model-select .n-base-selection__state-border) {
  display: none;
}

:deep(.model-select .n-base-selection-label) {
  padding: 0;
  background-color: transparent;
}

:deep(.model-select .n-base-selection-input) {
  font-size: 12px;
  font-weight: 600;
}

:deep(.model-select .n-base-selection-input__content) {
  color: var(--text-tertiary);
}

:deep(.model-select .n-base-selection__arrow) {
  color: var(--text-tertiary);
}

.model-pill:not(.is-disabled):hover {
  color: var(--text-primary);
  background: var(--bg-secondary);
}

.model-pill.is-disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.action-area {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.send-button,
.stop-button {
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
  transition:
    background-color 0.18s ease,
    border-color 0.18s ease,
    color 0.18s ease,
    transform 0.18s ease,
    box-shadow 0.18s ease;
}

.send-button.is-ready {
  border-color: rgba(20, 184, 166, 0.8);
  background: linear-gradient(135deg, #10b981, #0891b2);
  color: #ffffff;
  box-shadow: 0 10px 24px -14px rgba(8, 145, 178, 0.85);
}

.send-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.send-button.is-ready:hover,
.stop-button:hover {
  transform: translateY(-1px);
}

.stop-button {
  border-color: rgba(239, 68, 68, 0.32);
  color: #dc2626;
  background: rgba(239, 68, 68, 0.08);
}

.action-icon {
  width: 17px;
  height: 17px;
}

:global(:root.dark) .input-wrapper {
  border-color: rgba(45, 212, 191, 0.2);
  background: rgba(10, 10, 10, 0.92);
  box-shadow:
    0 22px 64px -38px rgba(0, 0, 0, 0.92),
    0 0 0 1px rgba(255, 255, 255, 0.04) inset;
}

:global(:root.dark) .input-wrapper.is-focused {
  border-color: rgba(45, 212, 191, 0.48);
  box-shadow:
    0 22px 64px -38px rgba(0, 0, 0, 0.92),
    0 0 0 3px rgba(45, 212, 191, 0.1);
}

:global(:root.dark) .mode-option.active {
  background: #151515;
  box-shadow: 0 6px 18px -14px rgba(0, 0, 0, 0.9);
}

:global(:root.dark) .model-pill {
  background: rgba(255, 255, 255, 0.03);
}

.key-dialog-backdrop {
  position: fixed;
  inset: 0;
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(15, 23, 42, 0.28);
}

.key-dialog {
  width: min(360px, 100%);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  background: var(--bg-primary);
  box-shadow: 0 24px 70px -38px rgba(15, 23, 42, 0.85);
  padding: 18px;
}

.key-dialog-title {
  margin-bottom: 12px;
  color: var(--text-primary);
  font-size: 15px;
  font-weight: 700;
}

.key-input {
  width: 100%;
  height: 38px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  outline: none;
  padding: 0 12px;
  color: var(--text-primary);
  background: var(--bg-secondary);
  font-size: 14px;
}

.key-input:focus {
  border-color: rgba(20, 184, 166, 0.65);
  box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.11);
}

.key-dialog-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
}

.key-dialog-main-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-left: auto;
}

.key-button {
  height: 34px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 0 14px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.key-button:disabled {
  cursor: not-allowed;
  opacity: 0.48;
}

.key-button.ghost {
  color: var(--text-tertiary);
  background: var(--bg-secondary);
}

.key-button.default {
  border-color: rgba(20, 184, 166, 0.32);
  color: #0f9f8f;
  background: rgba(20, 184, 166, 0.09);
}

.key-button.primary {
  border-color: rgba(20, 184, 166, 0.8);
  color: #ffffff;
  background: linear-gradient(135deg, #10b981, #0891b2);
}

@media (max-width: 640px) {
  .input-container {
    bottom: 18px;
    padding: 0 12px;
  }

  .textarea {
    min-height: 52px;
    max-height: 136px;
    padding: 14px 14px 10px;
    font-size: 15px;
  }

  .input-bottom-wrapper {
    gap: 8px;
    padding: 8px;
  }

  .mode-area {
    gap: 8px;
  }

  .mode-option {
    min-width: 64px;
    padding: 0 8px;
  }

  .model-pill {
    display: none;
  }
}
</style>
