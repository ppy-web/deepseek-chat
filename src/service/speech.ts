export interface SpeechToTextResponse {
  text: string;
  usage?: {
    seconds?: number;
    audio_tokens?: number;
    input_tokens?: number;
    output_tokens?: number;
    total_tokens?: number;
    [key: string]: unknown;
  };
}

export interface TextToSpeechRequest {
  id: string;
  text: string;
  mode?: "voice_design";
  voiceDesignPrompt?: string;
}

export interface SpeechRecognizeRequest {
  audio_data: string;
  language: string;
}

export const SPEECH_RECOGNIZE_UPSTREAM_URL =
  "https://tts.lideyong.fun/api/v1/speech/recognize";

export const SPEECH_RECOGNIZE_URL = "/speech-api/api/v1/speech/recognize";

export const TTS_UPSTREAM_URL =
  "https://tts.lideyong.fun/virtualhuman/speech/synthesis/1103?mode=voice_design&voice_design_prompt=台湾甜妹，台湾腔，声音甜美、软萌、亲近，语速轻快，带一点黏人感和撒娇气质，声音清晰可懂，适合轻松日常、聊天向内容。";

export const DEFAULT_TTS_URL =
  "/tts-ws/virtualhuman/speech/synthesis/1103?mode=voice_design&voice_design_prompt=台湾甜妹，声音甜美、软萌、亲近，语速轻快，带一点黏人感和撒娇气质，声音清晰可懂，适合轻松日常、聊天向内容。";

export async function recognizeSpeech(
  audioData: string,
  language = "auto"
): Promise<SpeechToTextResponse> {
  const response = await fetch(SPEECH_RECOGNIZE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      audio_data: audioData,
      language,
    } satisfies SpeechRecognizeRequest),
  });

  if (!response.ok) {
    let message = "语音识别失败";
    try {
      const detail = await response.json();
      if (typeof detail?.detail === "string") {
        message = detail.detail;
      }
    } catch {
      // Keep the fallback message when the service does not return JSON.
    }
    throw new Error(message);
  }

  return response.json() as Promise<SpeechToTextResponse>;
}

export function getSpeechSynthesisWebSocketUrl(url = DEFAULT_TTS_URL): string {
  if (url.startsWith("ws://") || url.startsWith("wss://")) {
    return url;
  }

  if (url.startsWith("http://")) {
    return `ws://${url.slice("http://".length)}`;
  }

  if (url.startsWith("https://")) {
    return `wss://${url.slice("https://".length)}`;
  }

  if (typeof window === "undefined") {
    return url;
  }

  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.host}${url}`;
}
