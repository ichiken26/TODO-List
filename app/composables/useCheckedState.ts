import { ref, computed, watch, type Ref } from 'vue';
import type { TodoItem, TodoUser } from './useTodos';
import { STORAGE_KEYS } from '~/constants/storage';
import { useLocalStorage } from './useLocalStorage';

/**
 * チェック画面のチェック状態を管理するcomposable
 * localStorageと連携して状態を永続化
 * 
 * @param todoUser - TODOユーザーオブジェクトのref（TODOリストを含む）
 * @returns チェック状態の管理機能
 */
export const useCheckedState = (todoUser: Ref<TodoUser | null>) => {
  const { load, save } = useLocalStorage<Record<string, boolean>>(
    STORAGE_KEYS.CHECKED_STATE,
    {}
  );

  /**
   * チェック状態を管理するref
   * キーはTODOのID、値はチェックされているかどうか
   */
  const checkedState = ref<Record<string, boolean>>(load());

  /**
   * TODOリストが更新されたら、チェック状態を同期
   */
  watch(
    () => todoUser.value,
    (newUser) => {
      if (newUser) {
        const savedState = load();
        const initialState: Record<string, boolean> = {};
        const todoIds = new Set(newUser.todos.map(todo => todo.id));

        // 存在するTODOのチェック状態を復元
        for (const todo of newUser.todos) {
          initialState[todo.id] = savedState[todo.id] || false;
        }

        // 削除されたTODOのチェック状態をクリア
        const cleanedState: Record<string, boolean> = {};
        for (const [id, checked] of Object.entries(initialState)) {
          if (todoIds.has(id)) {
            cleanedState[id] = checked;
          }
        }

        checkedState.value = cleanedState;
        save(cleanedState);
      }
    },
    { immediate: true }
  );

  /**
   * チェック状態を更新し、localStorageに保存
   * @param newState - 新しいチェック状態
   */
  const updateCheckedState = (newState: Record<string, boolean>) => {
    checkedState.value = newState;
    save(newState);
  };

  /**
   * 完了したTODOの数
   */
  const completedCount = computed(() => {
    return Object.values(checkedState.value).filter(Boolean).length;
  });

  /**
   * 未完了のTODOの数
   */
  const remainingCount = computed(() => {
    return (todoUser.value?.todos.length || 0) - completedCount.value;
  });

  /**
   * チェックが入っているTODOのリスト
   */
  const checkedTodos = computed(() => {
    if (!todoUser.value) return [];
    return todoUser.value.todos.filter(todo => checkedState.value[todo.id]);
  });

  /**
   * チェックが入っているTODOの数
   */
  const checkedCount = computed(() => {
    return checkedTodos.value.length;
  });

  /**
   * チェックが入っているTODOのテキストリスト（確認ダイアログ用）
   */
  const checkedTodoTexts = computed(() => {
    return checkedTodos.value.map(todo => todo.todo);
  });

  /**
   * すべてのTODOをチェックする
   */
  const checkAll = () => {
    if (!todoUser.value) return;
    const newState: Record<string, boolean> = {};
    for (const todo of todoUser.value.todos) {
      newState[todo.id] = true;
    }
    updateCheckedState(newState);
  };

  /**
   * すべてのTODOのチェックを解除する
   */
  const uncheckAll = () => {
    if (!todoUser.value) return;
    const newState: Record<string, boolean> = {};
    for (const todo of todoUser.value.todos) {
      newState[todo.id] = false;
    }
    updateCheckedState(newState);
  };

  return {
    checkedState,
    completedCount,
    remainingCount,
    checkedTodos,
    checkedCount,
    checkedTodoTexts,
    updateCheckedState,
    checkAll,
    uncheckAll,
  };
};

