<script setup>
import BotHello from "./BotHello.vue";
import InputBox from "@/components/InputBox/Index.vue";
import ChatBox from "@/components/ChatBox/Index.vue";
import AiTips from "@/components/Common/AiTips.vue";
import Navbar from "@/components/Common/Navbar.vue";
import { useChatStore } from "@/store";
const chat = useChatStore();

</script>

<template>
  <div class="assistant bg-noise noisy">
    <Navbar v-if="chat.sessionId" />
    <div class="new-dialog animate__animated animate__fadeIn" v-if="!chat.sessionId">
      <BotHello />
      <InputBox />
    </div>
    <!-- 对话 -->
    <div class="chat-box animate__animated animate__fadeIn" v-else>
      <ChatBox />
      <InputBox />
    </div>
    <!-- 提示信息  -->
    <AiTips />
  </div>
</template>

<style lang="scss" scoped>
.assistant {
  display: flex;
  position: relative;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  background-image: url("@/assets/img/noise.png");
  // height: calc(100% - 40px);

  .new-dialog {
    width: 100%;
    max-width: 960px;
    min-width: 400px;
    padding: 16px;
  }

  .chat-box {
    display: flex;
    flex-direction: column;
    position: relative;
    flex-grow: 1;
    width: 100%;
    height: calc(100% - 48px);
    // max-width: 960px;
    // padding: 0 16px;
  }
}
</style>
