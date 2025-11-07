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
        <span class="rich-text" :class="{ 'text-end': isTextStreamEnd }" v-html="htmlStr"></span>
      </div>
      <!-- 操作栏 -->
      <ActionBar v-if="!isPending && isTextStreamEnd && isLast" :content="msg.htmlStr" :status="msg.opsStatus"
        @like="onHandleLike" @unlike="onHandleUnlike" class="action-bar" />
      <TryAsking v-if="isTextStreamEnd && isLast" :list="suggestArray" @send="onSendSuggest" />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from "vue";
import { Watermark } from "watermark-js-plus";
import { useMitt } from "@/hooks/useMitt";
import message from "@/hooks/useMsg";
import AiLoading from "../Bot/AiLoading.vue";
import ActionBar from "../Bot/ActionBar.vue";
import ThinkingWrap from "../Bot/ThinkingWrap.vue";
import TryAsking from "../Bot/TryAsking.vue";
import EVENT_TYPE from "@/constants/event_type";

const mitt = useMitt();
const props = defineProps({
  msg: {
    type: Object,
    required: true,
  },
  isLast: {
    type: Boolean,
    default: false,
  },
});

const { msg } = props;

const markText = computed(() => {
  return "仅用于测试，请勿转载";
});

const mClass = computed(() => `message-${msg.mid}`);
const isPending = computed(() => msg.isPending);
const htmlStr = computed(() => msg.htmlStr);
const htmlThinking = computed(() => msg.htmlThinking);
const thinkFinished = computed(() => msg.thinkFinished);
const thinkTime = computed(() => msg.thinkTime);
const isTextStreamEnd = computed(() => msg.isTextStreamEnd);
const suggestArray = computed(() => msg.suggestArray);
const onHandleLike = () => {
  message.success("评价成功");
};
const onHandleUnlike = () => {
  message.warning("评价成功，我们会持续改进！");
};

const onSendSuggest = (item) => {
  mitt.emit(EVENT_TYPE.SEND_MESSAGE, item);
};

onMounted(() => {
  const watermark = new Watermark({
    content: markText.value,
    parent: `.${mClass.value}`,
    width: 100,
    height: 100,
    rotate: 30,
    fontSize: "12px",
    fontColor: "rgba(0, 0, 0, 0.5)",
    layout: "grid",
    gridLayoutOptions: {
      gap: [30, 30],
    },
    zIndex: 1000,
  });

  watermark.create();
});
</script>

<style lang="scss">
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

      // text-end 时图片显示
      &.text-end {
        img {
          display: block;
        }
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
  // .action-bar {
  //   opacity: 0;
  //   transition: opacity 0.4s ease;
  // }
  // &:hover {
  //   .action-bar {
  //     opacity: 1;
  //   }
  // }
}
</style>
