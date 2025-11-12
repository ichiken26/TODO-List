import { getTokenFromRequest, verifyToken } from './jwt';

/**
 * 認証トークンを検証し、ユーザー情報を取得
 * 
 * @param event - H3イベント
 * @returns デコードされたトークンデータ（検証失敗時はnull）
 */
export function verifyAuthToken(event: any): { userId: string; userName: string } | null {
  const token = getTokenFromRequest(event);
  if (!token) {
    return null;
  }

  const decoded = verifyToken(token);
  return decoded;
}

/**
 * 認証が必要なエンドポイントで使用するガード関数
 * トークンが無効な場合はエラーを投げる
 * 
 * @param event - H3イベント
 * @returns デコードされたトークンデータ
 */
export function requireAuth(event: any): { userId: string; userName: string } {
  const decoded = verifyAuthToken(event);
  
  if (!decoded) {
    throw createError({
      statusCode: 401,
      statusMessage: 'ログインが必要です',
    });
  }

  return decoded;
}

