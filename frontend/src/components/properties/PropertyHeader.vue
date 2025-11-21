<template>
  <div class="card bg-gradient-to-r from-primary/10 to-secondary/10 shadow-xl">
    <div class="card-body">
      <div class="flex items-start justify-between mb-4">
        <div>
          <h1 class="text-3xl font-bold">{{ property.name }}</h1>
          <p class="text-base-content/70 mt-2 flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {{ property.address }}, {{ property.postalCode }} {{ property.city }}
          </p>
        </div>
        <div class="flex gap-2">
          <div :class="getStatusBadgeClass(property.status)" class="badge badge-lg">
            {{ getStatusLabel(property.status) }}
           </div>
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
  }
})

const getStatusBadgeClass = (status) => {
  const classMap = {
    disponible: 'badge-success',
    loue: 'badge-info',
    en_travaux: 'badge-warning',
    vendu: 'badge-error'
  }
  return classMap[status] || 'badge-ghost'
}

const getStatusLabel = (status) => {
  const labelMap = {
    disponible: 'Disponible',
    loue: 'Loué',
    en_travaux: 'En travaux',
    vendu: 'Vendu'
  }
  return labelMap[status] || status
}
</script>
