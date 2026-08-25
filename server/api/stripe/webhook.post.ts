import Stripe from 'stripe'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const getPriceIdFromProductId = (productId?: string | null) => {
  switch (productId) {
    case 'sample-monthly':
    case 'sample-yearly':
      return productId
    default:
      return null
  }
}

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig()
  const stripe = new Stripe(runtimeConfig.stripeSecretKey || '', {
    apiVersion: '2025-02-24.acacia'
  })

  const signature = event.node.req.headers['stripe-signature']
  const rawBody = await readRawBody(event)

  if (!signature || !rawBody) {
    throw createError({ statusCode: 400, statusMessage: 'Missing Stripe signature or body' })
  }

  try {
    const eventData = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      runtimeConfig.stripeWebhookSecret || ''
    )

    if (eventData.type === 'checkout.session.completed') {
      const session = eventData.data.object as Stripe.Checkout.Session
      const productId = session.metadata?.productId || session.metadata?.planId || null
      const priceId = getPriceIdFromProductId(productId) || session.metadata?.priceId || null
      const email = session.customer_details?.email || 'demo-user@example.com'

      const user = await prisma.user.upsert({
        where: { email },
        update: {
          name: session.customer_details?.name || 'Demo User',
          stripeCustomerId: session.customer || undefined
        },
        create: {
          email,
          name: session.customer_details?.name || 'Demo User',
          stripeCustomerId: session.customer || null
        }
      })

      const amount = typeof session.amount_total === 'number' ? session.amount_total : 0
      const currency = (session.currency || 'jpy').toLowerCase()
      const subscriptionId = session.subscription?.toString() || `sub_demo_${Date.now()}`

      await prisma.subscription.upsert({
        where: { userId: user.id },
        update: {
          status: 'active',
          stripePriceId: priceId,
          currentPeriodStart: Math.floor(Date.now() / 1000),
          currentPeriodEnd: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
          cancelAtPeriodEnd: false,
          stripeSubscriptionId: subscriptionId
        },
        create: {
          userId: user.id,
          status: 'active',
          stripePriceId: priceId,
          currentPeriodStart: Math.floor(Date.now() / 1000),
          currentPeriodEnd: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
          cancelAtPeriodEnd: false,
          stripeSubscriptionId: subscriptionId
        }
      })

      await prisma.purchaseHistory.create({
        data: {
          userId: user.id,
          eventType: eventData.type,
          amount,
          currency,
          status: 'paid',
          stripeCheckoutSessionId: session.id,
          stripeInvoiceId: session.invoice?.toString() || null
        }
      })
    }

    console.log('Stripe webhook received:', eventData.type)

    return {
      received: true,
      type: eventData.type
    }
  } catch (error) {
    console.error('Webhook verification failed:', error)
    throw createError({ statusCode: 400, statusMessage: 'Webhook verification failed' })
  }
})
