<template>
  <!-- 侧边栏 -->
  <el-aside @mouseleave="handleFixed">
    <div class="sidebar-toggle" @click="toggleSideBar" />
    <TopInfo />
    <div class="sidebar-history">
      <History v-if="hasLogin" />
    </div>
    <AddBtn />
  </el-aside>
</template>

<script setup>
import { computed } from "vue";
import { useStore } from "@/hooks/useStore";
import TopInfo from "./TopInfo.vue";
import AddBtn from "./AddBtn.vue";
import History from "./History.vue";

const { app, user } = useStore();
const isSideBarVisible = computed(() => app.info.isSideBarVisible);
const isSmallPage = computed(() => app.info.isSmallPage);
const hasLogin = computed(() => user.info.hasLogin);

const toggleSideBar = () => {
  if (isSmallPage.value) {
    app.set({
      isSideBarVisible: false,
    });
    return;
  }
  app.set({
    isSideBarVisible: !isSideBarVisible.value,
  });
};
const handleFixed = () => {
  if (!isSmallPage.value) {
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
.sidebar-toggle {
  position: absolute;
  top: 12px;
  right: 12px;
  cursor: pointer;
  background-image: url("@/assets/img/sidebar.png");
  background-repeat: no-repeat;
  background-size: 14px;
  background-position: center center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  transition: all 0.3s;
  &:hover {
    background-color: #eee;
  }
}
.sidebar-history {
  flex: 1;
  overflow: hidden;
}
</style>
