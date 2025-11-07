<template>
  <div class="call-word">
    <div class="text-3xl font-bold underline" @click="alertEffects">性格设置</div>
  </div>
</template>

<script setup>
function alertEffects() {
  alert('功能开发中')
}

</script>

<style lang="scss">
.call-word {
  text-align: center;
  margin-top: 20px;
  padding: 15px;
  border: 1px solid #ccc;
  border-radius: 10px;
  user-select: none;
  cursor: pointer;
}
</style>
