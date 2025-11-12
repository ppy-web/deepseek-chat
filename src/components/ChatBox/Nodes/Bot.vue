<!-- 大模型回答的消息 -->
<template>
  <div class="bot">
    <div class="avatar">
      <!-- 思考中 -->
      <AiLoading :pending="isPending" />
    </div>
    <div class="message" :class="{ pending: !isPending }">
      <!-- 思考过程 -->
      <ThinkingWrap :html="htmlThinking" :finished="thinkFinished" :second="thinkTime" />
      <!-- 大模型回答 -->
      <div class="watermark" :class="{ [mClass]: true }">
        <span class="rich-text" v-html="htmlStr"></span>
      </div>
      <!-- 操作栏 -->
      <ActionBar v-if="!isPending && isTextStreamEnd" :content="msg.htmlStr" :status="msg.opsStatus"
        @like="onHandleLike" @unlike="onHandleUnlike" class="action-bar" />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from "vue";
import { Watermark } from "watermark-js-plus";
import message from "@/hooks/useMsg";
import AiLoading from "../Bot/AiLoading.vue";
import ActionBar from "../Bot/ActionBar.vue";
import ThinkingWrap from "../Bot/ThinkingWrap.vue";

const props = defineProps({
  msg: {
    type: Object,
    required: true,
  },
});

const { msg } = props;

const mClass = computed(() => `message-${msg.mid}`);
const isPending = computed(() => msg.isPending);
const htmlStr = computed(() => msg.htmlStr);
const htmlThinking = computed(() => msg.htmlThinking);
const thinkFinished = computed(() => msg.thinkFinished);
const thinkTime = computed(() => msg.thinkTime);
const isTextStreamEnd = computed(() => msg.isTextStreamEnd);
const onHandleLike = () => {
  message.success("评价成功");
};
const onHandleUnlike = () => {
  message.warning("评价成功，我们会持续改进！");
};

onMounted(() => {
  const watermark = new Watermark({
    content: 'https://github.com/ppy-web',
    parent: `.${mClass.value}`,
    width: 100,
    height: 100,
    rotate: 30,
    fontSize: "13px",
    fontColor: "rgba(122, 0, 0, 0.5)",
    layout: "grid",
    gridLayoutOptions: {
      gap: [30, 30],
    },
    zIndex: 1000,
  });
  watermark.create();
});
</script>

<style lang="scss" scoped>
.bot {
  max-width: 100%;

  & .message {
    border-radius: 8px;
    font-size: 16px;
    padding-left: 10px;
    max-width: 100%;
    font-weight: 400;
    font-size: 16px;
    color: #333333;

    &.pending {
      background-color: #fcfcfc;
    }

    .watermark {
      position: relative;
    }

    .rich-text {
      user-select: text;

      img {
        display: none;
      }

      // 角标样式
      .highlight-text {
        cursor: pointer !important;
        user-select: none !important;
      }
    }

    .tip {
      display: block;
      margin-top: 10px;
      font-weight: 400;
      font-weight: 400;
      font-size: 14px;
      color: #979797;
    }
  }

  // 控制操作栏显隐
  .action-bar {
    opacity: 0;
    transition: opacity 0.4s ease;
  }

  &:hover {
    .action-bar {
      opacity: 1;
    }
  }
}
</style>
