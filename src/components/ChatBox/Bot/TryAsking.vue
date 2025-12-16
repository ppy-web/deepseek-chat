<!-- 用于展示试着问问 推荐问题 -->
<template>
  <div class="try-container">
    <div class="try-item animate__animated animate__zoomInLeft" v-for="(item, index) in list" :key="index"
      @click="emit('send', item)">
      <img class="try-item-img" :src="turnImg" alt="" />
      <span class="try-item-text" v-html="item"></span>
    </div>
  </div>
</template>

<script setup>
import turnImg from "@/assets/img/turnrightdown.png";
const emit = defineEmits(["send"]);
const props = defineProps({
  list: {
    type: Array,
    default: () => [],
  },
});
</script>

<style lang="scss" scoped>
.try-container {
  margin-top: 10px;
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  .try-item {
    margin: 4px 0;
    font-size: 14px;
    padding: 8px 14px;
    border-radius: 5px;
    background-color: #f4f4f4;
    color: #666666;
    display: flex;
    align-items: center;
    cursor: pointer;

    &-img {
      width: 20px;
      height: 15px;
      margin-right: 8px;
    }
  }
}
</style>
