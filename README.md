# Stripe × Nuxt 学習用サンプル

このリポジトリは、Nuxt + TypeScript + Stripe Checkout を使った自己学習用の最小実装です。

## 事前準備

1. Stripe ダッシュボードで商品価格 ID を作成します。
2. `.env` に以下を設定します。

```env
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

> `envsample` も同じキー名を使っているため、ここに必要な設定をコピーして利用できます。

## セットアップ

```bash
npm install
npm run dev
```

ブラウザで `http://localhost:3000` を開き、購入ボタンから Checkout へ進めます。

## 画面構成

- 商品カード一覧
- Stripe Checkout へのリダイレクト
- 決済成功後のリダイレクト先（必要に応じて拡張可能）

## 補足

- サーバー側 API は [server/api/stripe/checkout.post.ts](server/api/stripe/checkout.post.ts) にあります。
- クライアント側の Stripe 初期化は [app/app.vue](app/app.vue) で行っています。
