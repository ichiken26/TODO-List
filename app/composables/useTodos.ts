import { v4 as uuidv4 } from 'uuid';
import { watch } from 'vue';
import { useState } from '#app/composables/state';
import { PRIORITY_LABELS, DEFAULT_PRIORITY } from '~/constants/priority';

/**
 * TODOアイテムの型定義
 */
export interface TodoItem {
  /** メッセージID */
  id: string;
  /** ユーザーID（パーティションキー） */
  partitionKey: string;
  /** 優先度（1: 高, 2: 中, 3: 低） */
  priority: number;
  /** TODOのテキスト */
  todo: string;
}

/**
 * ユーザー（TODOリスト全体）の型定義
 */
export interface TodoUser {
  /** ユーザーID */
  id: string;
  /** TODOアイテムのリスト */
  todos: TodoItem[];
}

/**
 * TODOリストの状態管理とAPI操作を行うcomposable
 * 
 * @returns TODOリストの状態と操作関数
 */
export const useTodos = () => {
  /**
   * アプリ全体のTODOユーザー状態を管理
   * NuxtのuseStateを使用して、SSR/CSR間で状態を共有
   */
  const todoUser = useState<TodoUser | null>('todoUser', () => null);

  /**
   * 認証ユーザーの状態を監視して、ユーザーが変わったらTODOリストをクリア
   */
  const authUser = useState<{ id: string; userName: string } | null>('authUser', () => null);
  watch(() => authUser.value?.id, (newUserId, oldUserId) => {
    if (newUserId !== oldUserId) {
      todoUser.value = null;
    }
  });

  /**
   * TODOリストの状態をクリアする
   */
  const clearTodos = () => {
    todoUser.value = null;
  };

  /**
   * サーバーからTODOリストを取得する
   * エラー時は空のリストを設定
   */
  const fetchTodos = async () => {
    try {
      const data = await $fetch<TodoUser>('/api/todos');
      todoUser.value = data;
    } catch (error) {
      console.error('TODOの取得に失敗:', error);
      // エラー時は状態をクリア
      todoUser.value = null;
    }
  };

  /**
   * TODOリストを更新する
   * サーバーにPOSTリクエストを送信し、レスポンスで状態を更新
   * 
   * @param updatedTodos - 更新後のTODOリスト
   * @returns 更新が成功したかどうか
   */
  const updateTodos = async (updatedTodos: TodoItem[]): Promise<boolean> => {
    try {
      const response = await $fetch<TodoUser>('/api/todos', {
        method: 'POST',
        body: {
          todos: updatedTodos,
        },
      });
      // サーバーからのレスポンスでローカルの状態を更新
      todoUser.value = response;
      return true;
    } catch (error) {
      console.error('TODOの更新に失敗:', error);
      alert('保存に失敗しました…');
      // 保存失敗時は、サーバーから最新のデータを再取得
      try {
        await fetchTodos();
      } catch (fetchError) {
        console.error('データの再取得に失敗:', fetchError);
      }
      return false;
    }
  };

  /**
   * 新しいTODOアイテムを生成する
   * 
   * @param todoText - TODOのテキスト
   * @param priority - 優先度
   * @returns 生成されたTODOアイテム
   */
  const createNewTodoItem = (todoText: string, priority: number): TodoItem => {
    const userId = todoUser.value?.id;
    if (!userId) {
      throw new Error('ユーザーがログインしていません');
    }
    
    return {
      id: `${userId}-${uuidv4()}`,
      partitionKey: userId,
      priority: priority,
      todo: todoText,
    };
  };

  return {
    todoUser,
    fetchTodos,
    updateTodos,
    createNewTodoItem,
    clearTodos,
  };
};

/**
 * 優先度のラベルを取得する
 * 
 * @param priority - 優先度の値（1, 2, 3）
 * @returns 優先度のラベル（存在しない場合はデフォルト優先度のラベル）
 */
export const getPriorityLabel = (priority: number): string => {
  return PRIORITY_LABELS[priority] ?? PRIORITY_LABELS[DEFAULT_PRIORITY] ?? '不明';
};
