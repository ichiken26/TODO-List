import { COOKIE_MAX_AGE_SECONDS, COOKIE_TOKEN_NAME } from '~/constants/auth';

/**
 * Cookieにトークンを設定する
 * 
 * @param event - H3イベント
 * @param token - JWTトークン
 */
export function setAuthTokenCookie(event: any, token: string): void {
  const isProduction = process.env.NODE_ENV === 'production';
  
  setCookie(event, COOKIE_TOKEN_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    maxAge: COOKIE_MAX_AGE_SECONDS,
  });
}

/**
 * Cookieからトークンを削除する
 * 
 * @param event - H3イベント
 */
export function clearAuthTokenCookie(event: any): void {
  deleteCookie(event, COOKIE_TOKEN_NAME);
}

