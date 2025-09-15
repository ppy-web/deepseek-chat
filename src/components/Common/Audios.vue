<!-- mp3音频 -->
<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useStore } from "@/hooks/useStore";
import { useMitt } from "@/hooks/useMitt";
import EVENT_TYPE from "@/constants/event_type";

const { config, app } = useStore();
const mitt = useMitt();

const muted = computed(() => app.info.muted);
const isPlayStream = computed(() => app.info.isPlayStream);
const voicePlayFlag = computed(() => config.info.voicePlayFlag); // 语音播放标志位

// 使用多个audio主要是为了提前预加载mp3文件，以后播放流畅
const obj = {
  Welcome: 0,
  Apology: 1,
  Timeout: 2,
  Interact: 3,
};

const voiceArr = ref([
  {
    name: "Welcome",
    url: config.info.welcomeVoice,
  },
  {
    name: "Apology",
    url: config.info.apologyVoice,
  },
  {
    name: "Timeout",
    url: config.info.timeoutVoice,
  },
  {
    name: "Interact",
    url: config.info.interactHintVoice,
  },
]);

const voice = ref(new Map());

const voiceCallback = (name) => {
  voiceArr.value.forEach((item) => {
    // 循环遍历所有音频    正在播放的音频时间设置为0 并暂停
    if (!voice.value[obj[item.name]].ended) {
      voice.value[obj[item.name]].currentTime = 0;
      voice.value[obj[item.name]].pause();
    }
  });

  if (name) {
    setTimeout(() => {
      voice.value[obj[name]].play();
    }, 10);
  }
};

const voiceEnd = () => {
  app.set({
    isPlayMp3: false,
  });
};

onMounted(() => {
  mitt.on(EVENT_TYPE.PLAY_MP3, (name) => {
    if (voicePlayFlag.value === 3) return;
    if (isPlayStream.value) return;
    // 如果name 是要播放mp3   如果为空 则会停止所有mp3
    if (name) {
      app.set({
        isPlayMp3: true,
      });
    } else {
      app.set({
        isPlayMp3: false,
      });
    }
    voiceCallback(name);
  });

  voiceArr.value.forEach((item) => {
    voice.value[obj[item.name]].addEventListener("ended", voiceEnd);
  });
});

onUnmounted(() => {
  mitt.off(EVENT_TYPE.PLAY_MP3);

  voiceArr.value.forEach((item) => {
    if (voice.value[obj[item.name]]) {
      voice.value[obj[item.name]].removeEventListener("ended", voiceEnd);
    }
  });
});
</script>

<template>
  <div class="audio-component">
    <audio
      ref="voice"
      v-for="item in voiceArr"
      :key="item.name"
      :src="item.url"
      :muted="muted"
    />
  </div>
</template>

<style lang="scss">
.audio-component {
  opacity: 0;
}
</style>
