import { defineStore } from "pinia";
import { computed, reactive } from "vue";
import { storage } from "@/utils";
import { CHARACTHER } from "@/constants";
import { formatDate } from "@/utils";

interface CallWordInfo {
  appName: string;
  character: number;
  hobby?: string;
  localDateTime: string;
  mood?: string;
  desc?: string;
}

const useCallwordStore = defineStore("callword", function () {
  const insistanceStr = storage.get("callWord");
  let parsedInsistance: Partial<CallWordInfo> = {};

  try {
    if (insistanceStr) parsedInsistance = JSON.parse(insistanceStr);
  } catch (e) {
    console.warn("Failed to parse callWord from storage");
  }

  const callWord = reactive<CallWordInfo>({
    appName: parsedInsistance?.appName || '小漫同学',
    character: parsedInsistance?.character || 1,
    hobby: parsedInsistance?.hobby,
    localDateTime: formatDate(new Date()),
    mood: parsedInsistance?.mood,
    desc: parsedInsistance?.desc,
  });

  function merge<T extends Record<string, unknown>>(target: T, source: Partial<T>): void {
    Object.keys(source).forEach((key) => {
      if (source[key] !== undefined) {
        (target as Record<string, unknown>)[key] = source[key];
      }
    });
  }

  function set(data: Partial<CallWordInfo>): void {
    merge(callWord as Record<string, unknown>, data as Record<string, unknown>);
    storage.set("callWord", JSON.stringify(callWord));
  }

  function get(): CallWordInfo {
    return callWord;
  }

  function clear(): void {
    storage.remove("callWord");
  }

  return {
    name: computed(() => callWord.appName),
    text: computed(() => {
      const text = CHARACTHER[callWord.character - 1].word;
      const userPrompt = callWord.hobby ? `用户信息是：${callWord.hobby}` : '';
      return `你的代号是${callWord.appName}。 ${text} ${userPrompt}，当前时间：${callWord.localDateTime}。用户要求：${callWord.desc}`;
    }),
    set,
    get,
    clear,
  };
});

export default useCallwordStore;
