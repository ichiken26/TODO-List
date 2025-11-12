# セットアップコマンド一覧

このプロジェクトを初めてセットアップする際に必要なコマンドを順番に記載しています。

## 前提条件

- Node.js 22.16.0 以上がインストールされていること

## セットアップ手順

### 1. Node.js のバージョン確認

```bash
node --version
```

**期待される出力**: `v22.16.0` またはそれ以上

### 2. nvm を使用する場合（推奨）

```bash
# nvm がインストールされているか確認
nvm --version

# プロジェクトで指定された Node.js バージョンをインストール
nvm install 22.16.0

# プロジェクトで指定された Node.js バージョンを使用
nvm use 22.16.0
```

### 3. プロジェクトディレクトリに移動

```bash
cd TODO-List
```

### 4. 依存関係のインストール

```bash
npm install
```

**所要時間**: 1-3分程度（ネットワーク速度による）

### 5. 開発サーバーの起動

```bash
npm run dev
```

**期待される出力**: 
```
✔ Nuxt is ready
  ➜ Local:   http://localhost:3000/
```

### 6. ブラウザで確認

ブラウザで `http://localhost:3000` を開いてアプリケーションを確認してください。

## エラーが発生した場合

### エラー: "Vueが見れない" / "Cannot find module"

以下のコマンドを順番に実行してください：

```bash
# 1. node_modules を削除
rm -rf node_modules

# 2. 依存関係を再インストール
npm install

# 3. キャッシュをクリア
rm -rf .nuxt .output .cache

# 4. 開発サーバーを再起動
npm run dev
```

### エラー: "better-sqlite3" 関連

```bash
# ネイティブモジュールを再ビルド
npm rebuild better-sqlite3

# その後、開発サーバーを起動
npm run dev
```

### エラー: Node.js のバージョンが異なる

```bash
# nvm を使用している場合
nvm use 22.16.0

# または、Node.js を直接インストールしている場合
# Node.js 22.16.0 をインストールしてください
```

## よく使うコマンド

| コマンド | 説明 |
|---------|------|
| `npm run dev` | 開発サーバーを起動 |
| `npm run build` | 本番用ビルドを作成 |
| `npm run preview` | 本番ビルドをプレビュー |
| `npm install` | 依存関係をインストール |

## 注意事項

- 初回起動時に `data/todos.db` が自動的に作成されます
- データベースファイルは `.gitignore` で除外されているため、リポジトリには含まれません
- 開発サーバーを停止する場合は、ターミナルで `Ctrl + C` を押してください

