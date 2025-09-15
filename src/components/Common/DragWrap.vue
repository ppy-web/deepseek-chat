<!-- 实现使用鼠标左右滑动的容器 -->
<template>
  <div
    class="table-drag-container"
    ref="container"
    @mousedown="startDrag"
    @touchstart.passive="startDrag"
    @mouseleave="endDrag"
    @mouseup="endDrag"
    @touchend="endDrag"
    @mousemove="onDrag"
    @touchmove.passive="onDrag"
  >
    <div class="table-wrapper" ref="wrapper" :class="warp ? 'warp' : ''">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
const props = defineProps({
  warp: {
    type: Boolean,
    default: false,
  },
});
const container = ref(null);
const wrapper = ref(null);
const dragState = ref({
  isDragging: false,
  startX: 0,
  scrollLeft: 0,
});

let lastScrollLeft = 0;

const startDrag = (e) => {
  const clientX = e.type.includes("touch") ? e.touches[0].clientX : e.pageX;
  dragState.value = {
    isDragging: true,
    startX: clientX - container.value.offsetLeft,
    scrollLeft: wrapper.value.scrollLeft,
  };
};

const endDrag = () => {
  if (!dragState.value.isDragging) return;
  dragState.value.isDragging = false;
  lastScrollLeft = wrapper.value.scrollLeft;
};

const onDrag = (e) => {
  if (!dragState.value.isDragging) return;
  e?.preventDefault();
  const clientX = e.type.includes("touch") ? e.touches[0].clientX : e.pageX;
  const x = clientX - container.value.offsetLeft;
  const walk = (x - dragState.value.startX) * 2;
  wrapper.value.scrollLeft = dragState.value.scrollLeft - walk;
};

onMounted(() => {
  lastScrollLeft = wrapper.value.scrollLeft;
  // 添加滚轮横向滚动
  container.value.addEventListener(
    "wheel",
    (e) => {
      e?.preventDefault();
      const step = 20;
      if (e.deltaY < 0) {
        wrapper.value.scrollLeft -= step;
      } else {
        wrapper.value.scrollLeft += step;
      }
    },
    { passive: false }
  );
});
</script>

<style lang="scss" scoped>
.table-drag-container {
  width: 100%;
  overflow-x: hidden;
  // cursor: grab;
  user-select: none;
}

.table-drag-container:active {
  // cursor: grabbing;
}

.table-wrapper {
  display: inline-block;
  white-space: nowrap;
  overflow-x: auto; /* 关键！允许水平滚动 */
  width: 100%; /* 确保容器宽度足够 */
  -webkit-overflow-scrolling: touch; /* 平滑滚动(iOS) */
}
.warp {
  white-space: normal;
  * {
    margin-bottom: 10px;
  }
}
// 去除滚动条
.table-wrapper::-webkit-scrollbar {
  display: none;
}
</style>
