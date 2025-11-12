import { getUserById } from '../../utils/auth';
import { requireAuth } from '../../utils/auth-guard';

/**
 * 現在のログインユーザー情報を取得
 */
export default defineEventHandler(async (event) => {
  try {
    const decoded = requireAuth(event);
    const user = await getUserById(decoded.userId);

    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: 'ユーザーが見つかりません',
        message: 'ユーザーが見つかりません',
      });
    }

    return {
      id: user.id,
      userName: user.userName,
    };
  } catch (error: any) {
    console.error('ユーザー情報の取得に失敗:', error);
    console.error('エラー詳細:', {
      name: error?.name,
      message: error?.message,
      code: error?.code,
      statusCode: error?.statusCode,
    });
    
    // 既にcreateErrorの場合はそのまま再スロー
    if (error?.statusCode) {
      throw error;
    }
    
    // DynamoDB関連のエラーの場合
    if (error?.name === 'ResourceNotFoundException' || error?.name === 'AccessDeniedException' || error?.code === 'AccessDenied') {
      throw createError({
        statusCode: 503,
        statusMessage: 'DynamoDBに接続できません。設定を確認してください。',
        message: 'DynamoDBに接続できません。設定を確認してください。',
      });
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: error?.message || 'ユーザー情報の取得に失敗しました',
      message: error?.message || 'ユーザー情報の取得に失敗しました',
    });
  }
});

