<template>
  <div class="p-8">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-3xl font-bold">Biens partagés avec moi</h1>
        <p class="text-base-content/70 mt-1">
          Biens auxquels vous avez accès via un partage
        </p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="i in 6" :key="i" class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <div class="skeleton h-6 w-3/4 mb-2"></div>
          <div class="skeleton h-4 w-full mb-4"></div>
          <div class="skeleton h-4 w-1/2"></div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="sharedProperties.length === 0" class="card bg-base-100 shadow-xl">
      <div class="card-body items-center text-center py-12">
        <svg class="w-16 h-16 text-base-content/30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        <h3 class="text-lg font-semibold mb-2">Aucun bien partagé</h3>
        <p class="text-base-content/60">
          Vous n'avez pas encore accès à des biens partagés par d'autres utilisateurs.
        </p>
      </div>
    </div>

    <!-- Properties Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="property in sharedProperties"
        :key="property.id"
        @click="goToProperty(property.id)"
        class="card bg-base-100 shadow-xl hover:shadow-2xl transition-all cursor-pointer"
      >
        <div class="card-body">
          <div class="flex items-start justify-between mb-2">
            <h2 class="card-title">{{ property.name }}</h2>
            <div class="badge" :class="getRoleBadgeClass(property.accessRole)">
              {{ getRoleLabel(property.accessRole) }}
            </div>
          </div>
          
          <p class="text-sm text-base-content/70 flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {{ property.address }}, {{ property.city }}
          </p>

          <div class="flex items-center gap-2 mt-4">
            <div class="badge badge-sm" :class="getStatusBadgeClass(property.status)">
              {{ getStatusLabel(property.status) }}
            </div>
            <div class="text-xs text-base-content/60">
              Partagé par {{ property.owner?.firstName }} {{ property.owner?.lastName }}
            </div>
          </div>

          <div class="flex gap-2 mt-4 text-xs">
            <div v-if="property.canEdit" class="badge badge-ghost badge-sm">
              <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Modification
            </div>
            <div v-if="property.canDelete" class="badge badge-ghost badge-sm">
              <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Suppression
            </div>
            <div v-if="property.canInvite" class="badge badge-ghost badge-sm">
              <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Invitation
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserAccessStore } from '@/stores/userAccess'
import { usePermissions } from '@/composables/usePermissions'

const router = useRouter()
const userAccessStore = useUserAccessStore()
const { getRoleLabel, getRoleBadgeClass } = usePermissions()

const loading = ref(false)

const sharedProperties = computed(() => userAccessStore.sharedProperties)

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

const goToProperty = (id) => {
  router.push(`/properties/${id}`)
}

onMounted(async () => {
  loading.value = true
  try {
    await userAccessStore.fetchMySharedProperties()
  } finally {
    loading.value = false
  }
})
</script>
