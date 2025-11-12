// これはサーバー側で動くコード (Nitro)
// DynamoDBからデータを取得

import { getTodosByUserId } from '../utils/todos';
import { TEMP_USER_ID } from '~/constants/user';
import { verifyAuthToken } from '../utils/auth-guard';

export default defineEventHandler(async (event) => {
  console.log('GET /api/todos が叩かれました');
  
  // JWTトークンからユーザーIDを取得（認証済みユーザーの場合）
  const authData = verifyAuthToken(event);
  const userId = authData?.userId || TEMP_USER_ID;
  
  console.log('userId:', userId, 'authData:', authData ? '認証済み' : '未認証');
  
  try {
    const result = await getTodosByUserId(userId);
    return result;
  } catch (error: any) {
    console.error('TODOの取得に失敗:', error);
    console.error('エラー詳細:', {
      name: error?.name,
      message: error?.message,
      code: error?.code,
      statusCode: error?.statusCode,
      region: process.env.REGION || process.env.AWS_REGION,
      endpoint: process.env.AWS_ENDPOINT,
    });
    
    // DynamoDB関連のエラーの場合、エラーを投げる（空のデータを返さない）
    if (error?.name === 'ResourceNotFoundException' || error?.name === 'AccessDeniedException' || error?.code === 'AccessDenied') {
      throw createError({
        statusCode: 503,
        statusMessage: 'DynamoDBに接続できません。設定を確認してください。',
        message: 'DynamoDBに接続できません。設定を確認してください。',
      });
    }
    
    // その他のエラーは空のデータを返す
    return {
      id: TEMP_USER_ID,
      todos: [],
    };
  }
});