<template>
  <div class="i-message">
    <span class="content">
      <icon-error class="icon"/>
      <span class="text">{{ text }}</span>
    </span>
  </div>
</template>
<script setup lang="ts">
import IconError from './icons/IconError.vue'
defineProps<{
  text: string,
  type: string
}>()
</script>
<style scoped>
.i-message{
  position: fixed;
  top: 10px;
  left: 0;
  width: 100%;
  z-index: 1000;
  display: flex;
  justify-content: center;
  .content{
    background: #fef0f0;
    border: 1px solid #fde2e2;
    color: #f56c6c;
    height: 39px;
    padding: 0 15px;
    border-radius: 4px;
    display:flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    .text{
      font-size: 14px;
      line-height: 1;
    }
    .icon{
      width: 15px;
      height: 15px;
    }
  }
}
</style>