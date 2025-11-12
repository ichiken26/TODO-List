import bcrypt from 'bcrypt';
import { dynamoDb, TABLES, QueryCommand, GetCommand, PutCommand } from './db';
import { BCRYPT_SALT_ROUNDS } from '../constants/auth';

/**
 * パスワードをハッシュ化する
 */
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
}

/**
 * パスワードを検証する
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

/**
 * パスワードのバリデーション
 */
export function validatePassword(password: string): { valid: boolean; message?: string } {
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
 */
export async function isUserNameExists(userName: string): Promise<boolean> {
  const command = new QueryCommand({
    TableName: TABLES.USERS,
    IndexName: 'user_name-index',
    KeyConditionExpression: 'user_name = :userName',
    ExpressionAttributeValues: {
      ':userName': userName,
    },
    Limit: 1,
  });
  const result = await dynamoDb.send(command);
  
  return (result.Items?.length ?? 0) > 0;
}

/**
 * ユーザー名でユーザーを取得
 */
export async function getUserByUserName(userName: string): Promise<{ id: string; userName: string; password: string } | null> {
  const command = new QueryCommand({
    TableName: TABLES.USERS,
    IndexName: 'user_name-index',
    KeyConditionExpression: 'user_name = :userName',
    ExpressionAttributeValues: {
      ':userName': userName,
    },
    Limit: 1,
  });
  const result = await dynamoDb.send(command);
  
  if (!result.Items || result.Items.length === 0) {
    return null;
  }
  
  const user = result.Items[0];
  return {
    id: user.id,
    userName: user.user_name,
    password: user.password,
  };
}

/**
 * ユーザーIDでユーザーを取得
 */
export async function getUserById(userId: string): Promise<{ id: string; userName: string; password: string } | null> {
  const command = new GetCommand({
    TableName: TABLES.USERS,
    Key: { id: userId },
  });
  const result = await dynamoDb.send(command);
  
  if (!result.Item) {
    return null;
  }
  
  return {
    id: result.Item.id,
    userName: result.Item.user_name,
    password: result.Item.password,
  };
}

/**
 * 新しいユーザーを作成
 */
export async function createUser(userName: string, password: string): Promise<string> {
  const userId = userName;
  const now = new Date().toISOString();
  
  const command = new PutCommand({
    TableName: TABLES.USERS,
    Item: {
      id: userId,
      user_name: userName,
      password: password,
      created_at: now,
      updated_at: now,
    },
    ConditionExpression: 'attribute_not_exists(id)',
  });
  await dynamoDb.send(command);
  
  return userId;
}
