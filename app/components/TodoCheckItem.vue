<template>
  <div 
    class="todo-check-item"
    :class="{ 'checked': checked }"
  >
    <label class="checkbox-label">
      <input 
        type="checkbox" 
        :checked="checked"
        @change="handleChange"
        class="todo-checkbox"
      />
      <span class="checkbox-custom"></span>
      <div class="todo-content">
        <PriorityBadge :priority="todo.priority" />
        <span class="todo-text">{{ todo.todo }}</span>
      </div>
    </label>
  </div>
</template>

<script setup lang="ts">
import type { TodoItem } from '~/composables/useTodos';

interface Props {
  todo: TodoItem;
  checked: boolean;
}

interface Emits {
  (e: 'update:checked', value: boolean): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

const handleChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit('update:checked', target.checked);
};
</script>

<style scoped>
.todo-check-item {
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
}

.todo-check-item:hover {
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.todo-check-item.checked {
  opacity: 0.7;
  background: #f5f5f5;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  width: 100%;
}

.todo-checkbox {
  display: none;
}

.checkbox-custom {
  width: 24px;
  height: 24px;
  border: 3px solid #667eea;
  border-radius: 5px;
  position: relative;
  flex-shrink: 0;
  transition: all 0.3s;
}

.todo-checkbox:checked + .checkbox-custom {
  background: #667eea;
  border-color: #667eea;
}

.todo-checkbox:checked + .checkbox-custom::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-weight: bold;
  font-size: 16px;
}

.todo-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.todo-text {
  font-size: 1.1rem;
  color: #333;
  transition: all 0.3s;
}

.todo-check-item.checked .todo-text {
  text-decoration: line-through;
  color: #999;
}

@media (max-width: 768px) {
  .todo-content {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>

