import { getUserById } from '../../utils/auth';
import { requireAuth } from '../../utils/auth-guard';

/**
 * 現在のログインユーザー情報を取得
 */
export default defineEventHandler(async (event) => {
  const decoded = requireAuth(event);
  const user = await getUserById(decoded.userId);

  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: 'ユーザーが見つかりません',
    });
  }

  return {
    id: user.id,
    userName: user.userName,
  };
});

