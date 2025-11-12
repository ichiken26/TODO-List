import jwt from 'jsonwebtoken';
import { JWT_SECRET_DEFAULT } from '../constants/auth';
import { JWT_EXPIRES_IN, BEARER_PREFIX, BEARER_PREFIX_LENGTH, COOKIE_TOKEN_NAME } from '~/constants/auth';

/**
 * JWTシークレットキー（本番環境では環境変数から取得すべき）
 */
const JWT_SECRET = process.env.JWT_SECRET || JWT_SECRET_DEFAULT;

/**
 * JWTトークンを生成する
 * 
 * @param userId - ユーザーID
 * @param userName - ユーザー名
 * @returns JWTトークン
 */
export function generateToken(userId: string, userName: string): string {
  return jwt.sign(
    { userId, userName },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * JWTトークンを検証する
 * 
 * @param token - JWTトークン
 * @returns デコードされたトークンデータ（検証失敗時はnull）
 */
export function verifyToken(token: string): { userId: string; userName: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; userName: string };
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * リクエストからJWTトークンを取得する
 * 
 * @param event - H3イベント
 * @returns JWTトークン（存在しない場合はnull）
 */
export function getTokenFromRequest(event: any): string | null {
  const authHeader = getHeader(event, 'authorization');
  if (authHeader?.startsWith(BEARER_PREFIX)) {
    return authHeader.substring(BEARER_PREFIX_LENGTH);
  }
  
  // Cookieからも取得を試みる
  const cookies = parseCookies(event);
  const cookieToken = cookies[COOKIE_TOKEN_NAME];
  return cookieToken || null;
}

