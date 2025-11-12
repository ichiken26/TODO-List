# TODO List アプリケーション

Nuxt.js 4.2.1 と SQLite を使用した TODO リスト管理アプリケーションです。

## 必要な環境

- Node.js: **22.16.0** 以上（推奨: 22.16.0）
- npm: Node.js に含まれています

## セットアップ手順

### 1. Node.js のバージョン確認

```bash
node --version
```

Node.js がインストールされていない場合、またはバージョンが異なる場合は、以下のいずれかの方法でインストール/切り替えを行ってください。

#### 方法A: nvm (Node Version Manager) を使用する場合（推奨）

```bash
# nvm がインストールされているか確認
nvm --version

# nvm がインストールされていない場合、インストール
# macOS/Linux:
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Windows:
# https://github.com/coreybutler/nvm-windows/releases からインストーラーをダウンロード

# プロジェクトディレクトリに移動後、.nvmrc で指定されたバージョンをインストール・使用
nvm install 22.16.0
nvm use 22.16.0
```

#### 方法B: Node.js を直接インストールする場合

[Node.js公式サイト](https://nodejs.org/)から Node.js 22.16.0 をダウンロードしてインストールしてください。

### 2. プロジェクトディレクトリに移動

```bash
cd TODO-List
```

### 3. 依存関係のインストール

```bash
npm install
```

### 4. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで `http://localhost:3000` を開いてアプリケーションを確認できます。

## よく使うコマンド

### 開発サーバーの起動

```bash
npm run dev
```

### 本番用ビルド

```bash
npm run build
```

### 本番ビルドのプレビュー

```bash
npm run preview
```

## トラブルシューティング

### Vue が見れない / エラーが発生する場合

1. **Node.js のバージョンを確認**
   ```bash
   node --version
   ```
   22.16.0 であることを確認してください。

2. **node_modules を削除して再インストール**
   ```bash
   rm -rf node_modules
   npm install
   ```

3. **キャッシュをクリア**
   ```bash
   rm -rf .nuxt .output .cache
   npm run dev
   ```

4. **better-sqlite3 の再ビルド（ネイティブモジュールのエラーの場合）**
   ```bash
   npm rebuild better-sqlite3
   ```

### データベースについて

- データベースファイルは `data/todos.db` に自動的に作成されます
- 初回起動時に自動的に初期化されます
- `.gitignore` で除外されているため、リポジトリには含まれません

## プロジェクト構造

```
TODO-List/
├── app/
│   ├── components/     # Vue コンポーネント
│   ├── composables/    # 再利用可能なロジック
│   ├── constants/      # 定数定義
│   └── pages/          # ページコンポーネント
├── server/
│   ├── api/            # API エンドポイント
│   └── utils/          # サーバー側ユーティリティ
├── data/               # SQLite データベース（自動生成）
├── package.json        # プロジェクト設定
└── .nvmrc             # Node.js バージョン指定
```

## 参考資料

- [Nuxt.js ドキュメント](https://nuxt.com/docs/getting-started/introduction)
- [Vue.js ドキュメント](https://vuejs.org/)
