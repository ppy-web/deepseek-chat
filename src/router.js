import { createRouter, createWebHistory } from "vue-router";
import Assistant from "@/views/Assistant/index.vue";
const routes = [
  {
    path: "/",
    component: Assistant,
    meta: {
      keepAlive: false,
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
