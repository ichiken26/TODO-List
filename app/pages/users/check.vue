<template>
  <div class="check-page">
    <PageHeader 
      title="✅ チェック画面" 
      subtitle="完了したタスクにチェックを入れましょう" 
    />

    <div v-if="!todoUser" class="empty-state-card">
      <div class="empty-state-icon">📋</div>
      <h3 class="empty-state-title">データがありません</h3>
      <p class="empty-state-message">編集画面でデータを読み込んでください</p>
      <NuxtLink to="/users/edit" class="btn-primary">
        📝 編集画面へ移動
      </NuxtLink>
    </div>

    <div v-else-if="todoUser.todos.length === 0" class="empty-state-card">
      <div class="empty-state-icon">📝</div>
      <h3 class="empty-state-title">TODOがありません</h3>
      <p class="empty-state-message">編集画面でTODOを追加してください</p>
      <NuxtLink to="/users/edit" class="btn-primary">
        ➕ TODOを追加する
      </NuxtLink>
    </div>

    <div v-else class="check-content">
      <TodoStats
        :total="todoUser.todos.length"
        :completed="completedCount"
        :remaining="remainingCount"
      />

      <div class="check-actions">
        <div class="check-actions-left">
          <button 
            @click="handleSelectAll"
            class="btn-check-action"
          >
            ✅ すべてチェック
          </button>
          <button 
            @click="handleUnselectAll"
            class="btn-check-action"
          >
            ❌ すべてチェック解除
          </button>
        </div>
        <div class="check-actions-right">
          <button 
            :disabled="checkedTodoCount === 0"
            @click="handleDeleteChecked"
            class="btn-check-action btn-delete"
            :class="{ 'disabled': checkedTodoCount === 0 }"
          >
            🗑️ チェックした項目を削除<template v-if="checkedTodoCount > 0"> ({{ checkedTodoCount }}件)</template>
          </button>
        </div>
      </div>

      <TodoCheckList
        :todos="todoUser.todos"
        :checked-state="checkedState"
        @update:checked-state="handleCheckedStateUpdate"
      />
    </div>

    <ConfirmDialog
      :visible="showDeleteDialog"
      title="削除確認"
      message="チェックしたTODOリストを削除しますか？"
      :items="checkedTodoTexts"
      @confirm="confirmDeleteChecked"
      @cancel="cancelDeleteChecked"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useCheckedState } from '~/composables/useCheckedState';

/**
 * 認証が必要なページ
 */
definePageMeta({
  middleware: 'auth',
});

/**
 * TODOリストの状態を管理
 */
const { todoUser, updateTodos } = useTodos();

/**
 * 認証ガード
 */
const { ensureAuthenticatedAndFetchTodos } = useAuthGuard();

/**
 * チェック状態を管理するcomposable
 * localStorageと連携して状態を永続化
 */
const {
  checkedState,
  completedCount,
  remainingCount,
  checkedCount: checkedTodoCount,
  checkedTodoTexts,
  updateCheckedState,
  checkAll: handleSelectAll,
  uncheckAll: handleUnselectAll,
} = useCheckedState(todoUser);

/**
 * 削除確認ダイアログの表示状態
 */
const showDeleteDialog = ref(false);

/**
 * 認証チェックとデータ取得
 */
onMounted(async () => {
  await ensureAuthenticatedAndFetchTodos();
});

/**
 * チェック状態を更新する
 * @param newState - 新しいチェック状態
 */
const handleCheckedStateUpdate = (newState: Record<string, boolean>) => {
  updateCheckedState(newState);
};

/**
 * チェックした項目を削除する確認ダイアログを表示
 */
const handleDeleteChecked = () => {
  if (checkedTodoCount.value === 0) return;
  showDeleteDialog.value = true;
};

/**
 * チェックした項目を削除する
 */
const confirmDeleteChecked = async () => {
  if (!todoUser.value || checkedTodoCount.value === 0) return;

  // チェックが入っていないTODOのみを残す
  const checkedIds = new Set(
    todoUser.value.todos
      .filter(todo => checkedState.value[todo.id])
      .map(todo => todo.id)
  );
  const remainingTodos = todoUser.value.todos.filter(
    todo => !checkedIds.has(todo.id)
  );

  // TODOリストを更新
  await updateTodos(remainingTodos);

  // 削除されたTODOのチェック状態をクリア
  const newState: Record<string, boolean> = {};
  for (const todo of remainingTodos) {
    newState[todo.id] = checkedState.value[todo.id] || false;
  }
  updateCheckedState(newState);

  // ダイアログを閉じる
  showDeleteDialog.value = false;
};

/**
 * 削除をキャンセルする
 */
const cancelDeleteChecked = () => {
  showDeleteDialog.value = false;
};
</script>

<style scoped>
.check-page {
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

.check-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.check-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.check-actions-left {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.check-actions-right {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn-check-action {
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

.btn-check-action:hover:not(:disabled) {
  background: #5568d3;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-delete {
  background: #f5576c;
}

.btn-delete:hover:not(:disabled) {
  background: #e0455a;
  box-shadow: 0 4px 12px rgba(245, 87, 108, 0.4);
}

.btn-check-action:disabled,
.btn-check-action.disabled {
  background: #ccc;
  color: #999;
  cursor: not-allowed;
  opacity: 0.6;
}

.btn-check-action:disabled:hover {
  transform: none;
  box-shadow: none;
}

.empty-state-card {
  background: white;
  border-radius: 15px;
  padding: 4rem 2rem;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  animation: fadeIn 0.5s ease-in;
}

.empty-state-icon {
  font-size: 5rem;
  margin-bottom: 1.5rem;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.empty-state-title {
  font-size: 1.8rem;
  color: #333;
  margin: 0 0 1rem 0;
  font-weight: bold;
}

.empty-state-message {
  font-size: 1.1rem;
  color: #666;
  margin: 0 0 2rem 0;
  line-height: 1.6;
}

.btn-primary {
  display: inline-block;
  padding: 1rem 2.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: bold;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
  background: linear-gradient(135deg, #5568d3 0%, #6a3d91 100%);
}
</style>
