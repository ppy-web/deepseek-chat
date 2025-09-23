<!-- 预留的操作栏，目前只有语音开关功能 -->
<template>
  <div class="navbar-container">
    <div class="left">{{ props.title }}</div>
    <div class="right" v-if="showVoice">
      <slot></slot>
      <div class="balance">余额 ￥{{ balance.total_balance  }}</div>
      <div
        class="voice"
        v-if="voicePlayFlag !== 3"
        :class="{ muted: muted }"
        @click="toggleMuted"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, ref } from "vue";
import { useStore } from "@/hooks/useStore";
import { useStreamPlayer } from "@/hooks/useStreamPlayer.js";

const { app, config } = useStore();
const { setVolume } = useStreamPlayer();
const props = defineProps({
  title: {
    type: String,
    default: "",
  },
  showVoice: {
    type: Boolean,
    default: false,
  },
});

// 麦克风
const voicePlayFlag = computed(() => config.info.voicePlayFlag);
const balance = computed(() => app.info.balanceInfo);
const muted = computed(() => app.info.muted);
const toggleMuted = () => {
  alert('功能拼命开发中~');
  app.set({
    muted: !muted.value,
  });
  // 流式播放设置静音  nextTick 是为了保证  stream_buffer.play 的stream 已经初始化（用户进入页面 直接点击静音按钮的情况，  因为stream是 根据点击事件初始化的）
  nextTick(() => {
    setVolume(muted.value ? 0 : 1);
  });
};
</script>

<style lang="scss" scoped>
.navbar-container {
  display: flex;
  align-items: center;
  height: 48px;
  line-height: 48px;
  width: 100%;
  padding-right: 16px;
  .left {
    flex: 1;
    font-weight: 700;
    font-size: 24px;
    color: #333;
  }
  .right {
    display: flex;
    margin-left: 10px;
    align-items: center;
    .voice {
      width: 30px;
      height: 30px;
      background-image: url("@/assets/img/voice1.png");
      background-size: 100% 100%;
    }
    .balance {
      height: 30px;
      line-height: 30px;
      font-size: 14px;
      color: #333;
      margin-right: 10px;
    }
  }
}
</style>
