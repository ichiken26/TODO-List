# AWSデプロイガイド

無料枠を最大限活用した最小コスト構成でAWSにデプロイする手順です。

## 推奨構成（最小コスト）

```
┌─────────────┐
│ CloudFront  │ (CDN - 無料枠: 1TB転送/月)
└──────┬──────┘
       │
┌──────▼──────┐
│ Amplify     │ (ホスティング + Lambda - 無料枠: 15GB/月)
└──────┬──────┘
       │
┌──────▼──────┐
│ DynamoDB    │ (無料枠: 25GBストレージ、200万読み取り/月)
└─────────────┘
```

**月額コスト**: **$0/月**（無料枠内で運用可能）

## 前提条件

- AWSアカウント（無料枠利用可能）
- AWS CLI インストール済み
- Git リポジトリ（GitHub/GitLab/Bitbucket）

## デプロイ手順

### 1. AWS CLIの設定

```bash
# AWS CLIのインストール確認
aws --version

# AWS認証情報の設定
aws configure
```

以下を入力:
- AWS Access Key ID: あなたのアクセスキー
- AWS Secret Access Key: あなたのシークレットキー
- Default region: `ap-northeast-1`
- Default output format: `json`

**アクセスキーの取得方法**:
1. AWS Console → IAM → ユーザー → セキュリティ認証情報
2. 「アクセスキーを作成」をクリック
3. アクセスキーIDとシークレットアクセスキーを保存

### 2. DynamoDBテーブルの作成

```bash
# usersテーブル（ユーザー情報）
aws dynamodb create-table \
  --table-name users \
  --attribute-definitions \
    AttributeName=id,AttributeType=S \
    AttributeName=user_name,AttributeType=S \
  --key-schema \
    AttributeName=id,KeyType=HASH \
  --global-secondary-indexes \
    IndexName=user_name-index,KeySchema=[{AttributeName=user_name,KeyType=HASH}],Projection={ProjectionType=ALL} \
  --billing-mode PAY_PER_REQUEST \
  --region ap-northeast-1

# todosテーブル（TODOリスト）
aws dynamodb create-table \
  --table-name todos \
  --attribute-definitions \
    AttributeName=partition_key,AttributeType=S \
    AttributeName=id,AttributeType=S \
  --key-schema \
    AttributeName=partition_key,KeyType=HASH \
    AttributeName=id,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST \
  --region ap-northeast-1

# テーブル作成の確認
aws dynamodb list-tables --region ap-northeast-1
```

**重要**: `PAY_PER_REQUEST`（オンデマンド）モードを使用することで、無料枠を最大限活用できます。小規模なアプリケーションでは追加コストは発生しません。

### 3. IAMロールの作成（Lambda実行用）

AmplifyがLambda関数を実行するためのIAMロールを作成:

```bash
# アカウントIDを取得
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# ポリシードキュメントを作成
cat > lambda-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
        "dynamodb:Query",
        "dynamodb:BatchWriteItem",
        "dynamodb:TransactWriteItems"
      ],
      "Resource": [
        "arn:aws:dynamodb:ap-northeast-1:${ACCOUNT_ID}:table/users",
        "arn:aws:dynamodb:ap-northeast-1:${ACCOUNT_ID}:table/users/index/*",
        "arn:aws:dynamodb:ap-northeast-1:${ACCOUNT_ID}:table/todos"
      ]
    }
  ]
}
EOF

# ポリシーを作成
aws iam create-policy \
  --policy-name TodoListDynamoDBPolicy \
  --policy-document file://lambda-policy.json

# ロールを作成
aws iam create-role \
  --role-name TodoListLambdaRole \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Principal": {
        "Service": ["lambda.amazonaws.com", "amplify.amazonaws.com"]
      },
      "Action": "sts:AssumeRole"
    }]
  }'

# ポリシーをロールにアタッチ
POLICY_ARN=$(aws iam list-policies --query 'Policies[?PolicyName==`TodoListDynamoDBPolicy`].Arn' --output text)
aws iam attach-role-policy \
  --role-name TodoListLambdaRole \
  --policy-arn ${POLICY_ARN}

# ロールARNをメモ（後で使用）
aws iam get-role --role-name TodoListLambdaRole --query 'Role.Arn' --output text
```

### 4. JWT Secretの生成

```bash
# 強力なランダム文字列を生成
openssl rand -base64 32
```

この値をメモしておきます（後でAmplifyの環境変数に設定します）。

### 5. Amplify Hosting でのデプロイ

#### 方法A: Amplify Console（推奨・最も簡単）

1. **AWS Amplify Console にアクセス**
   - https://console.aws.amazon.com/amplify/
   - 「New app」→「Host web app」を選択

2. **Gitリポジトリと接続**
   - GitHub/GitLab/Bitbucketを選択
   - リポジトリを選択
   - ブランチを選択（例: `main`）
   - 「次へ」をクリック

3. **ビルド設定**
   - 「新しい環境を追加」をクリック
   - 環境名: `main`（または任意）
   - ビルド設定を自動検出（Nuxt.jsを検出）
   - ビルド設定を編集（必要に応じて）:
     ```yaml
     version: 1
     frontend:
       phases:
         preBuild:
           commands:
             - npm ci
         build:
           commands:
             - npm run build
       artifacts:
         baseDirectory: .output/public
         files:
           - '**/*'
       cache:
         paths:
           - node_modules/**/*
     ```
   - 環境変数を追加:
     ```
     AWS_REGION=ap-northeast-1
     DYNAMODB_TABLE_USERS=users
     DYNAMODB_TABLE_TODOS=todos
     JWT_SECRET=<先ほど生成したJWT Secret>
     NODE_ENV=production
     ```
   - 「保存してデプロイ」をクリック

4. **デプロイの完了を待つ**
   - ビルドが完了するまで待つ（5-10分）
   - デプロイが成功すると、URLが表示されます（例: `https://main.xxxxx.amplifyapp.com`）

5. **カスタムドメインの設定（オプション）**
   - 「Domain management」をクリック
   - 「Add domain」をクリック
   - ドメイン名を入力
   - DNS設定に従ってドメインを設定

#### 方法B: Amplify CLI

```bash
# Amplify CLIのインストール
npm install -g @aws-amplify/cli

# Amplifyプロジェクトの初期化
amplify init

# ホスティングの追加
amplify add hosting

# 環境変数の設定
amplify env add

# デプロイ
amplify publish
```

### 6. nuxt.config.ts の確認

AmplifyでNuxt SSRを使用する場合、設定を確認:

```typescript
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  nitro: {
    preset: 'aws-lambda', // Amplify用のLambdaプリセット
  },
})
```

**注意**: Nuxt 4では、Amplifyが自動的にNitroを検出してLambda関数を生成します。上記の設定は明示的に指定する場合のみ必要です。

### 7. デプロイ後の確認

1. **Amplify URLにアクセス**
   - Amplify Consoleで表示されるURLにアクセス

2. **ユーザー登録**
   - 新規ユーザーを作成して動作確認

3. **TODO機能の確認**
   - TODOの追加、編集、削除が正常に動作することを確認

4. **CloudWatch Logsでログ確認**
   - AWS Console → CloudWatch → Logs
   - `/aws/amplify/` で始まるロググループを確認

## コスト見積もり（無料枠内）

| サービス | 無料枠 | 使用量（小規模） | 月額コスト |
|---------|--------|----------------|-----------|
| Amplify Hosting | 15GB転送/月 | 5GB/月 | **$0** |
| Lambda | 100万リクエスト/月 | 10万リクエスト/月 | **$0** |
| DynamoDB | 25GBストレージ、200万読み取り/月 | 1GB、10万読み取り/月 | **$0** |
| CloudFront | 1TB転送/月 | 50GB/月 | **$0** |

**合計**: **$0/月**（無料枠内で運用可能）

**注意**: 無料枠を超えた場合の料金:
- Amplify: $0.15/GB（15GB超過分）
- Lambda: $0.20/100万リクエスト（100万超過分）
- DynamoDB: $1.25/100万読み取りユニット（200万超過分）
- CloudFront: $0.085/GB（1TB超過分）

小規模なアプリケーション（月間10万リクエスト以下、データ1GB以下）では、無料枠内で運用可能です。

## セキュリティ設定

### IAMロールの確認

上記の手順3で作成したIAMロールが正しく設定されているか確認:

```bash
# ロールの確認
aws iam get-role --role-name TodoListLambdaRole

# アタッチされたポリシーの確認
aws iam list-attached-role-policies --role-name TodoListLambdaRole
```

### JWT_SECRETの管理

本番環境では、AWS Secrets Managerを使用することを推奨します（追加コスト: $0.40/月/シークレット）:

```bash
# シークレットを作成
aws secretsmanager create-secret \
  --name todo-list/jwt-secret \
  --secret-string "your-strong-secret-key-here" \
  --region ap-northeast-1
```

ただし、小規模なアプリケーションでは、Amplifyの環境変数に直接設定しても問題ありません。

## トラブルシューティング

### DynamoDBに接続できない

- IAMロールに適切な権限があるか確認
- リージョンが正しいか確認（`ap-northeast-1`）
- テーブル名が正しいか確認（`users`, `todos`）

```bash
# テーブルの状態を確認
aws dynamodb describe-table --table-name users --region ap-northeast-1
aws dynamodb describe-table --table-name todos --region ap-northeast-1
```

### Lambda関数がエラーになる

- CloudWatch Logsでログを確認
  - AWS Console → CloudWatch → Logs → `/aws/lambda/` で始まるロググループ
- 環境変数が正しく設定されているか確認
  - Amplify Console → 環境変数

### CORSエラー

- Amplifyが自動的にCORSを設定しますが、問題がある場合は:
  - Amplify Console → App settings → Rewrites and redirects
  - 必要に応じてCORSヘッダーを追加

### ビルドエラー

- Node.jsのバージョンを確認（22.16.0以上が必要）
- `package.json`の依存関係を確認
- ビルドログを確認（Amplify Console → Build history）

## 更新手順

```bash
# コードを更新
git add .
git commit -m "Update code"
git push origin main

# Amplifyが自動的にビルド・デプロイ
# または手動で再デプロイ:
# Amplify Console → 該当のブランチ → "Redeploy this version"
```

## リソースの削除（不要になった場合）

```bash
# Amplifyアプリの削除
# Amplify Console → App settings → General → Delete app

# DynamoDBテーブルの削除
aws dynamodb delete-table --table-name users --region ap-northeast-1
aws dynamodb delete-table --table-name todos --region ap-northeast-1

# IAMポリシーとロールの削除
aws iam detach-role-policy \
  --role-name TodoListLambdaRole \
  --policy-arn $(aws iam list-policies --query 'Policies[?PolicyName==`TodoListDynamoDBPolicy`].Arn' --output text)
aws iam delete-role --role-name TodoListLambdaRole
aws iam delete-policy \
  --policy-arn $(aws iam list-policies --query 'Policies[?PolicyName==`TodoListDynamoDBPolicy`].Arn' --output text)
```

## 参考リンク

- [AWS Amplify Documentation](https://docs.amplify.aws/)
- [DynamoDB Pricing](https://aws.amazon.com/dynamodb/pricing/)
- [Lambda Pricing](https://aws.amazon.com/lambda/pricing/)
- [Nuxt Deployment](https://nuxt.com/docs/getting-started/deployment)
- [AWS Free Tier](https://aws.amazon.com/free/)
