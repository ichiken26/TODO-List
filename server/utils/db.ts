import Database from 'better-sqlite3';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { TEMP_USER_ID } from '~/constants/user';
import { PRIORITY, DEFAULT_PRIORITY } from '~/constants/priority';

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
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

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

  // デフォルトユーザーが存在しない場合は作成
  const userExists = database.prepare('SELECT id FROM users WHERE id = ?').get(TEMP_USER_ID);
  
  if (!userExists) {
    database.prepare('INSERT INTO users (id) VALUES (?)').run(TEMP_USER_ID);
    
    // 初期データを挿入（オプション）
    const initialTodos = [
      {
        id: `${TEMP_USER_ID}-uuid1`,
        partitionKey: TEMP_USER_ID,
        priority: PRIORITY.HIGH,
        todo: 'コードレビューのチェック項目を洗い出す',
      },
      {
        id: `${TEMP_USER_ID}-uuid2`,
        partitionKey: TEMP_USER_ID,
        priority: PRIORITY.MEDIUM,
        todo: 'Nuxt 3の勉強をする',
      },
    ];

    const insertTodo = database.prepare(`
      INSERT INTO todos (id, partition_key, priority, todo)
      VALUES (?, ?, ?, ?)
    `);

    const insertMany = database.transaction((todos: typeof initialTodos) => {
      for (const todo of todos) {
        insertTodo.run(todo.id, todo.partitionKey, todo.priority, todo.todo);
      }
    });

    insertMany(initialTodos);
  }
}

// データベース接続を閉じる（アプリ終了時など）
export function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}

