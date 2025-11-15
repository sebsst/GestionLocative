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

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="stats shadow">
          <div class="stat">
            <div class="stat-title">Surface</div>
            <div class="stat-value text-2xl">{{ property.surface }} m²</div>
            <div class="stat-desc">{{ property.rooms }} pièces</div>
          </div>
        </div>

        <div class="stats shadow">
          <div class="stat">
            <div class="stat-title">Loyer mensuel</div>
            <div class="stat-value text-2xl text-success">{{ formatCurrency(property.currentRent) }}</div>
          </div>
        </div>

        <div class="stats shadow">
          <div class="stat">
            <div class="stat-title">Taxe foncière</div>
            <div class="stat-value text-2xl text-warning">{{ formatCurrency(property.propertyTax) }}</div>
            <div class="stat-desc">par an</div>
          </div>
        </div>

        <div class="stats shadow">
          <div class="stat">
            <div class="stat-title">Type de bien</div>
            <div class="stat-value text-xl">{{ formatPropertyType(property.type) }}</div>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body p-0">
          <!-- Tab Navigation -->
          <div class="flex border-b border-base-300">
            <button
              @click="activeTab = 'info'"
              :class="[
                'px-6 py-3 font-medium transition-colors border-b-2',
                activeTab === 'info'
                  ? 'border-primary text-primary bg-base-200'
                  : 'border-transparent text-base-content/70 hover:text-base-content hover:bg-base-200'
              ]"
            >
              Informations
            </button>
            <button
              @click="activeTab = 'leases'; loadLeases()"
              :class="[
                'px-6 py-3 font-medium transition-colors border-b-2',
                activeTab === 'leases'
                  ? 'border-primary text-primary bg-base-200'
                  : 'border-transparent text-base-content/70 hover:text-base-content hover:bg-base-200'
              ]"
            >
              Baux
            </button>
            <button
              @click="activeTab = 'finances'; loadFinances()"
              :class="[
                'px-6 py-3 font-medium transition-colors border-b-2',
                activeTab === 'finances'
                  ? 'border-primary text-primary bg-base-200'
                  : 'border-transparent text-base-content/70 hover:text-base-content hover:bg-base-200'
              ]"
            >
              Finances
            </button>
          </div>

          <!-- Tab Content -->
          <div v-if="activeTab === 'info'" class="p-6 space-y-4">
              <!-- Informations générales -->
              <h3 class="text-xl font-bold mb-4">Informations générales</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-3">
                  <div class="flex justify-between py-2 border-b border-base-300">
                    <span class="font-semibold">Type de bien</span>
                    <span>{{ formatPropertyType(property.type) }}</span>
                  </div>
                  <div class="flex justify-between py-2 border-b border-base-300">
                    <span class="font-semibold">Surface</span>
                    <span>{{ property.surface }} m²</span>
                  </div>
                  <div class="flex justify-between py-2 border-b border-base-300">
                    <span class="font-semibold">Nombre de pièces</span>
                    <span>{{ property.rooms }}</span>
                  </div>
                  <div class="flex justify-between py-2 border-b border-base-300">
                    <span class="font-semibold">Nombre de chambres</span>
                    <span>{{ property.bedrooms }}</span>
                  </div>
                </div>

                <div class="space-y-3">
                  <div class="flex justify-between py-2 border-b border-base-300">
                    <span class="font-semibold">Référence cadastrale</span>
                    <span>{{ property.cadastralReference || 'N/A' }}</span>
                  </div>
                  <div class="flex justify-between py-2 border-b border-base-300">
                    <span class="font-semibold">Numéro fiscal</span>
                    <span>{{ property.fiscalNumber || 'N/A' }}</span>
                  </div>
                  <div class="flex justify-between py-2 border-b border-base-300">
                    <span class="font-semibold">Prix d'achat</span>
                    <span>{{ formatCurrency(property.purchasePrice) }}</span>
                  </div>
                  <div class="flex justify-between py-2 border-b border-base-300">
                    <span class="font-semibold">Date d'achat</span>
                    <span>{{ formatDate(property.purchaseDate) }}</span>
                  </div>
                </div>
              </div>

              <div v-if="property.description" class="mt-6">
                <h4 class="font-semibold mb-2">Description</h4>
                <p class="text-base-content/80">{{ property.description }}</p>
              </div>
          </div>

          <div v-if="activeTab === 'leases'" class="p-6 space-y-4">
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
                    <tr v-for="lease in leases" :key="lease.id">
                      <td>{{ lease.Tenant?.firstName }} {{ lease.Tenant?.lastName }}</td>
                      <td>{{ formatDate(lease.startDate) }}</td>
                      <td>{{ lease.endDate ? formatDate(lease.endDate) : 'En cours' }}</td>
                      <td>{{ formatCurrency(lease.monthlyRent) }}</td>
                      <td>
                        <div :class="lease.status === 'actif' ? 'badge-success' : 'badge-error'" class="badge">
                          {{ lease.status }}
                        </div>
                      </td>
                      <td>
                        <div class="flex gap-1">
                          <button @click="openOccupancyModal(lease)" class="btn btn-ghost btn-xs btn-square" title="Gérer les périodes d'occupation">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </button>
                          <button @click="openRentPeriodModal(lease)" class="btn btn-ghost btn-xs btn-square" title="Gérer l'historique des loyers">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                          <button @click="editLease(lease)" class="btn btn-ghost btn-xs btn-square" title="Modifier le bail">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button @click="deleteLease(lease)" class="btn btn-ghost btn-xs btn-square text-error" title="Supprimer le bail">
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

          <div v-if="activeTab === 'finances'" class="p-6 space-y-4">
              <h3 class="text-xl font-bold mb-4">Données financières</h3>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div class="stats shadow">
                  <div class="stat">
                    <div class="stat-title">Revenus locatifs (année)</div>
                    <div class="stat-value text-success">{{ formatCurrency(financialData.yearlyRevenue) }}</div>
                  </div>
                </div>

                <div class="stats shadow">
                  <div class="stat">
                    <div class="stat-title">Charges (année)</div>
                    <div class="stat-value text-error">{{ formatCurrency(financialData.yearlyCharges) }}</div>
                  </div>
                </div>

                <div class="stats shadow">
                  <div class="stat">
                    <div class="stat-title">Résultat net</div>
                    <div class="stat-value text-info">{{ formatCurrency(financialData.yearlyRevenue - financialData.yearlyCharges) }}</div>
                  </div>
                </div>
              </div>

              <div class="bg-base-200 p-4 rounded-lg">
                <h4 class="font-semibold mb-3">Charges déductibles</h4>
                <div class="space-y-2">
                  <div class="flex justify-between">
                    <span>Taxe foncière</span>
                    <span class="font-semibold">{{ formatCurrency(property.propertyTax) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>Charges de copropriété</span>
                    <span class="font-semibold">{{ formatCurrency(financialData.yearlyCharges) }}</span>
                  </div>
                </div>
              </div>
          </div>
        </div>
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

    <!-- Occupancy Modal -->
    <LeaseOccupancyModal
      :show="showOccupancyModal"
      :lease="selectedLease"
      @close="showOccupancyModal = false"
      @updated="loadLeases"
    />

    <!-- Rent Period Modal -->
    <LeaseRentPeriodModal
      :is-open="showRentPeriodModal"
      :lease-id="selectedLease?.id"
      @close="showRentPeriodModal = false"
      @updated="loadLeases"
    />

    <!-- Edit Lease Modal -->
    <div v-if="showEditLeaseModal" @click.self="closeEditLeaseModal" class="modal modal-open">
      <div class="modal-box max-w-2xl">
        <button @click="closeEditLeaseModal" class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
        <h3 class="font-bold text-lg mb-4">Modifier le bail</h3>

        <form @submit.prevent="saveLease" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="form-control">
              <label class="label">
                <span class="label-text">Date de début *</span>
              </label>
              <input
                v-model="leaseForm.startDate"
                type="date"
                class="input input-bordered"
                required
              />
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text">Date de fin</span>
              </label>
              <input
                v-model="leaseForm.endDate"
                type="date"
                class="input input-bordered"
              />
              <label class="label">
                <span class="label-text-alt">Laisser vide si en cours</span>
              </label>
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text">Loyer mensuel (€) *</span>
              </label>
              <input
                v-model.number="leaseForm.monthlyRent"
                type="number"
                step="0.01"
                class="input input-bordered"
                required
              />
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text">Dépôt de garantie (€)</span>
              </label>
              <input
                v-model.number="leaseForm.deposit"
                type="number"
                step="0.01"
                class="input input-bordered"
              />
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text">Nombre d'occupants</span>
              </label>
              <input
                v-model.number="leaseForm.numberOfOccupants"
                type="number"
                min="1"
                class="input input-bordered"
              />
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text">Statut</span>
              </label>
              <select v-model="leaseForm.status" class="select select-bordered">
                <option value="actif">Actif</option>
                <option value="termine">Terminé</option>
                <option value="resilie">Résilié</option>
              </select>
            </div>
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">Notes</span>
            </label>
            <textarea
              v-model="leaseForm.notes"
              class="textarea textarea-bordered"
              rows="3"
            ></textarea>
          </div>

          <div class="modal-action">
            <button type="button" @click="closeEditLeaseModal" class="btn btn-ghost">
              Annuler
            </button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              <span v-if="saving" class="loading loading-spinner loading-sm"></span>
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'
import api from '@/services/api'
import LeaseOccupancyModal from '@/components/LeaseOccupancyModal.vue'
import LeaseRentPeriodModal from '@/components/LeaseRentPeriodModal.vue'

const route = useRoute()
const toast = useToast()
const property = ref(null)
const loading = ref(false)
const saving = ref(false)
const activeTab = ref('info')
const leases = ref([])
const showOccupancyModal = ref(false)
const showRentPeriodModal = ref(false)
const showEditLeaseModal = ref(false)
const selectedLease = ref(null)
const editingLease = ref(null)
const financialData = ref({
  yearlyRevenue: 0,
  yearlyCharges: 0
})

const leaseForm = ref({
  startDate: '',
  endDate: '',
  monthlyRent: null,
  deposit: null,
  numberOfOccupants: 1,
  status: 'actif',
  notes: ''
})

const loadProperty = async () => {
  loading.value = true
  try {
    const response = await api.get(`/api/properties/${route.params.id}`)
    property.value = response.data.data
  } catch (error) {
    console.error('Error loading property:', error)
    toast.error('Impossible de charger le bien')
  } finally {
    loading.value = false
  }
}

const loadLeases = async () => {
  try {
    const response = await api.get(`/api/leases?propertyId=${route.params.id}`)
    leases.value = response.data.data || []
  } catch (error) {
    console.error('Error loading leases:', error)
  }
}

const loadFinances = async () => {
  try {
    const currentYear = new Date().getFullYear()

    // Charger les loyers de l'année
    const rentsResponse = await api.get('/api/rents', {
      params: {
        year: currentYear,
        propertyId: route.params.id,
        status: 'paye'
      }
    })
    const rents = rentsResponse.data.data || []
    financialData.value.yearlyRevenue = rents.reduce((sum, r) => sum + (parseFloat(r.paidAmount) || 0), 0)

    // Charger les charges de l'année
    const chargesResponse = await api.get('/api/charges', {
      params: {
        year: currentYear,
        propertyId: route.params.id
      }
    })
    const charges = chargesResponse.data.data || []
    financialData.value.yearlyCharges = charges.reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0)
  } catch (error) {
    console.error('Error loading finances:', error)
  }
}

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

const formatPropertyType = (type) => {
  const typeMap = {
    appartement: 'Appartement',
    maison: 'Maison',
    immeuble: 'Immeuble',
    terrain: 'Terrain',
    garage: 'Garage',
    fond_commerce: 'Fonds de commerce',
    meuble: 'Meublé'
  }
  return typeMap[type] || type
}

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

const openOccupancyModal = (lease) => {
  selectedLease.value = lease
  showOccupancyModal.value = true
}

const openRentPeriodModal = (lease) => {
  selectedLease.value = lease
  showRentPeriodModal.value = true
}

const editLease = (lease) => {
  console.log('editLease appelé', lease)
  console.log('showEditLeaseModal avant:', showEditLeaseModal.value)
  editingLease.value = lease
  leaseForm.value = {
    startDate: lease.startDate ? lease.startDate.split('T')[0] : '',
    endDate: lease.endDate ? lease.endDate.split('T')[0] : '',
    monthlyRent: lease.monthlyRent,
    deposit: lease.deposit,
    numberOfOccupants: lease.numberOfOccupants || 1,
    status: lease.status,
    notes: lease.notes || ''
  }
  showEditLeaseModal.value = true
  console.log('showEditLeaseModal après:', showEditLeaseModal.value)
  console.log('leaseForm:', leaseForm.value)
}

const closeEditLeaseModal = () => {
  showEditLeaseModal.value = false
  editingLease.value = null
  leaseForm.value = {
    startDate: '',
    endDate: '',
    monthlyRent: null,
    deposit: null,
    numberOfOccupants: 1,
    status: 'actif',
    notes: ''
  }
}

const saveLease = async () => {
  saving.value = true
  try {
    const data = {
      ...leaseForm.value,
      endDate: leaseForm.value.endDate || null
    }

    await api.put(`/api/leases/${editingLease.value.id}`, data)
    toast.success('Bail modifié avec succès')
    closeEditLeaseModal()
    await loadLeases()
  } catch (error) {
    console.error('Erreur modification bail:', error)
    toast.error('Erreur lors de la modification du bail')
  } finally {
    saving.value = false
  }
}

const deleteLease = async (lease) => {
  if (!confirm(`Êtes-vous sûr de vouloir supprimer ce bail ?\n\nLocataire: ${lease.Tenant?.firstName} ${lease.Tenant?.lastName}\nDu ${formatDate(lease.startDate)} au ${lease.endDate ? formatDate(lease.endDate) : 'En cours'}`)) {
    return
  }

  try {
    await api.delete(`/api/leases/${lease.id}`)
    toast.success('Bail supprimé avec succès')
    await loadLeases()
  } catch (error) {
    console.error('Erreur suppression bail:', error)
    toast.error('Erreur lors de la suppression du bail')
  }
}

onMounted(() => {
  loadProperty()
  loadLeases()
})
</script>
