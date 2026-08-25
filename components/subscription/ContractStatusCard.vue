<script setup lang="ts">
interface SubscriptionStatusView {
  label: string
  text: string
  tone: 'active' | 'inactive' | 'warning'
  planName?: string
  periodText?: string
  updatedAt?: string
}

const props = defineProps<{
  status: SubscriptionStatusView
  loading: boolean
}>()

const emit = defineEmits<{
  (e: 'refresh'): void
}>()
</script>

<template>
  <section class="status-card">
    <div class="status-header">
      <div>
        <p class="eyebrow">現在の契約状態</p>
        <h2 :class="['status-label', props.status.tone]">{{ props.status.label }}</h2>
      </div>
      <button class="ghost-button" :disabled="props.loading" @click="emit('refresh')">
        {{ props.loading ? '更新中...' : '状態を更新' }}
      </button>
    </div>

    <p class="status-message">{{ props.status.text }}</p>

    <div class="meta-grid">
      <div v-if="props.status.planName">
        <span class="meta-label">契約プラン</span>
        <strong>{{ props.status.planName }}</strong>
      </div>
      <div v-if="props.status.periodText">
        <span class="meta-label">利用期間</span>
        <strong>{{ props.status.periodText }}</strong>
      </div>
      <div>
        <span class="meta-label">最終更新</span>
        <strong>{{ props.status.updatedAt || '不明' }}</strong>
      </div>
    </div>
  </section>
</template>

<style scoped>
.status-card {
  max-width: 900px;
  margin: 0 auto 24px;
  padding: 24px 28px;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.status-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.eyebrow {
  margin: 0 0 8px;
  color: #64748b;
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-weight: 700;
}

.status-label {
  margin: 0;
  font-size: clamp(1.7rem, 3vw, 2.1rem);
  line-height: 1.2;
  font-weight: 700;
}

.status-label.active {
  color: #166534;
}

.status-label.inactive {
  color: #334155;
}

.status-label.warning {
  color: #a16207;
}

.status-message {
  margin: 18px 0 0;
  color: #475569;
  line-height: 1.7;
  font-size: 0.98rem;
}

.meta-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
}

.meta-label {
  display: block;
  color: #64748b;
  font-size: 0.76rem;
  margin-bottom: 6px;
}

.ghost-button {
  padding: 10px 14px;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  background: #f8fafc;
  color: #0f172a;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
}

.ghost-button:disabled {
  opacity: 0.6;
  cursor: wait;
}

@media (max-width: 640px) {
  .status-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
