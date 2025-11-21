<template>
  <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
    <div class="stats shadow">
      <div class="stat">
        <div class="stat-title">Surface</div>
        <div class="stat-value text-2xl">{{ property.surface }} m²</div>
        <div class="stat-desc">{{ property.rooms }} pièces</div>
      </div>
    </div>

    <div class="stats shadow">
      <div class="stat">
        <div class="stat-title">Loyer mensuel</div>
        <div class="stat-value text-2xl text-success">{{ formatCurrency(property.currentRent) }}</div>
      </div>
    </div>

    <div class="stats shadow">
      <div class="stat">
        <div class="stat-title">Taxe foncière</div>
        <div class="stat-value text-2xl text-warning">{{ formatCurrency(property?.propertyTax || 0) }}</div>
        <div class="stat-desc">par an</div>
      </div>
    </div>

    <div class="stats shadow">
      <div class="stat">
        <div class="stat-title">Type de bien</div>
        <div class="stat-value text-xl">{{ formatPropertyType(property.type) }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  property: {
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

const formatPropertyType = (type) => {
  const typeMap = {
    appartement: 'Appartement',
    maison: 'Maison',
    immeuble: 'Immeuble',
    terrain: 'Terrain',
    garage: 'Garage',
    fond_commerce: 'Fonds de commerce',
    meuble: 'Meublé'
  }
  return typeMap[type] || type
}
</script>
