<template>
  <div class="loading">
    <p>{{ message || '読み込み中...' }}</p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  message?: string;
}

defineProps<Props>();
</script>

<style scoped>
.loading {
  text-align: center;
  padding: 3rem;
  color: #666;
}
</style>

