<template>
  <div class="sidebar-add-btn" @click="handleClick">
    <img src="@/assets/img/add2.png" />
    <span>新建对话</span>
  </div>
</template>

<script setup>
import { useStore } from "@/hooks/useStore";
import { useChat } from "@/hooks/useChat";
import { useMitt } from "@/hooks/useMitt";
import { useRoute } from "vue-router";
import { EVENT_TYPE } from "@/constants";

const { app } = useStore();
const { clearMessages, checkToStopMessage } = useChat();
const route = useRoute();
const mitt = useMitt();

const handleClick = () => {
  checkToStopMessage();
  if (route.path == "/") {
    clearMessages();
    mitt.emit(EVENT_TYPE.INIT_SUCCESS);
    app.set({
      showInterruptBtn: false,
      isNewDialog: true,
    });
  }
};
</script>

<style lang="scss">
.sidebar-add-btn {
  &:active {
    transform: scale(0.99);
    opacity: 0.9;
  }

  &:hover {
    background: linear-gradient(270deg, #4aaeff 0%, #3385ff 100%);
  }

  margin-top: 32px;
  width: 276px;
  height: 46px;
  background: linear-gradient(270deg, #269efd 0%, #1677fe 100%);
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  user-select: none;
  color: #fff;
  font-style: normal;
  font-size: 16px;

  img {
    width: 22px;
    height: 18px;
    margin-right: 6px;
  }
}
</style>
