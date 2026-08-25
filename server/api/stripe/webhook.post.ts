import Stripe from 'stripe'

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig()
  const stripe = new Stripe(runtimeConfig.stripeSecretKey || '', {
    apiVersion: '2025-02-24.acacia'
  })

  const signature = event.node.req.headers['stripe-signature']
  const body = await readBody(event)

  if (!signature || !body) {
    throw createError({ statusCode: 400, statusMessage: 'Missing Stripe signature or body' })
  }

  try {
    const eventData = stripe.webhooks.constructEvent(
      body,
      signature,
      runtimeConfig.stripeWebhookSecret || ''
    )

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
