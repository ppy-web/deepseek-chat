<!-- 新对话的欢迎语 -->
<script setup>
import { onMounted } from "vue";
import Typed from "typed.js";
import { useAppStore } from "@/store"

const app = useAppStore()
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
      <i-streamline-stickies-color:snowman class="mr-2" />
      <div class="welcome">Hi，我是 {{ app.appName }}</div>
      <div class="desc" id="desc"></div>
    </div>

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

    .welcome {
      font-size: 26px;
      font-weight: 500;
      color: #999;
    }
  }

  .desc {
    transition: all .3s ease-in-out;
    background: linear-gradient(to right, #21f05f, #21aef0 50%,
        #cd85f7 100%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    user-select: none;
    cursor: pointer;
    font-weight: 500;
    font-size: 26px;
    letter-spacing: 2px;
    display: inline-block;
    margin: 16px 5px;
  }

  .typed-cursor {
    display: none;
  }
}
</style>
