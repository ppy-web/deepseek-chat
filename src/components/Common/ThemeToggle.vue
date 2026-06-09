<template>
  <div class="theme-toggle flex items-center justify-center w-8 h-8 rounded-lg cursor-pointer transition-all duration-300 bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--hover-bg)]"
    @click="handleToggle">
    <i-streamline-stickies-color:sun v-if="app.isDark" class="text-lg" />
    <i-streamline-stickies-color:sun-clound-weather v-else class="text-lg" />
  </div>
</template>

<script setup lang="ts">
import { useAppStore } from "@/store";

const app = useAppStore();

const handleToggle = () => {
  app.toggleTheme();
};
</script>
