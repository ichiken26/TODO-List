import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

/**
 * DynamoDBクライアントの初期化
 */
const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'ap-northeast-1',
  ...(process.env.AWS_ENDPOINT && { endpoint: process.env.AWS_ENDPOINT }),
});

/**
 * DynamoDB Document Client（属性を自動マッピング）
 */
export const dynamoDb = DynamoDBDocumentClient.from(client);

/**
 * テーブル名
 */
export const TABLES = {
  USERS: process.env.DYNAMODB_TABLE_USERS || 'users',
  TODOS: process.env.DYNAMODB_TABLE_TODOS || 'todos',
} as const;

/**
 * データベース接続を取得（互換性のため）
 */
export function getDatabase() {
  return dynamoDb;
}
