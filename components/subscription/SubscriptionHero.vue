<template>
  <section class="hero-card">
    <p class="eyebrow">Stripe Subscription Demo</p>
    <h1>Nuxt × Stripe 学習用ページ</h1>
    <p class="lead">
      月額・年額のサブスクリプションを選択し、Stripe Checkout で購読フローを体験できます。
    </p>
  </section>
</template>

<style scoped>
.hero-card {
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
</style>