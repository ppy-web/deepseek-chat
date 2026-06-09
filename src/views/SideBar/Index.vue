<template>
  <!-- 侧边栏 -->
  <div @mouseleave="handleFixed" class="h-full flex flex-col letter-spacing-wide">
    <TopInfo />
    <div class="sidebar-history flex-1 overflow-hidden">
      <History />
    </div>
    <AddBtn />
  </div>
</template>

<script setup lang="ts">
import { useAppStore } from "@/store";
import TopInfo from "./TopInfo.vue";
import AddBtn from "./AddBtn.vue";
import History from "./History.vue";

const app = useAppStore();

const handleFixed = () => {
  if (!app.isSmallPage) {
    return;
  }
  app.set({
    isSidebarFixed: false,
  });
};
</script>

<style scoped>
.letter-spacing-wide {
  letter-spacing: 0.1em;
}
</style>
