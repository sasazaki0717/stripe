import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const getPlanNameFromId = (priceId?: string | null) => {
  if (!priceId) return '未設定'

  switch (priceId) {
    case 'sample-monthly':
    case 'price_demo_monthly':
      return '月額プラン'
    case 'sample-yearly':
    case 'price_demo_yearly':
      return '年額プラン'
    default:
      return priceId
  }
}

export default defineEventHandler(async () => {
  const user = await prisma.user.findFirst({
    orderBy: { createdAt: 'desc' },
    include: {
      subscription: true,
      purchaseHistory: {
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    }
  })

  if (!user || !user.subscription) {
    return {
      user: user ? {
        id: user.id,
        email: user.email,
        name: user.name
      } : null,
      subscription: null,
      lastPurchase: null,
      state: {
        label: '未契約',
        text: '現在の契約はありません。購入または契約を行ってください。',
        tone: 'inactive'
      },
      updatedAt: new Date().toISOString()
    }
  }

  const subscription = user.subscription
  const lastPurchase = user.purchaseHistory[0] ?? null

  const statusMap: Record<string, { label: string; text: string; tone: 'active' | 'inactive' | 'warning' }> = {
    active: {
      label: '契約中',
      text: '現在、契約期間中です。利用は通常どおり継続されています。',
      tone: 'active'
    },
    trialing: {
      label: 'お試し中',
      text: '試用期間中です。設定が完了したら通常契約へ切り替わります。',
      tone: 'warning'
    },
    past_due: {
      label: '支払い遅延',
      text: '請求に遅延が発生しています。Stripe 側の支払い状況を確認してください。',
      tone: 'warning'
    },
    canceled: {
      label: '契約終了',
      text: '契約は終了しています。再購入または再契約が可能です。',
      tone: 'inactive'
    },
    inactive: {
      label: '未契約',
      text: '現在の契約はありません。購入または契約を行ってください。',
      tone: 'inactive'
    }
  }

  const currentStatus = statusMap[subscription.status] ?? statusMap.inactive
  const planName = getPlanNameFromId(subscription.stripePriceId)

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name
    },
    subscription: {
      id: subscription.id,
      status: subscription.status,
      planName,
      stripePriceId: subscription.stripePriceId,
      currentPeriodStart: subscription.currentPeriodStart,
      currentPeriodEnd: subscription.currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd
    },
    lastPurchase: lastPurchase ? {
      id: lastPurchase.id,
      eventType: lastPurchase.eventType,
      amount: lastPurchase.amount,
      currency: lastPurchase.currency,
      status: lastPurchase.status,
      createdAt: lastPurchase.createdAt
    } : null,
    state: currentStatus,
    updatedAt: new Date().toISOString()
  }
})
