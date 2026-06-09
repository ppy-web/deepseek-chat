<script setup lang="ts">
import { ref } from 'vue';
import {
  NButton,
  NCard,
  NForm,
  NFormItem,
  NInput,
  NModal,
  NRadioButton,
  NRadioGroup,
  NTooltip,
} from "naive-ui";
import { useCallwordStore } from '@/store';
import { CHARACTHER } from '@/constants';

const callword = useCallwordStore();
const callVisible = ref(false);
const role = ref({
  appName: '',
  character: 1,
  hobby: '' as string | undefined,
  desc: '' as string | undefined,
});

interface FormErrors {
  appName?: string;
  character?: string;
}

const formErrors = ref<FormErrors>({});

function validateForm(): boolean {
  formErrors.value = {};
  if (!role.value.appName.trim()) {
    formErrors.value.appName = '还没有设置昵称';
    return false;
  }
  return true;
}

function onHandleSave() {
  if (!validateForm()) return;
  callVisible.value = false;
  callword.set(role.value);
}

function showCallWord() {
  const data = callword.get();
  role.value = {
    appName: data.appName,
    character: data.character,
    hobby: data.hobby || '',
    desc: data.desc || '',
  };
  callVisible.value = true;
}
</script>

<template>
  <NTooltip trigger="hover">
    <template #trigger>
      <NButton
        class="sidebar-icon-button"
        quaternary
        size="small"
        aria-label="个性化设置"
        @click="showCallWord"
      >
        <template #icon>
          <i-streamline-stickies-color:control />
        </template>
      </NButton>
    </template>
    个性化设置
  </NTooltip>

  <NModal v-model:show="callVisible" class="callword-modal">
    <NCard title="个性化设置" :bordered="false" role="dialog" aria-modal="true">
      <template #header-extra>
        <NButton quaternary circle size="small" aria-label="关闭个性化设置" @click="callVisible = false">
          <template #icon>
            <i-streamline-stickies-color:cancel-2 />
          </template>
        </NButton>
      </template>

      <NForm label-placement="left" label-width="88" :show-feedback="false" @submit.prevent="onHandleSave">
        <NFormItem label="助手昵称" :validation-status="formErrors.appName ? 'error' : undefined">
          <div class="field-stack">
            <NInput v-model:value="role.appName" placeholder="想要怎么称呼我呢？" maxlength="5" show-count />
            <span v-if="formErrors.appName" class="field-error">{{ formErrors.appName }}</span>
          </div>
        </NFormItem>

        <NFormItem label="助手性格">
          <NRadioGroup v-model:value="role.character" class="character-group" name="assistant-character">
            <NRadioButton v-for="item in CHARACTHER" :key="item.value" :value="item.value">
              {{ item.label }}
            </NRadioButton>
          </NRadioGroup>
        </NFormItem>

        <NFormItem label="关于你">
          <NInput v-model:value="role.hobby" placeholder="请输入你的信息，让我更了解你" maxlength="200" show-count />
        </NFormItem>

        <NFormItem label="自定义指令">
          <NInput
            v-model:value="role.desc"
            type="textarea"
            placeholder="自定义的提示词，如：你是一个程序员"
            maxlength="500"
            show-count
            :autosize="{ minRows: 3, maxRows: 5 }"
          />
        </NFormItem>
      </NForm>

      <div class="privacy-note">
        <i-streamline-stickies-color:android-setting-duo />
        <span>您设置的数据只储存在本机，不必担心隐私泄露</span>
      </div>

      <template #footer>
        <div class="modal-actions">
          <NButton @click="callVisible = false">取消</NButton>
          <NButton type="primary" @click="onHandleSave">保存</NButton>
        </div>
      </template>
    </NCard>
  </NModal>
</template>

<style scoped>
.sidebar-icon-button {
  width: 32px;
  height: 32px;
  color: var(--text-primary);
}

:global(.callword-modal) {
  width: min(600px, calc(100vw - 32px));
}

.field-stack {
  width: 100%;
}

.field-error {
  display: block;
  margin-top: 6px;
  color: #ef4444;
  font-size: 12px;
  line-height: 1.2;
}

:deep(.character-group) {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.privacy-note {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 16px;
  color: var(--text-tertiary);
  font-size: 12px;
  text-align: center;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
