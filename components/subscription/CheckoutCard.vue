<template>
  <section class="checkout-card">
    <h2>現在の選択</h2>
    <p v-if="selectedPlan">
      <strong>{{ selectedPlan.name }}</strong> を選択しています。
    </p>
    <button :disabled="checkoutStatus === 'pending'" @click="$emit('checkout')">
      {{ checkoutStatus === 'pending' ? '準備中...' : 'Stripe Checkout へ移動' }}
    </button>
    <p v-if="checkoutStatus === 'error'" class="error-message">{{ errorMessage }}</p>
  </section>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'

const props = defineProps({
  selectedPlan: {
    type: Object as PropType<{ id: string; name: string } | undefined>,
    required: false
  },
  checkoutStatus: {
    type: String as PropType<'idle' | 'pending' | 'success' | 'error'>,
    required: true
  },
  errorMessage: {
    type: String,
    required: true
  }
})
</script>

<style scoped>
.checkout-card {
  max-width: 900px;
  margin: 0 auto 20px;
  padding: 28px;
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.08);
  text-align: center;
}

button {
  padding: 14px 24px;
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

.error-message {
  margin-top: 14px;
  color: #b91c1c;
}
</style>