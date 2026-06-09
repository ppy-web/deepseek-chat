<template>
  <NTooltip trigger="hover">
    <template #trigger>
      <NButton
        class="theme-toggle"
        quaternary
        size="small"
        :aria-label="toggleLabel"
        @click="handleToggle"
      >
        <template #icon>
          <i-streamline-stickies-color:sun v-if="app.isDark" class="text-lg" />
          <i-streamline-stickies-color:sun-clound-weather v-else class="text-lg" />
        </template>
      </NButton>
    </template>
    {{ toggleLabel }}
  </NTooltip>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { NButton, NTooltip } from "naive-ui";
import { useAppStore } from "@/store";

const app = useAppStore();

const toggleLabel = computed(() => (app.isDark ? "切换到日间模式" : "切换到夜间模式"));

const handleToggle = () => {
  app.toggleTheme();
};
</script>

<style scoped>
.theme-toggle {
  width: 32px;
  height: 32px;
  color: var(--text-primary);
  background: var(--bg-secondary);
}

.theme-toggle:hover {
  background: var(--hover-bg);
}
</style>
