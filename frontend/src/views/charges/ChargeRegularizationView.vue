<template>
  <div class="p-8">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold">Régularisation des Charges</h1>
        <p class="text-base-content/70 mt-1">Calculez et générez les décomptes annuels de charges</p>
      </div>
      <button @click="showCalculateDialog = true" class="btn btn-primary gap-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        Nouvelle régularisation
      </button>
    </div>

    <!-- Statistiques -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <div class="stats shadow">
        <div class="stat">
          <div class="stat-title">Total régularisations</div>
          <div class="stat-value text-2xl">{{ regularizations.length }}</div>
        </div>
      </div>

      <div class="stats shadow bg-success text-success-content">
        <div class="stat">
          <div class="stat-title text-success-content/70">Envoyées</div>
          <div class="stat-value text-2xl">{{ sentCount }}</div>
        </div>
      </div>

      <div class="stats shadow bg-warning text-warning-content">
        <div class="stat">
          <div class="stat-title text-warning-content/70">Brouillons</div>
          <div class="stat-value text-2xl">{{ draftCount }}</div>
        </div>
      </div>

      <div class="stats shadow bg-info text-info-content">
        <div class="stat">
          <div class="stat-title text-info-content/70">Montant total</div>
          <div class="stat-value text-xl">{{ formatCurrency(totalRegularization) }}</div>
        </div>
      </div>
    </div>

    <!-- Filtres -->
    <div class="card bg-base-100 shadow-xl mb-6">
      <div class="card-body">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text">Année</span>
            </label>
            <select v-model="filters.year" class="select select-bordered" @change="loadRegularizations">
              <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
            </select>
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">Statut</span>
            </label>
            <select v-model="filters.status" class="select select-bordered" @change="loadRegularizations">
              <option value="">Tous</option>
              <option value="draft">Brouillon</option>
              <option value="sent">Envoyé</option>
              <option value="paid">Payé</option>
              <option value="refunded">Remboursé</option>
            </select>
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">Bail</span>
            </label>
            <select v-model="filters.leaseId" class="select select-bordered" @change="loadRegularizations">
              <option value="">Tous les baux</option>
              <option v-for="lease in activeLeases" :key="lease.id" :value="lease.id">
                {{ lease.Tenant?.firstName }} {{ lease.Tenant?.lastName }} - {{ lease.Property?.name }}
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
    <div v-else-if="regularizations.length > 0" class="card bg-base-100 shadow-xl overflow-hidden">
      <div class="overflow-x-auto">
        <table class="table table-zebra">
          <thead class="bg-base-200">
            <tr class="border-b-2 border-base-300">
              <th>Année</th>
              <th>Locataire</th>
              <th>Bien</th>
              <th>Provisions</th>
              <th>Charges réelles</th>
              <th>Régularisation</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="reg in regularizations" :key="reg.id">
              <td class="font-semibold">{{ reg.year }}</td>
              <td>
                {{ reg.Lease?.Tenant?.firstName }} {{ reg.Lease?.Tenant?.lastName }}
              </td>
              <td>{{ reg.Lease?.Property?.name }}</td>
              <td>{{ formatCurrency(reg.totalProvisions) }}</td>
              <td>{{ formatCurrency(reg.totalRealCharges) }}</td>
              <td>
                <span
                  :class="{
                    'text-success font-bold': parseFloat(reg.regularizationAmount) > 0,
                    'text-error font-bold': parseFloat(reg.regularizationAmount) < 0,
                    'text-base-content': parseFloat(reg.regularizationAmount) === 0
                  }"
                >
                  {{ formatCurrency(reg.regularizationAmount) }}
                </span>
              </td>
              <td>
                <span class="badge" :class="getStatusBadge(reg.status)">
                  {{ getStatusLabel(reg.status) }}
                </span>
              </td>
              <td>
                <div class="flex gap-2">
                  <button
                    @click="viewRegularization(reg)"
                    class="btn btn-sm btn-ghost"
                    title="Voir détails"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  <button
                    @click="generatePDF(reg)"
                    class="btn btn-sm btn-ghost"
                    title="Générer PDF"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </button>
                  <button
                    v-if="reg.status === 'draft'"
                    @click="deleteRegularization(reg.id)"
                    class="btn btn-sm btn-ghost text-error"
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

    <!-- Empty state -->
    <div v-else class="card bg-base-100 shadow-xl">
      <div class="card-body text-center py-12">
        <svg class="w-16 h-6 mx-auto text-base-content/30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p class="text-base-content/60">Aucune régularisation trouvée</p>
        <button @click="showCalculateDialog = true" class="btn btn-primary mt-4">
          Créer une régularisation
        </button>
      </div>
    </div>

    <!-- Modal Calculer régularisation -->
    <Modal
      v-model="showCalculateDialog"
      title="Calculer une régularisation de charges"
      size="lg"
      :hide-footer="true"
    >
      <div class="space-y-6">
        <!-- Sélection bail et année -->
        <div class="grid grid-cols-2 gap-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text">Bail *</span>
            </label>
            <select v-model="calculationForm.leaseId" class="select select-bordered">
              <option value="">Sélectionner un bail</option>
              <option v-for="lease in activeLeases" :key="lease.id" :value="lease.id">
                {{ lease.Tenant?.firstName }} {{ lease.Tenant?.lastName }} - {{ lease.Property?.name }}
              </option>
            </select>
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">Année *</span>
            </label>
            <select v-model="calculationForm.year" class="select select-bordered">
              <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
            </select>
          </div>
        </div>

        <!-- Résultats du calcul -->
        <div v-if="calculationResult" class="space-y-4">
          <div class="divider">Résultat du calcul</div>

          <!-- Summary cards -->
          <div class="grid grid-cols-3 gap-4">
            <div class="stat bg-base-200 rounded-box">
              <div class="stat-title">Provisions versées</div>
              <div class="stat-value text-xl">{{ formatCurrency(calculationResult.totalProvisions) }}</div>
            </div>

            <div class="stat bg-base-200 rounded-box">
              <div class="stat-title">Charges réelles</div>
              <div class="stat-value text-xl">{{ formatCurrency(calculationResult.totalRealCharges) }}</div>
            </div>

            <div class="stat rounded-box" :class="{
              'bg-success text-success-content': calculationResult.regularizationAmount > 0,
              'bg-error text-error-content': calculationResult.regularizationAmount < 0,
              'bg-base-200': calculationResult.regularizationAmount === 0
            }">
              <div class="stat-title" :class="{
                'text-success-content/70': calculationResult.regularizationAmount > 0,
                'text-error-content/70': calculationResult.regularizationAmount < 0
              }">Régularisation</div>
              <div class="stat-value text-xl">{{ formatCurrency(calculationResult.regularizationAmount) }}</div>
              <div class="stat-desc" :class="{
                'text-success-content/70': calculationResult.regularizationAmount > 0,
                'text-error-content/70': calculationResult.regularizationAmount < 0
              }">
                {{ calculationResult.regularizationAmount > 0 ? 'Dû par le locataire' : calculationResult.regularizationAmount < 0 ? 'Dû au locataire' : 'Équilibré' }}
              </div>
            </div>
          </div>

          <!-- Pro-rata breakdown (if applicable) -->
          <div v-if="calculationResult.usedProRata && calculationResult.provisionsPeriodBreakdown?.length > 0" class="alert alert-info">
            <div class="w-full">
              <div class="flex items-center justify-between mb-2">
                <div class="font-semibold">Calcul au prorata (changement de loyer)</div>
                <span class="badge badge-primary">Appliqué</span>
              </div>
              <div class="overflow-x-auto">
                <table class="table table-xs">
                  <thead>
                    <tr>
                      <th>Période</th>
                      <th class="text-right">Jours</th>
                      <th class="text-right">Charges mensuelles</th>
                      <th class="text-right">Provisions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(period, index) in calculationResult.provisionsPeriodBreakdown" :key="index">
                      <td class="text-sm">
                        {{ formatDate(period.startDate) }} → {{ formatDate(period.endDate) }}
                      </td>
                      <td class="text-right">{{ period.days }}</td>
                      <td class="text-right">{{ formatCurrency(period.monthlyCharges) }}</td>
                      <td class="text-right font-semibold">{{ formatCurrency(period.provisions) }}</td>
                    </tr>
                    <tr class="font-bold bg-base-200">
                      <td colspan="3" class="text-right">Total</td>
                      <td class="text-right">{{ formatCurrency(calculationResult.totalProvisions) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Détails par charge -->
          <div class="overflow-x-auto">
            <table class="table table-sm">
              <thead class="bg-base-200">
                <tr>
                  <th>Charge</th>
                  <th class="text-right">Provisions</th>
                  <th class="text-right">Réel</th>
                  <th class="text-right">Différence</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(detail, index) in calculationResult.details" :key="index">
                  <td>{{ detail.chargeName }}</td>
                  <td class="text-right">{{ formatCurrency(detail.provisions) }}</td>
                  <td class="text-right">{{ formatCurrency(detail.realAmount) }}</td>
                  <td class="text-right" :class="{
                    'text-success font-semibold': detail.difference > 0,
                    'text-error font-semibold': detail.difference < 0
                  }">
                    {{ formatCurrency(detail.difference) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <button @click="closeCalculateDialog" class="btn btn-ghost">Annuler</button>
          <button
            @click="calculate"
            :disabled="!calculationForm.leaseId || !calculationForm.year || calculating"
            class="btn btn-primary"
          >
            <span v-if="calculating" class="loading loading-spinner loading-sm"></span>
            {{ calculating ? 'Calcul...' : 'Calculer' }}
          </button>
          <button
            v-if="calculationResult"
            @click="saveRegularization"
            :disabled="saving"
            class="btn btn-success"
          >
            <span v-if="saving" class="loading loading-spinner loading-sm"></span>
            {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
          </button>
        </div>
      </template>
    </Modal>

    <!-- Modal View Details -->
    <Modal
      v-model="showDetailsDialog"
      :title="`Régularisation ${selectedRegularization?.year || ''}`"
      size="xl"
      :hide-footer="true"
    >
      <div v-if="selectedRegularization" class="space-y-6">
        <!-- Header info -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="text-sm text-base-content/60">Locataire</p>
            <p class="font-semibold">
              {{ selectedRegularization.Lease?.Tenant?.firstName }} {{ selectedRegularization.Lease?.Tenant?.lastName }}
            </p>
          </div>
          <div>
            <p class="text-sm text-base-content/60">Bien</p>
            <p class="font-semibold">{{ selectedRegularization.Lease?.Property?.name }}</p>
            <p class="text-sm">{{ selectedRegularization.Lease?.Property?.address }}</p>
          </div>
          <div>
            <p class="text-sm text-base-content/60">Période</p>
            <p class="font-semibold">
              {{ formatDate(selectedRegularization.periodStart) }} - {{ formatDate(selectedRegularization.periodEnd) }}
            </p>
          </div>
          <div>
            <p class="text-sm text-base-content/60">Statut</p>
            <p>
              <span class="badge" :class="getStatusBadge(selectedRegularization.status)">
                {{ getStatusLabel(selectedRegularization.status) }}
              </span>
            </p>
          </div>
        </div>

        <div class="divider"></div>

        <!-- Summary -->
        <div class="grid grid-cols-3 gap-4">
          <div class="stat bg-base-200 rounded-box">
            <div class="stat-title">Provisions versées</div>
            <div class="stat-value text-xl">{{ formatCurrency(selectedRegularization.totalProvisions) }}</div>
          </div>

          <div class="stat bg-base-200 rounded-box">
            <div class="stat-title">Charges réelles</div>
            <div class="stat-value text-xl">{{ formatCurrency(selectedRegularization.totalRealCharges) }}</div>
          </div>

          <div class="stat rounded-box" :class="{
            'bg-success text-success-content': parseFloat(selectedRegularization.regularizationAmount) > 0,
            'bg-error text-error-content': parseFloat(selectedRegularization.regularizationAmount) < 0,
            'bg-base-200': parseFloat(selectedRegularization.regularizationAmount) === 0
          }">
            <div class="stat-title">Régularisation</div>
            <div class="stat-value text-xl">{{ formatCurrency(selectedRegularization.regularizationAmount) }}</div>
          </div>
        </div>

        <!-- Details table -->
        <div v-if="selectedRegularization.details && selectedRegularization.details.length > 0">
          <h3 class="font-bold text-lg mb-2">Détail par charge</h3>
          <div class="overflow-x-auto">
            <table class="table table-sm">
              <thead class="bg-base-200">
                <tr>
                  <th>Charge</th>
                  <th class="text-right">Provisions</th>
                  <th class="text-right">Réel</th>
                  <th class="text-right">Différence</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="detail in selectedRegularization.details" :key="detail.id">
                  <td>{{ detail.chargeName }}</td>
                  <td class="text-right">{{ formatCurrency(detail.provisions) }}</td>
                  <td class="text-right">{{ formatCurrency(detail.realAmount) }}</td>
                  <td class="text-right" :class="{
                    'text-success font-semibold': parseFloat(detail.difference) > 0,
                    'text-error font-semibold': parseFloat(detail.difference) < 0
                  }">
                    {{ formatCurrency(detail.difference) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Notes -->
        <div v-if="selectedRegularization.notes">
          <h3 class="font-bold text-lg mb-2">Notes</h3>
          <p class="text-sm">{{ selectedRegularization.notes }}</p>
        </div>

        <!-- Actions -->
        <div class="flex justify-between gap-2">
          <div class="flex gap-2">
            <button
              v-if="selectedRegularization.status === 'draft'"
              @click="markAsSent(selectedRegularization.id)"
              class="btn btn-primary btn-sm"
            >
              Marquer comme envoyé
            </button>
            <button
              v-if="selectedRegularization.status === 'sent' && parseFloat(selectedRegularization.regularizationAmount) > 0"
              @click="markAsPaid(selectedRegularization.id)"
              class="btn btn-success btn-sm"
            >
              Marquer comme payé
            </button>
            <button
              v-if="selectedRegularization.status === 'sent' && parseFloat(selectedRegularization.regularizationAmount) < 0"
              @click="markAsRefunded(selectedRegularization.id)"
              class="btn btn-success btn-sm"
            >
              Marquer comme remboursé
            </button>
          </div>
          <div class="flex gap-2">
            <button @click="generatePDF(selectedRegularization)" class="btn btn-outline btn-sm">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Générer PDF
            </button>
            <button @click="showDetailsDialog = false" class="btn btn-ghost btn-sm">Fermer</button>
          </div>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import api from '@/services/api'
import Modal from '@/components/ui/Modal.vue'

const toast = useToast()

const regularizations = ref([])
const activeLeases = ref([])
const loading = ref(false)
const calculating = ref(false)
const saving = ref(false)

const showCalculateDialog = ref(false)
const showDetailsDialog = ref(false)
const selectedRegularization = ref(null)
const calculationResult = ref(null)

const filters = reactive({
  year: new Date().getFullYear(),
  status: '',
  leaseId: ''
})

const calculationForm = reactive({
  leaseId: '',
  year: new Date().getFullYear()
})

const years = computed(() => {
  const currentYear = new Date().getFullYear()
  return Array.from({ length: 10 }, (_, i) => currentYear - i)
})

const sentCount = computed(() => {
  return regularizations.value.filter(r => r.status === 'sent').length
})

const draftCount = computed(() => {
  return regularizations.value.filter(r => r.status === 'draft').length
})

const totalRegularization = computed(() => {
  return regularizations.value.reduce((sum, r) => sum + parseFloat(r.regularizationAmount || 0), 0)
})

const formatCurrency = (value) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(value || 0)
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('fr-FR')
}

const getStatusBadge = (status) => {
  const badges = {
    draft: 'badge-warning',
    sent: 'badge-info',
    paid: 'badge-success',
    refunded: 'badge-success'
  }
  return badges[status] || 'badge-ghost'
}

const getStatusLabel = (status) => {
  const labels = {
    draft: 'Brouillon',
    sent: 'Envoyé',
    paid: 'Payé',
    refunded: 'Remboursé'
  }
  return labels[status] || status
}

const loadRegularizations = async () => {
  loading.value = true
  try {
    const params = {}
    if (filters.year) params.year = filters.year
    if (filters.status) params.status = filters.status
    if (filters.leaseId) params.leaseId = filters.leaseId

    const response = await api.get('/api/charge-regularizations', { params })
    regularizations.value = response.data.data || []
  } catch (error) {
    console.error('Error loading regularizations:', error)
    toast.error('Erreur lors du chargement des régularisations')
  } finally {
    loading.value = false
  }
}

const loadActiveLeases = async () => {
  try {
    const response = await api.get('/api/leases', { params: { status: 'actif' } })
    activeLeases.value = response.data.data || []
  } catch (error) {
    console.error('Error loading leases:', error)
  }
}

const calculate = async () => {
  calculating.value = true
  try {
    const response = await api.post('/api/charge-regularizations/calculate', {
      leaseId: calculationForm.leaseId,
      year: calculationForm.year
    })
    calculationResult.value = response.data.data
    toast.success('Calcul effectué avec succès')
  } catch (error) {
    console.error('Error calculating:', error)
    toast.error(error.response?.data?.error?.message || 'Erreur lors du calcul')
  } finally {
    calculating.value = false
  }
}

const saveRegularization = async () => {
  if (!calculationResult.value) return

  saving.value = true
  try {
    await api.post('/api/charge-regularizations', calculationResult.value)
    toast.success('Régularisation enregistrée avec succès')
    closeCalculateDialog()
    loadRegularizations()
  } catch (error) {
    console.error('Error saving:', error)
    toast.error('Erreur lors de l\'enregistrement')
  } finally {
    saving.value = false
  }
}

const viewRegularization = (reg) => {
  selectedRegularization.value = reg
  showDetailsDialog.value = true
}

const deleteRegularization = async (id) => {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cette régularisation ?')) return

  try {
    await api.delete(`/api/charge-regularizations/${id}`)
    toast.success('Régularisation supprimée')
    loadRegularizations()
  } catch (error) {
    console.error('Error deleting:', error)
    toast.error('Erreur lors de la suppression')
  }
}

const markAsSent = async (id) => {
  try {
    await api.put(`/api/charge-regularizations/${id}`, {
      status: 'sent',
      sentDate: new Date().toISOString().split('T')[0]
    })
    toast.success('Régularisation marquée comme envoyée')
    showDetailsDialog.value = false
    loadRegularizations()
  } catch (error) {
    console.error('Error updating:', error)
    toast.error('Erreur lors de la mise à jour')
  }
}

const markAsPaid = async (id) => {
  try {
    await api.put(`/api/charge-regularizations/${id}`, {
      status: 'paid',
      paidDate: new Date().toISOString().split('T')[0]
    })
    toast.success('Régularisation marquée comme payée')
    showDetailsDialog.value = false
    loadRegularizations()
  } catch (error) {
    console.error('Error updating:', error)
    toast.error('Erreur lors de la mise à jour')
  }
}

const markAsRefunded = async (id) => {
  try {
    await api.put(`/api/charge-regularizations/${id}`, {
      status: 'refunded',
      paidDate: new Date().toISOString().split('T')[0]
    })
    toast.success('Régularisation marquée comme remboursée')
    showDetailsDialog.value = false
    loadRegularizations()
  } catch (error) {
    console.error('Error updating:', error)
    toast.error('Erreur lors de la mise à jour')
  }
}

const generatePDF = async (reg) => {
  try {
    const response = await api.get(`/api/charge-regularizations/${reg.id}/pdf`, {
      responseType: 'blob'
    });

    // Create blob link to download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `decompte-charges-${reg.year}-${reg.id.slice(-6)}.pdf`);
    document.body.appendChild(link);
    link.click();

    // Clean up
    link.remove();
    window.URL.revokeObjectURL(url);

    toast.success('PDF généré avec succès');
  } catch (error) {
    console.error('Error generating PDF:', error);
    toast.error('Erreur lors de la génération du PDF');
  }
}

const closeCalculateDialog = () => {
  showCalculateDialog.value = false
  calculationForm.leaseId = ''
  calculationForm.year = new Date().getFullYear()
  calculationResult.value = null
}

onMounted(() => {
  loadRegularizations()
  loadActiveLeases()
})
</script>
