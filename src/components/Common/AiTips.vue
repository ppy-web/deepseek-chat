<!-- 用于底部显示版权信息 -->
<template>
  <div class="tip text-center fixed w-full text-sm text-gray-400 py-2.5 mt-auto bottom-0">
    {{ tip }}
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  tip?: string;
}>(), {
  tip: "AI会犯错，请自行甄别",
});
</script>
