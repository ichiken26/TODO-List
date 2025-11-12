import bcrypt from 'bcrypt';
import { getDatabase } from './db';
import { BCRYPT_SALT_ROUNDS } from '../constants/auth';

/**
 * パスワードをハッシュ化する
 * 
 * @param password - 平文のパスワード
 * @returns ハッシュ化されたパスワード
 */
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
}

/**
 * パスワードを検証する
 * 
 * @param password - 平文のパスワード
 * @param hashedPassword - ハッシュ化されたパスワード
 * @returns パスワードが一致するかどうか
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

/**
 * パスワードのバリデーション
 * 英数字の混合である必要がある
 * 
 * @param password - 検証するパスワード
 * @returns バリデーション結果とエラーメッセージ
 */
export function validatePassword(password: string): { valid: boolean; message?: string } {
  // 正規表現: 英字と数字の両方を含む必要がある
  const passwordRegex = /^(?=.*?[a-z])(?=.*?[\d])[a-z\d]+$/i;
  
  if (!password) {
    return { valid: false, message: 'パスワードを入力してください' };
  }
  
  if (!passwordRegex.test(password)) {
    return { valid: false, message: 'パスワードは英数字の混合である必要があります' };
  }
  
  return { valid: true };
}

/**
 * ユーザー名の重複チェック
 * 
 * @param userName - チェックするユーザー名
 * @returns ユーザー名が既に存在するかどうか
 */
export function isUserNameExists(userName: string): boolean {
  const db = getDatabase();
  const user = db.prepare('SELECT id FROM users WHERE user_name = ?').get(userName);
  return !!user;
}

/**
 * ユーザー名でユーザーを取得
 * 
 * @param userName - ユーザー名
 * @returns ユーザー情報（存在しない場合はnull）
 */
export function getUserByUserName(userName: string): { id: string; userName: string; password: string } | null {
  const db = getDatabase();
  const user = db.prepare('SELECT id, user_name as userName, password FROM users WHERE user_name = ?').get(userName) as any;
  return user || null;
}

/**
 * ユーザーIDでユーザーを取得
 * 
 * @param userId - ユーザーID
 * @returns ユーザー情報（存在しない場合はnull）
 */
export function getUserById(userId: string): { id: string; userName: string; password: string } | null {
  const db = getDatabase();
  const user = db.prepare('SELECT id, user_name as userName, password FROM users WHERE id = ?').get(userId) as any;
  return user || null;
}

/**
 * 新しいユーザーを作成
 * 
 * @param userName - ユーザー名
 * @param password - ハッシュ化されたパスワード
 * @returns 作成されたユーザーのID
 */
export function createUser(userName: string, password: string): string {
  const db = getDatabase();
  const userId = userName; // idはユーザー名と同じ
  
  db.prepare(`
    INSERT INTO users (id, user_name, password)
    VALUES (?, ?, ?)
  `).run(userId, userName, password);
  
  return userId;
}

