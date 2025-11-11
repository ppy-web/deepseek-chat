<!-- 用于展示AI头像和思考中状态-->
<template>
  <div class="AI">
    <img class="avatar" :src="botDefault" />
    <div class="loadwrap" v-if="props.pending">
      <span>AI思考中</span>
      <div class="loader">
        <div class="box-load1" />
        <div class="box-load2" />
        <div class="box-load3" />
      </div>
    </div>
  </div>
</template>

<script setup>
import botDefault from "@/assets/img/doubao.png";
const props = defineProps({
  pending: {
    type: Boolean,
    default: false,
  },
});
</script>

<style lang="scss" scoped>
.AI {
  display: flex;
  flex-direction: row;
  align-items: center;
  font-size: 14px;
  color: #333;
  height: 100%;

  .avatar {
    align-self: flex-start;
    min-width: 28px;
    height: 28px;
    border-radius: 50%;
  }

  span {
    margin-left: 10px;
  }

  @keyframes brighten {
    50% {
      background-color: #9ac5f3;
    }

    100% {
      background-color: #6ca4f4;
    }
  }

  .loadwrap {
    display: flex;

    .loader {
      display: flex;
      transition: all 0.4s;
      align-items: center;
    }

    .loader div {
      margin-left: 5px;
      background-color: #b6d9f2;
      border-radius: 100%;
      height: 5px;
      width: 5px;
    }

    .box-load1 {
      animation: brighten 1.2s infinite;
    }

    .box-load2 {
      animation: brighten 1.2s infinite;
      animation-delay: 0.3s;
    }

    .box-load3 {
      animation: brighten 1.2s infinite;
      animation-delay: 0.6s;
    }
  }
}
</style>
