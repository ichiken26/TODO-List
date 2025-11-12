import { dynamoDb, TABLES } from '../utils/db';
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

  try {
    const existingTodos = await dynamoDb.query({
      TableName: TABLES.TODOS,
      KeyConditionExpression: 'partition_key = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
      ProjectionExpression: 'id, partition_key',
    });

    const now = new Date().toISOString();
    const transactItems: any[] = [];

    if (existingTodos.Items && existingTodos.Items.length > 0) {
      for (const item of existingTodos.Items) {
        transactItems.push({
          Delete: {
            TableName: TABLES.TODOS,
            Key: {
              partition_key: item.partition_key,
              id: item.id,
            },
          },
        });
      }
    }

    if (body.todos.length > 0) {
      for (const todo of body.todos) {
        transactItems.push({
          Put: {
            TableName: TABLES.TODOS,
            Item: {
              partition_key: userId,
              id: todo.id,
              priority: todo.priority,
              todo: todo.todo,
              created_at: now,
              updated_at: now,
            },
          },
        });
      }
    }

    transactItems.push({
      Update: {
        TableName: TABLES.USERS,
        Key: { id: userId },
        UpdateExpression: 'SET updated_at = :now',
        ExpressionAttributeValues: {
          ':now': now,
        },
      },
    });

    if (transactItems.length > 0) {
      const chunks = [];
      for (let i = 0; i < transactItems.length; i += 25) {
        chunks.push(transactItems.slice(i, i + 25));
      }

      for (const chunk of chunks) {
        await dynamoDb.transactWrite({
          TransactItems: chunk,
        });
      }
    }

    return await getTodosByUserId(userId);
  } catch (error) {
    console.error('TODOの保存に失敗:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'TODOの保存に失敗しました',
    });
  }
});
