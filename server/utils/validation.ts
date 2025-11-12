/**
 * 入力値のバリデーションとサニタイズを行うユーティリティ
 */

/**
 * ユーザー名とパスワードをサニタイズする
 * 
 * @param userName - ユーザー名
 * @param password - パスワード
 * @returns サニタイズされたユーザー名とパスワード
 */
export function sanitizeCredentials(userName: unknown, password: unknown): { userName: string; password: string } {
  const sanitizedUserName = String(userName).trim();
  const sanitizedPassword = String(password);

  return {
    userName: sanitizedUserName,
    password: sanitizedPassword,
  };
}

/**
 * ユーザー名とパスワードの入力チェック
 * 
 * @param userName - ユーザー名
 * @param password - パスワード
 * @returns バリデーションエラーメッセージ（問題なければnull）
 */
export function validateCredentialsInput(userName: string, password: string): string | null {
  if (!userName || !password) {
    return 'ユーザー名とパスワードを入力してください';
  }

  if (userName.length === 0 || password.length === 0) {
    return 'ユーザー名とパスワードを入力してください';
  }

  return null;
}

