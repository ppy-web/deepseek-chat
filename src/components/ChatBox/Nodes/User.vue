<!-- 用户发送的消息 -->
<template>
  <div class="user" style="flex-direction: row-reverse; max-width: 100%;">
    <div class="message rounded-xl px-4 py-2.5 overflow-hidden"
      style="background: var(--bg-secondary); color: var(--text-primary); transition: background-color 0.3s ease, color 0.3s ease;">
      <span class="rich-text whitespace-pre-wrap break-all break-words select-text" v-html="msg.content"></span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface UserMessage {
  mid: string;
  type: string;
  content: string;
}

defineProps<{
  msg: UserMessage;
}>();
</script>
