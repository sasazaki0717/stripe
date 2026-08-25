<template>
  <main class="page-shell">
    <section class="hero-card">
      <h1>Stripe 学習用</h1>
    </section>

    <ContractStatusCard
      :status="{
        label: status.label,
        text: status.text,
        tone: status.tone,
        planName: subscriptionPlanName,
        periodText,
        updatedAt
      }"
      :loading="statusLoading"
      @refresh="loadStatus"
    />

    <section class="status-card" v-if="statusMessage">
      <p>{{ statusMessage }}</p>
    </section>

    <section class="product-grid">
      <article v-for="product in products" :key="product.id" class="product-card">
        <div>
          <p class="product-category">{{ product.category }}</p>
          <h2>{{ product.name }}</h2>
          <p class="product-description">{{ product.description }}</p>
        </div>
        <div class="product-footer">
          <strong>{{ product.price }}</strong>
          <button :disabled="checkoutLoading === product.id" @click="checkout(product)">
            {{ checkoutLoading === product.id ? '処理中...' : 'Checkout に移動' }}
          </button>
        </div>
      </article>
    </section>
  </main>
</template>

<script setup lang="ts">
import ContractStatusCard from '../components/subscription/ContractStatusCard.vue'

const runtimeConfig = useRuntimeConfig()
const route = useRoute()
const router = useRouter()

const products = [
  {
    id: 'sample-monthly',
    category: '学習プラン',
    name: '月額プラン',
    description: 'Nuxt + Stripe の動作確認用プランです。',
    price: '¥1,000'
  },
  {
    id: 'sample-yearly',
    category: '学習プラン',
    name: '年額プラン',
    description: '長期学習向けのサンプルです。',
    price: '¥10,000'
  }
]

const checkoutLoading = ref<string | null>(null)
const statusLoading = ref(false)
const statusMessage = ref('')
const selectedPlanId = ref<string | null>(null)

function planNameFromProductId(productId: string | null): string {
  if (!productId) return '未設定'

  switch (productId) {
    case 'sample-monthly':
      return '月額プラン'
    case 'sample-yearly':
      return '年額プラン'
    default:
      return '未設定'
  }
}

interface StatusState {
  label: string
  text: string
  tone: 'active' | 'inactive' | 'warning'
}

const status = ref<StatusState>({
  label: '確認中',
  text: '契約状態を読み込みしています...',
  tone: 'inactive'
})
const subscriptionPlanName = ref('未設定')
const periodText = ref('')
const updatedAt = ref('')

const STORAGE_KEY = 'stripe-demo-selected-plan'

async function rememberSelectedPlan(productId: string) {
  selectedPlanId.value = productId
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, productId)
  }

  await loadStatus()
}

async function loadStatus() {
  statusLoading.value = true

  try {
    const data = await $fetch<{ state: StatusState; subscription: { planName?: string; currentPeriodEnd?: number } | null; updatedAt?: string }>('/api/subscription/status')
    status.value = data.state
    subscriptionPlanName.value = data.subscription?.planName || planNameFromProductId(selectedPlanId.value)
    periodText.value = data.subscription?.currentPeriodEnd
      ? new Date(data.subscription.currentPeriodEnd * 1000).toLocaleString('ja-JP', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        })
      : '未設定'
    updatedAt.value = data.updatedAt ? new Date(data.updatedAt).toLocaleString('ja-JP') : '不明'
  } catch (error) {
    console.error(error)
    status.value = {
      label: 'エラー',
      text: '契約状態の取得に失敗しました。サーバー側を確認してください。',
      tone: 'warning'
    }
  } finally {
    statusLoading.value = false
  }
}

onMounted(() => {
  if (typeof window !== 'undefined') {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (saved === 'sample-monthly' || saved === 'sample-yearly') {
      selectedPlanId.value = saved
    } else {
      selectedPlanId.value = null
      window.localStorage.removeItem(STORAGE_KEY)
    }
  }

  if (route.query.success === 'true') {
    statusMessage.value = '決済が完了しました。契約状態を再読込しています。'
    router.replace({ path: '/', query: {} })
  }

  loadStatus()

  if (route.query.canceled) {
    statusMessage.value = '決済がキャンセルされました。'
    router.replace({ path: '/', query: {} })
  }
})

async function checkout(product: (typeof products)[number]) {
  if (!runtimeConfig.public.stripePublishableKey) {
    statusMessage.value = '公開可能キーが設定されていません。env を確認してください。'
    return
  }

  checkoutLoading.value = product.id
  rememberSelectedPlan(product.id)
  statusMessage.value = ''

  try {
    const response = await $fetch<{ sessionId: string; url?: string }>('/api/stripe/checkout', {
      method: 'POST',
      body: {
        productId: product.id
      }
    })

    if (!response.url) {
      throw new Error('Checkout URL が返されませんでした。')
    }

    window.location.href = response.url
  } catch (error) {
    console.error(error)
    statusMessage.value = 'Checkout セッションの作成に失敗しました。コンソールを確認してください。'
  } finally {
    checkoutLoading.value = null
  }
}
</script>

<style scoped>
.page-shell {
  min-height: 100vh;
  background: #f8fafc;
  padding: 32px 20px;
  color: #0f172a;
}

.hero-card,
.product-card,
.status-card {
  max-width: 900px;
  margin: 0 auto 20px;
  padding: 24px 28px;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.eyebrow {
  margin: 0 0 10px;
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #64748b;
  font-weight: 700;
}

h1 {
  margin: 0;
  font-size: clamp(1.9rem, 3vw, 2.5rem);
  line-height: 1.2;
}

.lead {
  margin: 12px 0 0;
  color: #475569;
  line-height: 1.7;
}

.product-grid {
  display: grid;
  gap: 18px;
}

.product-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.product-category {
  margin: 0 0 8px;
  font-size: 0.8rem;
  color: #64748b;
}

.product-card h2 {
  margin: 0;
  font-size: 1.2rem;
}

.product-description {
  margin: 10px 0 0;
  color: #475569;
}

.product-footer {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
  min-width: 160px;
}

.product-footer strong {
  font-size: 1.2rem;
}

button {
  padding: 11px 18px;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  background: #0f172a;
  color: #ffffff;
  font-weight: 600;
  cursor: pointer;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.status-card {
  color: #0f172a;
}

@media (max-width: 700px) {
  .product-card {
    flex-direction: column;
    align-items: stretch;
  }

  .product-footer {
    align-items: flex-start;
  }
}
</style>
