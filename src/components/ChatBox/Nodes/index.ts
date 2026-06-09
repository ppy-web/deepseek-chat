import { shallowRef, type Component } from "vue";
import User from "./User.vue";
import Bot from "./Bot.vue";

interface NodeConfig {
  component: Component;
  type: string;
}

const Nodes = shallowRef<NodeConfig[]>([
  {
    component: User,
    type: "user",
  },
  {
    component: Bot,
    type: "assistant",
  },
]);

export { Nodes };
