<!-- 新对话的欢迎语 -->
<script setup>
import Typed from "typed.js";
import { onMounted } from "vue";
import { useCallwordStore } from "@/store"

const callword = useCallwordStore()
const desc = `Hi，我是${callword.name} 今天想聊些什么？`;
onMounted(() => {
  new Typed("#desc", {
    strings: [desc],
    typeSpeed: 50,
    loop: false,
    cursorChar: '1', // 光标字符
  });
});
</script>

<template>
  <div class="desc" id="desc"></div>
</template>

<style>
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
  line-height: 32px;
  height: 32px;
  margin-bottom: 16px;
}

.typed-cursor {
  display: none;
}
</style>
