import { reactive } from "vue";

interface RefsMap {
  [key: string]: HTMLElement | null;
}

const refs = reactive<RefsMap>({});

export function useRefs() {
  function setRefs(name: string) {
    return (el: HTMLElement | null) => {
      refs[name] = el;
    };
  }

  return { refs, setRefs };
}
