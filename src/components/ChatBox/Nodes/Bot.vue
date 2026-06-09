<!-- 大模型回答的消息 -->
<template>
  <div class="bot max-w-full relative pb-5">
    <div class="avatar">
      <AiLoading :pending="msg.isPending" />
    </div>
    <div class="message" :class="{ 'not-pending': !msg.isPending }">
      <ThinkingWrap :html="msg.thinking" :finished="msg.thinkFinished" :second="msg.thinkTime" />
      <MarkdownRender :content="msg.content" :final="msg.isTextStreamEnd"
        code-block-light-theme="vs" code-block-dark-theme="vs"
        :code-block-props="{ showHeader: false, showFontSizeButtons: false }" />
    </div>
    <ActionBar class="action-bar" v-if="!msg.isPending && msg.isTextStreamEnd"
      :content="msg.content" :status="msg.opsStatus"
      @like="onHandleLike" @unlike="onHandleUnlike" />
  </div>
</template>

<script setup lang="ts">
import { useAppStore } from "@/store";
import message from "@/hooks/useMsg";
import AiLoading from "../Bot/AiLoading.vue";
import ActionBar from "../Bot/ActionBar.vue";
import ThinkingWrap from "../Bot/ThinkingWrap.vue";
import MarkdownRender from 'markstream-vue';
import { enableKatex } from 'markstream-vue';
import 'katex/dist/katex.min.css';

enableKatex();

const app = useAppStore();

interface BotMessage {
  mid: string;
  type: string;
  content: string;
  thinking: string;
  thinkFinished: boolean;
  thinkTime: number;
  isPending: boolean;
  isTextStreamEnd: boolean;
  opsStatus?: string;
}

const props = defineProps<{
  msg: BotMessage;
}>();

const onHandleLike = () => {
  message.success("评价成功");
};

const onHandleUnlike = () => {
  message.warning("评价成功，我们会持续改进！");
};
</script>

<style scoped>
.bot .message {
  border-radius: 8px;
  padding-left: 5px;
  max-width: 100%;
  font-weight: 400;
  color: var(--text-primary);
  transition: background-color 0.3s ease, color 0.3s ease;
}

.bot .message.not-pending {
  border-top: 1px solid var(--border-color);
  margin-left: 12px;
}

.bot .action-bar {
  opacity: 0;
  transition: opacity 0.4s ease;
  position: absolute;
  bottom: -5px;
  left: 66px;
  z-index: 2;
}

.bot:hover .action-bar {
  opacity: 1;
}
</style>
