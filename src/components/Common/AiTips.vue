<!-- 用于底部显示版权信息 -->
<template>
  <div class="tip">{{ tip }}</div>
</template>
<script setup>
import { ref } from "vue";
// const tip = ref('内容由AI生成，请仔细甄别')
const props = defineProps({
  tip: {
    type: String,
    default: "内容由AI生成，重要信息请自行甄别",
  },
});
</script>

<style lang="scss" scoped>
.tip {
  text-align: center;
  position: fixed;
  width: 100%;
  font-size: 12px;
  color: #cccccc;
  padding: 10px 0;
  margin-top: auto;
  bottom: 0;
  font-size: 14px;
}
</style>
