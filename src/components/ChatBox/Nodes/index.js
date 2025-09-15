import { shallowRef } from "vue";
import User from "./User.vue";
import Bot from "./Bot.vue";
const Nodes = shallowRef([]);
Nodes.value = [
  {
    component: User,
    type: "User",
  },
  {
    component: Bot,
    type: "Bot",
  },
];

export { Nodes };
