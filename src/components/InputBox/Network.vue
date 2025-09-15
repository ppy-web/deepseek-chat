<!-- 联网搜索 -->
<template>
  <div
    class="network"
    :class="{ 'touch-network': networkStatus }"
    @click="changeNStatus"
  >
    <div class="network-icon"></div>
    <div class="network-text" id="network-text">联网搜索</div>
  </div>
</template>
<script setup>
import { computed, inject } from "vue";
import { useStore } from "@/hooks/useStore";
const { config, app } = useStore();
const networkStatus = computed(() => app.info.networkStatus);
const verifyLogin = inject("verifyLogin");

const changeNStatus = () => {
  verifyLogin();
  app.set({
    networkStatus: !networkStatus.value,
  });
};
</script>

<style lang="scss">
.network {
  display: flex;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.05);
  border: 1px solid #dfdfdf;
  border-radius: 16px;
  height: 32px;
  line-height: 32px;
  cursor: pointer;
  user-select: none;
  .network-text {
    flex: 1;
    max-width: 100px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: center;
    margin-right: 12px;
    margin-left: -5px;
    vertical-align: middle;
    font-weight: 400;
    font-size: 14px;
    color: #181818;
    padding-left: 2px;
  }
  .network-icon {
    width: 18px;
    height: 18px;
    margin-left: 12px;
    margin-right: 10px;
    background-image: url("@/assets/img/net.png");
    background-size: 100%;
    background-repeat: no-repeat;
    background-position: center;
  }
}
.touch-network {
  background-color: #e5efff;
  border: 1px solid #2090fe;
  .network-text {
    color: #2090fe;
  }
  .network-icon {
    background-image: url("@/assets/img/netblue.png");
  }
}
</style>
