<!-- 新对话的欢迎语 -->
<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useCallwordStore } from "@/store";

const callword = useCallwordStore();
const desc = `Hi，我是${callword.name} 今天想聊些什么？`;
const displayText = ref('');
const showCursor = ref(true);

onMounted(() => {
  let i = 0;
  const timer = setInterval(() => {
    if (i < desc.length) {
      displayText.value += desc[i];
      i++;
    } else {
      clearInterval(timer);
      setTimeout(() => {
        showCursor.value = false;
      }, 1000);
    }
  }, 50);
});
</script>

<template>
  <div class="desc select-none cursor-pointer font-medium text-2xl leading-8 h-8 break-words text-center">
    {{ displayText }}<span v-if="showCursor" class="cursor-blink">|</span>
  </div>
</template>

<style scoped>
.desc {
  transition: all 0.3s ease-in-out;
  background: var(--text-primary);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

@keyframes blink {

  0%,
  50% {
    opacity: 1;
  }

  51%,
  100% {
    opacity: 0;
  }
}

.cursor-blink {
  animation: blink 1s infinite;
  font-weight: 100;
}
</style>
