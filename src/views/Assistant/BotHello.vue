<!-- 新对话的欢迎语 -->
<script setup>
import { ref, computed, onMounted } from "vue";
import Typed from "typed.js";
import { useStore } from "@/hooks/useStore";
import deepseek from '@/assets/img/deepseek.svg';
const { config } = useStore();
const welcome = computed(
  () => config.info.welcomeMessage || "Hi，我是DeepSeek，很高兴为您服务～"
);
const desc = computed(
  () =>
    config.info.joinTips ||
    "作为你的智能伙伴，我既能写文案、想点子，又能陪你聊天～"
);

const showImagePeople = ref(false);

onMounted(() => {
  new Typed("#desc", {
    strings: [desc.value],
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
      img {
        width: 40px;
        height: 40px;
      }
    }
    .welcome {
      font-size: 30px;
      font-weight: bold;
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
