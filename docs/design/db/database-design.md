# DB設計書

## 1. 目的
この設計書は、Stripe と連携したサブスクリプション決済システムを実装するためのデータベース設計をまとめたものです。
本DBは、Stripeの情報をローカルで保持しておく「キャッシュ」として使うほか、ユーザーごとの契約状態や決済履歴を素早く参照できるようにすることを目的としています。

## 2. 前提条件
- フレームワーク: Nuxt
- データベース: SQLite
- ORM: Prisma
- 認証方式: 簡易認証（メールアドレスを基本にする）
- Stripe連携: 顧客ID、サブスクリプション状態、Webhook同期を前提とする

## 3. テーブル一覧

### 3.1 users
ユーザーの基本情報を管理するテーブルです。

| 項目 | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| id | String | はい | ユーザーを識別するID |
| createdAt | DateTime | はい | レコード作成日時 |
| updatedAt | DateTime | はい | レコード更新日時 |
| email | String | はい | メールアドレス。ユニーク制約あり |
| name | String? | いいえ | 表示名 |
| stripeCustomerId | String? | いいえ | Stripe上の顧客ID |

### 3.2 subscriptions
ユーザーのサブスクリプション契約状態を管理するテーブルです。

| 項目 | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| id | String | はい | サブスクリプションID |
| createdAt | DateTime | はい | 作成日時 |
| updatedAt | DateTime | はい | 更新日時 |
| userId | String | はい | 紐づくユーザーID |
| stripeSubscriptionId | String? | いいえ | Stripe上のサブスクリプションID |
| status | String | はい | Stripeの契約状態。例: active, canceled, past_due |
| stripePriceId | String? | いいえ | Stripeの価格ID |
| currentPeriodStart | Int? | いいえ | 現在の課金期間開始タイムスタンプ |
| currentPeriodEnd | Int? | いいえ | 現在の課金期間終了タイムスタンプ |
| cancelAtPeriodEnd | Boolean | はい | 次回の期間終了時に解約するかどうか |

### 3.3 purchase_history
決済や契約イベントの履歴を管理するテーブルです。

| 項目 | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| id | String | はい | 履歴ID |
| createdAt | DateTime | はい | 作成日時 |
| updatedAt | DateTime | はい | 更新日時 |
| userId | String | はい | 関連するユーザーID |
| subscriptionId | String? | いいえ | 関連するサブスクリプションID |
| stripeCheckoutSessionId | String? | いいえ | Stripe Checkout セッションID |
| stripeInvoiceId | String? | いいえ | Stripe Invoice ID |
| eventType | String | はい | イベント種別。例: checkout.completed |
| amount | Int? | いいえ | 決済金額 |
| currency | String | はい | 通貨コード。例: jpy |
| status | String | はい | 履歴の状態。例: pending, succeeded, failed |

## 4. テーブル間の関係
- User と Subscription は 1対1 の関係です。
  - 1人のユーザーは基本的に1つの契約情報を持つ前提です。
- User と PurchaseHistory は 1対多の関係です。
  - 1人のユーザーに対して複数の決済履歴が紐づきます。
- Subscription と PurchaseHistory は 1対多の関係です。
  - 1つの契約に対して複数のイベント履歴を残せます。

## 5. 設計方針
- Stripeの重要な状態は、ローカルDBにキャッシュして管理します。
- サブスクリプション状態は `boolean` ではなく、Stripeの状態文字列をそのまま保持する設計にしています。
- Webhookの受信時に状態を同期できるよう、Stripe側のIDを保持します。
- すべてのテーブルに `id`, `createdAt`, `updatedAt` を持たせ、監査や追跡をしやすくしています。

## 6. 運用上の注意点
- Webhookは必ず冪等に処理してください。
  - 同じイベントを何度受けても、同じ結果になるようにします。
- 同じ Stripe のサブスクリプションや請求情報が重複して保存されないように、IDをユニークで管理します。
- Webhookで状態が更新されたときは、必ず `updatedAt` を更新します。
- Stripe を正本とし、ローカルDBは検索・表示・再同期用のキャッシュとして扱うのが前提です。
