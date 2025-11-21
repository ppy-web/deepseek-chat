<script setup>
import { useCallwordStore } from '@/store'
import { CHARACTHER } from '@/constants'

const callword = useCallwordStore()
const callVisible = ref(false)
const role = ref({
  appName: '',
  character: 1,
  hobby: '',
  desc: '',
})
const transitionConfig = {
  name: 'dialog-custom-object',
  appear: true,
  mode: 'out-in',
  duration: 500,
}
const formRules = {
  appName: [
    { required: true, message: '还没有设置昵称', trigger: 'blur' },
  ],
  character: [
    { required: true, message: '还没有选择性格', trigger: 'blur' },
  ],
}

function onHandleSave() {
  callVisible.value = false
  callword.set(role.value)
}

function showCallWord() {
  role.value = callword.get()
  callVisible.value = true
}
</script>


<template>
  <div class="my-2">
    <div @click="showCallWord">
      <i-streamline-stickies-color:control class="cursor-pointer" />
    </div>
    <el-dialog v-model="callVisible" class="dialog-round" header-class="dialog-header" width="600px" align-center
      :show-close="false" :destroy-on-close="true" append-to-body :transition="transitionConfig">
      <template #header="{ close }">
        <div class="flex justify-between items-center mb-5">
          <span class="text-xl font-medium">个性化设置</span>
          <i-streamline-stickies-color:cancel-2 @click="close()" class="cursor-pointer" />
        </div>
      </template>
      <div>
        <el-form :model="role" :rules="formRules" label-width="100px" label-position="right"
          size="default" scroll-to-error>
          <el-form-item label="助手昵称" prop="appName">
            <el-input v-model="role.appName" placeholder="想要怎么称呼我呢？" clearable maxlength="5" show-word-limit />
          </el-form-item>
          <el-form-item label="助手性格" prop="character">
            <el-segmented v-model="role.character" :options="CHARACTHER" />
          </el-form-item>
          <el-form-item label="关于你" prop="hobby">
            <el-input v-model="role.hobby" placeholder="请输入你的信息，让我更了解你" clearable maxlength="200" show-word-limit />
          </el-form-item>
          <el-form-item label="自定义指令" prop="desc">
            <el-input v-model="role.desc" type="textarea" :rows="3" placeholder="自定义的提示词，如：你是一个程序员" clearable
              maxlength="500" />
          </el-form-item>
        </el-form>
        <div class="flex flex-row justify-center text-xs text-gray-500 text-center">
          <i-streamline-stickies-color:android-setting-duo />
          <span> &nbsp;您设置的数据只储存在本机，不必担心隐私泄露</span>
        </div>
      </div>
      <template #footer>
        <div class="mx-auto text-center">
          <el-button type="primary" plain @click="callVisible = false">
            <i-streamline-stickies-color:cancel-2-duo />
          </el-button>
          <el-button type="primary" @click="onHandleSave">
            <i-streamline-stickies-color:validation-1-duo />
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss">
.call-word {
  border-radius: 10px;
  user-select: none;
  cursor: pointer;
}

/* Object Configuration Animation */
.dialog-custom-object-enter-active,
.dialog-custom-object-leave-active,
.dialog-custom-object-enter-active .el-dialog,
.dialog-custom-object-leave-active .el-dialog {
  transition: all 0.8s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.dialog-custom-object-enter-from,
.dialog-custom-object-leave-to {
  opacity: 0;
}

.dialog-custom-object-enter-from .el-dialog,
.dialog-custom-object-leave-to .el-dialog {
  transform: translateX(-50%) translateY(-50%) rotate(-25deg) scale(0.3);
  opacity: 0;
}
</style>
