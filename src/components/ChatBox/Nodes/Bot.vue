<!-- 大模型回答的消息 -->
<template>
  <div class="bot">
    <div class="avatar">
      <!-- 思考中 -->
      <AiLoading :pending="msg.isPending" />
    </div>
    <div class="message" :class="{ pending: !msg.isPending }">
      <!-- 思考过程 -->
      <ThinkingWrap :html="msg.thinking" :finished="msg.thinkFinished" :second="msg.thinkTime" />
      <!-- 大模型回答 -->
      <MarkdownRender :content="msg.content" :is-dark="app.isDark"></MarkdownRender>
    </div>
    <!-- 操作栏 -->
    <ActionBar class="action-bar" v-if="!msg.isPending && msg.isTextStreamEnd" :content="msg.content"
      :status="msg.opsStatus" @like="onHandleLike" @unlike="onHandleUnlike" />
  </div>
</template>

<script setup>
import { useAppStore } from "@/store";
const app = useAppStore();
import message from "@/hooks/useMsg";
import AiLoading from "../Bot/AiLoading.vue";
import ActionBar from "../Bot/ActionBar.vue";
import ThinkingWrap from "../Bot/ThinkingWrap.vue";
import MarkdownRender from 'markstream-vue'
import 'markstream-vue/index.css'
const props = defineProps({
  msg: {
    type: Object,
    required: true,
  },
});

const { msg } = props;
const onHandleLike = () => {
  message.success("评价成功");
};
const onHandleUnlike = () => {
  message.warning("评价成功，我们会持续改进！");
};
</script>

<style lang="scss" scoped>
.bot {
  max-width: 100%;
  position: relative;
  padding-bottom: 20px;

  & .message {
    border-radius: 8px;
    font-size: 16px;
    padding-left: 10px;
    max-width: 100%;
    font-weight: 400;
    font-size: 16px;
    color: var(--text-primary);
    transition: background-color 0.3s ease, color 0.3s ease;

    &.pending {
      background-color: var(--bg-secondary);
      padding: 12px;
      margin-left: 12px;
    }

    .watermark {
      position: relative;
    }
  }

  // 控制操作栏显隐
  .action-bar {
    opacity: 0;
    transition: opacity 0.4s ease;
    position: absolute;
    bottom: -5px;
    left: 66px;
    z-index: 2;
  }

  &:hover {
    .action-bar {
      opacity: 1;
    }
  }
}
</style>
