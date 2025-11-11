<template>
  <div class="todo-list-card">
    <div class="todo-list-header">
      <h3>現在のTODOリスト ({{ todos.length }}件)</h3>
      <div class="todo-list-actions">
        <div class="todo-list-actions-left">
          <button 
            @click="handleSelectAll"
            class="btn-select-action"
          >
            ✅ すべて選択
          </button>
          <button 
            @click="handleUnselectAll"
            class="btn-select-action"
          >
            ❌ すべて選択解除
          </button>
        </div>
        <button 
          :disabled="selectedCount === 0"
          @click="handleDeleteSelected"
          class="btn-delete-selected"
          :class="{ 'disabled': selectedCount === 0 }"
        >
          🗑️ 選択した項目を削除<template v-if="selectedCount > 0"> ({{ selectedCount }}件)</template>
        </button>
      </div>
    </div>
    <div v-if="todos.length === 0" class="empty-state">
      <p>まだTODOがありません。上記のフォームから追加してください。</p>
    </div>
    <div v-else class="priority-groups">
      <div
        v-for="(group, priority) in groupedTodos"
        :key="priority"
        v-show="group.length > 0"
        class="priority-group"
      >
        <h4 class="priority-group-title">{{ getPriorityLabel(Number(priority)) }}</h4>
        <ul class="todo-list">
          <TodoEditItem
            v-for="todo in group"
            :key="todo.id"
            :todo="todo"
            :selected="selectedTodos[todo.id] || false"
            @update:todo="handleUpdate(todo.id, $event)"
            @update:selected="handleSelectChange(todo.id, $event)"
            @update:priority="handlePriorityChange(todo.id, $event)"
          />
        </ul>
      </div>
    </div>

    <ConfirmDialog
      :visible="showConfirmDialog"
      title="削除確認"
      message="以下のTODOリストを削除しますか？"
      :items="selectedTodoTexts"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { TodoItem } from '~/composables/useTodos';
import { getPriorityLabel } from '~/composables/useTodos';
import { useSelection } from '~/composables/useSelection';
import { usePriorityGroups } from '~/composables/usePriorityGroups';

interface Props {
  todos: TodoItem[];
}

interface Emits {
  (e: 'update', todos: TodoItem[]): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

/**
 * 選択状態を管理するcomposable
 */
const {
  selectedState: selectedTodos,
  selectedCount,
  selectedItems: selectedTodoList,
  clearSelection,
  selectAll,
  unselectAll,
} = useSelection(() => props.todos);

/**
 * 優先度ごとにグループ分けするcomposable
 */
const { groupedTodos } = usePriorityGroups(() => props.todos);

/**
 * 削除確認ダイアログの表示状態
 */
const showConfirmDialog = ref(false);

/**
 * 選択されたTODOのテキストリスト（確認ダイアログ用）
 */
const selectedTodoTexts = computed(() => {
  return selectedTodoList.value.map(todo => todo.todo);
});

/**
 * TODOのテキストを更新する
 * @param todoId - TODOのID
 * @param newText - 新しいテキスト
 */
const handleUpdate = (todoId: string, newText: string) => {
  const updatedTodos = props.todos.map(todo =>
    todo.id === todoId ? { ...todo, todo: newText } : todo
  );
  emit('update', updatedTodos);
};

/**
 * 選択状態を更新する
 * @param todoId - TODOのID
 * @param selected - 選択状態
 */
const handleSelectChange = (todoId: string, selected: boolean) => {
  selectedTodos.value[todoId] = selected;
};

/**
 * TODOの優先度を更新する
 * @param todoId - TODOのID
 * @param newPriority - 新しい優先度
 */
const handlePriorityChange = (todoId: string, newPriority: number) => {
  const updatedTodos = props.todos.map(todo =>
    todo.id === todoId ? { ...todo, priority: newPriority } : todo
  );
  emit('update', updatedTodos);
};

/**
 * 選択した項目を削除する確認ダイアログを表示
 */
const handleDeleteSelected = () => {
  if (selectedTodoList.value.length === 0) return;
  showConfirmDialog.value = true;
};

/**
 * 選択した項目を削除する
 */
const confirmDelete = () => {
  const selectedIds = new Set(selectedTodoList.value.map(todo => todo.id));
  const updatedTodos = props.todos.filter(todo => !selectedIds.has(todo.id));

  clearSelection();
  showConfirmDialog.value = false;

  emit('update', updatedTodos);
};

/**
 * 削除をキャンセルする
 */
const cancelDelete = () => {
  showConfirmDialog.value = false;
};

/**
 * すべてのTODOを選択する
 */
const handleSelectAll = () => {
  selectAll();
};

/**
 * すべてのTODOの選択を解除する
 */
const handleUnselectAll = () => {
  unselectAll();
};
</script>

<style scoped>
.todo-list-card {
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.todo-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.todo-list-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.todo-list-actions-left {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn-select-action {
  padding: 0.75rem 1.5rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
  transition: background-color 0.3s, transform 0.3s;
}

.btn-select-action:hover {
  background: #5568d3;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.todo-list-card h3 {
  font-size: 1.3rem;
  color: #333;
  margin: 0;
}

.btn-delete-selected {
  padding: 0.75rem 1.5rem;
  background: #f5576c;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
  transition: background-color 0.3s, transform 0.3s, opacity 0.3s;
}

.btn-delete-selected:hover:not(:disabled) {
  background: #e0455a;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(245, 87, 108, 0.4);
}

.btn-delete-selected:disabled,
.btn-delete-selected.disabled {
  background: #ccc;
  color: #999;
  cursor: not-allowed;
  opacity: 0.6;
}

.btn-delete-selected:disabled:hover {
  transform: none;
  box-shadow: none;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #999;
}

.priority-groups {
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

.todo-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 0;
  margin: 0;
}
</style>

