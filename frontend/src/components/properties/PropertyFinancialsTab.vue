<template>
  <div class="p-6 space-y-4">
    <h3 class="text-xl font-bold mb-4">Données financières</h3>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <div class="stats shadow">
        <div class="stat">
          <div class="stat-title">Revenus locatifs (année)</div>
          <div class="stat-value text-success">{{ formatCurrency(financialData.yearlyRevenue) }}</div>
        </div>
      </div>

      <div class="stats shadow">
        <div class="stat">
          <div class="stat-title">Charges (année)</div>
          <div class="stat-value text-error">{{ formatCurrency(financialData.yearlyCharges) }}</div>
        </div>
      </div>

      <div class="stats shadow">
        <div class="stat">
          <div class="stat-title">Résultat net</div>
          <div class="stat-value text-info">{{ formatCurrency(financialData.yearlyRevenue - financialData.yearlyCharges) }}</div>
        </div>
      </div>
    </div>

    <div class="bg-base-200 p-4 rounded-lg">
      <h4 class="font-semibold mb-3">Charges déductibles</h4>
      <div class="space-y-2">
        <div class="flex justify-between">
          <span>Taxe foncière</span>
          <span class="font-semibold">{{ formatCurrency(property.propertyTax) }}</span>
        </div>
        <div class="flex justify-between">
          <span>Charges de copropriété</span>
          <span class="font-semibold">{{ formatCurrency(financialData.yearlyCharges) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  property: {
    type: Object,
    required: true
  },
  financialData: {
    type: Object,
    required: true
  }
})

const formatCurrency = (value) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(value || 0)
}
</script>
