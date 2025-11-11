// これはサーバー側で動くコード (Nitro)
// SQLiteにデータを保存

import { getDatabase } from '../utils/db';

interface TodoItem {
  id: string;
  partitionKey: string;
  priority: number;
  todo: string;
}

interface RequestBody {
  id: string;
  todos: TodoItem[];
}

export default defineEventHandler(async (event) => {
  const body = await readBody<RequestBody>(event);
  
  console.log('POST /api/todos が叩かれました');
  console.log('受け取ったデータ:', body);

  const db = getDatabase();
  const userId = body.id;

  try {
    // トランザクションで一括更新
    const transaction = db.transaction(() => {
      // ユーザーが存在しない場合は作成
      const userExists = db.prepare('SELECT id FROM users WHERE id = ?').get(userId);
      if (!userExists) {
        db.prepare('INSERT INTO users (id) VALUES (?)').run(userId);
      }

      // 既存のTODOをすべて削除
      db.prepare('DELETE FROM todos WHERE partition_key = ?').run(userId);

      // 新しいTODOを一括挿入
      if (body.todos.length > 0) {
        const insertTodo = db.prepare(`
          INSERT INTO todos (id, partition_key, priority, todo, updated_at)
          VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
        `);

        for (const todo of body.todos) {
          insertTodo.run(todo.id, todo.partitionKey, todo.priority, todo.todo);
        }
      }

      // ユーザーの更新日時を更新
      db.prepare('UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(userId);
    });

    transaction();

    // 保存後のデータを取得して返す
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
  } catch (error) {
    console.error('TODOの保存に失敗:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'TODOの保存に失敗しました',
    });
  }
});