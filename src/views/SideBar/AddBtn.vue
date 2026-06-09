<script setup lang="ts">
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
  <div class="sidebar-add-btn mt-8 w-[276px] h-[46px] rounded-lg flex justify-center items-center cursor-pointer select-none text-base transition-all duration-500 active:scale-[0.99] active:opacity-90"
    @click="handleClick">
    <i-streamline-stickies-color:mail />
    <span class="ml-2">发起新对话</span>
  </div>
</template>

<style scoped>
.sidebar-add-btn {
  background: linear-gradient(270deg, #e0e3c4 0%, rgb(203, 239, 211) 100%);
  color: #c26508;
}

.sidebar-add-btn:hover {
  background: linear-gradient(90deg, #a2fab5 0%, #c7d16a 100%);
  color: #312f20;
}
</style>
