<template>
  <div class="top-info" @click="handleClick">
    <div class="top-info-left">
      <img class="top-info-left-logo" :src="logo" />
    </div>
    <div class="top-info-right">
      <div class="top-info-right-title">{{ assistantName }}</div>
      <div class="top-info-right-desc">{{ assistantDesc }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useStore } from "@/hooks/useStore";
import { useMitt } from "@/hooks/useMitt";
import { useChat } from "@/hooks/useChat";
import EVENT_TYPE from "@/constants/event_type";
import doubao from "@/assets/img/doubao.png";

const router = useRouter();
const route = useRoute();
const mitt = useMitt();
const { app, config, user } = useStore();
const { clearMessages, checkToStopMessage } = useChat();

const hasLogin = computed(() => user.info.hasLogin);
const logo = computed(() => config.info.customerLogo || doubao);
const assistantName = computed(() => config.info.serviceName || "智能助手");
const assistantDesc = computed(() => config.info.customerName || "");

const handleImageError = (e) => {
  e.target.src = logo;
};

const handleClick = () => {
  if (hasLogin.value) {
    if (route.path !== "/") {
      checkToStopMessage();
      clearMessages();
      router.push("/");
      mitt.emit(EVENT_TYPE.INIT_SUCCESS);
      app.set({
        showInterruptBtn: false,
        isNewDialog: true,
        uploadUrl: "",
      });
    }
  } else {
    mitt.emit(EVENT_TYPE.SHOW_LOGIN);
  }
};
</script>

<style lang="scss">
.top-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px 0 12px;
  cursor: pointer;
  .top-info-left-logo {
    display: block;
    width: 54px;
    height: 54px;
    // border-radius: 27px;
  }
  .top-info-right {
    flex: 1;
    margin-left: 12px;
    .top-info-right-title {
      font-size: 18px;
      font-weight: 500;
      color: #000;
    }
    .top-info-right-desc {
      font-size: 14px;
      color: #666;
      margin-top: 2px;
    }
  }
}
</style>
