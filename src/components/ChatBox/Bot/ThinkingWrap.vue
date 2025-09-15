<!-- 用于展示深度思考内容 -->
<template>
  <div class="thinking-wrap" v-if="html" :class="{ 'thinking-hide': !show }">
    <div class="thinking" @click="show = !show">
      <span>{{ finished ? `已深度思考(用时${second}秒)` : "思考中..." }}</span>
      <el-icon class="arrows"><ArrowDown color="#666666" /></el-icon>
    </div>
    <Transition>
      <span class="rich-text-thingking" v-html="html"></span>
    </Transition>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { ArrowDown } from "@element-plus/icons-vue";

const props = defineProps({
  html: {
    type: String,
    default: "",
  },
  finished: {
    type: Boolean,
    default: false,
  },
  second: {
    type: Number,
    default: 0,
  },
});
const show = ref(true);
</script>

<style lang="scss" scoped>
.thinking-wrap {
  margin-bottom: 10px;
  .thinking {
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    width: fit-content;
    color: #666666;
    border-radius: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
  }
  .arrows {
    transform: rotate(-180deg);
    transition: transform 0.3s ease;
  }
  .rich-text-thingking {
    display: inline-block;
    position: relative;
    padding-left: 13px;
    color: #8b8b8b;
    line-height: 1.3;
    font-size: 13px;
    &::before {
      content: " ";
      border-left: 2px solid #e5e5e5;
      height: calc(100% - 10px);
      margin-top: 5px;
      position: absolute;
      top: 0;
      left: 0;
    }
  }
}
.thinking-hide {
  .rich-text-thingking {
    display: none;
  }
  .arrows {
    transform: rotate(0deg);
  }
}
</style>
