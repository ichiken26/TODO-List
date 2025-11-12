import { getDatabase } from '../utils/db';
import { requireAuth } from '../utils/auth-guard';
import { getTodosByUserId } from '../utils/todos';

interface TodoItem {
  id: string;
  partitionKey: string;
  priority: number;
  todo: string;
}

interface RequestBody {
  todos: TodoItem[];
}

/**
 * TODOリスト保存API
 * 認証済みユーザーのTODOリストを保存
 */
export default defineEventHandler(async (event) => {
  const { userId } = requireAuth(event);
  const body = await readBody<RequestBody>(event);
  const db = getDatabase();

  try {
    // トランザクションで一括更新
    const transaction = db.transaction(() => {
      // 既存のTODOをすべて削除
      db.prepare('DELETE FROM todos WHERE partition_key = ?').run(userId);

      // 新しいTODOを一括挿入
      if (body.todos.length === 0) return;

      const insertTodo = db.prepare(`
        INSERT INTO todos (id, partition_key, priority, todo, updated_at)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      `);

      for (const todo of body.todos) {
        insertTodo.run(todo.id, userId, todo.priority, todo.todo);
      }

      // ユーザーの更新日時を更新
      db.prepare('UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(userId);
    });

    transaction();

    return getTodosByUserId(userId);
  } catch (error) {
    console.error('TODOの保存に失敗:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'TODOの保存に失敗しました',
    });
  }
});