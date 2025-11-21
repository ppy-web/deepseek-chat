<template>
  <div class="theme-toggle" @click="handleToggle">
    <i-streamline-stickies-color:sun v-if="app.isDark" class="theme-icon" />
    <i-streamline-stickies-color:sun-clound-weather v-else class="theme-icon" />
  </div>
</template>

<script setup>
import { useAppStore } from "@/store";

const app = useAppStore();

const handleToggle = () => {
  app.toggleTheme();
};
</script>

<style lang="scss" scoped>
.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  
  &:hover {
    background-color: var(--hover-bg);
  }
  
  .theme-icon {
    font-size: 18px;
  }
}
</style>

