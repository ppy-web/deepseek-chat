<!-- 大模型回答的消息 -->
<template>
  <div class="bot max-w-full relative pb-5">
    <div class="message" :class="{ 'not-pending': !msg.isPending }">
      <NDivider title-placement="left" dashed>
        <AiLoading :pending="msg.isPending" />
      </NDivider>
      <ThinkingWrap :html="msg.thinking" :finished="msg.thinkFinished" :second="msg.thinkTime" />
      <MarkdownRender :content="msg.content" :final="msg.isTextStreamEnd" code-block-light-theme="vs"
        code-block-dark-theme="vs" :code-block-props="{ showHeader: false, showFontSizeButtons: false }"
        custom-id="bot-msg" />
    </div>
    <ActionBar class="action-bar" v-if="!msg.isPending && msg.isTextStreamEnd" :content="msg.content"
      :speech-id="msg.mid" :status="msg.opsStatus" @like="onHandleLike" @unlike="onHandleUnlike" />
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
import { NDivider } from "naive-ui";
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
[data-custom-id='bot-msg'] {
  --ms-flow-paragraph-y: .8em;
}

.bot .message {
  border-radius: 8px;
  padding-left: 5px;
  max-width: 100%;
  font-weight: 400;
  color: var(--text-primary);
  transition: background-color 0.3s ease, color 0.3s ease;
}

.bot .action-bar {
  transition: opacity 0.4s ease;
  position: absolute;
  bottom: -5px;
  z-index: 2;
}

.bot:hover .action-bar {
  opacity: 1;
}
</style>
