import { defineStore } from "pinia";
import { merge } from "lodash-es";
import { storage } from "@/utils";
import { CHARACTHER } from "@/constants";
import { formatDate } from "@/utils";

const useCallwordStore = defineStore("callword", function () {
  // 从本地存储中获取数据
  const insistance = storage.get("callWord");
  const callWord = reactive({
    appName: insistance?.appName || '小漫同学',
    character: 1,
    hobby: '',
    localDateTime: formatDate(new Date()),
    mood: '',
    desc: ''
  });
  function set(data) {
    merge(callWord, data);
    storage.set("callWord", info);
  }
  function clear() {
    storage.remove("callWord");
  }
  return {
    name: computed(() => callWord.appName),
    text: computed(() => {
      const text = CHARACTHER[callWord.character - 1].word
      const userPrompt = callWord.hobby ? `用户信息是：${callWord.hobby}` : ''
      return `你的代号是${callWord.appName}。 ${text} ${userPrompt}，当前时间：${callWord.localDateTime}。用户要求：${callWord.desc}`
    }),
    set,
    clear,
  };
});
export default useCallwordStore