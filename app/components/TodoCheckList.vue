<template>
  <div class="todo-check-list">
    <div
      v-for="(group, priority) in groupedTodos"
      :key="priority"
      v-show="group.length > 0"
      class="priority-group"
    >
      <h4 class="priority-group-title">{{ getPriorityLabel(Number(priority)) }}</h4>
      <div class="todo-check-items">
        <TodoCheckItem
          v-for="todo in group"
          :key="todo.id"
          :todo="todo"
          :checked="checkedState[todo.id] || false"
          @update:checked="handleCheckedChange(todo.id, $event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TodoItem } from '~/composables/useTodos';
import { getPriorityLabel } from '~/composables/useTodos';
import { usePriorityGroups } from '~/composables/usePriorityGroups';

interface Props {
  todos: TodoItem[];
  checkedState: Record<string, boolean>;
}

interface Emits {
  (e: 'update:checkedState', state: Record<string, boolean>): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

/**
 * 優先度ごとにグループ分けするcomposable
 */
const { groupedTodos } = usePriorityGroups(() => props.todos);

/**
 * チェック状態を更新する
 * @param todoId - TODOのID
 * @param checked - チェック状態
 */
const handleCheckedChange = (todoId: string, checked: boolean) => {
  const newState = { ...props.checkedState, [todoId]: checked };
  emit('update:checkedState', newState);
};
</script>

<style scoped>
.todo-check-list {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.priority-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.priority-group-title {
  font-size: 1.1rem;
  font-weight: bold;
  color: #333;
  padding: 0.5rem 1rem;
  background: #f5f5f5;
  border-radius: 5px;
  margin: 0;
}

.todo-check-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>

