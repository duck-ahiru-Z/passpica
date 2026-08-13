# プロジェクト構造 (Project Structure)

このプロジェクトは Next.js (App Router) をベースに構築されています。
開発に参加する方が、どこに何のファイルがあるのかを把握しやすいように各ディレクトリの役割をまとめています。

## ディレクトリ構成

```text
passpica/
├── content/               # アプリケーションで表示するコンテンツ（Markdownファイルなど）が格納されます。
│   └── study-methods/     # 勉強法に関するコンテンツ
├── public/                # 画像やファビコン(favicon.ico)などの静的アセットが格納されます。
├── src/                   # ソースコードのメインディレクトリ
│   ├── app/               # Next.js App Routerのページコンポーネントとルーティング
│   │   ├── articles/      # 記事ページ
│   │   ├── drill/         # ドリル・問題演習ページ
│   │   ├── learn/         # 学習用ページ
│   │   ├── tools/         # ツール系ページ
│   │   ├── globals.css    # グローバルスタイルシート
│   │   ├── layout.tsx     # 全体レイアウト
│   │   └── page.tsx       # トップページ
│   │
│   ├── components/        # 再利用可能なReactコンポーネント
│   │   ├── elements/      # ボタンや入力フォームなどの基本的なUI要素
│   │   ├── layout/        # ヘッダーやフッター、コンテナなどのレイアウト用コンポーネント
│   │   ├── math/          # 数式表示に関連するコンポーネント
│   │   └── utils/         # ユーティリティコンポーネント
│   │
│   ├── data/              # アプリケーションで使用する静的データやデータ定義
│   │   ├── calendar/      # カレンダー関連のデータ
│   │   └── pseudo-lang/   # 擬似言語などのデータ
│   │
│   ├── lib/               # ユーティリティ関数や外部ライブラリのラッパー（例: markdown.ts）
│   │
│   └── types/             # TypeScriptの型定義ファイル（例: article.ts）
│
├── .gitignore             # Gitの管理対象外にするファイル/ディレクトリの指定
├── eslint.config.mjs      # ESLint (静的解析ツール) の設定
├── next.config.ts         # Next.js の全体設定
├── package.json           # プロジェクトの依存関係パッケージとスクリプト（npm/yarn）
├── postcss.config.mjs     # PostCSS (CSS変換ツール) の設定
├── tailwind.config.ts     # Tailwind CSS のスタイリング設定
└── tsconfig.json          # TypeScript のコンパイラ設定
```

## 各ディレクトリの役割と編集方針

1. **`src/app/` (ページとルーティング)**
   - URLに対応するページを作成する場合は、この中にディレクトリを作り、その中に `page.tsx` を配置します。（例: `/articles` なら `src/app/articles/page.tsx`）
2. **`src/components/` (UIコンポーネント)**
   - 複数のページで使い回すパーツ（ボタン、カード、ナビゲーションなど）はここに作成します。
   - 役割ごとに `elements`, `layout` 等に整理して配置してください。
3. **`src/lib/` (ロジックとユーティリティ)**
   - コンポーネントに依存しない、純粋なJavaScript/TypeScriptの関数（Markdownのパース処理など）はここに記述します。
4. **`src/types/` (型定義)**
   - アプリケーション全体で共通して使用するTypeScriptの型（Type/Interface）はここにまとめます。
5. **`content/` (コンテンツデータ)**
   - 記事データや静的なマークダウンファイルはここに保存し、`src/lib/` の関数等を使って読み込みます。

---
*※ 新しいディレクトリや大きな機能追加を行った際は、このファイルを適宜更新してください。*
