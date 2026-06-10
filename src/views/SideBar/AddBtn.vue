<script setup lang="ts">
import { NButton } from "naive-ui";
import { IconNewChat } from "@/icons";
import { useChatStore, useAppStore } from "@/store";

const chat = useChatStore();
const app = useAppStore();

const handleClick = () => {
  chat.checkToStopMessage();
  chat.initMessages();
  app.set({
    isSideBarVisible: false,
  });
};
</script>

<template>
  <div class="sidebar-add-wrap">
    <NButton class="sidebar-add-btn" block size="large" type="primary" strong @click="handleClick">
      <template #icon>
        <IconNewChat />
      </template>
      发起新对话
    </NButton>
  </div>
</template>

<style scoped>
.sidebar-add-wrap {
  flex: 0 0 auto;
  padding-top: 8px;
}

.sidebar-add-btn {
  height: 46px;
  font-size: 15px;
  font-weight: 700;
  box-shadow: 0 12px 28px -20px rgba(15, 118, 110, 0.7);
}
</style>
