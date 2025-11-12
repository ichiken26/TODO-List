import { getDatabase } from './db';

/**
 * TODOリストを取得する共通関数
 * 
 * @param userId - ユーザーID
 * @returns TODOリスト
 */
export function getTodosByUserId(userId: string) {
  const db = getDatabase();
  const todos = db.prepare(`
    SELECT id, partition_key as partitionKey, priority, todo
    FROM todos
    WHERE partition_key = ?
    ORDER BY priority ASC, created_at ASC
  `).all(userId);

  return {
    id: userId,
    todos: todos.map((todo: any) => ({
      id: todo.id,
      partitionKey: todo.partitionKey,
      priority: todo.priority,
      todo: todo.todo,
    })),
  };
}

