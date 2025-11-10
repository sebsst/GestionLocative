<template>
  <div class="p-8">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold">Locataires</h1>
        <p class="text-base-content/70 mt-1">Gestion de vos locataires</p>
      </div>
      <button
        @click="showDialog = true"
        class="btn btn-primary gap-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Nouveau locataire
      </button>
    </div>

    <!-- Filtres -->
    <div class="card bg-base-100 shadow-xl mb-6">
      <div class="card-body">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text">Recherche</span>
            </label>
            <input
              v-model="filters.search"
              type="text"
              placeholder="Nom du locataire..."
              class="input input-bordered w-full"
              @input="loadTenants"
            />
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">Statut du bail</span>
            </label>
            <select v-model="filters.leaseStatus" class="select select-bordered w-full" @change="loadTenants">
              <option value="">Tous les statuts</option>
              <option value="active">Bail actif</option>
              <option value="inactive">Sans bail</option>
            </select>
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">Bien</span>
            </label>
            <select v-model="filters.property" class="select select-bordered w-full" @change="loadTenants">
              <option value="">Tous les biens</option>
              <option v-for="property in properties" :key="property.id" :value="property.id">
                {{ property.name }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center items-center h-64">
      <span class="loading loading-spinner loading-lg text-primary"></span>
    </div>

    <!-- Table -->
    <div v-else-if="tenants.length > 0" class="card bg-base-100 shadow-xl overflow-hidden">
      <div class="overflow-x-auto">
        <table class="table table-zebra">
          <thead>
            <tr>
              <th>Locataire</th>
              <th>Contact</th>
              <th>Bien</th>
              <th class="text-center">Statut Bail</th>
              <th class="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="tenant in tenants" :key="tenant.id" class="hover">
              <td>
                <div class="flex items-center gap-3">
                  <div class="avatar placeholder">
                    <div class="bg-success text-success-content rounded-lg w-10">
                      <span class="text-sm font-bold">
                        {{ tenant.firstName.charAt(0).toUpperCase() }}{{ tenant.lastName.charAt(0).toUpperCase() }}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div class="font-medium">{{ tenant.firstName }} {{ tenant.lastName }}</div>
                    <div class="text-sm opacity-60">{{ tenant.email }}</div>
                  </div>
                </div>
              </td>
              <td>{{ tenant.phone }}</td>
              <td>
                <span v-if="tenant.currentProperty">
                  {{ tenant.currentProperty }}
                </span>
                <span v-else class="italic opacity-60">
                  Aucun bien
                </span>
              </td>
              <td class="text-center">
                <div v-if="tenant.hasActiveLease" class="badge badge-success badge-sm">
                  Bail actif
                </div>
                <div v-else class="badge badge-ghost badge-sm">
                  Sans bail
                </div>
              </td>
              <td>
                <div class="flex items-center justify-center gap-2">
                  <button
                    @click="viewTenant(tenant)"
                    class="btn btn-ghost btn-xs"
                    title="Voir détails"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  <button
                    @click="editTenant(tenant)"
                    class="btn btn-ghost btn-xs"
                    title="Modifier"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    @click="deleteTenant(tenant)"
                    class="btn btn-ghost btn-xs text-error"
                    title="Supprimer"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="card bg-base-100 shadow-xl">
      <div class="card-body items-center text-center py-12">
        <svg class="w-16 h-16 text-base-content/30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <h3 class="text-lg font-semibold mb-2">Aucun locataire trouvé</h3>
        <p class="text-base-content/60">{{ filters.search ? 'Essayez de modifier les filtres' : 'Ajoutez votre premier locataire' }}</p>
      </div>
    </div>

    <!-- Dialog -->
    <!-- TODO: Ajouter le dialog pour créer/modifier un locataire -->
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import api from '@/services/api'

const router = useRouter()
const toast = useToast()

const tenants = ref([])
const properties = ref([])
const loading = ref(false)
const showDialog = ref(false)

const filters = reactive({
  search: '',
  leaseStatus: '',
  property: ''
})

const loadTenants = async () => {
  loading.value = true
  try {
    const params = {}
    if (filters.search) params.search = filters.search
    if (filters.leaseStatus) params.leaseStatus = filters.leaseStatus
    if (filters.property) params.property = filters.property

    const response = await api.get('/api/tenants', { params })
    tenants.value = response.data.data || []
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: 'Impossible de charger les locataires',
      life: 3000
    })
  } finally {
    loading.value = false
  }
}

const loadProperties = async () => {
  try {
    const response = await api.get('/api/properties')
    properties.value = response.data.data || []
  } catch (error) {
    console.error('Erreur lors du chargement des biens:', error)
  }
}

const viewTenant = (tenant) => {
  router.push(`/tenants/${tenant.id}`)
}

const editTenant = (tenant) => {
  // TODO: Ouvrir le dialog d'édition
  showDialog.value = true
}

const deleteTenant = (tenant) => {
  if (confirm(`Voulez-vous vraiment supprimer ${tenant.firstName} ${tenant.lastName} ?`)) {
    api.delete(`/api/tenants/${tenant.id}`)
      .then(() => {
        toast.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Locataire supprimé avec succès',
          life: 3000
        })
        loadTenants()
      })
      .catch(() => {
        toast.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de supprimer le locataire',
          life: 3000
        })
      })
  }
}

onMounted(() => {
  loadTenants()
  loadProperties()
})
</script>
