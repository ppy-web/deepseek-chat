<script setup>
import { ref, inject } from "vue";
import BotHello from "./BotHello.vue";

const bannerPng = inject("customerBigLogo");
const showBg = ref(true);
const handleImageError = (e) => {
  showBg.value = false;
};
</script>

<template>
  <div class="header-container">
    <div class="image-container" v-if="bannerPng && showBg">
      <img :src="bannerPng" @error="handleImageError" />
    </div>
    <BotHello />
  </div>
</template>

<style lang="scss" scoped>
.header-container {
  display: inline-block;
  width: 100%;
  margin-bottom: 15px;
  // transform: translateY(-7.5vh);
  .image-container {
    width: 100%;
    text-align: center;
  }
}
</style>
