<template>
  <div class="stats-bar">
    <div class="stat-item">
      <span class="stat-label">総タスク数:</span>
      <span class="stat-value">{{ total }}</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">完了:</span>
      <span class="stat-value completed">{{ completed }}</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">残り:</span>
      <span class="stat-value remaining">{{ remaining }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  total: number;
  completed: number;
  remaining: number;
}

defineProps<Props>();
</script>

<style scoped>
.stats-bar {
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  display: flex;
  justify-content: space-around;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  flex-wrap: wrap;
  gap: 1rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.stat-label {
  font-size: 0.9rem;
  color: #666;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: #667eea;
}

.stat-value.completed {
  color: #4caf50;
}

.stat-value.remaining {
  color: #f5576c;
}

@media (max-width: 768px) {
  .stats-bar {
    flex-direction: column;
  }
}
</style>

