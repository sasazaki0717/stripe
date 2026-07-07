<template>
  <main class="page-shell">
    <section class="hero-card">
      <p class="eyebrow">Stripe Demo</p>
      <h1>Nuxt × Stripe 学習用ページ</h1>
      <p class="lead">
        ボタンを押すと Stripe Checkout に遷移します。テスト用キーを `.env` に設定済みである前提です。
      </p>
    </section>

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
          <button :disabled="loading === product.id" @click="checkout(product)">
            {{ loading === product.id ? '処理中...' : 'Checkout に移動' }}
          </button>
        </div>
      </article>
    </section>
  </main>
</template>

<script setup lang="ts">
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

const loading = ref<string | null>(null)
const statusMessage = ref('')

onMounted(() => {
  if (route.query.success) {
    statusMessage.value = '決済が完了しました。おつかれさまです！'
    router.replace({ path: '/', query: {} })
  }
  if (route.query.canceled) {
    statusMessage.value = '決済がキャンセルされました。もう一度お試しください。'
    router.replace({ path: '/', query: {} })
  }
})

async function checkout(product: (typeof products)[number]) {
  if (!runtimeConfig.public.stripePublishableKey) {
    statusMessage.value = '公開可能キーが設定されていません。env を確認してください。'
    return
  }

  loading.value = product.id
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
    loading.value = null
  }
}
</script>

<style scoped>
.page-shell {
  min-height: 100vh;
  background: linear-gradient(180deg, #edf2ff 0%, #ffffff 100%);
  padding: 32px;
}

.hero-card,
.product-card,
.status-card {
  max-width: 900px;
  margin: 0 auto 20px;
  padding: 28px;
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.08);
}

.eyebrow {
  margin: 0 0 12px;
  font-size: 0.8rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #4f46e5;
  font-weight: 800;
}

h1 {
  margin: 0;
  font-size: 2rem;
  line-height: 1.2;
}

.lead {
  margin: 14px 0 0;
  color: #475569;
  line-height: 1.75;
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
  font-size: 0.85rem;
  color: #64748b;
}

.product-card h2 {
  margin: 0;
  font-size: 1.3rem;
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
  padding: 12px 20px;
  border: none;
  border-radius: 999px;
  background-color: #111827;
  color: white;
  font-weight: 700;
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
