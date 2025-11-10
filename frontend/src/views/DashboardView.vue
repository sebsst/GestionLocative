<template>
  <div class="p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold">Tableau de bord</h1>
      <p class="text-base-content/70 mt-1">Vue d'ensemble de votre gestion locative</p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center items-center h-64">
      <span class="loading loading-spinner loading-lg text-primary"></span>
    </div>

    <!-- Content -->
    <div v-else class="space-y-6">
      <!-- Stats Cards avec DaisyUI -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="stats shadow">
          <div class="stat">
            <div class="stat-title">Total Biens</div>
            <div class="stat-value">{{ stats.totalProperties }}</div>
          </div>
        </div>

        <div class="stats shadow bg-success text-success-content">
          <div class="stat">
            <div class="stat-title text-success-content/70">Biens Loués</div>
            <div class="stat-value">{{ stats.rentedProperties }}</div>
            <div class="stat-desc text-success-content/70">{{ stats.occupancyRate }}% d'occupation</div>
          </div>
        </div>

        <div class="stats shadow">
          <div class="stat">
            <div class="stat-title">Locataires</div>
            <div class="stat-value">{{ stats.totalTenants }}</div>
          </div>
        </div>

        <div class="stats shadow bg-primary text-primary-content">
          <div class="stat">
            <div class="stat-title text-primary-content/70">Revenus Mensuels</div>
            <div class="stat-value text-2xl">{{ formatCurrency(stats.monthlyRevenue) }}</div>
          </div>
        </div>
      </div>

      <!-- Quick Actions avec DaisyUI Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <router-link to="/properties">
          <div class="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow cursor-pointer">
            <div class="card-body">
              <div class="flex items-center gap-4">
                <div class="avatar placeholder">
                  <div class="bg-primary text-primary-content rounded-full w-12">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 class="card-title text-base">Gérer les biens</h3>
                  <p class="text-sm text-base-content/60">Ajouter, modifier vos biens</p>
                </div>
              </div>
            </div>
          </div>
        </router-link>

        <router-link to="/tenants">
          <div class="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow cursor-pointer">
            <div class="card-body">
              <div class="flex items-center gap-4">
                <div class="avatar placeholder">
                  <div class="bg-success text-success-content rounded-full w-12">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 class="card-title text-base">Locataires</h3>
                  <p class="text-sm text-base-content/60">Gérer vos locataires</p>
                </div>
              </div>
            </div>
          </div>
        </router-link>

        <router-link to="/rents">
          <div class="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow cursor-pointer">
            <div class="card-body">
              <div class="flex items-center gap-4">
                <div class="avatar placeholder">
                  <div class="bg-secondary text-secondary-content rounded-full w-12">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 class="card-title text-base">Loyers</h3>
                  <p class="text-sm text-base-content/60">Suivre les paiements</p>
                </div>
              </div>
            </div>
          </div>
        </router-link>
      </div>

      <!-- Recent Activity avec DaisyUI -->
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title">Activité récente</h2>
          <div class="divider my-0"></div>
          <div class="flex justify-center items-center py-12">
            <div class="text-center">
              <svg class="w-16 h-16 mx-auto text-base-content/30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p class="text-base-content/60">Aucune activité récente</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'

const loading = ref(true)
const stats = ref({
  totalProperties: 0,
  rentedProperties: 0,
  totalTenants: 0,
  monthlyRevenue: 0,
  occupancyRate: 0
})

const formatCurrency = (value) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(value || 0)
}

const loadStats = async () => {
  loading.value = true
  try {
    // Charger les statistiques depuis l'API
    const [propertiesRes, tenantsRes] = await Promise.all([
      api.get('/api/properties'),
      api.get('/api/tenants')
    ])

    const properties = propertiesRes.data.data || []
    const tenants = tenantsRes.data.data || []

    const rentedProperties = properties.filter(p => p.status === 'loue')
    const monthlyRevenue = rentedProperties.reduce((sum, p) => sum + (parseFloat(p.currentRent) || 0), 0)

    stats.value = {
      totalProperties: properties.length,
      rentedProperties: rentedProperties.length,
      totalTenants: tenants.length,
      monthlyRevenue: monthlyRevenue,
      occupancyRate: properties.length > 0 ? Math.round((rentedProperties.length / properties.length) * 100) : 0
    }
  } catch (error) {
    console.error('Erreur lors du chargement des statistiques:', error)
    stats.value = {
      totalProperties: 0,
      rentedProperties: 0,
      totalTenants: 0,
      monthlyRevenue: 0,
      occupancyRate: 0
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadStats()
})
</script>
