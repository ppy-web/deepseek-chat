<!-- 语音按钮，来自移动端，PC暂未使用 -->
<template>
  <div class="speech-wrapper">
    <span ref="el" class="btn">
      {{ btnMsg }}
    </span>
  </div>
  <div class="speech-box" v-if="speechStatus === 1">
    <div class="recording">
      <span>正在录音,剩余{{ remainTime }}秒</span>
      <div id="loading">
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>
      <span>松开发送,上滑取消</span>
    </div>
  </div>
</template>

<script setup>
import { useTemplateRef, onMounted, onUnmounted, computed, ref } from "vue";
import AlloyFinger from "alloyfinger";

import { useVoiceRecord } from "@/hooks/useVoiceRecord";
import { useMitt } from "@/hooks/useMitt";
import EVENT_TYPE from "@/constants/event_type";
import * as service from "@/service/api";

const MAX_RECORD_TIME = 30;

const voiceRecord = useVoiceRecord();
const mitt = useMitt();

// 语音按钮状态 0: 松开 1: 按住 2：发送中
const speechStatus = ref(0);
const btnMsg = computed(() => {
  if (speechStatus.value === 0) {
    return "按住说话";
  } else if (speechStatus.value === 1) {
    return "松开发送，时长不超过30秒";
  } else if (speechStatus.value === 2) {
    return "发送中";
  }
});
// 语音按钮
const el = useTemplateRef("el");
// 是否触发swipeUp
const emitSwipeUp = ref(false);
// 剩余时间
const remainTime = ref(MAX_RECORD_TIME);
// 倒计时定时器
const timer = ref(null);

/**
 * 开始录音
 */
const startRecordVoice = () => {
  remainTime.value = MAX_RECORD_TIME;
  speechStatus.value = 1;
  voiceRecord.recStart();
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
  if (speechStatus.value === 1) {
    voiceRecord.recStop(recStopCallback);
  }
};

/**
 * 录音停止回调函数
 */
const recStopCallback = (blob) => {
  if (!blob || blob.size === 0) {
    speechStatus.value = 0;
    Toast("录音失败,请检查是否有其他应用正在录音，或着您可以手动输入问题");
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
  speechStatus.value = 2;
  service
    .stt(data)
    .then((res) => {
      speechStatus.value = 0;
      res = JSON.parse(res);
      if (res.status === 20000000) {
        if (res.result) {
          mitt.emit(EVENT_TYPE.SEND_MESSAGE, res.result);
        } else {
          Toast("未识别到内容，请检查是否有其他应用占用录音");
        }
      } else {
        Toast("语音识别失败");
      }
    })
    .catch(() => {
      speechStatus.value = 0;
      Toast("语音识别失败");
    });
};

/**
 * 取消录音
 */
const cancelRecordVoice = () => {
  speechStatus.value = 0;
  clearInterval(timer.value);
  if (speechStatus.value === 1) {
    voiceRecord.recCancel();
  }
};

onMounted(() => {
  new AlloyFinger(el.value, {
    touchEnd: () => {
      setTimeout(() => {
        if (speechStatus.value === 1) {
          // 没有触发过swipeUp，就发送消息
          if (!emitSwipeUp.value) {
            stopRecordVoice();
          } else {
            cancelRecordVoice();
          }
        }
        emitSwipeUp.value = false;
      }, 50);
    },
    longTap: () => {
      if (speechStatus.value === 0) {
        startRecordVoice();
      }
    },
    swipe: (e) => {
      if (e.direction === "Up") {
        emitSwipeUp.value = true;
      }
    },
  });
});

onUnmounted(() => {});
</script>

<style lang="scss">
.speech-wrapper {
  color: #1b1b1b;
  position: relative;
  height: 0.68rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.32rem;
  font-weight: 500;
  margin-bottom: 0.2rem;
  .btn {
    width: 100%;
    height: 0.68rem;
    line-height: 0.68rem;
    text-align: center;
    border-radius: 0.35rem;
  }
}
.speech-box {
  width: 2.6rem;
  height: 2.6rem;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #7a92ad;
  border-radius: 0.16rem;
  text-align: center;
  font-size: 0.2rem;
  color: white;
  padding: 0.28rem;
  z-index: 99;
  div {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    #loading {
      width: 100%;
      height: 0.6rem;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      span {
        animation: load 0.8s ease infinite;
        display: inline-block;
        width: 0.06rem;
        height: 0.6rem;
        background-color: white;
        &:nth-child(1) {
          animation-delay: 0.2s;
        }
        &:nth-child(2) {
          animation-delay: 0.25s;
        }
        &:nth-child(3) {
          animation-delay: 0.3s;
        }
        &:nth-child(4) {
          animation-delay: 0.35s;
        }
        &:nth-child(5) {
          animation-delay: 0.25s;
        }
        &:nth-child(6) {
          animation-delay: 0.2s;
        }
        &:nth-child(7) {
          animation-delay: 0.25s;
        }
        &:nth-child(8) {
          animation-delay: 0.3s;
        }
        &:nth-child(9) {
          animation-delay: 0.35s;
        }
        &:nth-child(10) {
          animation-delay: 0.1s;
        }
        &:nth-child(11) {
          animation-delay: 0.25s;
        }
        &:nth-child(12) {
          animation-delay: 0.2s;
        }
      }
    }
  }
}

@keyframes load {
  0%,
  100% {
    height: 0.6rem;
    background-color: #ffffff;
  }
  50% {
    height: 0.2rem;
    background-color: #f9f5f5;
  }
}
</style>
