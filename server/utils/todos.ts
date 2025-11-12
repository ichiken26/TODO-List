import { dynamoDb, TABLES } from './db';

/**
 * TODOリストを取得する共通関数
 * 
 * @param userId - ユーザーID
 * @returns TODOリスト
 */
export async function getTodosByUserId(userId: string) {
  const result = await dynamoDb.query({
    TableName: TABLES.TODOS,
    KeyConditionExpression: 'partition_key = :userId',
    ExpressionAttributeValues: {
      ':userId': userId,
    },
  });
  
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
}
