import { shallowRef } from "vue";
import User from "./User.vue";
import Bot from "./Bot.vue";
const Nodes = shallowRef([]);
Nodes.value = [
  {
    component: User,
    type: "user",
  },
  {
    component: Bot,
    type: "assistant",
  },
];

export { Nodes };
