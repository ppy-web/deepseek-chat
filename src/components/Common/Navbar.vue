<!-- 预留的操作栏，目前只有语音开关功能 -->
<template>
  <div class="navbar-container">
    <div class="left">{{ props.title }}</div>
    <div class="right">
      <slot></slot>
      <div class="balance">余额 ￥{{ app.balanceInfo.total_balance }}</div>
    </div>
  </div>
</template>

<script setup>
import { useAppStore } from "@/store";

const app = useAppStore();
const props = defineProps({
  title: {
    type: String,
    default: "",
  },
});
</script>

<style lang="scss" scoped>
.navbar-container {
  display: flex;
  align-items: center;
  height: 48px;
  line-height: 48px;
  width: 100%;
  padding-right: 16px;

  .left {
    flex: 1;
    font-weight: 700;
    font-size: 24px;
    color: #333;
  }

  .right {
    display: flex;
    margin-left: 10px;
    align-items: center;

    .voice {
      width: 30px;
      height: 30px;
      background-image: url("@/assets/img/voice1.png");
      background-size: 100% 100%;
    }

    .balance {
      height: 30px;
      line-height: 30px;
      font-size: 14px;
      color: #333;
      margin-right: 10px;
    }
  }
}
</style>
