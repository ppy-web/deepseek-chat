<!-- 新对话的欢迎语 -->
<script setup>
import { onMounted } from "vue";
import Typed from "typed.js";
import deepseek from "@/assets/img/deepseek.svg";
const welcome = "Hi，我是小漫";
const desc = "今天想聊些什么？";
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
    margin-bottom: 16px;
  }

  .typed-cursor {
    display: none;
  }
}
</style>
