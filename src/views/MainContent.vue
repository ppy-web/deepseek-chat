<template>
  <el-container style="background-color: #fcfcfc">
    <div
      class="main-sidebar-toggle bg-t"
      @click="clickToggleSideBar"
      @mouseenter="hoverToggleSideBar"
      v-if="isSmallPage || !isSideBarVisible"
    ></div>
    <slot></slot>
  </el-container>
</template>

<script setup>
import { computed } from "vue";
import { useStore } from "@/hooks/useStore";

const { app } = useStore();
const isSideBarVisible = computed(() => app.info.isSideBarVisible);
const isSmallPage = computed(() => app.info.isSmallPage);

const clickToggleSideBar = () => {
  app.set({
    isSideBarVisible: true,
  });
};

const hoverToggleSideBar = () => {
  if (isSmallPage.value) {
    app.set({
      isSideBarVisible: true,
      isSidebarFixed: true,
      needTransition: false,
    });
  }
};
</script>

<style lang="scss">
.main-sidebar-toggle {
  position: absolute;
  top: 12px;
  left: 12px;
  cursor: pointer;
  background-image: url("@/assets/img/sidebar.png");
  background-repeat: no-repeat;
  background-size: 14px;
  background-position: center center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  transition: all 0.3s;
  z-index: 100;
  &:hover {
    background-color: #eee;
  }
}
</style>
