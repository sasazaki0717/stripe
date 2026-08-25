const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.upsert({
    where: { email: 'demo-user@example.com' },
    update: { name: 'Demo User', stripeCustomerId: 'cus_demo_123' },
    create: { email: 'demo-user@example.com', name: 'Demo User', stripeCustomerId: 'cus_demo_123' }
  })

  await prisma.subscription.upsert({
    where: { userId: user.id },
    update: {
      status: 'active',
      stripePriceId: 'sample-monthly',
      currentPeriodStart: Math.floor(Date.now() / 1000),
      currentPeriodEnd: Math.floor(Date.now() / 1000) + 86400,
      cancelAtPeriodEnd: false
    },
    create: {
      userId: user.id,
      status: 'active',
      stripePriceId: 'sample-monthly',
      currentPeriodStart: Math.floor(Date.now() / 1000),
      currentPeriodEnd: Math.floor(Date.now() / 1000) + 86400,
      cancelAtPeriodEnd: false
    }
  })

  await prisma.purchaseHistory.create({
    data: {
      userId: user.id,
      eventType: 'checkout.session.completed',
      amount: 1000,
      currency: 'jpy',
      status: 'paid',
      stripeCheckoutSessionId: 'cs_test_active_state'
    }
  })

  const result = await prisma.user.findFirst({
    where: { email: 'demo-user@example.com' },
    include: {
      subscription: true,
      purchaseHistory: { take: 1, orderBy: { createdAt: 'desc' } }
    }
  })

  console.log(JSON.stringify(result, null, 2))
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
