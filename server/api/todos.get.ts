import { requireAuth } from '../utils/auth-guard';
import { getTodosByUserId } from '../utils/todos';

/**
 * TODOリスト取得API
 * 認証済みユーザーのTODOリストを取得
 */
export default defineEventHandler(async (event) => {
  const { userId } = requireAuth(event);

  try {
    return await getTodosByUserId(userId);
  } catch (error) {
    console.error('TODOの取得に失敗:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'TODOの取得に失敗しました',
    });
  }
});