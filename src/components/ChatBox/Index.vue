<!-- 消息列表 -->
<script setup lang="ts">
import { onMounted, onUnmounted, provide } from "vue";
import { useEventListener } from "@vueuse/core";
import { useMitt } from "@/hooks/useMitt";
import { useRefs } from "@/hooks/useRefs";
import { useChatStore } from "@/store";
import { Nodes } from "./Nodes";
import EVENT_TYPE from "@/constants/event_type";
import { CHAT_CONFIG } from "@/constants";
import Navbar from "@/components/Common/Navbar.vue";

const mitt = useMitt();
const { refs, setRefs } = useRefs();
const chat = useChatStore();

const component = (item: { type: string }) => {
  return Nodes.value.find((e) => e.type === item.type)?.component;
};

provide("evaluate", chat.evaluateMessage);

let autoScroll: (() => void) | undefined;

onMounted(() => {
  mitt.on(EVENT_TYPE.CANCEL_ANSWER, () => {
    chat.cancelAnswer();
  });

  autoScroll = useEventListener(
    refs.messageBoxRef as unknown as HTMLElement,
    "wheel",
    () => {
      chat.setAutoScroll(false);
    },
    { passive: true }
  );
});

onUnmounted(() => {
  chat.checkToStopMessage();
  mitt.off(EVENT_TYPE.CANCEL_ANSWER);
  mitt.off(EVENT_TYPE.SEND_MESSAGE);
  mitt.off(EVENT_TYPE.SHOW_CHAT_HISTORY);
});
</script>

<template>
  <Navbar />
  <div class="chat-component" :ref="setRefs('messageBoxRef') as any">
    <div class="messages-content">
      <template v-for="item in chat.chatList" :key="item.mid">
        <component class="message-wrap" :is="component(item)" :msg="item" />
      </template>
    </div>
  </div>
</template>

<style>
.chat-component {
  position: relative;
  width: 100%;
  min-width: 350px;
  flex: 1;
  overflow-y: auto;
  margin-bottom: 40px;
}

.messages-content {
  width: 100%;
  max-width: v-bind('CHAT_CONFIG.MAX_CONTENT_WIDTH + "px"');
  min-height: 100%;
  margin: 0 auto;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  padding: 0 16px;
}

.message-wrap {
  display: flex;
  margin-bottom: 12px;
}

.message-wrap .message {
  word-wrap: break-word;
}
</style>
