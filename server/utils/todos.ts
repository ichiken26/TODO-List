import { dynamoDb, TABLES, QueryCommand } from './db';

/**
 * TODOリストを取得する共通関数
 * 
 * @param userId - ユーザーID
 * @returns TODOリスト
 */
export async function getTodosByUserId(userId: string) {
  try {
    const command = new QueryCommand({
      TableName: TABLES.TODOS,
      KeyConditionExpression: 'partition_key = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
    });
    const result = await dynamoDb.send(command);
  
  if (!result.Items) {
    return {
      id: userId,
      todos: [],
    };
  }
  
  const todos = result.Items
    .map((item: any) => ({
      id: item.id,
      partitionKey: item.partition_key,
      priority: item.priority,
      todo: item.todo,
      created_at: item.created_at,
    }))
    .sort((a: any, b: any) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      return (a.created_at || '').localeCompare(b.created_at || '');
    });
  
    return {
      id: userId,
      todos,
    };
  } catch (error: any) {
    console.error('getTodosByUserId エラー:', {
      userId,
      tableName: TABLES.TODOS,
      error: error?.message,
      code: error?.code,
      name: error?.name,
    });
    throw error; // エラーを再スローして、呼び出し元で処理
  }
}
