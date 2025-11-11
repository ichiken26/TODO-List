import { computed } from 'vue';
import type { TodoItem } from './useTodos';
import { PRIORITY, PRIORITY_MIN, PRIORITY_MAX } from '~/constants/priority';

/**
 * TODOリストを優先度ごとにグループ分けするcomposable
 * 
 * @param getTodos - グループ分けするTODOリストを取得する関数（リアクティブ対応）
 * @returns 優先度ごとにグループ分けされたTODOリスト
 */
export const usePriorityGroups = (getTodos: () => TodoItem[]) => {
  /**
   * 優先度ごとにグループ分けされたTODOリスト
   * キーは優先度（1, 2, 3）、値はその優先度のTODOリスト
   */
  const groupedTodos = computed(() => {
    const todos = getTodos();
    const groups: Record<number, TodoItem[]> = {
      [PRIORITY.HIGH]: [],
      [PRIORITY.MEDIUM]: [],
      [PRIORITY.LOW]: [],
    };

    for (const todo of todos) {
      const priority = todo.priority;
      if (priority >= PRIORITY_MIN && priority <= PRIORITY_MAX && groups[priority]) {
        groups[priority].push(todo);
      }
    }

    return groups;
  });

  return {
    groupedTodos,
  };
};

