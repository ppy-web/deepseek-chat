<template>
  <!-- 侧边栏 -->
  <el-aside @mouseleave="handleFixed">
    <TopInfo />
    <div class="sidebar-history">
      <History />
    </div>
    <AddBtn />
  </el-aside>
</template>

<script setup>
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

<style lang="scss" scoped>
.el-aside {
  letter-spacing: 0.1em;
}
.sidebar-history {
  flex: 1;
  overflow: hidden;
}
</style>
