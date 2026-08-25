<script setup lang="ts">
import ContractStatusCard from '~/components/subscription/ContractStatusCard.vue'

interface SubscriptionStatusState {
  label: string
  text: string
  tone: 'active' | 'inactive' | 'warning'
}

const loading = ref(false)
const status = ref<SubscriptionStatusState>({
  label: '確認中',
  text: '契約状態を読み込みています...',
  tone: 'inactive'
})
const periodText = ref('')
const updatedAt = ref('')

async function loadStatus() {
  loading.value = true

  try {
    const data = await $fetch<{ state: SubscriptionStatusState; subscription: { currentPeriodEnd?: number } | null; updatedAt?: string }>('/api/subscription/status')
    status.value = data.state
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
    loading.value = false
  }
}

onMounted(() => {
  loadStatus()
})
</script>

<template>
  <main class="page-shell">
    <section class="hero-card">
      <p class="eyebrow">Stripe Demo</p>
      <h1>契約状態の確認</h1>
      <p class="lead">
        現在のサブスクリプション状態と利用期間がここで確認できます。
      </p>
    </section>

    <ContractStatusCard
      :status="{
        label: status.label,
        text: status.text,
        tone: status.tone,
        periodText,
        updatedAt
      }"
      :loading="loading"
      @refresh="loadStatus"
    />
  </main>
</template>

<style scoped>
.page-shell {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
  padding: 32px 20px;
}

.hero-card {
  max-width: 900px;
  margin: 0 auto 24px;
  padding: 28px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.78);
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08);
}

.eyebrow {
  margin: 0 0 12px;
  color: #4f46e5;
  font-size: 0.8rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  font-weight: 800;
}

h1 {
  margin: 0;
  font-size: clamp(2rem, 4vw, 3rem);
}

.lead {
  margin: 12px 0 0;
  color: #475569;
  line-height: 1.75;
}
</style>
