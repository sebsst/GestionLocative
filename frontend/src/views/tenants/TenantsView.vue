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
          <thead class="bg-base-200">
            <tr class="border-b-2 border-base-300">
              <th class="border-r border-base-300">Locataire</th>
              <th class="border-r border-base-300">Contact</th>
              <th class="border-r border-base-300">Bien occupé</th>
              <th class="text-right border-r border-base-300">Loyer mensuel</th>
              <th class="text-center border-r border-base-300">Statut Bail</th>
              <th class="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="tenant in tenants" :key="tenant.id" class="hover h-6">
              <td>
                <div class="flex items-center gap-3">
                  <router-link :to="`/tenants/${tenant.id}`" class="avatar placeholder cursor-pointer hover:scale-110 transition-transform">
                    <div class="bg-success text-success-content rounded-lg w-10">
                      <span class="text-sm font-bold">
                        {{ tenant.firstName.charAt(0).toUpperCase() }}{{ tenant.lastName.charAt(0).toUpperCase() }}
                      </span>
                    </div>
                  </router-link>
                  <div>
                    <div class="font-medium">{{ tenant.firstName }} {{ tenant.lastName }}</div>
                    <div class="text-sm opacity-60">{{ tenant.email }}</div>
                  </div>
                </div>
              </td>
              <td>{{ tenant.phone }}</td>
              <td>
                <div v-if="getActiveLease(tenant)">
                  <div class="font-medium">{{ getActiveLease(tenant).Property?.name }}</div>
                  <div class="text-sm opacity-60">{{ getActiveLease(tenant).Property?.address }}</div>
                </div>
                <span v-else class="italic opacity-60">
                  Aucun bien
                </span>
              </td>
              <td class="text-right">
                <span v-if="getActiveLease(tenant)" class="font-semibold text-success">
                  {{ formatCurrency(getActiveLease(tenant).rentAmount) }}
                </span>
                <span v-else class="italic opacity-60">
                  -
                </span>
              </td>
              <td class="text-center">
                <div v-if="getActiveLease(tenant)" class="badge badge-success badge-sm">
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
                    v-if="!getActiveLease(tenant)"
                    @click="openQuickLeaseModal(tenant)"
                    class="btn btn-primary btn-xs gap-1"
                    title="Créer un bail"
                  >
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Créer bail
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
        <svg class="w-16 h-6 text-base-content/30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <h3 class="text-lg font-semibold mb-2">Aucun locataire trouvé</h3>
        <p class="text-base-content/60">{{ filters.search ? 'Essayez de modifier les filtres' : 'Ajoutez votre premier locataire' }}</p>
      </div>
    </div>

    <!-- Dialog Create/Edit -->
    <Modal
      v-model="showDialog"
      :title="editingTenant ? 'Modifier le locataire' : 'Nouveau locataire'"
      size="lg"
      :hide-footer="true"
    >
      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text">Prénom *</span>
            </label>
            <input
              v-model="tenantForm.firstName"
              type="text"
              placeholder="Jean"
              class="input input-bordered w-full"
              required
            />
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">Nom *</span>
            </label>
            <input
              v-model="tenantForm.lastName"
              type="text"
              placeholder="Dupont"
              class="input input-bordered w-full"
              required
            />
          </div>
        </div>

        <div class="form-control">
          <label class="label">
            <span class="label-text">Email *</span>
          </label>
          <input
            v-model="tenantForm.email"
            type="email"
            placeholder="email@exemple.com"
            class="input input-bordered w-full"
            required
          />
        </div>

        <div class="form-control">
          <label class="label">
            <span class="label-text">Téléphone</span>
          </label>
          <input
            v-model="tenantForm.phone"
            type="tel"
            placeholder="06 12 34 56 78"
            class="input input-bordered w-full"
          />
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <button @click="closeDialog" class="btn btn-ghost">Annuler</button>
          <button @click="saveTenant" :disabled="saving" class="btn btn-primary">
            <span v-if="saving" class="loading loading-spinner loading-sm"></span>
            {{ saving ? 'Enregistrement...' : (editingTenant ? 'Modifier' : 'Créer') }}
          </button>
        </div>
      </template>
    </Modal>

    <!-- Quick Lease Modal -->
    <Modal
      v-model="showQuickLeaseModal"
      title="Créer un bail rapide"
      size="md"
    >
      <form @submit.prevent="createQuickLease" class="space-y-4">
        <!-- Tenant Info (read-only) -->
        <div class="alert alert-info">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span><strong>Locataire:</strong> {{ selectedTenantForLease?.firstName }} {{ selectedTenantForLease?.lastName }}</span>
        </div>

        <!-- Property Selection -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-semibold">Bien *</span>
            <span class="label-text-alt">{{ availableProperties.length }} disponible(s)</span>
          </label>
          <select 
            v-model="quickLeaseForm.propertyId" 
            class="select select-bordered" 
            required
            @change="onPropertySelected"
          >
            <option value="">Sélectionner un bien</option>
            <option v-for="property in availableProperties" :key="property.id" :value="property.id">
              {{ property.name }} - {{ formatCurrency(property.currentRent) }}/mois
            </option>
          </select>
        </div>

        <!-- Start Date -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-semibold">Date de début *</span>
            <span class="label-text-alt">Par défaut: 1er du mois prochain</span>
          </label>
          <input
            v-model="quickLeaseForm.startDate"
            type="date"
            class="input input-bordered"
            required
            @change="onStartDateChanged"
          />
        </div>

        <!-- End Date -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-semibold">Date de fin</span>
            <span class="label-text-alt">Par défaut: +1 an</span>
          </label>
          <input
            v-model="quickLeaseForm.endDate"
            type="date"
            class="input input-bordered"
            :min="quickLeaseForm.startDate"
          />
        </div>

        <!-- Rent Amount -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-semibold">Loyer mensuel *</span>
            <span class="label-text-alt">Auto-rempli depuis le bien</span>
          </label>
          <input
            v-model.number="quickLeaseForm.rentAmount"
            type="number"
            step="0.01"
            min="0"
            class="input input-bordered"
            required
          />
        </div>

        <!-- Charges (optional) -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-semibold">Charges mensuelles</span>
          </label>
          <input
            v-model.number="quickLeaseForm.charges"
            type="number"
            step="0.01"
            min="0"
            class="input input-bordered"
            placeholder="0.00"
          />
        </div>
      </form>

      <template #footer>
        <button @click="showQuickLeaseModal = false" class="btn">Annuler</button>
        <button @click="createQuickLease" class="btn btn-primary" :disabled="saving">
          <span v-if="saving" class="loading loading-spinner loading-sm"></span>
          {{ saving ? 'Création...' : 'Créer le bail' }}
        </button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import api from '@/services/api'
import Modal from '@/components/ui/Modal.vue'

const router = useRouter()
const toast = useToast()

const tenants = ref([])
const properties = ref([])
const loading = ref(false)
const showDialog = ref(false)
const showQuickLeaseModal = ref(false)
const saving = ref(false)
const editingTenant = ref(null)
const selectedTenantForLease = ref(null)

const filters = reactive({
  search: '',
  leaseStatus: '',
  property: ''
})

const tenantForm = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: ''
})

const quickLeaseForm = reactive({
  propertyId: '',
  startDate: '',
  endDate: '',
  rentAmount: 0,
  charges: 0
})

// Computed: Available properties (status = disponible)
const availableProperties = computed(() => {
  return properties.value.filter(p => p.status === 'disponible')
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
    toast.error('Impossible de charger les locataires')
    console.error('Error loading tenants:', error)
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

const resetForm = () => {
  Object.assign(tenantForm, {
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  })
}

const closeDialog = () => {
  showDialog.value = false
  editingTenant.value = null
  resetForm()
}

const saveTenant = async () => {
  if (!tenantForm.firstName || !tenantForm.lastName || !tenantForm.email) {
    toast.warning('Veuillez remplir tous les champs obligatoires')
    return
  }

  saving.value = true
  try {
    if (editingTenant.value) {
      await api.put(`/api/tenants/${editingTenant.value.id}`, tenantForm)
      toast.success('Locataire modifié avec succès')
    } else {
      await api.post('/api/tenants', tenantForm)
      toast.success('Locataire créé avec succès')
    }
    closeDialog()
    loadTenants()
  } catch (error) {
    toast.error(error.response?.data?.error?.message || 'Impossible de sauvegarder le locataire')
    console.error('Error saving tenant:', error)
  } finally {
    saving.value = false
  }
}

const viewTenant = (tenant) => {
  router.push(`/tenants/${tenant.id}`)
}

const editTenant = (tenant) => {
  editingTenant.value = tenant
  Object.assign(tenantForm, {
    firstName: tenant.firstName,
    lastName: tenant.lastName,
    email: tenant.email,
    phone: tenant.phone || ''
  })
  showDialog.value = true
}

const deleteTenant = (tenant) => {
  if (confirm(`Voulez-vous vraiment supprimer ${tenant.firstName} ${tenant.lastName} ?`)) {
    api.delete(`/api/tenants/${tenant.id}`)
      .then(() => {
        toast.success('Locataire supprimé avec succès')
        loadTenants()
      })
      .catch((error) => {
        toast.error('Impossible de supprimer le locataire')
        console.error('Error deleting tenant:', error)
      })
  }
}

const getActiveLease = (tenant) => {
  if (!tenant.Leases || tenant.Leases.length === 0) return null
  return tenant.Leases.find(lease => lease.status === 'actif') || null
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(value || 0)
}

onMounted(() => {
  loadTenants()
  loadProperties()
})

// Keyboard shortcuts for the dialog
watch(showDialog, (isOpen) => {
  if (isOpen) {
    const handleKeyboard = (e) => {
      // Ctrl+S or Cmd+S to save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        saveTenant()
      }
      // Ctrl+Enter or Cmd+Enter to save and close
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        saveTenant()
      }
    }
    window.addEventListener('keydown', handleKeyboard)
    
    // Cleanup
    const cleanup = () => {
      window.removeEventListener('keydown', handleKeyboard)
    }
    window._tenantDialogCleanup = cleanup
  } else if (window._tenantDialogCleanup) {
    window._tenantDialogCleanup()
    delete window._tenantDialogCleanup
  }
})

// Quick Lease Functions
const getDefaultStartDate = () => {
  const today = new Date()
  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1)
  return nextMonth.toISOString().split('T')[0]
}

const getDefaultEndDate = (startDate = null) => {
  const start = startDate ? new Date(startDate) : new Date(getDefaultStartDate())
  const end = new Date(start.getFullYear() + 1, start.getMonth(), start.getDate())
  return end.toISOString().split('T')[0]
}

const openQuickLeaseModal = (tenant) => {
  selectedTenantForLease.value = tenant
  quickLeaseForm.propertyId = ''
  quickLeaseForm.startDate = getDefaultStartDate()
  quickLeaseForm.endDate = getDefaultEndDate()
  quickLeaseForm.rentAmount = 0
  quickLeaseForm.charges = 0
  showQuickLeaseModal.value = true
}

const onPropertySelected = () => {
  if (quickLeaseForm.propertyId) {
    const property = properties.value.find(p => p.id === quickLeaseForm.propertyId)
    if (property) {
      quickLeaseForm.rentAmount = property.currentRent || 0
    }
  }
}

const onStartDateChanged = () => {
  if (quickLeaseForm.startDate) {
    quickLeaseForm.endDate = getDefaultEndDate(quickLeaseForm.startDate)
  }
}

const createQuickLease = async () => {
  if (!quickLeaseForm.propertyId || !quickLeaseForm.startDate || !quickLeaseForm.rentAmount) {
    toast.error('Veuillez remplir tous les champs obligatoires')
    return
  }

  saving.value = true
  try {
    await api.post('/api/leases', {
      tenantId: selectedTenantForLease.value.id,
      propertyId: quickLeaseForm.propertyId,
      startDate: quickLeaseForm.startDate,
      endDate: quickLeaseForm.endDate || null,
      rentAmount: quickLeaseForm.rentAmount,
      charges: quickLeaseForm.charges || 0,
      status: 'actif'
    })

    toast.success('Bail créé avec succès')
    showQuickLeaseModal.value = false
    await loadTenants() // Refresh to show updated status
  } catch (error) {
    console.error('Error creating lease:', error)
    toast.error(error.response?.data?.message || 'Erreur lors de la création du bail')
  } finally {
    saving.value = false
  }
}
</script>
