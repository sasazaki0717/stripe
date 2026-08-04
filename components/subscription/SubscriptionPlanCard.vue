<template>
  <article class="plan-card" :class="{ selected }">
    <div>
      <p class="plan-type">{{ plan.category }}</p>
      <h2>{{ plan.name }}</h2>
      <p class="plan-description">{{ plan.description }}</p>
    </div>
    <div class="plan-footer">
      <strong>{{ plan.price }}</strong>
      <button :disabled="selected" @click="$emit('select')">
        {{ selected ? '選択中' : 'このプランを選択' }}
      </button>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'

const props = defineProps({
  plan: {
    type: Object as PropType<{ id: string; category: string; name: string; description: string; price: string }> ,
    required: true
  },
  selected: {
    type: Boolean,
    required: true
  }
})
</script>

<style scoped>
.plan-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  padding: 24px;
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 0 18px 36px rgba(15, 23, 42, 0.06);
}

.plan-card.selected {
  border: 2px solid #4f46e5;
}

.plan-type {
  margin: 0 0 8px;
  font-size: 0.85rem;
  color: #64748b;
}

h2 {
  margin: 0;
  font-size: 1.3rem;
}

.plan-description {
  margin: 10px 0 0;
  color: #475569;
}

.plan-footer {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
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

strong {
  font-size: 1.2rem;
}

@media (max-width: 700px) {
  .plan-card {
    flex-direction: column;
    align-items: stretch;
  }

  .plan-footer {
    align-items: flex-start;
  }
}
</style>