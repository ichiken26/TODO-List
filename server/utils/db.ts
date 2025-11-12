import Database from 'better-sqlite3';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
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
    initializeDatabase(db);
  }
  return db;
}

// データベースの初期化（テーブル作成）
function initializeDatabase(database: Database.Database) {
  // usersテーブル（ユーザー情報）
  // 既存のテーブルがある場合は、カラムを追加（マイグレーション）
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      user_name TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 既存のテーブルにカラムが存在しない場合は追加（マイグレーション）
  try {
    const tableInfo = database.prepare("PRAGMA table_info(users)").all() as Array<{ name: string }>;
    const columnNames = tableInfo.map(col => col.name);
    
    if (!columnNames.includes('user_name')) {
      database.exec(`ALTER TABLE users ADD COLUMN user_name TEXT`);
    }
    if (!columnNames.includes('password')) {
      database.exec(`ALTER TABLE users ADD COLUMN password TEXT`);
    }
    
    // 既存のuser_nameにUNIQUE制約を追加（既存データがある場合はスキップ）
    try {
      database.exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_users_user_name ON users(user_name)`);
    } catch (error) {
      // 既にUNIQUE制約がある場合は無視
      console.log('user_name UNIQUE制約は既に存在します');
    }
  } catch (error) {
    console.error('テーブルマイグレーションエラー:', error);
  }

  // todosテーブル（TODOアイテム）
  database.exec(`
    CREATE TABLE IF NOT EXISTS todos (
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
    CREATE INDEX IF NOT EXISTS idx_todos_partition_key ON todos(partition_key)
  `);
}

// データベース接続を閉じる（アプリ終了時など）
export function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}

