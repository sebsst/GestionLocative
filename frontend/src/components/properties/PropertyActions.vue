<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    <button @click="$emit('create-lease')" class="btn btn-primary btn-lg">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
      </svg>
      <div class="flex flex-col items-start">
        <span>Créer un bail</span>
        <span class="text-xs opacity-70">Nouveau contrat</span>
      </div>
    </button>

    <button v-if="hasLeases" @click="$emit('manage-occupants')" class="btn btn-primary btn-lg">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
      <div class="flex flex-col items-start">
        <span>Gérer les occupants</span>
        <span class="text-xs opacity-70">Nombre et périodes</span>
      </div>
    </button>

    <button v-if="hasLeases" @click="$emit('manage-rents')" class="btn btn-secondary btn-lg">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <div class="flex flex-col items-start">
        <span>Gérer les montants</span>
        <span class="text-xs opacity-70">Loyer et charges</span>
      </div>
    </button>

    <button v-if="hasLeases" @click="$emit('generate-rents')" class="btn btn-accent btn-lg" :disabled="generatingRents">
      <span v-if="generatingRents" class="loading loading-spinner"></span>
      <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
      <div class="flex flex-col items-start">
        <span>Générer loyers</span>
        <span class="text-xs opacity-70">Mois en cours</span>
      </div>
    </button>
  </div>
</template>

<script setup>
defineProps({
  hasLeases: {
    type: Boolean,
    required: true
  },
  generatingRents: {
    type: Boolean,
    default: false
  }
})

defineEmits(['create-lease', 'manage-occupants', 'manage-rents', 'generate-rents'])
</script>
