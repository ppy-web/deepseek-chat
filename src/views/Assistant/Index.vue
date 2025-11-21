<script setup>
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
  <el-container>
    <div class="assistant noisy light" :class="{ 'night': app.isDark }">
      <Navbar  v-if="!chat.sessionId"/>
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
  </el-container>
</template>

<style lang="scss" scoped>
.assistant {
  display: flex;
  position: relative;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;


  .new-dialog {
    width: 100%;
    height: calc(100% - 148px);
    max-width: 960px;
    min-width: 400px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 16px;
    margin-bottom: 148px;
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

.light {
  background: linear-gradient(to bottom,
      #87CEEB 0%,
      /* 天顶的淡蓝色 */
      #B0E0E6 70%,
      /* 中间过渡色 */
      #F0F8FF 100%
      /* 靠近地平线的更浅色 */
    );
}

.night {
  background-image: url("@/assets/img/noise.png");
}
</style>
