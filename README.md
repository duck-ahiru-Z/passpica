# Passpica

このプロジェクトは Next.js (App Router) で構築された受験対策・学習サポートアプリケーションです。

## 開発環境の構築手順 (Getting Started)

このプロジェクトをローカルで立ち上げるための手順です。

### 1. 事前準備
Node.js (v18 以上推奨) と Git がインストールされていることを確認してください。

### 2. プロジェクトのクローン
ターミナルを開き、以下のコマンドを実行します。
```bash
git clone https://github.com/duck-ahiru-Z/passpica.git
cd passpica
```

### 3. パッケージのインストール
以下のコマンドで依存関係をインストールします。
```bash
npm install
```

### 4. 開発サーバーの起動
以下のコマンドでローカルサーバーを起動します。
```bash
npm run dev
```

起動後、ブラウザで [http://localhost:3000](http://localhost:3000) にアクセスすると画面が表示されます。

## 開発の流れ

ファイルを編集して保存すると、自動的にブラウザ上の画面が更新されます。
変更を共有する場合は以下のコマンドでプッシュしてください。

```bash
git add .
git commit -m "変更内容を記述"
git push
```

## Gemini Canvas の匿名イベント計測

`POST /api/analytics` は、Gemini Canvasから匿名の利用イベントだけを受け取り、GA4 Measurement Protocolへ転送します。問題文・答案・添削本文・画像などの学習内容は受け付けず、保存もしません。

VercelのProject Settings → Environment Variablesに、次の環境変数を設定してください。

- `GA4_MEASUREMENT_ID`: `G-CR7H15LZZ8`（未設定時もこのIDが既定値です）
- `GA4_API_SECRET`: GA4管理画面で発行したMeasurement Protocol API Secret

API Secretの実値はリポジトリへ追加しないでください。

### GA4環境変数の用途

- `NEXT_PUBLIC_GA4_MEASUREMENT_ID`: passpica本体のブラウザ側GA4用。公開されるMeasurement IDです。`G-CR7H15LZZ8`を設定してください。
- `GA4_MEASUREMENT_ID`: `/api/analytics` がGA4 Measurement Protocolへ送信する際のMeasurement IDです。
- `GA4_API_SECRET`: `/api/analytics` 用のMeasurement Protocol API Secretです。Vercelにのみ設定し、Gitやクライアントへ公開しないでください。

ブラウザ側はGoogleタグの自動page_viewを無効にし、初回表示とApp Routerのページ遷移を共通の手動計測で送信します。匿名イベントは `src/lib/analytics.ts` の `trackEvent` を利用してください。
