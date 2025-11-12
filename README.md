# TODO List アプリケーション

Nuxt.js 4.2.1 と DynamoDB を使用した TODO リスト管理アプリケーションです。

## 必要な環境

- Node.js: **22.16.0** 以上（推奨: 22.16.0）
- npm: Node.js に含まれています
- Docker: ローカル開発用（DynamoDB Local）

## クイックスタート

```bash
# 1. 依存関係のインストール
npm install

# 2. DynamoDB Localの起動（別ターミナル）
docker compose up -d dynamodb-local

# 3. テーブルの作成
aws dynamodb create-table --table-name users --attribute-definitions AttributeName=id,AttributeType=S AttributeName=user_name,AttributeType=S --key-schema AttributeName=id,KeyType=HASH --global-secondary-indexes IndexName=user_name-index,KeySchema=[{AttributeName=user_name,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5} --billing-mode PROVISIONED --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 --endpoint-url http://localhost:8000

aws dynamodb create-table --table-name todos --attribute-definitions AttributeName=partition_key,AttributeType=S AttributeName=id,AttributeType=S --key-schema AttributeName=partition_key,KeyType=HASH AttributeName=id,KeyType=RANGE --billing-mode PROVISIONED --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 --endpoint-url http://localhost:8000

# 4. 環境変数の設定
cp .env.example .env.local

# 5. 開発サーバーの起動
npm run dev
```

詳細は `SETUP.md` を参照してください。

## プロジェクト構造

```
TODO-List/
├── app/
│   ├── components/     # Vue コンポーネント
│   ├── composables/   # 再利用可能なロジック
│   ├── constants/     # 定数定義
│   └── pages/         # ページコンポーネント
├── server/
│   ├── api/           # API エンドポイント
│   └── utils/         # サーバー側ユーティリティ
├── package.json       # プロジェクト設定
└── .nvmrc            # Node.js バージョン指定
```
