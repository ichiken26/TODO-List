<template>
  <div class="priority-badge" :class="`priority-${priority}`">
    {{ priorityLabel }}
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { getPriorityLabel } from '~/composables/useTodos';

interface Props {
  priority: number;
}

const props = defineProps<Props>();

const priorityLabel = computed(() => getPriorityLabel(props.priority));
</script>

<style scoped>
.priority-badge {
  padding: 0.4rem 0.8rem;
  border-radius: 5px;
  font-size: 0.85rem;
  font-weight: bold;
  white-space: nowrap;
  text-align: center;
}

.priority-1 {
  background: #fee;
  color: #c33;
}

.priority-2 {
  background: #ffd;
  color: #cc6;
}

.priority-3 {
  background: #efe;
  color: #3c3;
}
</style>

