<script setup>
import { useAppStore, useCallwordStore } from "@/store";
import CallWord from "./CallWord.vue";

const app = useAppStore();
const callword = useCallwordStore();

const toggleSideBar = () => {
  if (app.isSmallPage) {
    app.set({
      isSideBarVisible: false,
    });
  }
  app.set({
    isSideBarVisible: !app.isSideBarVisible,
  });
};

</script>

<template>
  <div class="flex row-auto items-center pb-4">
    <img class="w-12  rounded-full" :src="app.logo" />
    <span class="flex-1 h-15 pl-2 text-xl font-bold">{{ callword.name }}</span>
    <CallWord />
    <i-streamline-stickies-color:cancel-2-duo @click="toggleSideBar" class="ml-2" />

  </div>
</template>