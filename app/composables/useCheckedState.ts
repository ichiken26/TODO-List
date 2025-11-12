import { ref, computed, watch, type Ref } from 'vue';
import type { TodoItem, TodoUser } from './useTodos';
import { STORAGE_KEYS } from '~/constants/storage';

/**
 * ユーザーIDに基づいたlocalStorageキーを生成
 */
const getStorageKey = (userId: string | null): string => {
  if (!userId) return STORAGE_KEYS.CHECKED_STATE;
  return `${STORAGE_KEYS.CHECKED_STATE}-${userId}`;
};

/**
 * localStorageから値を読み込む
 */
const loadFromStorage = (key: string): Record<string, boolean> => {
  if (typeof window === 'undefined') return {};
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

/**
 * localStorageに値を保存する
 */
const saveToStorage = (key: string, value: Record<string, boolean>): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`localStorageへの保存に失敗 (key: ${key}):`, error);
  }
};

/**
 * チェック画面のチェック状態を管理するcomposable
 * localStorageと連携して状態を永続化
 * ユーザーごとに状態を分離
 * 
 * @param todoUser - TODOユーザーオブジェクトのref（TODOリストを含む）
 * @returns チェック状態の管理機能
 */
export const useCheckedState = (todoUser: Ref<TodoUser | null>) => {
  /**
   * チェック状態を管理するref
   * キーはTODOのID、値はチェックされているかどうか
   */
  const checkedState = ref<Record<string, boolean>>({});

  /**
   * TODOリストが更新されたら、チェック状態を同期
   */
  watch(
    () => todoUser.value,
    (newUser, oldUser) => {
      if (!newUser || (oldUser && oldUser.id !== newUser.id)) {
        checkedState.value = {};
        return;
      }

      // 現在のユーザーIDに基づいたlocalStorageから読み込む
      const userStorageKey = getStorageKey(newUser.id);
      const savedState = loadFromStorage(userStorageKey);
      const cleanedState: Record<string, boolean> = {};

      for (const todo of newUser.todos) {
        cleanedState[todo.id] = savedState[todo.id] || false;
      }

      checkedState.value = cleanedState;
      saveToStorage(userStorageKey, cleanedState);
    },
    { immediate: true }
  );

  /**
   * チェック状態を更新し、localStorageに保存
   * @param newState - 新しいチェック状態
   */
  const updateCheckedState = (newState: Record<string, boolean>) => {
    checkedState.value = newState;
    
    // 現在のユーザーIDに基づいたlocalStorageに保存
    if (todoUser.value) {
      const userStorageKey = getStorageKey(todoUser.value.id);
      saveToStorage(userStorageKey, newState);
    }
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

