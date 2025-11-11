import { ref, computed, watch } from 'vue';
import type { TodoItem } from './useTodos';

/**
 * TODOアイテムの選択状態を管理するcomposable
 * 
 * @param getTodos - 選択対象のTODOリストを取得する関数（リアクティブ対応）
 * @returns 選択状態の管理機能
 */
export const useSelection = (getTodos: () => TodoItem[]) => {
  /**
   * 選択状態を管理するref
   * キーはTODOのID、値は選択されているかどうか
   */
  const selectedState = ref<Record<string, boolean>>({});

  /**
   * TODOリストが更新されたら、存在しないTODOの選択状態をクリア
   */
  watch(
    getTodos,
    (newTodos) => {
      const todoIds = new Set(newTodos.map(todo => todo.id));
      const cleaned: Record<string, boolean> = {};
      for (const [id, selected] of Object.entries(selectedState.value)) {
        if (todoIds.has(id)) {
          cleaned[id] = selected;
        }
      }
      selectedState.value = cleaned;
    },
    { deep: true }
  );

  /**
   * 選択されたTODOの数
   */
  const selectedCount = computed(() => {
    return Object.values(selectedState.value).filter(Boolean).length;
  });

  /**
   * 選択されたTODOのリスト
   */
  const selectedItems = computed(() => {
    return getTodos().filter(todo => selectedState.value[todo.id]);
  });

  /**
   * 選択状態を更新する
   * @param todoId - TODOのID
   * @param selected - 選択状態
   */
  const updateSelection = (todoId: string, selected: boolean) => {
    selectedState.value[todoId] = selected;
  };

  /**
   * すべてのTODOを選択する
   */
  const selectAll = () => {
    const newState: Record<string, boolean> = {};
    for (const todo of getTodos()) {
      newState[todo.id] = true;
    }
    selectedState.value = newState;
  };

  /**
   * すべてのTODOの選択を解除する
   */
  const unselectAll = () => {
    const newState: Record<string, boolean> = {};
    for (const todo of getTodos()) {
      newState[todo.id] = false;
    }
    selectedState.value = newState;
  };

  /**
   * 選択状態をクリアする
   */
  const clearSelection = () => {
    selectedState.value = {};
  };

  return {
    selectedState,
    selectedCount,
    selectedItems,
    updateSelection,
    selectAll,
    unselectAll,
    clearSelection,
  };
};

