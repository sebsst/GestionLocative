<template>
  <div class="card bg-gradient-to-r from-primary/10 to-secondary/10 shadow-xl">
    <div class="card-body">
      <div class="flex items-start justify-between mb-4">
        <div class="flex-1">
          <div class="flex items-center gap-3 mb-2">
            <h1 class="text-3xl font-bold">{{ property.name }}</h1>
            <UserAccessBadge
              v-if="property.isShared"
              :is-shared="property.isShared"
              :role="property.accessRole"
            />
          </div>
          <p class="text-base-content/70 mt-2 flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {{ property.address }}, {{ property.postalCode }} {{ property.city }}
          </p>
        </div>
        <div class="flex gap-2">
          <button
            v-if="property.canInvite"
            @click="$emit('share')"
            class="btn btn-secondary gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Partager
          </button>
          <div :class="getStatusBadgeClass(property.status)" class="badge badge-lg">
            {{ getStatusLabel(property.status) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import UserAccessBadge from '@/components/ui/UserAccessBadge.vue'

defineProps({
  property: {
    type: Object,
    required: true
  }
})

defineEmits(['share'])

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
