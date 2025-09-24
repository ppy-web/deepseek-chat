<!-- 输入框 -->
<template>
  <div class="input-container">
    <div class="input-wrapper">
      <div
        ref="inputRef"
        class="textarea"
        contenteditable="true"
        rows="2"
        :data-placeholder="placeHolder"
        @input="onInput"
        @keydown="handleKeydown"
        @blur="onBlur"
        @paste="handlePaste"
        @compositionstart="isComposing = true"
        @compositionend="isComposing = false"
      />
      <div class="input-bottom-wrapper">
        <div class="input-bottom-wrapper-left">
          <Models />
          <Network />
        </div>
        <div class="input-bottom-wrapper-right">
          <UploadBtn @fileUploaded="handleFileUploaded" />
          <span
            class="stop"
            @click.stop="cancelAnswer"
            v-if="showInterruptBtn"
          />
          <template v-else>
            <span class="send" @click.stop="sendInput" />
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, computed, ref, provide } from "vue";

import Models from "./Models.vue";
import Network from "./Network.vue";
import UploadBtn from "./UploadBtn.vue";

import { useStore } from "@/hooks/useStore";
import { useMitt } from "@/hooks/useMitt";
import EVENT_TYPE from "@/constants/event_type";

const mitt = useMitt();
const { app } = useStore();
// 输入框的值
const inputVal = ref("");
const inputRef = ref(null);
const isComposing = ref(false); // 用于处理中文输入法状态
const placeHolder = ref("试试与我互动吧~ Enter发送，Shit+Enter换行"); // 输入框placeholder
const fileList = ref([]); // 文件上传列表
const showInterruptBtn = computed(() => app.info.showInterruptBtn); // 中断按钮是否展示

// 输入
const onInput = (e) => {
  inputVal.value = e.target.innerText;
};

const sendVoiceText = (val) => {
  inputRef.value.innerText = val;
  inputVal.value = val;
  inputRef.value?.focus();
  // 创建 Range 对象  聚焦到文字末尾
  const range = document.createRange();
  const selection = window.getSelection();
  range.selectNodeContents(inputRef.value);
  range.collapse(false);
  selection.removeAllRanges();
  selection.addRange(range);
};

// 失焦
const onBlur = () => {
  if (inputRef.value && !inputRef.value.textContent.trim()) {
    inputRef.value.innerHTML = "";
  }
};

// 处理按键事件（实现Ctrl+Enter发送）
const handleKeydown = (e) => {
  // 中文输入法正在组词时不处理
  if (isComposing.value) return;
  // 回车键发送
  if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey) {
    e.preventDefault();
    sendInput();
  }
};
// 处理粘贴事件（去除格式）
const handlePaste = (e) => {
  e.preventDefault();
  const text = e.clipboardData.getData("text/plain");
  document.execCommand("insertText", false, text);
  // 自动滚动到底部
  inputRef.value.scrollTop = inputRef.value.scrollHeight;
};
// 发送
const sendInput = () => {
  if (inputVal.value.trim()) {
    mitt.emit(EVENT_TYPE.SEND_MESSAGE, inputVal.value.trim());
    inputRef.value.innerText = "";
    inputVal.value = "";
  }
};
// 中断答案
const cancelAnswer = () => {
  mitt.emit(EVENT_TYPE.CANCEL_ANSWER);
  inputVal.value = "";
};

const handleFileUploaded = (list) => {
  fileList.value = list;
};

onMounted(() => {
  // 挂载自动获取焦点
  inputRef.value?.focus();
  mitt.on(EVENT_TYPE.SEND_SUCCESS, () => {
    inputVal.value = "";
  });
});

onUnmounted(() => {
  mitt.off(EVENT_TYPE.SEND_SUCCESS);
});
</script>

<style lang="scss" scope>
.input-container {
  width: 100%;
  position: sticky;
  bottom: 40px;
  width: 100%;
  .input-wrapper {
    position: relative;
    background: #ffffff;
    box-shadow: 0px 1px 2px 0px rgba(102, 102, 102, 0.1);
    border-radius: 16px;
    border: 1px solid #dedede;
    overflow: hidden;
    cursor: pointer;
    .textarea {
      word-break: break-word;
      margin: 14px;
      padding: 0;
      display: block;
      outline: none;
      font-size: 16px;
      min-height: 50px;
      max-height: 150px;
      overflow: auto;
      box-sizing: border-box;
    }
    .textarea[data-placeholder]:empty::before {
      content: attr(data-placeholder);
      color: #bab7d2;
      cursor: text;
      font-size: 14px;
    }
    .input-bottom-wrapper {
      margin: 16px;
      margin-top: 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      .input-bottom-wrapper-left {
        flex: 1;
        display: flex;
      }
      .input-bottom-wrapper-right {
        display: flex;
        align-items: center;
        .stop {
          width: 58px;
          height: 32px;
          background: #191919;
          border-radius: 17px;
          position: relative;
          &::after {
            content: " ";
            position: absolute;
            width: 14px;
            height: 14px;
            background: #fff;
            border-radius: 2px;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
          }
        }
        .send {
          width: 58px;
          height: 32px;
          background-image: url("@/assets/img/send.png");
          background-size: 100% 100%;
          cursor: pointer;
        }
        .disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }
      }
    }
  }
}
</style>
