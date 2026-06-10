import { computed, ref } from "vue";
import { recognizeSpeech } from "@/service/speech";

type SpeechInputStatus = "idle" | "recording" | "recognizing";

interface UseSpeechInputOptions {
  language?: string;
  maxRecordSeconds?: number;
  onRecognized?: (text: string) => void;
  onError?: (message: string) => void;
}

type LegacyGetUserMedia = (
  constraints: MediaStreamConstraints,
  successCallback: (stream: MediaStream) => void,
  errorCallback: (error: DOMException) => void
) => void;

interface LegacyNavigator extends Navigator {
  getUserMedia?: LegacyGetUserMedia;
  webkitGetUserMedia?: LegacyGetUserMedia;
  mozGetUserMedia?: LegacyGetUserMedia;
  msGetUserMedia?: LegacyGetUserMedia;
}

interface AudioWindow extends Window {
  webkitAudioContext?: typeof AudioContext;
}

const DEFAULT_MAX_RECORD_SECONDS = 30;
const TARGET_SAMPLE_RATE = 16000;

const status = ref<SpeechInputStatus>("idle");
const remainSeconds = ref(DEFAULT_MAX_RECORD_SECONDS);

let timer: ReturnType<typeof setInterval> | null = null;
let mediaStream: MediaStream | null = null;
let audioContext: AudioContext | null = null;
let sourceNode: MediaStreamAudioSourceNode | null = null;
let processorNode: ScriptProcessorNode | null = null;
let silentGainNode: GainNode | null = null;
let recordedChunks: Float32Array[] = [];
let inputSampleRate = TARGET_SAMPLE_RATE;

const clearTimer = () => {
  if (!timer) return;
  clearInterval(timer);
  timer = null;
};

const cleanupRecorder = () => {
  processorNode?.disconnect();
  sourceNode?.disconnect();
  silentGainNode?.disconnect();
  mediaStream?.getTracks().forEach((track) => track.stop());
  void audioContext?.close();

  processorNode = null;
  sourceNode = null;
  silentGainNode = null;
  mediaStream = null;
  audioContext = null;
};

const mergeAudioChunks = (chunks: Float32Array[]) => {
  const length = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const result = new Float32Array(length);
  let offset = 0;

  chunks.forEach((chunk) => {
    result.set(chunk, offset);
    offset += chunk.length;
  });

  return result;
};

const resampleAudio = (samples: Float32Array, fromSampleRate: number, toSampleRate: number) => {
  if (fromSampleRate === toSampleRate) return samples;

  const ratio = fromSampleRate / toSampleRate;
  const newLength = Math.round(samples.length / ratio);
  const result = new Float32Array(newLength);

  for (let index = 0; index < newLength; index += 1) {
    const sourceIndex = index * ratio;
    const before = Math.floor(sourceIndex);
    const after = Math.min(before + 1, samples.length - 1);
    const weight = sourceIndex - before;
    result[index] = samples[before] * (1 - weight) + samples[after] * weight;
  }

  return result;
};

const writeString = (view: DataView, offset: number, value: string) => {
  for (let index = 0; index < value.length; index += 1) {
    view.setUint8(offset + index, value.charCodeAt(index));
  }
};

const encodeWav = (samples: Float32Array, sampleRate: number) => {
  const bytesPerSample = 2;
  const blockAlign = bytesPerSample;
  const buffer = new ArrayBuffer(44 + samples.length * bytesPerSample);
  const view = new DataView(buffer);

  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + samples.length * bytesPerSample, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, "data");
  view.setUint32(40, samples.length * bytesPerSample, true);

  let offset = 44;
  for (let index = 0; index < samples.length; index += 1, offset += 2) {
    const sample = Math.max(-1, Math.min(1, samples[index]));
    view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
  }

  return new Blob([view], { type: "audio/wav" });
};

const blobToDataUrl = (blob: Blob) => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error || new Error("音频读取失败"));
    reader.readAsDataURL(blob);
  });
};

const getMicrophoneStream = (constraints: MediaStreamConstraints) => {
  if (typeof navigator === "undefined") {
    return Promise.reject(new Error("当前运行环境不支持麦克风录音"));
  }

  if (navigator.mediaDevices?.getUserMedia) {
    return navigator.mediaDevices.getUserMedia(constraints);
  }

  const legacyNavigator = navigator as LegacyNavigator;
  const legacyGetUserMedia =
    legacyNavigator.getUserMedia ||
    legacyNavigator.webkitGetUserMedia ||
    legacyNavigator.mozGetUserMedia ||
    legacyNavigator.msGetUserMedia;

  if (legacyGetUserMedia) {
    return new Promise<MediaStream>((resolve, reject) => {
      legacyGetUserMedia.call(legacyNavigator, constraints, resolve, reject);
    });
  }

  if (typeof window !== "undefined" && window.isSecureContext === false) {
    return Promise.reject(
      new Error("当前页面不是安全上下文，浏览器禁止访问麦克风。请使用 http://127.0.0.1:3020/deepseek-chat/ 或 HTTPS 地址打开。")
    );
  }

  return Promise.reject(
    new Error("当前浏览器不支持麦克风录音 API，请使用 Chrome 或 Edge，并检查麦克风权限。")
  );
};

const createAudioContext = () => {
  if (typeof window === "undefined") {
    throw new Error("当前运行环境不支持音频录制");
  }

  const AudioContextConstructor = window.AudioContext || (window as AudioWindow).webkitAudioContext;
  if (!AudioContextConstructor) {
    throw new Error("当前浏览器不支持 Web Audio，请使用 Chrome 或 Edge。");
  }

  return new AudioContextConstructor();
};

export function useSpeechInput(options: UseSpeechInputOptions = {}) {
  const maxRecordSeconds = options.maxRecordSeconds || DEFAULT_MAX_RECORD_SECONDS;
  const language = options.language || "auto";

  const resetState = () => {
    clearTimer();
    cleanupRecorder();
    status.value = "idle";
    remainSeconds.value = maxRecordSeconds;
  };

  const emitText = (text: string) => {
    const normalizedText = text.trim();
    if (!normalizedText) {
      options.onError?.("未识别到语音内容");
      return;
    }
    options.onRecognized?.(normalizedText);
  };

  const recognizeRecordedAudio = async () => {
    if (!recordedChunks.length) {
      throw new Error("录音失败，请检查麦克风是否被占用");
    }

    const samples = mergeAudioChunks(recordedChunks);
    const resampled = resampleAudio(samples, inputSampleRate, TARGET_SAMPLE_RATE);
    const audioData = await blobToDataUrl(encodeWav(resampled, TARGET_SAMPLE_RATE));
    const result = await recognizeSpeech(audioData, language);
    emitText(result.text || "");
  };

  const stop = () => {
    if (status.value !== "recording") return;

    clearTimer();
    cleanupRecorder();
    status.value = "recognizing";

    void recognizeRecordedAudio()
      .catch((error) => {
        options.onError?.(error instanceof Error ? error.message : "语音识别失败");
      })
      .finally(() => {
        recordedChunks = [];
        status.value = "idle";
        remainSeconds.value = maxRecordSeconds;
      });
  };

  const startTimer = () => {
    clearTimer();
    remainSeconds.value = maxRecordSeconds;
    timer = setInterval(() => {
      remainSeconds.value -= 1;
      if (remainSeconds.value <= 0) {
        stop();
      }
    }, 1000);
  };

  const start = async () => {
    if (status.value !== "idle") return;

    try {
      recordedChunks = [];
      mediaStream = await getMicrophoneStream({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      audioContext = createAudioContext();
      inputSampleRate = audioContext.sampleRate;
      sourceNode = audioContext.createMediaStreamSource(mediaStream);
      processorNode = audioContext.createScriptProcessor(4096, 1, 1);
      silentGainNode = audioContext.createGain();
      silentGainNode.gain.value = 0;
      processorNode.onaudioprocess = (event) => {
        if (status.value !== "recording") return;
        recordedChunks.push(new Float32Array(event.inputBuffer.getChannelData(0)));
      };
      sourceNode.connect(processorNode);
      processorNode.connect(silentGainNode);
      silentGainNode.connect(audioContext.destination);
      status.value = "recording";
      startTimer();
    } catch (error) {
      resetState();
      const message =
        error instanceof DOMException && error.name === "NotAllowedError"
          ? "无法访问麦克风，请检查浏览器授权"
          : error instanceof Error
            ? error.message
            : "语音录制启动失败";
      options.onError?.(message);
    }
  };

  const cancel = () => {
    recordedChunks = [];
    resetState();
  };

  return {
    status: computed(() => status.value),
    isRecording: computed(() => status.value === "recording"),
    isRecognizing: computed(() => status.value === "recognizing"),
    remainSeconds: computed(() => remainSeconds.value),
    start,
    stop,
    cancel,
  };
}
