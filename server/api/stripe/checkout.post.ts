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

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        price: body.priceId,
        quantity: 1
      }
    ],
    success_url: `${getRequestURL(event).origin}/?success=true`,
    cancel_url: `${getRequestURL(event).origin}/?canceled=true`
  })

  return {
    sessionId: session.id
  }
})
