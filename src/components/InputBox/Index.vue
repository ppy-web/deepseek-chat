<!-- 输入框 -->
<template>
  <div class="input-container">
    <div class="input-wrapper">
      <div ref="inputRef" class="textarea" contenteditable="true" rows="2" :data-placeholder="placeHolder"
        @input="onInput" @keydown="handleKeydown" @blur="onBlur" @paste="handlePaste"
        @compositionstart="isComposing = true" @compositionend="isComposing = false" />
      <div class="input-bottom-wrapper">
        <div class="input-bottom-wrapper-left">
          <div class="deep-button" :class="{ active: app.deepseek }" @click="checkTink">深度思考</div>
        </div>
        <div class="input-bottom-wrapper-right">
          <!-- <span class="stop" @click.stop="cancelAnswer" v-if="showInterruptBtn" /> -->
          <span class="stop" @click.stop="cancelAnswer" v-if="chat.isRunning" />
          <template v-else>
            <span class="send" @click.stop="sendInput"> <i-streamline-stickies-color:sent-from-computer-duo
                class="mr-2" />发送</span>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import { useMitt } from "@/hooks/useMitt";
import EVENT_TYPE from "@/constants/event_type";
import { useChatStore, useAppStore } from "@/store";
const mitt = useMitt();
const chat = useChatStore()
const app = useAppStore()

// 输入框的值
const inputVal = ref("");
const inputRef = ref(null);
const isComposing = ref(false); // 用于处理中文输入法状态
const placeHolder = ref("试试与我互动吧~ Enter发送，Shit+Enter换行"); // 输入框placeholder

const checkTink = () => {
  app.set({
    deepseek: !app.deepseek
  })
  app.setApiConfig({
    model: app.deepseek ? 'deepseek-reasoner' : 'deepseek-chat'
  })
}

// 输入
const onInput = (e) => {
  inputVal.value = e.target.innerText;
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
    // mitt.emit(EVENT_TYPE.SEND_MESSAGE, inputVal.value.trim());
    chat.sendMessage(inputVal.value.trim());
    inputRef.value.innerText = "";
    inputVal.value = "";
  }
};
// 中断答案
const cancelAnswer = () => {
  mitt.emit(EVENT_TYPE.CANCEL_ANSWER);
  inputVal.value = "";
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
    border-radius: 16px;
    padding: 1px 0;
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

        .deep-button {
          transition: all .3s ease-in-out;
          width: 100px;
          height: 32px;
          border-radius: 17px;
          border: #bab7d2 1px solid;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          background: linear-gradient(to right, #21f05f, #21aef0 50%,
              #cd85f7 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          user-select: none;
          cursor: pointer;
        }

        .deep-button:hover {
          opacity: .5;
        }

        .deep-button:active {
          background: #bab7d2;
          opacity: .5;
        }

        .active {
          background: linear-gradient(to right, #21f05f 0%, #21aef0 50%, #cd85f7 100%);
          color: #fff;
          border: #bab7d2;
        }
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
          display: inline-flex;
          align-items: center;
          background-color: #83d8d4;
          height: 32px;
          border-radius: 16px;
          padding: 10px 16px;
          cursor: pointer;
          color: #131313;
        }

        .disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }
      }
    }
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
}
</style>
