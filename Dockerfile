# Nuxt.js アプリケーション用 Dockerfile
FROM node:22-alpine AS builder

WORKDIR /app

# 依存関係のインストール
COPY package*.json ./
RUN npm ci

# アプリケーションのコピーとビルド
COPY . .
RUN npm run build

# 本番環境用イメージ
FROM node:22-alpine

WORKDIR /app

# 本番依存関係のみインストール
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# ビルド成果物をコピー
COPY --from=builder /app/.output ./.output

# ポート公開
EXPOSE 3000

# 環境変数
ENV NODE_ENV=production
ENV NITRO_PORT=3000
ENV NITRO_HOST=0.0.0.0

# アプリケーション起動
CMD ["node", ".output/server/index.mjs"]

