import { clearAuthTokenCookie } from '../../utils/cookie';

/**
 * ログアウトAPI
 * Cookieからトークンを削除する
 */
export default defineEventHandler(async (event) => {
  clearAuthTokenCookie(event);

  return {
    success: true,
  };
});

