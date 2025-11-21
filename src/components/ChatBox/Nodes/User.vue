<!-- 用户发送的消息 -->
<template>
  <div class="user">
    <div class="message">
      <span class="rich-text" v-html="msg.content"></span>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  msg: {
    type: Object,
    required: true,
  },
});
</script>

<style lang="scss">
.user {
  flex-direction: row-reverse;
  max-width: 100%;
  .message {
    background: var(--bg-secondary);
    border-radius: 12px;
    padding: 10px 15px;
    color: var(--text-primary);
    overflow: hidden !important;
    transition: background-color 0.3s ease, color 0.3s ease;
    .rich-text {
      white-space: pre-wrap;
      word-break: break-all;
      word-wrap: break-word;
      user-select: text;
    }
  }
}
</style>
