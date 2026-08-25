# SQLite + Prisma を使ったサブスクリプション設計

## 1. 方針
今回の学習用途では、Stripe を「正本データ」、SQLite を「表示用・検索用・キャッシュ用」として使う設計にします。

つまり、Stripe 側で契約状態や決済情報が正しく管理されている前提で、ローカル DB には表示や検索に必要な情報だけを保持します。

- Stripe: 正本
- SQLite: 表示・検索・業務確認の補助
- Prisma: ORM で簡潔に扱う

## 2. 使うテーブル
- User
- Subscription
- PurchaseHistory

必要に応じて、将来は `deletedAt` も使えますが、今回は学習用途なので `createdAt` / `updatedAt` を中心に設計します。

## 3. テーブル設計

### User
ユーザー情報を持つテーブルです。

- id
- createdAt
- updatedAt
- deletedAt（必要なら追加）
- email
- name
- stripeCustomerId

意図:
- 認証の簡易化のためにメールアドレスをユニークキーにします
- Stripe の顧客ID を紐付けて、決済とユーザーを結びます
- `deletedAt` は将来的に論理削除をしたい場合に使います

### Subscription
契約状態を管理するテーブルです。

- id
- createdAt
- updatedAt
- deletedAt（必要なら追加）
- userId
- stripeSubscriptionId
- status
- stripePriceId
- currentPeriodStart
- currentPeriodEnd
- cancelAtPeriodEnd

意図:
- Stripe の状態を文字列で管理します
- `active`, `canceled`, `past_due`, `trialing` のような値を保持します
-　`boolean` ではなく文字列にして、Stripe の仕様に合わせます

### PurchaseHistory
購入履歴・決済履歴を保存するテーブルです。

- id
- createdAt
- updatedAt
- deletedAt（必要なら追加）
- userId
- subscriptionId
- stripeCheckoutSessionId
- stripeInvoiceId
- eventType
- amount
- currency
- status

意図:
- 購入や請求の履歴を残せます
- Stripe のイベントごとに履歴を残すことで、あとから確認しやすくなります
- `deletedAt` は履歴抹消ではなく、論理削除が必要な場合に使えます

## 4. Prisma スキーマ案

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id               String   @id @default(cuid())
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
  deletedAt        DateTime?
  email            String   @unique
  name             String?
  stripeCustomerId String?  @unique

  subscription     Subscription?
  purchaseHistory  PurchaseHistory[]

  @@map("users")
}

model Subscription {
  id                   String   @id @default(cuid())
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt
  deletedAt            DateTime?

  userId               String   @unique
  stripeSubscriptionId String?  @unique
  status               String   @default("inactive")
  stripePriceId        String?
  currentPeriodStart   Int?
  currentPeriodEnd     Int?
  cancelAtPeriodEnd    Boolean  @default(false)

  user                User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  purchaseHistory     PurchaseHistory[]

  @@map("subscriptions")
}

model PurchaseHistory {
  id                    String   @id @default(cuid())
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  deletedAt             DateTime?

  userId                String
  subscriptionId        String?
  stripeCheckoutSessionId String? @unique
  stripeInvoiceId       String? @unique
  eventType             String
  amount                Int?
  currency              String   @default("jpy")
  status                String   @default("pending")

  user                  User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  subscription          Subscription? @relation(fields: [subscriptionId], references: [id], onDelete: SetNull)

  @@map("purchase_history")
}
```

## 5. SQLite を使うメリット
- 無料で導入しやすい
- 学習用途には十分軽い
- Prisma と相性が良い
- 本番向けの設計思想を学ぶにはちょうどいい

## 6. SQLite を使うときの注意点
- 本番環境では PostgreSQL などへ移行する前提で設計する
- SQLite は並行数や大規模データで弱くなることがある
- Stripe の正本データは常に Stripe 側にある前提で、ローカル DB は補助的に扱う

## 7. 運用の考え方
- Stripe から Webhook を受けたら、DB を同期する
- 画面表示のためにローカルDBを参照する
- もし Stripe で不整合が起きた場合は、Stripe を正本として再同期する

## 8. 画面表示の例
- 現在の契約状態
  - status が `active` の場合は「契約中」
- 購入履歴一覧
  - createdAt を基準に一覧表示
  - status が `succeeded` なら「成功」
  - `failed` なら「失敗」

## 9. まとめ
今回は、学習用途として最もわかりやすい設計を採用します。

- Stripe は本体データ
- SQLite はキャッシュ兼検索表示用
- Prisma で簡単に操作
- `createdAt` / `updatedAt` は必須
- 必要なら `deletedAt` も追加可能

この設計なら、契約状態の表示と購入履歴の表示をすぐ作れます。
