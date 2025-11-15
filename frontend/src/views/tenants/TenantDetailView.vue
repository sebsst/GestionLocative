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
      <div class="card bg-gradient-to-r from-success/10 to-info/10 shadow-xl">
        <div class="card-body">
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center gap-4">
              <div class="avatar placeholder">
                <div class="bg-success text-success-content rounded-full w-16">
                  <span class="text-2xl font-bold">
                    {{ tenant.firstName.charAt(0).toUpperCase() }}{{ tenant.lastName.charAt(0).toUpperCase() }}
                  </span>
                </div>
              </div>
              <div>
                <h1 class="text-3xl font-bold">{{ tenant.firstName }} {{ tenant.lastName }}</h1>
                <p class="text-base-content/70 mt-1 flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {{ tenant.email }}
                </p>
                <p class="text-base-content/70 flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {{ tenant.phone }}
                </p>
              </div>
            </div>
            <div class="flex gap-2">
              <div v-if="activeLease" class="badge badge-lg badge-success">Bail actif</div>
              <div v-else class="badge badge-lg badge-ghost">Sans bail</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bail actif -->
      <div v-if="activeLease" class="card bg-base-100 shadow-xl border-l-4 border-primary">
        <div class="card-body">
          <h2 class="card-title flex items-center gap-2">
            <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Bail en cours
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <div>
              <p class="text-sm text-base-content/60 mb-1">Bien occupé</p>
              <p class="text-lg font-semibold">{{ activeLease.Property?.name }}</p>
              <p class="text-sm text-base-content/70">{{ activeLease.Property?.address }}</p>
            </div>
            <div>
              <p class="text-sm text-base-content/60 mb-1">Loyer mensuel</p>
              <p class="text-lg font-semibold text-success">{{ formatCurrency(activeLease.rentAmount) }}</p>
            </div>
            <div>
              <p class="text-sm text-base-content/60 mb-1">Période du bail</p>
              <p class="text-lg font-semibold">{{ formatDate(activeLease.startDate) }}</p>
              <p class="text-sm text-base-content/70">{{ activeLease.endDate ? 'au ' + formatDate(activeLease.endDate) : 'En cours' }}</p>
            </div>
            <div>
              <p class="text-sm text-base-content/60 mb-1">Dépôt de garantie</p>
              <p class="text-lg font-semibold">{{ formatCurrency(activeLease.deposit) }}</p>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="alert alert-warning shadow-lg">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <span>Ce locataire n'a pas de bail actif</span>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="stats shadow">
          <div class="stat">
            <div class="stat-title">Paiements (année)</div>
            <div class="stat-value text-2xl text-info">{{ paymentsStats.paidCount }}/{{ paymentsStats.totalCount }}</div>
            <div class="stat-desc">{{ formatCurrency(paymentsStats.totalPaid) }} payés</div>
          </div>
        </div>

        <div class="stats shadow">
          <div class="stat">
            <div class="stat-title">En attente</div>
            <div class="stat-value text-2xl text-warning">{{ formatCurrency(paymentsStats.totalPending) }}</div>
          </div>
        </div>

        <div class="stats shadow">
          <div class="stat">
            <div class="stat-title">Retards</div>
            <div class="stat-value text-2xl" :class="paymentsStats.lateCount > 0 ? 'text-error' : 'text-success'">
              {{ paymentsStats.lateCount }}
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <div role="tablist" class="tabs tabs-lifted">
            <input
              type="radio"
              name="tenant_tabs"
              role="tab"
              class="tab"
              aria-label="Informations"
              :checked="activeTab === 'info'"
              @change="activeTab = 'info'"
            />
            <div role="tabpanel" class="tab-content bg-base-100 border-base-300 rounded-box p-6">
              <h3 class="text-xl font-bold mb-4">Informations personnelles</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-3">
                  <div class="flex justify-between py-2 border-b border-base-300">
                    <span class="font-semibold">Prénom</span>
                    <span>{{ tenant.firstName }}</span>
                  </div>
                  <div class="flex justify-between py-2 border-b border-base-300">
                    <span class="font-semibold">Nom</span>
                    <span>{{ tenant.lastName }}</span>
                  </div>
                  <div class="flex justify-between py-2 border-b border-base-300">
                    <span class="font-semibold">Email</span>
                    <span>{{ tenant.email }}</span>
                  </div>
                  <div class="flex justify-between py-2 border-b border-base-300">
                    <span class="font-semibold">Téléphone</span>
                    <span>{{ tenant.phone }}</span>
                  </div>
                </div>

                <div class="space-y-3">
                  <div class="flex justify-between py-2 border-b border-base-300">
                    <span class="font-semibold">Date de naissance</span>
                    <span>{{ formatDate(tenant.birthDate) }}</span>
                  </div>
                  <div class="flex justify-between py-2 border-b border-base-300">
                    <span class="font-semibold">Adresse</span>
                    <span>{{ tenant.address || 'N/A' }}</span>
                  </div>
                  <div class="flex justify-between py-2 border-b border-base-300">
                    <span class="font-semibold">Profession</span>
                    <span>{{ tenant.profession || 'N/A' }}</span>
                  </div>
                  <div class="flex justify-between py-2 border-b border-base-300">
                    <span class="font-semibold">Revenu mensuel</span>
                    <span>{{ formatCurrency(tenant.monthlyIncome) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <input
              type="radio"
              name="tenant_tabs"
              role="tab"
              class="tab"
              aria-label="Baux"
              :checked="activeTab === 'leases'"
              @change="activeTab = 'leases'; loadLeases()"
            />
            <div role="tabpanel" class="tab-content bg-base-100 border-base-300 rounded-box p-6">
              <h3 class="text-xl font-bold mb-4">Historique des baux</h3>

              <div v-if="leases.length > 0" class="overflow-x-auto">
                <table class="table table-zebra">
                  <thead class="bg-base-200">
                    <tr class="border-b-2 border-base-300">
                      <th class="border-r border-base-300">Bien</th>
                      <th class="border-r border-base-300">Début</th>
                      <th class="border-r border-base-300">Fin</th>
                      <th class="border-r border-base-300">Loyer</th>
                      <th class="border-r border-base-300">Dépôt de garantie</th>
                      <th class="border-r border-base-300">Statut</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="lease in leases" :key="lease.id">
                      <td>{{ lease.Property?.name }}</td>
                      <td>{{ formatDate(lease.startDate) }}</td>
                      <td>{{ lease.endDate ? formatDate(lease.endDate) : 'En cours' }}</td>
                      <td>{{ formatCurrency(lease.rentAmount) }}</td>
                      <td>{{ formatCurrency(lease.deposit) }}</td>
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

            <input
              type="radio"
              name="tenant_tabs"
              role="tab"
              class="tab"
              aria-label="Paiements"
              :checked="activeTab === 'payments'"
              @change="activeTab = 'payments'; loadPayments()"
            />
            <div role="tabpanel" class="tab-content bg-base-100 border-base-300 rounded-box p-6">
              <h3 class="text-xl font-bold mb-4">Historique des paiements</h3>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div class="stats shadow">
                  <div class="stat">
                    <div class="stat-title">Total payé</div>
                    <div class="stat-value text-success">{{ formatCurrency(paymentsStats.totalPaid) }}</div>
                  </div>
                </div>

                <div class="stats shadow">
                  <div class="stat">
                    <div class="stat-title">En attente</div>
                    <div class="stat-value text-warning">{{ formatCurrency(paymentsStats.totalPending) }}</div>
                  </div>
                </div>

                <div class="stats shadow">
                  <div class="stat">
                    <div class="stat-title">En retard</div>
                    <div class="stat-value text-error">{{ paymentsStats.lateCount }}</div>
                  </div>
                </div>
              </div>

              <div v-if="payments.length > 0" class="overflow-x-auto">
                <table class="table table-zebra">
                  <thead class="bg-base-200">
                    <tr class="border-b-2 border-base-300">
                      <th class="border-r border-base-300">Période</th>
                      <th class="border-r border-base-300">Bien</th>
                      <th class="text-right border-r border-base-300">Montant attendu</th>
                      <th class="text-right border-r border-base-300">Montant payé</th>
                      <th class="border-r border-base-300">Date paiement</th>
                      <th class="text-center">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="payment in payments" :key="payment.id">
                      <td>{{ getMonthName(payment.month) }} {{ payment.year }}</td>
                      <td>{{ payment.Lease?.Property?.name }}</td>
                      <td class="text-right">{{ formatCurrency(payment.expectedAmount) }}</td>
                      <td class="text-right">{{ formatCurrency(payment.paidAmount) }}</td>
                      <td>{{ formatDate(payment.paymentDate) }}</td>
                      <td class="text-center">
                        <div :class="getBadgeClass(payment.status)" class="badge badge-sm">
                          {{ getStatusLabel(payment.status) }}
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div v-else class="text-center py-8 text-base-content/60">
                Aucun paiement enregistré
              </div>
            </div>
          </div>
        </div>
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

    <!-- Occupancy Modal -->
    <LeaseOccupancyModal
      :show="showOccupancyModal"
      :lease="selectedLease"
      @close="showOccupancyModal = false"
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
                v-model.number="leaseForm.rentAmount"
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
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'
import api from '@/services/api'
import LeaseOccupancyModal from '@/components/LeaseOccupancyModal.vue'

const route = useRoute()
const toast = useToast()
const tenant = ref(null)
const loading = ref(false)
const saving = ref(false)
const activeTab = ref('info')
const leases = ref([])
const payments = ref([])
const showOccupancyModal = ref(false)
const showEditLeaseModal = ref(false)
const selectedLease = ref(null)
const editingLease = ref(null)

const leaseForm = ref({
  startDate: '',
  endDate: '',
  rentAmount: null,
  deposit: null,
  numberOfOccupants: 1,
  status: 'actif',
  notes: ''
})

const activeLease = computed(() => {
  return leases.value.find(lease => lease.status === 'actif')
})

const paymentsStats = computed(() => {
  const totalCount = payments.value.length
  const paidCount = payments.value.filter(p => p.status === 'paye').length
  const lateCount = payments.value.filter(p => p.status === 'en_retard').length
  const totalPaid = payments.value.reduce((sum, p) => sum + (parseFloat(p.paidAmount) || 0), 0)
  const totalPending = payments.value
    .filter(p => p.status !== 'paye')
    .reduce((sum, p) => sum + (parseFloat(p.expectedAmount) - parseFloat(p.paidAmount || 0)), 0)

  return {
    totalCount,
    paidCount,
    lateCount,
    totalPaid,
    totalPending
  }
})

const loadTenant = async () => {
  loading.value = true
  try {
    const response = await api.get(`/api/tenants/${route.params.id}`)
    tenant.value = response.data.data
  } catch (error) {
    console.error('Error loading tenant:', error)
    toast.error('Impossible de charger le locataire')
  } finally {
    loading.value = false
  }
}

const loadLeases = async () => {
  try {
    const response = await api.get(`/api/leases?tenantId=${route.params.id}`)
    leases.value = response.data.data || []
  } catch (error) {
    console.error('Error loading leases:', error)
  }
}

const loadPayments = async () => {
  try {
    const currentYear = new Date().getFullYear()
    const response = await api.get('/api/rents', {
      params: {
        year: currentYear,
        tenantId: route.params.id
      }
    })
    payments.value = response.data.data || []
  } catch (error) {
    console.error('Error loading payments:', error)
  }
}

const months = [
  { label: 'Janvier', value: 1 },
  { label: 'Février', value: 2 },
  { label: 'Mars', value: 3 },
  { label: 'Avril', value: 4 },
  { label: 'Mai', value: 5 },
  { label: 'Juin', value: 6 },
  { label: 'Juillet', value: 7 },
  { label: 'Août', value: 8 },
  { label: 'Septembre', value: 9 },
  { label: 'Octobre', value: 10 },
  { label: 'Novembre', value: 11 },
  { label: 'Décembre', value: 12 }
]

const getMonthName = (month) => {
  return months.find(m => m.value === month)?.label || month
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

const getBadgeClass = (status) => {
  const classMap = {
    en_attente: 'badge-warning',
    paye: 'badge-success',
    partiel: 'badge-info',
    en_retard: 'badge-error'
  }
  return classMap[status] || 'badge-ghost'
}

const getStatusLabel = (status) => {
  const labelMap = {
    en_attente: 'En attente',
    paye: 'Payé',
    partiel: 'Partiel',
    en_retard: 'En retard'
  }
  return labelMap[status] || status
}

const openOccupancyModal = (lease) => {
  selectedLease.value = lease
  showOccupancyModal.value = true
}

const editLease = (lease) => {
  editingLease.value = lease
  leaseForm.value = {
    startDate: lease.startDate ? lease.startDate.split('T')[0] : '',
    endDate: lease.endDate ? lease.endDate.split('T')[0] : '',
    rentAmount: lease.rentAmount,
    deposit: lease.deposit,
    numberOfOccupants: lease.numberOfOccupants || 1,
    status: lease.status,
    notes: lease.notes || ''
  }
  showEditLeaseModal.value = true
}

const closeEditLeaseModal = () => {
  showEditLeaseModal.value = false
  editingLease.value = null
  leaseForm.value = {
    startDate: '',
    endDate: '',
    rentAmount: null,
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
  if (!confirm(`Êtes-vous sûr de vouloir supprimer ce bail ?\n\nBien: ${lease.Property?.name}\nDu ${formatDate(lease.startDate)} au ${lease.endDate ? formatDate(lease.endDate) : 'En cours'}`)) {
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
  loadTenant()
  loadLeases()
  loadPayments()
})
</script>
