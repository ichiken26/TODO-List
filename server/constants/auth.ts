/**
 * 認証に関するサーバー側定数定義
 */

/**
 * bcryptのソルトラウンド数
 */
export const BCRYPT_SALT_ROUNDS = 10;

/**
 * JWTシークレットキーのデフォルト値
 * 本番環境では環境変数から取得すべき
 */
export const JWT_SECRET_DEFAULT = 'your-secret-key-change-this-in-production-min-32-chars';

/**
 * 認証が不要なパス
 */
export const PUBLIC_PATHS = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/logout',
] as const;

/**
 * 認証が必要なパス
 */
export const PROTECTED_PATHS = [
  '/api/todos',
] as const;

