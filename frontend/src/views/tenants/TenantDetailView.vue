<template>
  <div class="p-8">
    <!-- Back Button -->
    <button @click="$router.back()" class="btn btn-ghost gap-2 mb-6">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      Retour
    </button>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center items-center h-64">
      <span class="loading loading-spinner loading-lg text-primary"></span>
    </div>

    <!-- Content -->
    <div v-else-if="tenant" class="space-y-6">
      <!-- Header -->
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <div class="flex items-start justify-between">
            <div>
              <h1 class="text-3xl font-bold">{{ tenant.firstName }} {{ tenant.lastName }}</h1>
              <p class="text-base-content/70 mt-2">{{ tenant.email }}</p>
              <p class="text-base-content/70">{{ tenant.phone }}</p>
            </div>
            <button @click="$router.push('/tenants')" class="btn btn-primary">
              Retour à la liste
            </button>
          </div>
        </div>
      </div>

      <!-- Info Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <h3 class="card-title">Informations personnelles</h3>
            <div class="space-y-2">
              <p><strong>Nom:</strong> {{ tenant.firstName }} {{ tenant.lastName }}</p>
              <p><strong>Email:</strong> {{ tenant.email }}</p>
              <p><strong>Téléphone:</strong> {{ tenant.phone }}</p>
            </div>
          </div>
        </div>

        <div class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <h3 class="card-title">Bien actuel</h3>
            <div class="space-y-2">
              <p v-if="tenant.currentProperty">{{ tenant.currentProperty }}</p>
              <p v-else class="text-base-content/50 italic">Aucun bien</p>
              <div v-if="tenant.hasActiveLease" class="badge badge-success">Bail actif</div>
              <div v-else class="badge badge-ghost">Sans bail</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Note temporaire -->
      <div class="alert alert-info">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <span>Vue détaillée simplifiée. La version complète sera disponible prochainement.</span>
      </div>
    </div>

    <!-- Error State -->
    <div v-else class="card bg-base-100 shadow-xl">
      <div class="card-body items-center text-center">
        <h3 class="text-lg font-semibold">Locataire non trouvé</h3>
        <button @click="$router.push('/tenants')" class="btn btn-primary mt-4">
          Retour à la liste
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/services/api'

const route = useRoute()
const tenant = ref(null)
const loading = ref(false)

const loadTenant = async () => {
  loading.value = true
  try {
    const response = await api.get(`/api/tenants/${route.params.id}`)
    tenant.value = response.data.data
  } catch (error) {
    console.error('Error loading tenant:', error)
    alert('Erreur: Impossible de charger le locataire')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadTenant()
})
</script>
