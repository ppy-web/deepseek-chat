<!-- 用于展示AI头像和思考中状态-->
<template>
  <div class="AI">
    <img class="avatar" :src="botDefault" />
    <span v-if="props.pending"><i-svg-spinners:blocks-shuffle-3 width="20px" height="20px" /></span>
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
    color: #0bb343;
  }

  span {
    margin-left: 10px;
  }
}
</style>
