<script setup>
import { useRouter, useRoute } from "vue-router";
import { useAppStore, useChatStore } from "@/store";
import { useMitt } from "@/hooks/useMitt";
import EVENT_TYPE from "@/constants/event_type";

const router = useRouter();
const route = useRoute();
const mitt = useMitt();
const app = useAppStore();
const { clearMessages, checkToStopMessage } = useChatStore();

const handleClick = () => {
  if (route.path !== "/") {
    checkToStopMessage();
    clearMessages();
    router.push("/");
    mitt.emit(EVENT_TYPE.INIT_SUCCESS);
  }
};
</script>

<template>
  <div class="top-info" @click="handleClick">
    <div class="top-info-left">
      <img class="top-info-left-logo" :src="app.logo" />
    </div>
    <div class="top-info-right">
      <div class="top-info-right-title">{{ app.appName }}</div>
    </div>
  </div>
</template>

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
