<!-- 录音开关和图标 -->
<template>
  <div class="voice-container" @click.stop="changeType()">
    <div class="speech" v-show="speechStatus === 0">
      <el-tooltip
        effect="customized"
        content="语音输入（功能开发中）"
        placement="top"
      >
        <img :src="voiceImg" />
      </el-tooltip>
    </div>
    <el-tooltip effect="customized" :content="voiceStatusText" placement="top">
      <div class="voice-bars-container" v-show="speechStatus === 1">
        <div class="voice-bars">
          <div
            v-for="(bar, index) in bars"
            :key="index"
            class="bar"
            :class="[`bar-${index + 1}`, { loading: isLoading }]"
            :style="{
              '--base-height': `${barHeight[index]}px`,
              '--bar-color': color,
              '--bar-width': `${barWidth}px`,
              'animation-delay': `${index * 0.1}s`,
              opacity: currentVolume * 0.5 + 0.5,
            }"
          ></div>
        </div>
      </div>
    </el-tooltip>
    <!-- <div class="volume-indicator">{{ (currentVolume * 100).toFixed(0) }}%</div> -->
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from "vue";
import * as service from "@/service/api";
import { useVoiceRecord } from "@/hooks/useVoiceRecord";
import { useStore } from "@/hooks/useStore";
import { useMitt } from "@/hooks/useMitt";
import EVENT_TYPE from "@/constants/event_type";
import voiceImg from "@/assets/img/phone_voice.png";
import message from "@/hooks/useMessage";
const { app } = useStore();
const emit = defineEmits(["send"]);
const props = defineProps({
  barCount: {
    type: Number,
    default: 5,
    validator: (value) => value >= 3 && value <= 9,
  },
  // 音柱颜色
  color: {
    type: String,
    default: "#1677fe",
  },
  // 音柱宽度
  barWidth: {
    type: Number,
    default: 3,
  },
  // 最大高度
  maxHeight: {
    type: Number,
    default: 10,
  },
  // 音量敏感度
  sensitivity: {
    type: Number,
    default: 1,
  },
});
const voiceRecordIsOpen = computed(() => app.info.voiceRecordIsOpen);
const bars = computed(() => Array.from({ length: props.barCount }));
const MAX_RECORD_TIME = 30;
const isLoading = ref(0);
const voiceRecord = useVoiceRecord();
const mitt = useMitt();
// 剩余时间
const remainTime = ref(MAX_RECORD_TIME);
// 倒计时定时器
const timer = ref(null);
// 语音按钮状态 0: 停止 1: 录音
const speechStatus = ref(0);
// 计算中间高两边低的音柱高度
const barHeight = computed(() => {
  const heights = [];
  if (isLoading.value) {
    for (let i = 0; i < props.barCount; i++) {
      heights.push(props.maxHeight * 0.4);
    }
  } else {
    const middleIndex = Math.floor(props.barCount / 2);
    for (let i = 0; i < props.barCount; i++) {
      const distanceFromMiddle = Math.abs(i - middleIndex);
      const height = props.maxHeight * (1 - distanceFromMiddle * 0.1);
      const dynamicHeight =
        height * (0.5 + currentVolume.value * props.sensitivity);
      heights.push(Math.max(dynamicHeight, props.maxHeight * 0.4));
    }
  }
  return heights;
});
// 获取音柱基础高度（中间高两边低）
const getBarHeight = (index) => {
  const middleIndex = Math.floor(props.barCount / 2);
  const distanceFromMiddle = Math.abs(index - middleIndex);
  const baseHeight = props.maxHeight * (1 - distanceFromMiddle * 0.2);
  const dynamicHeight =
    baseHeight * (0.5 + currentVolume.value * props.sensitivity);
  return Math.max(dynamicHeight, props.maxHeight);
};
const voiceStatusText = computed(() => {
  if (isLoading.value === 0) {
    return `${remainTime.value}秒`;
  } else if (isLoading.value === 1) {
    return "加载中";
  } else if (isLoading.value === 2) {
    return "识别中";
  }
});

// 切换录音状态
const changeType = () => {
  if (speechStatus.value === 1) {
    stopRecordVoice();
    stopListening();
    return;
  } else {
    speechStatus.value = 1;
    openRecordVoice();
  }
};
/**
 * 录音成功打开回调函数
 */
const recOpenSuccess = () => {
  isLoading.value = 0;
  startRecordVoice();
  mitt.emit("change-voice-record-open-status", {
    status: true,
    type: 2,
  });
};

/**
 * 打开录音
 */
const openRecordVoice = () => {
  isLoading.value = 1;
  voiceRecord.recOpen(recOpenSuccess);
};

/**
 * 开始录音
 */
const startRecordVoice = () => {
  remainTime.value = MAX_RECORD_TIME;
  speechStatus.value = 1;
  voiceRecord.recStart();
  startListening();
  // 开始倒计时
  timer.value = setInterval(() => {
    remainTime.value--;
    if (remainTime.value <= 0) {
      stopRecordVoice();
    }
  }, 1000);
};

/**
 * 停止录音
 */
const stopRecordVoice = () => {
  clearInterval(timer.value);
  stopListening();
  if (speechStatus.value === 1) {
    voiceRecord.recStop(recStopCallback);
  }
};

/**
 * 录音停止回调函数
 */
const recStopCallback = (blob) => {
  voiceRecord.recClose(() => {
    console.log(`output->关闭录音`);
  });
  if (!blob || blob.size === 0) {
    speechStatus.value = 0;
    message.error(
      "录音失败,请检查是否有其他应用正在录音，或着您可以手动输入问题"
    );
    return;
  }
  const time = Date.now();
  const file = new File([blob], `${time}.mp3`, {
    type: "audio/mp3",
    lastModified: time,
  });
  const data = {
    file,
  };
  isLoading.value = 2;
  service
    .stt(data)
    .then((res) => {
      isLoading.value = 0;
      speechStatus.value = 0;
      res = JSON.parse(res);
      if (res.status === 20000000) {
        if (res.result) {
          emit("send", res.result);
        } else {
          message.warning("未识别到内容，请检查是否有其他应用占用录音");
        }
      } else {
        message.error("语音识别失败1");
      }
    })
    .catch(() => {
      isLoading.value = 0;
      speechStatus.value = 0;
      message.error("语音识别失败1");
    });
};

const isListening = ref(false);
const currentVolume = ref(0);
const audioContext = ref(null);
const analyser = ref(null);
const microphone = ref(null);
const dataArray = ref(null);
const animationFrameId = ref(null);
const smoothingFactor = 0.1; // 0-1之间，越小越平滑

// 开始监听麦克风
const startListening = async () => {
  try {
    audioContext.value = new (window.AudioContext ||
      window.webkitAudioContext)();
    analyser.value = audioContext.value.createAnalyser();
    analyser.value.fftSize = 32;

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    microphone.value = audioContext.value.createMediaStreamSource(stream);
    microphone.value.connect(analyser.value);

    dataArray.value = new Uint8Array(analyser.value.frequencyBinCount);
    isListening.value = true;
    updateVolume();
  } catch (error) {
    console.error("麦克风访问错误:", error);
  }
};

// 停止监听
const stopListening = () => {
  if (animationFrameId.value) {
    cancelAnimationFrame(animationFrameId.value);
    animationFrameId.value = null;
  }

  if (microphone.value) {
    microphone.value.disconnect();
    const tracks = microphone.value.mediaStream.getTracks();
    tracks.forEach((track) => track.stop());
    microphone.value = null;
  }

  if (audioContext.value && audioContext.value.state !== "closed") {
    audioContext.value.close();
  }

  isListening.value = false;
  currentVolume.value = 0;
};

// 更新音量数据
const minVolumeThreshold = 0.4; // 忽略微小音量
const responseDelay = 0.1; // 响应延迟(秒)
const lastUpdateTime = ref(0);

const updateVolume = (timestamp) => {
  if (!isListening.value || !analyser.value) return;
  analyser.value.getByteFrequencyData(dataArray.value);
  const rawVolume = Math.max(...dataArray.value) / 255;
  // 应用阈值
  const adjustedVolume = rawVolume < minVolumeThreshold ? 0 : rawVolume;

  // 限制更新频率
  if (timestamp - lastUpdateTime.value >= responseDelay * 1000) {
    currentVolume.value = adjustedVolume;
    lastUpdateTime.value = timestamp;
  }

  animationFrameId.value = requestAnimationFrame(updateVolume);
};
</script>

<style lang="scss" scoped>
.voice-container {
  margin-right: 10px;
  position: relative;
  .speech {
    width: 30px;
    height: 30px;
    cursor: pointer;
    &:hover {
      background: #e0e4ed;
      border-radius: 10px;
    }
    img {
      width: 100%;
    }
  }
  .volume-indicator {
    position: absolute;
    top: -18px;
    left: 50%;
    transform: translateX(-50%);
  }
  .voice-bars-container {
    width: 30px;
    height: 30px;
    border-radius: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #e0e4ed;
  }

  .voice-bars {
    display: flex;
    align-items: center;
    height: 20px;
    gap: 1px;
  }

  .bar {
    position: relative;
    width: var(--bar-width);
    height: var(--base-height);
    background: var(--bar-color);
    border-radius: 4px;
    animation: bar-animation 1.6s infinite ease-in-out;
    transform-origin: center center;
  }

  /* 为每个音柱设置不同的动画高度 */
  .bar-1 {
    animation-name: bar-animation-1;
  }
  .bar-2 {
    animation-name: bar-animation-2;
  }
  .bar-3 {
    animation-name: bar-animation-3;
  }
  .bar-4 {
    animation-name: bar-animation-2;
  }
  .bar-5 {
    animation-name: bar-animation-1;
  }

  /* Loading 状态下每个音柱的动画 */
  .bar-1.loading {
    animation-name: loading-animation-1, fade-pulse;
  }
  .bar-2.loading {
    animation-name: loading-animation-2, fade-pulse;
  }
  .bar-3.loading {
    animation-name: loading-animation-3, fade-pulse;
  }

  @keyframes bar-animation-1 {
    0%,
    100% {
      transform: scaleY(0.2);
    }
    50% {
      transform: scaleY(0.5);
    }
  }
  @keyframes bar-animation-2 {
    0%,
    100% {
      transform: scaleY(0.3);
    }
    50% {
      transform: scaleY(0.8);
    }
  }
  @keyframes bar-animation-3 {
    0%,
    100% {
      transform: scaleY(0.4);
    }
    50% {
      transform: scaleY(1);
    }
  }

  @keyframes loading-animation-1 {
    0%,
    100% {
      transform: scaleY(0.2);
    }
    50% {
      transform: scaleY(0.4);
    }
  }
  @keyframes loading-animation-2 {
    0%,
    100% {
      transform: scaleY(0.3);
    }
    50% {
      transform: scaleY(0.5);
    }
  }
  @keyframes loading-animation-3 {
    0%,
    100% {
      transform: scaleY(0.4);
    }
    50% {
      transform: scaleY(0.6);
    }
  }

  /* 最小高度波动 */
  @keyframes loading-animation {
    0%,
    100% {
      transform: scaleY(0.3);
    }
    50% {
      transform: scaleY(0.5);
    }
  }
  /* 渐隐效果 */
  @keyframes fade-pulse {
    0%,
    100% {
      opacity: 0.1;
    }
    50% {
      opacity: 0.5;
    }
  }

  /* Loading 状态时的样式 */
  .bar.loading {
    //  loading-animation 1.5s infinite ease-in-out,
    animation: fade-pulse 2s infinite ease-in-out;
    opacity: 0.8;
  }
}
</style>
