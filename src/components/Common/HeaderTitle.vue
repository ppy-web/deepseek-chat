<!-- 用于统一展示卡片标题 -->
<script setup>
const props = defineProps({
  title: {
    type: String,
    default: "常用应用",
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
      <span class="title">{{ title }}</span>
    </div>
    <div class="hot-header-r"><slot></slot></div>
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
      font-size: 18px;
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
  }
}
</style>
