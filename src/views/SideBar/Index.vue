<template>
  <div class="sidebar-shell" @mouseleave="handleFixed">
    <TopInfo />
    <div class="sidebar-history">
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
.sidebar-shell {
  display: flex;
  height: 100%;
  min-height: 0;
  flex-direction: column;
  gap: 12px;
}

.sidebar-history {
  min-height: 0;
  flex: 1;
  overflow: hidden;
}
</style>
