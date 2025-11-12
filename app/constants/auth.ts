/**
 * 認証に関する定数定義
 */

/**
 * JWTトークンの有効期限（7日間）
 */
export const JWT_EXPIRES_IN = '7d';

/**
 * Cookieの有効期限（7日間、秒単位）
 */
export const COOKIE_MAX_AGE_DAYS = 7;
export const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * COOKIE_MAX_AGE_DAYS;

/**
 * Cookie名
 */
export const COOKIE_TOKEN_NAME = 'token';

/**
 * Bearerトークンのプレフィックス
 */
export const BEARER_PREFIX = 'Bearer ';
export const BEARER_PREFIX_LENGTH = BEARER_PREFIX.length;

