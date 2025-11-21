<!-- 操作栏 -->
<template>
  <div class="action-container">
    <div class="action-list animate__animated">
      <div class="action-item" :class="{ animate__heartBeat: isClickCopy }" @click="onHandleCopy">
        <el-tooltip effect="customized" content="复制" placement="top">
          <i-lucide:copy />
        </el-tooltip>
      </div>
      <div class="action-item" :class="{ animate__heartBeat: isClickLike }" @click="onHandleLike">
        <el-tooltip effect="customized" content="喜欢" placement="top">
          <i-lucide:heart />
        </el-tooltip>
      </div>
      <div class="action-item" :class="{ animate__heartBeat: isClickUnLike }" @click="onHandleTread">
        <el-tooltip effect="customized" content="不喜欢" placement="top">
          <i-lucide:heart-crack />
        </el-tooltip>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { smartCopy } from "@/utils";
import message from "@/hooks/useMsg";

const emit = defineEmits(["like", "unlike"]);

const props = defineProps({
  content: String,
  status: {
    type: String,
    default: "0",
  },
});
const isClickCopy = ref(false);
const isClickLike = ref(false);
const isClickUnLike = ref(false);
const evaluteValue = ref("");

const onHandleCopy = async () => {
  isClickCopy.value = true;
  setTimeout(() => {
    isClickCopy.value = false;
  }, 1000);
  const result = await smartCopy(props.content);
  result.success && message.success("复制成功");
};

const onHandleLike = () => {
  isClickLike.value = true;
  emit("like");
  setTimeout(() => {
    isClickLike.value = false;
  }, 1000);
};

const onHandleTread = () => {
  evaluteValue.value = "";
  isClickUnLike.value = true;
  setTimeout(() => {
    isClickUnLike.value = false;
  }, 1000);
};
</script>

<style lang="scss" scoped>
.action-container {
  margin-top: 10px;
  .action-list {
    gap: 10px;
    display: flex;
    align-items: center;
    width: 100%;

    .action-item {
      cursor: pointer;
      font-size: 18px;
    }
  }
}
</style>
