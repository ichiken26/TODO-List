# セットアップガイド

## 前提条件

- Node.js 22.16.0 以上
- Docker（ローカル開発用）

## セットアップ手順

### 1. Node.js のバージョン確認

```bash
node --version
```

**期待される出力**: `v22.16.0` またはそれ以上

### 2. nvm を使用する場合（推奨）

```bash
nvm install 22.16.0
nvm use 22.16.0
```

### 3. 依存関係のインストール

```bash
npm install
```

### 4. DynamoDB Local の起動

```bash
docker compose up -d dynamodb-local
```

### 5. DynamoDB テーブルの作成

```bash
# usersテーブル
aws dynamodb create-table \
  --table-name users \
  --attribute-definitions \
    AttributeName=id,AttributeType=S \
    AttributeName=user_name,AttributeType=S \
  --key-schema \
    AttributeName=id,KeyType=HASH \
  --global-secondary-indexes \
    IndexName=user_name-index,KeySchema=[{AttributeName=user_name,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5} \
  --billing-mode PROVISIONED \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
  --endpoint-url http://localhost:8000

# todosテーブル
aws dynamodb create-table \
  --table-name todos \
  --attribute-definitions \
    AttributeName=partition_key,AttributeType=S \
    AttributeName=id,AttributeType=S \
  --key-schema \
    AttributeName=partition_key,KeyType=HASH \
    AttributeName=id,KeyType=RANGE \
  --billing-mode PROVISIONED \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
  --endpoint-url http://localhost:8000
```

### 6. 環境変数の設定

`.env.local` を作成:

```bash
AWS_REGION=ap-northeast-1
AWS_ENDPOINT=http://localhost:8000
AWS_ACCESS_KEY_ID=local
AWS_SECRET_ACCESS_KEY=local
DYNAMODB_TABLE_USERS=users
DYNAMODB_TABLE_TODOS=todos
JWT_SECRET=your-secret-key-here
```

### 7. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで `http://localhost:3000` を開いて確認してください。

## トラブルシューティング

### DynamoDB Local に接続できない

```bash
# Dockerコンテナの状態を確認
docker compose ps

# ログを確認
docker compose logs dynamodb-local

# 再起動
docker compose restart dynamodb-local
```

### テーブルが作成できない

- DynamoDB Local が起動していることを確認
- `--endpoint-url http://localhost:8000` を指定していることを確認

### その他のエラー

```bash
# node_modules を削除して再インストール
rm -rf node_modules
npm install

# キャッシュをクリア
rm -rf .nuxt .output .cache
npm run dev
```

## 本番環境（AWS）

環境変数を設定:

```bash
AWS_REGION=ap-northeast-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
DYNAMODB_TABLE_USERS=users
DYNAMODB_TABLE_TODOS=todos
JWT_SECRET=your-secret-key
```

AWS CLI でテーブルを作成（`--endpoint-url` は不要）:

```bash
aws dynamodb create-table --table-name users ...
aws dynamodb create-table --table-name todos ...
```
