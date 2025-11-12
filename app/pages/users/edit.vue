<template>
  <div class="edit-page">
    <PageHeader 
      title="📝 TODOリスト編集画面" 
      subtitle="タスクの追加、編集、削除ができます" 
    />

    <LoadingState v-if="!todoUser" />

    <div v-else class="edit-content">
      <TodoAddForm @submit="handleAddTodo" />
      
      <TodoList 
        :todos="todoUser.todos" 
        @update="handleUpdateTodos"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import type { TodoItem } from '~/composables/useTodos';

/**
 * 認証が必要なページ
 */
definePageMeta({
  middleware: 'auth',
});

/**
 * TODOリストの状態を管理
 */
const { todoUser, updateTodos, createNewTodoItem } = useTodos();

/**
 * 認証ガード
 */
const { ensureAuthenticatedAndFetchTodos } = useAuthGuard();

/**
 * 認証チェックとデータ取得
 */
onMounted(async () => {
  await ensureAuthenticatedAndFetchTodos();
});

const handleAddTodo = async (text: string, priority: number) => {
  if (!todoUser.value) return;
  const newItem = createNewTodoItem(text, priority);
  todoUser.value.todos.push(newItem);
  // 自動保存
  await updateTodos(todoUser.value.todos);
};

const handleUpdateTodos = async (updatedTodos: TodoItem[]) => {
  if (!todoUser.value) return;
  todoUser.value.todos = updatedTodos;
  // 自動保存
  await updateTodos(updatedTodos);
};
</script>

<style scoped>
.edit-page {
  animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.edit-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}
</style>
