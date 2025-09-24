<!-- 切换模型 -->
<template>
  <el-popover
    v-model:visible="showChangeModel"
    :width="250"
    trigger="click"
    placement="top"
    popper-class="exchange-model-popover"
    :show-arrow="false"
  >
    <div class="popover-content">
      <div
        class="model-item"
        v-for="(item, index) in MODELS"
        :key="index"
        :class="{ active: localModelIndex === index }"
        @click="onConfirmModel(item, index)"
      >
        <img :src="item.icon" />
        <div class="model-item-info">
          <div class="model-item-text">{{ item.text }}</div>
          <div class="model-item-des">{{ item.description }}</div>
        </div>
        <div class="check"></div>
      </div>
    </div>
    <template #reference>
      <div
        class="exchange-content"
        :class="{ touch: showChangeModel }"
        @click.stop="handleShowChangeModel"
      >
        <div class="modelName" id="model-name">{{ modelName }}</div>
        <div class="change-model"></div>
      </div>
    </template>
  </el-popover>
</template>
<script setup>
import { ref, computed, inject } from "vue";
import { useStore } from "@/hooks/useStore";
import { MODELS } from "@/constants";

const { config, app } = useStore();
const showBigModelList = computed(() => config.info.showBigModelList);
const showChangeModel = ref(false);
const localModelIndex = computed(() => app.info.localModelIndex);
const modelName = computed(() => MODELS[localModelIndex.value].text);
const model = computed(() => MODELS[localModelIndex.value].value);

const handleShowChangeModel = () => {
  if (showChangeModel.value) {
    showChangeModel.value = true;
  } else {
    showChangeModel.value = false;
  }
};

const onConfirmModel = (e, index) => {
  if (e.value === model.value) {
    showChangeModel.value = false;
    return;
  }
  app.set({
    localModelIndex: index,
  });
  showChangeModel.value = false;
};
</script>

<style lang="scss" scoped>
.exchange-content {
  display: flex;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.05);
  border: 1px solid #dfdfdf;
  border-radius: 16px;
  vertical-align: middle;
  height: 32px;
  line-height: 32px;
  margin-right: 8px;
  padding: 0 5px;
  cursor: pointer;
  user-select: none;
  .modelName {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: center;
    margin-left: 10px;
    vertical-align: middle;
    font-weight: 400;
    font-size: 14px;
    color: #181818;
  }
  .change-model {
    width: 16px;
    height: 16px;
    background-image: url("@/assets/img/arrow_down.png");
    margin-right: 2px;
    margin-left: 2px;
    background-size: 100%;
    background-repeat: no-repeat;
    background-position: center;
    transition: transform 0.3s ease;
  }
}
.touch {
  background-color: #e5efff;
  border: 1px solid #2090fe;
  .modelName {
    color: #2090fe;
  }
  .change-model {
    transform: rotate(-180deg);
  }
}
</style>
