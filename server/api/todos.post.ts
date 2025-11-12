// これはサーバー側で動くコード (Nitro)
// DynamoDBにデータを保存

import { dynamoDb, TABLES, QueryCommand, GetCommand, PutCommand, BatchWriteCommand } from '../utils/db';
import { getTodosByUserId } from '../utils/todos';
import { verifyAuthToken } from '../utils/auth-guard';

interface TodoItem {
  id: string;
  partitionKey: string;
  priority: number;
  todo: string;
}

interface RequestBody {
  id?: string;
  todos: TodoItem[];
}

export default defineEventHandler(async (event) => {
  const body = await readBody<RequestBody>(event);
  
  console.log('POST /api/todos が叩かれました');
  console.log('受け取ったデータ:', body);

  // JWTトークンからユーザーIDを取得（認証済みユーザーの場合）
  const authData = verifyAuthToken(event);
  let userId: string | null = null;

  if (authData) {
    // 認証済みユーザーの場合、JWTトークンからユーザーIDを取得
    userId = authData.userId;
    console.log('認証済みユーザーID（JWTから取得）:', userId);
  } else {
    // 認証されていない場合、body.idまたはtodos[0].partitionKeyから取得
    userId = body.id || (body.todos && body.todos.length > 0 ? body.todos[0].partitionKey : null);
    
    if (!userId) {
      // それも存在しない場合は、TEMP_USER_IDを使用（ローカル開発用）
      const { TEMP_USER_ID } = await import('~/constants/user');
      userId = TEMP_USER_ID;
      console.log('userIdが指定されていないため、TEMP_USER_IDを使用:', userId);
    } else {
      console.log('userId（リクエストボディから取得）:', userId);
    }
  }

  return await handleSave(body, userId);
});

async function handleSave(body: RequestBody, userId: string) {

  try {
    // ユーザーが存在しない場合は作成
    const getUserCommand = new GetCommand({
      TableName: TABLES.USERS,
      Key: { id: String(userId) }, // 明示的にStringに変換
    });
    console.log('GetCommand Key:', JSON.stringify(getUserCommand.input.Key));
    const userResult = await dynamoDb.send(getUserCommand);
    
    if (!userResult.Item) {
      const now = new Date().toISOString();
      const createUserCommand = new PutCommand({
        TableName: TABLES.USERS,
        Item: {
          id: userId,
          created_at: now,
          updated_at: now,
        },
      });
      await dynamoDb.send(createUserCommand);
    } else {
      // ユーザーの更新日時を更新
      const updateUserCommand = new PutCommand({
        TableName: TABLES.USERS,
        Item: {
          ...userResult.Item,
          updated_at: new Date().toISOString(),
        },
      });
      await dynamoDb.send(updateUserCommand);
    }

    // 既存のTODOを取得
    const queryCommand = new QueryCommand({
      TableName: TABLES.TODOS,
      KeyConditionExpression: 'partition_key = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
    });
    const existingTodosResult = await dynamoDb.send(queryCommand);

    // 既存のTODOを削除（バッチ削除）
    if (existingTodosResult.Items && existingTodosResult.Items.length > 0) {
      const deleteRequests = existingTodosResult.Items.map((item: any) => ({
        DeleteRequest: {
          Key: {
            partition_key: item.partition_key,
            id: item.id,
          },
        },
      }));

      // BatchWriteCommandは最大25アイテムまで
      const batchSize = 25;
      for (let i = 0; i < deleteRequests.length; i += batchSize) {
        const batch = deleteRequests.slice(i, i + batchSize);
        const batchDeleteCommand = new BatchWriteCommand({
          RequestItems: {
            [TABLES.TODOS]: batch,
          },
        });
        await dynamoDb.send(batchDeleteCommand);
      }
    }

    // 新しいTODOを一括挿入（バッチ書き込み）
    if (body.todos.length > 0) {
      const now = new Date().toISOString();
      
      // 既存のTODOのcreated_atを保持するためのマップを作成
      const existingTodosMap = new Map<string, string>();
      if (existingTodosResult.Items) {
        for (const item of existingTodosResult.Items) {
          if (item.created_at) {
            existingTodosMap.set(item.id, item.created_at);
          }
        }
      }
      
      const putRequests = body.todos.map((todo: any) => {
        // 既存のTODOの場合はcreated_atを保持、新規の場合は現在時刻を使用
        const created_at = existingTodosMap.get(todo.id) || todo.created_at || now;
        
        return {
          PutRequest: {
            Item: {
              partition_key: todo.partitionKey,
              id: todo.id,
              priority: todo.priority,
              todo: todo.todo,
              created_at: created_at,
              updated_at: now,
            },
          },
        };
      });

      // BatchWriteCommandは最大25アイテムまで
      const batchSize = 25;
      for (let i = 0; i < putRequests.length; i += batchSize) {
        const batch = putRequests.slice(i, i + batchSize);
        const batchWriteCommand = new BatchWriteCommand({
          RequestItems: {
            [TABLES.TODOS]: batch,
          },
        });
        await dynamoDb.send(batchWriteCommand);
      }
    }

    // 保存後のデータを取得して返す
    const result = await getTodosByUserId(userId);
    return result;
  } catch (error: any) {
    console.error('TODOの保存に失敗:', error);
    console.error('エラー詳細:', {
      name: error?.name,
      message: error?.message,
      code: error?.code,
      statusCode: error?.statusCode,
      region: process.env.REGION || process.env.AWS_REGION,
      endpoint: process.env.AWS_ENDPOINT,
      tables: TABLES,
    });
    
    // DynamoDB関連のエラーの場合、より詳細なメッセージを返す
    let errorMessage = error?.message || 'TODOの保存に失敗しました';
    let statusCode = 500;
    
    if (error?.name === 'ResourceNotFoundException') {
      errorMessage = 'DynamoDBテーブルが見つかりません。テーブルが作成されているか確認してください。';
      statusCode = 503;
    } else if (error?.name === 'AccessDeniedException' || error?.code === 'AccessDenied') {
      errorMessage = 'DynamoDBへのアクセス権限がありません。IAMロールの設定を確認してください。';
      statusCode = 503;
    } else if (error?.name === 'ValidationException') {
      errorMessage = `DynamoDBのバリデーションエラー: ${error.message}`;
      statusCode = 400;
    }
    
    throw createError({
      statusCode,
      statusMessage: errorMessage,
      message: errorMessage, // h3の警告に対応
    });
  }
}