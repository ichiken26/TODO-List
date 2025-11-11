// これはサーバー側で動くコード (Nitro)
// SQLiteからデータを取得

import { getDatabase } from '../utils/db';
import { TEMP_USER_ID } from '~/constants/user';

export default defineEventHandler(() => {
  console.log('GET /api/todos が叩かれました');
  
  const db = getDatabase();

  try {
    // ユーザーが存在するか確認
    const user = db.prepare('SELECT id FROM users WHERE id = ?').get(TEMP_USER_ID);
    
    if (!user) {
      // ユーザーが存在しない場合は空のデータを返す
      return {
        id: TEMP_USER_ID,
        todos: [],
      };
    }

    // TODOリストを取得
    const todos = db.prepare(`
      SELECT id, partition_key as partitionKey, priority, todo
      FROM todos
      WHERE partition_key = ?
      ORDER BY priority ASC, created_at ASC
    `).all(TEMP_USER_ID);

    return {
      id: TEMP_USER_ID,
      todos: todos.map((todo: any) => ({
        id: todo.id,
        partitionKey: todo.partitionKey,
        priority: todo.priority,
        todo: todo.todo,
      })),
    };
  } catch (error) {
    console.error('TODOの取得に失敗:', error);
    // エラー時は空のデータを返す
    return {
      id: TEMP_USER_ID,
      todos: [],
    };
  }
});