import Stripe from 'stripe'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)

  const secretKey = config.stripeSecretKey

  if (!secretKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'STRIPE_SECRET_KEY is not configured.'
    })
  }

  const stripe = new Stripe(secretKey)

  const products = {
    'sample-monthly': {
      name: 'Nuxt × Stripe 学習プラン（月額）',
      amount: 1000,
      currency: 'jpy'
    },
    'sample-yearly': {
      name: 'Nuxt × Stripe 学習プラン（年額）',
      amount: 10000,
      currency: 'jpy'
    }
  }

  const product = products[body.productId]

  if (!product) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid productId.'
    })
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: product.currency,
          product_data: {
            name: product.name
          },
          unit_amount: product.amount
        },
        quantity: 1
      }
    ],
    success_url: `${getRequestURL(event).origin}/?success=true`,
    cancel_url: `${getRequestURL(event).origin}/?canceled=true`
  })

  return {
    sessionId: session.id,
    url: session.url
  }
})
