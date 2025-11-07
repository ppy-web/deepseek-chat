<!-- 消息列表 -->
<template>
  <el-scrollbar class="chat-component" :ref="setRefs('messageBoxRef')">
    <template v-for="item in messages" :key="item.mid">
      <component class="message-wrap" :is="component(item)" :msg="item"
        :is-last="messages[messages.length - 1].mid == item.mid"></component>
    </template>
  </el-scrollbar>
</template>

<script setup>
import { nextTick, onMounted, onUnmounted, provide } from "vue";
import { useEventListener } from "@vueuse/core";
import { useMitt } from "@/hooks/useMitt";
import { useRefs } from "@/hooks/useRefs";
import { useChatStore } from "@/store";
import { useBrowser } from "@/hooks/useBrowser";
import { Nodes } from "./Nodes";
import EVENT_TYPE from "@/constants/event_type";

const mitt = useMitt();
const { browser } = useBrowser();
const { refs, setRefs } = useRefs();
const {
  messages,
  setAutoScroll,
  cancelAnswer,
  evaluateMessage,
  checkToStopMessage,
} = useChatStore();
const component = (item) => {
  return Nodes.value.find((e) => e.type == item.type).component;
};

provide("evaluate", evaluateMessage);
let autoScroll;
onMounted(() => {
  nextTick(() => {
    if (document.querySelector(".chat-box .chat-component")) {
      if (browser.width - 300 < 800) {
        document.querySelector(".chat-box .chat-component").style.padding =
          "0 16px";
        document.querySelector(".chat-box .input-container").style.padding =
          "0 16px";
      } else {
        let p = (browser.width - 300 - 960) / 2;
        p = p < 16 ? 16 : p;
        document.querySelector(
          ".chat-box .chat-component"
        ).style.padding = `0px ${p}px`;
        document.querySelector(
          ".chat-box .input-container"
        ).style.padding = `0px ${p}px`;
      }
    }
  });
  // 取消回答
  mitt.on(EVENT_TYPE.CANCEL_ANSWER, () => {
    cancelAnswer();
  });
  // 显示对话记录
  // mitt.on(EVENT_TYPE.SHOW_CHAT_HISTORY, (id) => {
  //   switchSession(id);
  // });
  autoScroll = useEventListener(
    refs.messageBoxRef,
    "wheel",
    () => {
      setAutoScroll(false);
    },
    { passive: true }
  );
});
onUnmounted(() => {
  checkToStopMessage();
  mitt.off(EVENT_TYPE.CANCEL_ANSWER);
  mitt.off(EVENT_TYPE.SEND_MESSAGE);
  mitt.off(EVENT_TYPE.SHOW_CHAT_HISTORY);
});
</script>

<style lang="scss">
.chat-component {
  position: relative;
  width: 100%;
  min-width: 350px;
  flex: 1;
  overflow-y: hidden !important;
  margin-bottom: 40px;

  .message-wrap {
    display: flex;
    margin-bottom: 12px;

    .message {
      word-wrap: break-word;
    }
  }
}
</style>
