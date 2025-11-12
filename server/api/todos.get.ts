// これはサーバー側で動くコード (Nitro)
// DynamoDBからデータを取得

import { getTodosByUserId } from '../utils/todos';
import { TEMP_USER_ID } from '~/constants/user';

export default defineEventHandler(async () => {
  console.log('GET /api/todos が叩かれました');
  
  try {
    const result = await getTodosByUserId(TEMP_USER_ID);
    return result;
  } catch (error) {
    console.error('TODOの取得に失敗:', error);
    // エラー時は空のデータを返す
    return {
      id: TEMP_USER_ID,
      todos: [],
    };
  }
});