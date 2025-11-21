<template>
  <div class="p-6 space-y-4">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-xl font-bold">Historique des baux</h3>
    </div>

    <div v-if="leases.length > 0" class="overflow-x-auto">
      <table class="table table-zebra">
        <thead class="bg-base-200">
          <tr class="border-b-2 border-base-300">
            <th class="border-r border-base-300">Locataire</th>
            <th class="border-r border-base-300">Début</th>
            <th class="border-r border-base-300">Fin</th>
            <th class="border-r border-base-300">Loyer</th>
            <th class="border-r border-base-300">Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="lease in leases" :key="lease.id" class="h-6">
            <td>{{ lease.Tenant?.firstName }} {{ lease.Tenant?.lastName }}</td>
            <td>{{ formatDate(lease.startDate) }}</td>
            <td>{{ lease.endDate ? formatDate(lease.endDate) : 'En cours' }}</td>
            <td>{{ formatCurrency(lease.monthlyRent) }}</td>
            <td>
              <div :class="getLeaseStatusBadgeClass(lease.status)" class="badge">
                {{ getLeaseStatusLabel(lease.status) }}
              </div>
            </td>
            <td>
              <div class="flex gap-1">
                <button @click="$emit('manage-occupants', lease)" class="btn btn-ghost btn-xs btn-square" title="Gérer les périodes d'occupation">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </button>
                <button @click="$emit('manage-rents', lease)" class="btn btn-ghost btn-xs btn-square" title="Gérer l'historique des loyers">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
                <button @click="$emit('edit-lease', lease)" class="btn btn-ghost btn-xs btn-square" title="Modifier le bail">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button v-if="lease.status === 'actif'" @click="$emit('end-lease', lease)" class="btn btn-ghost btn-xs btn-square text-warning" title="Mettre fin au bail">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
                <button @click="$emit('delete-lease', lease)" class="btn btn-ghost btn-xs btn-square text-error" title="Supprimer le bail">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else class="text-center py-8 text-base-content/60">
      Aucun bail enregistré
    </div>
  </div>
</template>

<script setup>
defineProps({
  leases: {
    type: Array,
    required: true
  }
})

defineEmits(['manage-occupants', 'manage-rents', 'edit-lease', 'end-lease', 'delete-lease'])

const formatCurrency = (value) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(value || 0)
}

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('fr-FR')
}

const getLeaseStatusBadgeClass = (status) => {
  const classMap = {
    actif: 'badge-success',
    termine: 'badge-ghost',
    resilie: 'badge-error',
    en_attente: 'badge-warning'
  }
  return classMap[status] || 'badge-ghost'
}

const getLeaseStatusLabel = (status) => {
  const labelMap = {
    actif: 'Actif',
    termine: 'Terminé',
    resilie: 'Résilié',
    en_attente: 'En attente'
  }
  return labelMap[status] || status
}
</script>
