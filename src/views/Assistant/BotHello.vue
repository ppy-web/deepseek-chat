<!-- 新对话的欢迎语 -->
<script setup>
import {onMounted } from "vue";
import Typed from "typed.js";
import deepseek from "@/assets/img/deepseek.svg";
const welcome = "Hi，我是DeepSeek，很高兴为您服务～";
const desc = "我是DeepSeek，一个基于大模型开发的智能对话机器人，我可以回答您的问题，提供信息，甚至帮助您解决问题。";
onMounted(() => {
  new Typed("#desc", {
    strings: [desc],
    typeSpeed: 100,
    backSpeed: 100,
    backDelay: 1000,
    startDelay: 1000,
    loop: false,
  });
});
</script>

<template>
  <div class="hello-container">
    <div class="hello">
      <div class="image-people">
        <img :src="deepseek" alt="deepseek" />
      </div>
      <div class="welcome">{{ welcome }}</div>
    </div>
    <div class="desc" id="desc"></div>
  </div>
</template>

<style lang="scss">
.hello-container {
  width: 100%;
  min-height: 40px;
  text-align: center;
  .hello {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 5px;
    .image-people {
      display: inline-block;
      width: 40px;
      margin-right: 10px;
      img {
        width: 40px;
        vertical-align: middle;
      }
    }
    .welcome {
      font-size: 26px;
      font-weight: 500;
    }
  }
  .desc {
    font-weight: 400;
    font-size: 16px;
    color: rgba(0, 0, 0, 0.55);
    letter-spacing: 1px;
    margin-top: 16px;
  }
  .typed-cursor {
    display: none;
  }
}
</style>
