<!-- 用于统一修改弹窗标题和关闭按钮 -->
<script setup>
import { CloseBold } from "@element-plus/icons-vue";
const emit = defineEmits(["close"]);
const props = defineProps({
  title: {
    type: String,
    default: "提示",
  },
  showClose: {
    type: Boolean,
    default: true,
  },
  fontSize: {
    type: String,
    default: "18px",
  },
  icon: {
    type: String,
    default: "",
  },
});
</script>

<template>
  <div class="header-container">
    <div class="hot-header-l">
      <img v-if="icon" :src="icon" />
      <span class="title" :style="`font-size:${fontSize};`">{{ title }}</span>
    </div>
    <div class="hot-header-r" v-if="props.showClose">
      <span class="close" @click="emit('close')"
        ><el-icon><CloseBold /></el-icon
      ></span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.header-container {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  .hot-header-l {
    display: flex;
    align-items: center;
    img {
      width: 20px;
      height: 20px;
      margin-right: 5px;
    }
    .title {
      font-weight: bold;
      color: #333333;
    }
  }
  .hot-header-r {
    .more {
      font-size: 14px;
      font-weight: 400;
      color: #999999;
      cursor: pointer;
      margin-left: 10px;
      &:hover {
        color: #333;
      }
    }
    .close {
      display: inline-block;
      width: 40px;
      height: 40px;
      line-height: 40px;
      text-align: center;
      border-radius: 8px;
      cursor: pointer;
      &:hover {
        background: #f4f9fd;
      }
    }
  }
}
</style>
