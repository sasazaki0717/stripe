# 基本設計書

## 1. 概要
このシステムは、Nuxt を使って Stripe Checkout とサブスクリプション決済を実現するための基本設計書です。
ユーザーがプランを選択すると、サーバー側で Stripe Checkout セッションを作成し、決済完了後は Webhook を受けて契約状態を同期します。

## 2. システム構成
- フロントエンド: Nuxt / Vue 3
- サーバーサイド: Nuxt の server API
- データベース: SQLite + Prisma
- 決済基盤: Stripe
- 認証方式: 簡易認証（メールアドレスをベースにする）

## 3. 機能要件
### 3.1 ユーザー機能
- ユーザーの登録および取得
- メールアドレスベースの簡易認証
- Stripe の顧客ID とユーザーを紐付ける

### 3.2 サブスクリプション機能
- プランの選択
- Stripe Checkout セッションの作成
- サブスクリプション状態の取得・更新
- Webhook による状態同期

### 3.3 決済履歴機能
- 決済イベントの保存
- 請求や契約変更の履歴管理
- ステータスの追跡

## 4. データフロー
1. ユーザーがプランを選択する
2. サーバー側で Stripe Checkout セッションを作成する
3. Stripe Checkout に遷移する
4. 決済が完了した後、Stripe から Webhook を受信する
5. Webhook の内容に応じて DB を更新する

## 5. テーブルの役割
- users: ユーザー情報と Stripe の顧客ID を保持する
- subscriptions: 現在の契約状態や期間情報を保持する
- purchase_history: 決済・請求イベントの履歴を保持する

## 6. 主な処理内容
### 6.1 Checkout セッション作成
- ユーザーに紐づく Stripe Customer を作成または取得する
- 選択されたプランに応じて Checkout セッションを生成する

### 6.2 Webhook 処理
- checkout.session.completed
- customer.subscription.updated
- customer.subscription.deleted
- invoice.payment_succeeded
- invoice.payment_failed

## 7. 運用方針
- Webhook は必ず冪等に処理する
- Stripe を正本のデータソースとして扱い、ローカルDBは検索・表示・再同期用のキャッシュとして利用する
- 状態の同期が必要な場合は、Stripe のイベントを優先して反映する
