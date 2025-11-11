<template>
  <div class="p-8">
    <!-- Back Button -->
    <button
      @click="$router.back()"
      class="btn btn-ghost gap-2 mb-6"
    >
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
    <div v-else-if="property" class="space-y-6">
      <!-- Header -->
      <div class="card bg-base-100 shadow-xl">
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
            <button @click="$router.push(`/properties`)" class="btn btn-primary gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Retour à la liste
            </button>
          </div>
          <div class="badge badge-success">{{ property.status }}</div>
        </div>
      </div>

      <!-- Info Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <h3 class="card-title text-lg">Informations</h3>
            <div class="space-y-2">
              <p><strong>Type:</strong> {{ property.type }}</p>
              <p><strong>Surface:</strong> {{ property.surface }} m²</p>
              <p><strong>Pièces:</strong> {{ property.rooms }}</p>
            </div>
          </div>
        </div>

        <div class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <h3 class="card-title text-lg">Loyer</h3>
            <div class="space-y-2">
              <p class="text-2xl font-bold">{{ formatCurrency(property.currentRent) }}</p>
              <p class="text-sm text-base-content/70">par mois</p>
            </div>
          </div>
        </div>

        <div class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <h3 class="card-title text-lg">Statut</h3>
            <div class="space-y-2">
              <div class="badge badge-lg badge-success">{{ property.status }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Description -->
      <div class="card bg-base-100 shadow-xl" v-if="property.description">
        <div class="card-body">
          <h3 class="card-title">Description</h3>
          <p>{{ property.description }}</p>
        </div>
      </div>

      <!-- Note temporaire -->
      <div class="alert alert-info">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <span>Vue détaillée simplifiée. La version complète avec onglets sera disponible prochainement.</span>
      </div>
    </div>

    <!-- Error State -->
    <div v-else class="card bg-base-100 shadow-xl">
      <div class="card-body items-center text-center">
        <h3 class="text-lg font-semibold">Bien non trouvé</h3>
        <button @click="$router.push('/properties')" class="btn btn-primary mt-4">
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
const property = ref(null)
const loading = ref(false)

const loadProperty = async () => {
  loading.value = true
  try {
    const response = await api.get(`/api/properties/${route.params.id}`)
    property.value = response.data.data
  } catch (error) {
    console.error('Error loading property:', error)
    alert('Erreur: Impossible de charger le bien')
  } finally {
    loading.value = false
  }
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(value || 0)
}

onMounted(() => {
  loadProperty()
})
</script>
