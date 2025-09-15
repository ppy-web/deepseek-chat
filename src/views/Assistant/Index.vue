<template>
  <div class="assistant">
    <Navbar :show-voice="true" v-if="!isNewDialog" />
    <div
      class="new-dialog animate__animated animate__fadeIn"
      :class="{ offset: !isLogin }"
      v-if="isNewDialog"
    >
      <HeaderBox />
      <InputBox />
    </div>
    <!-- 对话 -->
    <div
      class="chat-box animate__animated animate__fadeIn"
      v-show="!isNewDialog"
    >
      <ChatBox :key="sessionId" />
      <InputBox />
    </div>
    <!-- 提示信息  -->
    <AiTips />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, provide } from "vue";
import { useStore } from "@/hooks/useStore";

import HeaderBox from "./HeaderBox.vue";
import InputBox from "@/components/InputBox/Index.vue";
import ChatBox from "@/components/ChatBox/Index.vue";
import AiTips from "@/components/Common/AiTips.vue";
import Navbar from "@/components/Common/Navbar.vue";

const { user, app, config } = useStore();

const isNewDialog = computed(() => app.info.isNewDialog); // 是否是新对话
const isLogin = computed(() => user.info.hasLogin); // 是否登录
const sessionId = computed(() => app.info.sessionId); // 会话id
const customerBigLogo = computed(() => config.info.customerBigLogo); // 客户logo
provide("customerBigLogo", customerBigLogo);
</script>

<style lang="scss">
.assistant {
  display: flex;
  position: relative;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  background-color: #fcfcfc;
  // height: calc(100% - 40px);
  // border: 1px solid #89b773;
  .new-dialog {
    width: 100%;
    max-width: 960px;
    min-width: 400px;
    padding: 16px;
  }
  .offset {
    transform: translateY(-7.5vh);
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
