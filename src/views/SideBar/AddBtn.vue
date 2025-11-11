<script setup>
import { useChatStore } from "@/store";
const chat = useChatStore();

const handleClick = () => {
  chat.checkToStopMessage();
  chat.initMessages()
};
</script>

<template>
  <div class="sidebar-add-btn" @click="handleClick">
    <i-streamline-stickies-color:mail />
    <span class="ml-2">发起新对话</span>
  </div>
</template>


<style lang="scss" scoped>
.sidebar-add-btn {
  margin-top: 32px;
  width: 276px;
  height: 46px;
  background: linear-gradient(270deg, #c7d16a 0%, #a2fab5 100%);
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  user-select: none;
  font-size: 16px;
  color: #c26508;
  transition: all .5s ease-in-out;

  &:active {
    transform: scale(0.99);
    opacity: 0.9;
  }

  &:hover {
    background: linear-gradient(270deg, #a2fab5 0%, #c7d16a 100%);
    color: #312f20;
  }
}
</style>
