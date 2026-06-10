<script setup lang="ts">
import BotHello from "./BotHello.vue";
import InputBox from "@/components/InputBox/Index.vue";
import ChatBox from "@/components/ChatBox/Index.vue";
import Navbar from "@/components/Common/Navbar.vue";
import AiTips from "@/components/Common/AiTips.vue";
import { useChatStore, useAppStore } from "@/store";

const chat = useChatStore();
const app = useAppStore();
</script>

<template>
  <div class="assistant w-full h-full flex flex-col items-center justify-center relative" :class="{ 'dark-bg': app.isDark }">
    <Navbar v-if="!chat.sessionId" />
    <div class="new-dialog w-full flex flex-col justify-center gap-4 p-4 animate-fade-in" v-if="!chat.sessionId">
      <BotHello />
      <InputBox />
    </div>
    <!-- 对话 -->
    <div class="chat-box w-full flex flex-col flex-grow animate-fade-in" v-else>
      <ChatBox />
      <InputBox />
    </div>
    <!-- 提示信息 -->
    <AiTips />
  </div>
</template>

<style scoped>
.assistant {
  max-width: 100%;
}

.new-dialog {
  height: calc(100% - 148px);
  max-width: 960px;
  min-width: 400px;
  margin-bottom: 148px;
}

.chat-box {
  height: calc(100% - 48px);
}

.assistant:not(.dark-bg) {
  background: var(--light-theme-bg);
}

.assistant:not(.dark-bg)::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image:
    linear-gradient(rgba(15, 23, 42, 0.028) 1px, transparent 1px),
    linear-gradient(90deg, rgba(15, 23, 42, 0.02) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.38), transparent 70%);
}

.dark-bg {
  background-image: url("@/assets/img/noise.png");
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}
</style>
