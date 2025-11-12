import Database from 'better-sqlite3';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand, GetCommand, PutCommand, BatchWriteCommand } from '@aws-sdk/lib-dynamodb';
import { DEFAULT_PRIORITY } from '~/constants/priority';

// データベースファイルのパス
const dbDir = join(process.cwd(), 'data');
const dbPath = join(dbDir, 'todos.db');

// データディレクトリが存在しない場合は作成
if (!existsSync(dbDir)) {
  mkdirSync(dbDir, { recursive: true });
}

// データベース接続
let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (!db) {
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL'); // Write-Ahead Logging モードを有効化
    db.pragma('foreign_keys = ON'); // FOREIGN KEY制約を有効化
    initializeDatabase(db);
  }
  return db;
}

// データベースの初期化（テーブル作成）
function initializeDatabase(database: Database.Database) {
  // 既存のテーブルを削除（FOREIGN KEY制約を確実に適用するため）
  // 注意: 本番環境では、この処理を削除するか、マイグレーション処理に置き換えてください
  database.exec(`
    DROP TABLE IF EXISTS todos;
    DROP TABLE IF EXISTS users;
  `);

  // usersテーブル（ユーザー情報）
  database.exec(`
    CREATE TABLE users (
      id TEXT PRIMARY KEY,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // todosテーブル（TODOアイテム）
  // FOREIGN KEY制約を有効にするには、PRAGMA foreign_keys = ON が設定されている必要があります
  database.exec(`
    CREATE TABLE todos (
      id TEXT PRIMARY KEY,
      partition_key TEXT NOT NULL,
      priority INTEGER NOT NULL DEFAULT ${DEFAULT_PRIORITY},
      todo TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (partition_key) REFERENCES users(id)
    )
  `);

  // インデックスの作成
  database.exec(`
    CREATE INDEX idx_todos_partition_key ON todos(partition_key)
  `);
}

// データベース接続を閉じる（アプリ終了時など）
export function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}

// ============================================
// DynamoDB実装（本番環境用）
// ============================================

// 環境変数から設定を取得
const region = process.env.REGION || process.env.AWS_REGION || 'ap-northeast-1';
const endpoint = process.env.AWS_ENDPOINT; // ローカル開発用（DynamoDB Local）

// DynamoDBクライアントの設定
const dynamoDbClient = new DynamoDBClient({
  region,
  ...(endpoint && { endpoint }), // ローカル開発時のみエンドポイントを設定
});

// DynamoDB Document Client（高レベルAPI）
export const dynamoDb = DynamoDBDocumentClient.from(dynamoDbClient, {
  marshallOptions: {
    removeUndefinedValues: true,
  },
  unmarshallOptions: {
    wrapNumbers: false,
  },
});

// コマンドクラスをエクスポート
export { QueryCommand, GetCommand, PutCommand, BatchWriteCommand };

// テーブル名の定数
export const TABLES = {
  USERS: process.env.DYNAMODB_TABLE_USERS || 'users',
  TODOS: process.env.DYNAMODB_TABLE_TODOS || 'todos',
} as const;

