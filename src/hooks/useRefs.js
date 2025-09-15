import { reactive } from "vue";

const refs = reactive({});

export function useRefs() {

  function setRefs(name) {
    return (el) => {
      refs[name] = el;
    };
  }

  return { refs, setRefs };
}
