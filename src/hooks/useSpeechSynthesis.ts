import { computed, ref } from "vue";
import { DEFAULT_TTS_URL, getSpeechSynthesisWebSocketUrl } from "@/service/speech";

type SpeechPlaybackStatus = "idle" | "connecting" | "playing" | "paused";

interface SpeakTextOptions {
  id?: string;
  url?: string;
}

const HEARTBEAT_INTERVAL = 5000;
const SPEECH_CHUNK_MAX_LENGTH = 120;
const SPEECH_CHUNK_SEND_INTERVAL = 120;
const PCM_SAMPLE_RATE = 16000;
const CONNECTING_TIMEOUT = 20000;

const playbackStatus = ref<SpeechPlaybackStatus>("idle");
const currentSpeechId = ref("");
const lastError = ref("");

let ws: WebSocket | null = null;
let audioContext: AudioContext | null = null;
let nextPlayTime = 0;
let requestSerial = 0;
let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
let chunkSendTimer: ReturnType<typeof setTimeout> | null = null;
let idleTimer: ReturnType<typeof setTimeout> | null = null;
let connectingTimer: ReturnType<typeof setTimeout> | null = null;
let queuedChunks: string[] = [];
let activeSources = new Set<AudioBufferSourceNode>();

const clearHeartbeat = () => {
  if (!heartbeatTimer) return;
  clearInterval(heartbeatTimer);
  heartbeatTimer = null;
};

const clearChunkSendTimer = () => {
  if (!chunkSendTimer) return;
  clearTimeout(chunkSendTimer);
  chunkSendTimer = null;
};

const clearIdleTimer = () => {
  if (!idleTimer) return;
  clearTimeout(idleTimer);
  idleTimer = null;
};

const clearConnectingTimer = () => {
  if (!connectingTimer) return;
  clearTimeout(connectingTimer);
  connectingTimer = null;
};

const stopSpeechWithError = (message: string) => {
  lastError.value = message;
  stopSpeech({ keepError: true });
};

const sanitizeSpeechText = (text: string) => {
  return String(text || "")
    .replace(/(?:\\r\\n|\\n|\\r|\/n|\/r)+/gi, "。")
    .replace(/[\r\n]+/g, "。")
    .replace(/[ \t]+/g, " ")
    .replace(/。{2,}/g, "。")
    .trim();
};

const pushSpeechChunk = (chunks: string[], buffer: string, maxLength: number) => {
  const text = buffer.trim();
  if (!text) return;

  for (let index = 0; index < text.length; index += maxLength) {
    chunks.push(text.slice(index, index + maxLength));
  }
};

const splitSpeechText = (text: string, maxLength = SPEECH_CHUNK_MAX_LENGTH) => {
  const speechText = sanitizeSpeechText(text);
  if (!speechText) return [];

  const chunks: string[] = [];
  const sentences = speechText.match(/[^。！？!?；;，,]+[。！？!?；;，,]?/g) || [speechText];
  let buffer = "";

  sentences.forEach((sentence) => {
    if (sentence.length > maxLength) {
      pushSpeechChunk(chunks, buffer, maxLength);
      buffer = "";
      pushSpeechChunk(chunks, sentence, maxLength);
      return;
    }

    if (buffer && buffer.length + sentence.length > maxLength) {
      pushSpeechChunk(chunks, buffer, maxLength);
      buffer = sentence;
      return;
    }

    buffer += sentence;
  });

  pushSpeechChunk(chunks, buffer, maxLength);
  return chunks;
};

const getAudioContext = () => {
  if (audioContext) return audioContext;
  audioContext = new AudioContext();
  nextPlayTime = audioContext.currentTime;
  return audioContext;
};

const pcm16ToAudioBuffer = (arrayBuffer: ArrayBuffer) => {
  const context = getAudioContext();
  const pcm = new Int16Array(arrayBuffer);
  const audioBuffer = context.createBuffer(1, pcm.length, PCM_SAMPLE_RATE);
  const channel = audioBuffer.getChannelData(0);

  for (let index = 0; index < pcm.length; index += 1) {
    channel[index] = Math.max(-1, Math.min(1, pcm[index] / 0x8000));
  }

  return audioBuffer;
};

const scheduleIdleCheck = () => {
  clearIdleTimer();
  if (!audioContext) return;

  const waitMs = Math.max((nextPlayTime - audioContext.currentTime) * 1000 + 300, 300);
  idleTimer = setTimeout(() => {
    if (activeSources.size || queuedChunks.length || ws?.readyState === WebSocket.CONNECTING) {
      scheduleIdleCheck();
      return;
    }

    if (playbackStatus.value === "playing") {
      stopSpeech();
    }
  }, waitMs);
};

const receiveAudioBuffer = (arrayBuffer: ArrayBuffer) => {
  if (!arrayBuffer.byteLength) return;

  const context = getAudioContext();
  const audioBuffer = pcm16ToAudioBuffer(arrayBuffer);
  const source = context.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(context.destination);

  const startTime = Math.max(nextPlayTime, context.currentTime + 0.02);
  nextPlayTime = startTime + audioBuffer.duration;
  activeSources.add(source);
  source.onended = () => {
    activeSources.delete(source);
    scheduleIdleCheck();
  };
  source.start(startTime);

  if (playbackStatus.value === "connecting") {
    clearConnectingTimer();
    playbackStatus.value = "playing";
  }
  scheduleIdleCheck();
};

const sendHeartbeat = () => {
  if (ws?.readyState !== WebSocket.OPEN) return;
  ws.send("ping");
};

const flushQueuedChunks = () => {
  if (chunkSendTimer || !queuedChunks.length || ws?.readyState !== WebSocket.OPEN) return;

  const sendNext = () => {
    chunkSendTimer = null;
    const chunk = queuedChunks.shift();
    if (!chunk || ws?.readyState !== WebSocket.OPEN) return;

    ws.send(chunk);
    if (queuedChunks.length) {
      chunkSendTimer = setTimeout(sendNext, SPEECH_CHUNK_SEND_INTERVAL);
    }
  };

  sendNext();
};

const handleTextMessage = (message: string) => {
  if (!message) return;

  if (message === "connect-success" || message.includes("connect-success")) {
    flushQueuedChunks();
    return;
  }

  if (message.startsWith("{")) {
    try {
      const data = JSON.parse(message) as { type?: string };
      if (data.type === "pong") return;
    } catch {
      // Ignore non-protocol JSON text.
    }
  }

  if (/data=error\b/.test(message)) {
    stopSpeechWithError("语音朗读服务返回错误");
  }
};

const connectWebSocket = (url: string) => {
  ws = new WebSocket(url);
  ws.binaryType = "arraybuffer";

  ws.onopen = () => {
    clearHeartbeat();
    heartbeatTimer = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);
    flushQueuedChunks();
  };

  ws.onmessage = async (event) => {
    if (typeof event.data === "string") {
      handleTextMessage(event.data);
      return;
    }

    if (event.data instanceof ArrayBuffer) {
      receiveAudioBuffer(event.data);
      return;
    }

    if (event.data instanceof Blob) {
      receiveAudioBuffer(await event.data.arrayBuffer());
    }
  };

  ws.onerror = () => {
    if (playbackStatus.value === "connecting") {
      stopSpeechWithError("语音朗读连接异常");
    }
  };

  ws.onclose = () => {
    clearHeartbeat();
    ws = null;
  };
};

function stopSpeech(options: { keepError?: boolean } = {}) {
  requestSerial += 1;
  clearHeartbeat();
  clearChunkSendTimer();
  clearIdleTimer();
  clearConnectingTimer();
  queuedChunks = [];

  activeSources.forEach((source) => {
    try {
      source.stop();
    } catch {
      // Source may already be stopped.
    }
  });
  activeSources = new Set<AudioBufferSourceNode>();

  if (ws) {
    ws.close();
    ws = null;
  }

  void audioContext?.close();
  audioContext = null;
  nextPlayTime = 0;
  currentSpeechId.value = "";
  playbackStatus.value = "idle";
  if (!options.keepError) {
    lastError.value = "";
  }
}

export function useSpeechSynthesis() {
  const speakText = async (text: string, options: SpeakTextOptions = {}) => {
    const content = sanitizeSpeechText(text);
    if (!content) return false;

    stopSpeech();
    const speechId = options.id || `${Date.now()}`;
    requestSerial += 1;
    currentSpeechId.value = speechId;
    playbackStatus.value = "connecting";
    lastError.value = "";
    queuedChunks = splitSpeechText(content);

    if (!queuedChunks.length) {
      stopSpeech();
      return false;
    }

    try {
      await getAudioContext().resume();
      connectWebSocket(getSpeechSynthesisWebSocketUrl(options.url || DEFAULT_TTS_URL));
      connectingTimer = setTimeout(() => {
        if (playbackStatus.value === "connecting") {
          stopSpeechWithError("语音朗读响应超时");
        }
      }, CONNECTING_TIMEOUT);
      return true;
    } catch (error) {
      stopSpeechWithError(error instanceof Error ? error.message : "语音朗读启动失败");
      return false;
    }
  };

  const pauseSpeech = () => {
    if (playbackStatus.value === "connecting") {
      stopSpeech();
      return;
    }

    if (playbackStatus.value !== "playing") return;

    void audioContext?.suspend();
    playbackStatus.value = "paused";
  };

  const resumeSpeech = () => {
    if (playbackStatus.value !== "paused") return;

    void audioContext?.resume();
    playbackStatus.value = "playing";
  };

  return {
    playbackStatus: computed(() => playbackStatus.value),
    currentSpeechId: computed(() => currentSpeechId.value),
    lastError: computed(() => lastError.value),
    speakText,
    pauseSpeech,
    resumeSpeech,
    stopSpeech,
  };
}
