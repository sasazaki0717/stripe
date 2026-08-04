<template>
  <main class="page-shell">
    <SubscriptionHero />

    <section class="status-card" v-if="statusMessage">
      <p>{{ statusMessage }}</p>
    </section>

    <section class="plan-grid">
      <SubscriptionPlanCard
        v-for="plan in plans"
        :key="plan.id"
        :plan="plan"
        :selected="selectedPlan === plan.id"
        @select="selectPlan(plan.id)"
      />
    </section>

    <CheckoutCard
      :selectedPlan="selectedPlanData"
      :checkoutStatus="checkoutStatus"
      :errorMessage="errorMessage"
      @checkout="checkout"
    />
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import SubscriptionHero from '@/components/subscription/SubscriptionHero.vue'
import SubscriptionPlanCard from '@/components/subscription/SubscriptionPlanCard.vue'
import CheckoutCard from '@/components/subscription/CheckoutCard.vue'

const runtimeConfig = useRuntimeConfig()
const route = useRoute()
const router = useRouter()

const plans = [
  {
    id: 'monthly',
    category: '学習プラン',
    name: '月額プラン',
    description: '毎月更新される学習サブスクリプションです。',
    price: '¥1,000'
  },
  {
    id: 'yearly',
    category: '学習プラン',
    name: '年額プラン',
    description: '年間契約でお得に学習を続ける方向けです。',
    price: '¥10,000'
  }
]

const selectedPlan = ref<'monthly' | 'yearly'>('monthly')
const checkoutStatus = ref<'idle' | 'pending' | 'success' | 'error'>('idle')
const errorMessage = ref('')
const statusMessage = ref('')

const selectedPlanData = computed(() => plans.find((plan) => plan.id === selectedPlan.value))

function selectPlan(planId: 'monthly' | 'yearly') {
  selectedPlan.value = planId
}

onMounted(() => {
  if (route.query.success) {
    checkoutStatus.value = 'success'
    statusMessage.value = '決済が完了しました。ありがとうございます。'
    router.replace({ path: '/', query: {} })
  }
  if (route.query.canceled) {
    checkoutStatus.value = 'error'
    errorMessage.value = '決済がキャンセルされました。再度お試しください。'
    statusMessage.value = ''
    router.replace({ path: '/', query: {} })
  }
})

async function checkout() {
  if (!runtimeConfig.public.stripePublishableKey) {
    checkoutStatus.value = 'error'
    errorMessage.value = '公開可能キーが設定されていません。env を確認してください。'
    return
  }

  if (!selectedPlanData.value) {
    checkoutStatus.value = 'error'
    errorMessage.value = 'プランが選択されていません。'
    return
  }

  checkoutStatus.value = 'pending'
  errorMessage.value = ''

  try {
    const response = await $fetch<{ url?: string }>('/api/stripe/subscription', {
      method: 'POST',
      body: {
        planId: selectedPlanData.value.id
      }
    })

    if (!response.url) {
      throw new Error('Checkout URL が返されませんでした。')
    }

    window.location.href = response.url
  } catch (error) {
    console.error(error)
    checkoutStatus.value = 'error'
    errorMessage.value = '購読チェックアウトの作成に失敗しました。コンソールを確認してください。'
  }
}
</script>

<style scoped>
.page-shell {
  min-height: 100vh;
  background: linear-gradient(180deg, #edf2ff 0%, #ffffff 100%);
  padding: 32px;
}

.status-card {
  max-width: 900px;
  margin: 0 auto 20px;
  padding: 28px;
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.08);
  color: #0f172a;
}

.plan-grid {
  display: grid;
  gap: 18px;
}
</style>