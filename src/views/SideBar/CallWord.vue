<script setup lang="ts">
import { ref } from 'vue';
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
  <div class="my-2">
    <div @click="showCallWord" class="cursor-pointer">
      <i-streamline-stickies-color:control />
    </div>

    <!-- 弹窗 -->
    <div v-if="callVisible" class="modal-overlay" @click.self="callVisible = false">
      <div class="modal-content max-w-[600px] w-full">
        <div class="flex justify-between items-center mb-5">
          <span class="text-xl font-medium">个性化设置</span>
          <i-streamline-stickies-color:cancel-2 @click="callVisible = false" class="cursor-pointer" />
        </div>
        <div>
          <form @submit.prevent="onHandleSave">
            <div class="mb-4 flex items-center">
              <label class="w-24 text-right pr-4 text-sm">助手昵称</label>
              <div class="flex-1">
                <input v-model="role.appName" placeholder="想要怎么称呼我呢？" maxlength="5"
                  class="w-full h-9 px-3 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <span v-if="formErrors.appName" class="text-red-500 text-xs mt-1">{{ formErrors.appName }}</span>
              </div>
            </div>
            <div class="mb-4 flex items-center">
              <label class="w-24 text-right pr-4 text-sm">助手性格</label>
              <div class="flex-1 flex gap-2 flex-wrap">
                <button v-for="item in CHARACTHER" :key="item.value" type="button"
                  class="px-3 py-1 rounded-full text-sm border transition-all"
                  :class="role.character === item.value ? 'bg-blue-500 text-white border-blue-500' : 'hover:bg-gray-100'"
                  @click="role.character = item.value">
                  {{ item.label }}
                </button>
              </div>
            </div>
            <div class="mb-4 flex items-center">
              <label class="w-24 text-right pr-4 text-sm">关于你</label>
              <div class="flex-1">
                <input v-model="role.hobby" placeholder="请输入你的信息，让我更了解你" maxlength="200"
                  class="w-full h-9 px-3 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div class="mb-4 flex items-start">
              <label class="w-24 text-right pr-4 text-sm pt-2">自定义指令</label>
              <div class="flex-1">
                <textarea v-model="role.desc" :rows="3" placeholder="自定义的提示词，如：你是一个程序员" maxlength="500"
                  class="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"></textarea>
              </div>
            </div>
          </form>
          <div class="flex flex-row justify-center text-xs text-gray-500 text-center mt-4">
            <i-streamline-stickies-color:android-setting-duo />
            <span>&nbsp;您设置的数据只储存在本机，不必担心隐私泄露</span>
          </div>
        </div>
        <div class="mx-auto text-center mt-4">
          <button class="px-4 h-8 rounded text-sm border hover:bg-gray-50 mr-2" @click="callVisible = false">
            取消
          </button>
          <button class="px-4 h-8 rounded text-sm text-white bg-blue-500 hover:opacity-90" @click="onHandleSave">
            保存
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 24px;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
