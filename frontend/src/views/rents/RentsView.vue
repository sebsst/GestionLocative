<template>
  <div class="p-8">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold">Gestion des loyers</h1>
        <p class="text-base-content/70 mt-1">Suivi des paiements et génération des loyers</p>
      </div>
      <button
        @click="showGenerateDialog = true"
        class="btn btn-primary gap-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Générer les loyers du mois
      </button>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
      <div class="stats shadow">
        <div class="stat">
          <div class="stat-title">Total loyers</div>
          <div class="stat-value">{{ rents.length }}</div>
        </div>
      </div>

      <div class="stats shadow bg-warning text-warning-content">
        <div class="stat">
          <div class="stat-title text-warning-content/70">En attente</div>
          <div class="stat-value">{{ pendingCount }}</div>
        </div>
      </div>

      <div class="stats shadow bg-error text-error-content">
        <div class="stat">
          <div class="stat-title text-error-content/70">En retard</div>
          <div class="stat-value">{{ lateCount }}</div>
        </div>
      </div>

      <div class="stats shadow bg-success text-success-content">
        <div class="stat">
          <div class="stat-title text-success-content/70">Payés</div>
          <div class="stat-value">{{ paidCount }}</div>
        </div>
      </div>

      <div class="stats shadow">
        <div class="stat">
          <div class="stat-title">Montant perçu</div>
          <div class="stat-value text-xl">{{ formatCurrency(totalPaidAmount) }}</div>
        </div>
      </div>

      <div class="stats shadow">
        <div class="stat">
          <div class="stat-title">Montant attendu</div>
          <div class="stat-value text-xl">{{ formatCurrency(totalExpectedAmount) }}</div>
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
            <select v-model="filters.year" class="select select-bordered w-full" @change="loadRents">
              <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
            </select>
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">Mois</span>
            </label>
            <select v-model="filters.month" class="select select-bordered w-full" @change="loadRents">
              <option value="">Tous les mois</option>
              <option v-for="month in months" :key="month.value" :value="month.value">
                {{ month.label }}
              </option>
            </select>
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">Statut</span>
            </label>
            <select v-model="filters.status" class="select select-bordered w-full" @change="loadRents">
              <option value="">Tous les statuts</option>
              <option v-for="status in statusOptions" :key="status.value" :value="status.value">
                {{ status.label }}
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
    <div v-else-if="rents.length > 0" class="card bg-base-100 shadow-xl overflow-hidden">
      <div class="overflow-x-auto">
        <table class="table table-zebra">
          <thead>
            <tr>
              <th>Locataire</th>
              <th>Bien</th>
              <th>Période</th>
              <th class="text-right">Montant attendu</th>
              <th class="text-right">Montant payé</th>
              <th class="text-center">Statut</th>
              <th class="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="rent in rents" :key="rent.id" class="hover">
              <td>
                <div class="font-medium">
                  {{ rent.Lease?.Tenant?.firstName }} {{ rent.Lease?.Tenant?.lastName }}
                </div>
              </td>
              <td>
                <div class="text-sm">
                  {{ rent.Lease?.Property?.name }}
                </div>
              </td>
              <td>
                <div class="text-sm">
                  {{ getMonthName(rent.month) }} {{ rent.year }}
                </div>
              </td>
              <td class="text-right">
                <div class="text-sm font-medium">
                  {{ formatCurrency(rent.expectedAmount) }}
                </div>
              </td>
              <td class="text-right">
                <div class="text-sm font-medium">
                  {{ formatCurrency(rent.paidAmount) }}
                </div>
              </td>
              <td class="text-center">
                <div
                  :class="getBadgeClass(rent.status)"
                  class="badge badge-sm"
                >
                  {{ getStatusLabel(rent.status) }}
                </div>
              </td>
              <td>
                <div class="flex items-center justify-center gap-2">
                  <button
                    v-if="rent.status !== 'paye'"
                    @click="markAsPaid(rent)"
                    class="btn btn-ghost btn-xs text-success"
                    title="Marquer comme payé"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                  <button
                    @click="sendReminder(rent)"
                    class="btn btn-ghost btn-xs text-info"
                    title="Envoyer un rappel"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </button>
                  <button
                    @click="downloadReminder(rent)"
                    class="btn btn-ghost btn-xs text-secondary"
                    title="Télécharger le rappel"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
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
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 class="text-lg font-semibold mb-2">Aucun loyer trouvé</h3>
        <p class="text-base-content/60">Générez les loyers du mois en cours</p>
      </div>
    </div>

    <!-- Dialog Generate Rents -->
    <Modal
      v-model="showGenerateDialog"
      title="Générer les loyers"
      size="sm"
      :hide-footer="true"
    >
      <div class="space-y-4">
        <div class="form-control">
          <label class="label">
            <span class="label-text">Mois</span>
          </label>
          <select v-model="generateForm.month" class="select select-bordered w-full">
            <option v-for="month in months" :key="month.value" :value="month.value">
              {{ month.label }}
            </option>
          </select>
        </div>
        <div class="form-control">
          <label class="label">
            <span class="label-text">Année</span>
          </label>
          <select v-model="generateForm.year" class="select select-bordered w-full">
            <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
          </select>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <button @click="showGenerateDialog = false" class="btn">Annuler</button>
          <button @click="generateRents" :disabled="generating" class="btn btn-primary">
            {{ generating ? 'Génération...' : 'Générer' }}
          </button>
        </div>
      </template>
    </Modal>

    <!-- Dialog Payment -->
    <Modal
      v-model="showPaymentDialog"
      title="Enregistrer un paiement"
      size="sm"
      :hide-footer="true"
    >
      <div class="space-y-4">
        <div class="form-control">
          <label class="label">
            <span class="label-text">Montant payé (€)</span>
          </label>
          <input
            v-model.number="paymentForm.paidAmount"
            type="number"
            min="0"
            step="0.01"
            placeholder="800.00"
            class="input input-bordered w-full"
          />
        </div>
        <div class="form-control">
          <label class="label">
            <span class="label-text">Date de paiement</span>
          </label>
          <input
            v-model="paymentForm.paymentDate"
            type="date"
            class="input input-bordered w-full"
          />
        </div>
        <div class="form-control">
          <label class="label">
            <span class="label-text">Moyen de paiement</span>
          </label>
          <select v-model="paymentForm.paymentMethod" class="select select-bordered w-full">
            <option v-for="method in paymentMethods" :key="method.value" :value="method.value">
              {{ method.label }}
            </option>
          </select>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <button @click="showPaymentDialog = false" class="btn">Annuler</button>
          <button @click="savePayment" :disabled="saving" class="btn btn-primary">
            {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
          </button>
        </div>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import api from '@/services/api'
import Modal from '@/components/ui/Modal.vue'

const rents = ref([])
const loading = ref(false)
const showGenerateDialog = ref(false)
const showPaymentDialog = ref(false)
const generating = ref(false)
const saving = ref(false)
const selectedRent = ref(null)

const filters = reactive({
  year: new Date().getFullYear(),
  month: null,
  status: null
})

const generateForm = reactive({
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear()
})

const paymentForm = reactive({
  paidAmount: 0,
  paymentDate: new Date().toISOString().split('T')[0],
  paymentMethod: 'virement'
})

const years = computed(() => {
  const currentYear = new Date().getFullYear()
  return Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)
})

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

const statusOptions = [
  { label: 'En attente', value: 'en_attente' },
  { label: 'Payé', value: 'paye' },
  { label: 'Partiel', value: 'partiel' },
  { label: 'En retard', value: 'en_retard' }
]

const paymentMethods = [
  { label: 'Virement', value: 'virement' },
  { label: 'Chèque', value: 'cheque' },
  { label: 'Espèces', value: 'especes' },
  { label: 'Prélèvement', value: 'prelevement' }
]

// Computed stats
const pendingCount = computed(() => {
  return rents.value.filter(r => r.status === 'en_attente').length
})

const lateCount = computed(() => {
  return rents.value.filter(r => r.status === 'en_retard').length
})

const paidCount = computed(() => {
  return rents.value.filter(r => r.status === 'paye').length
})

const totalPaidAmount = computed(() => {
  return rents.value.reduce((sum, r) => sum + (parseFloat(r.paidAmount) || 0), 0)
})

const totalExpectedAmount = computed(() => {
  return rents.value.reduce((sum, r) => sum + (parseFloat(r.expectedAmount) || 0), 0)
})

const loadRents = async () => {
  loading.value = true
  try {
    const params = {}
    if (filters.year) params.year = filters.year
    if (filters.month) params.month = filters.month
    if (filters.status) params.status = filters.status

    const response = await api.get('/api/rents', { params })
    rents.value = response.data.data || []
  } catch (error) {
    alert('Erreur: Impossible de charger les loyers')
    console.error('Error loading rents:', error)
  } finally {
    loading.value = false
  }
}

const generateRents = async () => {
  generating.value = true
  try {
    await api.post('/api/rents/generate', generateForm)
    alert('Succès: Loyers générés avec succès')
    showGenerateDialog.value = false
    loadRents()
  } catch (error) {
    alert(`Erreur: ${error.response?.data?.error?.message || 'Impossible de générer les loyers'}`)
    console.error('Error generating rents:', error)
  } finally {
    generating.value = false
  }
}

const markAsPaid = (rent) => {
  selectedRent.value = rent
  paymentForm.paidAmount = rent.expectedAmount
  paymentForm.paymentDate = new Date().toISOString().split('T')[0]
  showPaymentDialog.value = true
}

const savePayment = async () => {
  saving.value = true
  try {
    await api.put(`/api/rents/${selectedRent.value.id}/pay`, paymentForm)
    alert('Succès: Paiement enregistré avec succès')
    showPaymentDialog.value = false
    loadRents()
  } catch (error) {
    alert('Erreur: Impossible d\'enregistrer le paiement')
    console.error('Error saving payment:', error)
  } finally {
    saving.value = false
  }
}

const sendReminder = async (rent) => {
  try {
    await api.post(`/api/documents/rent-reminder/${rent.id}/send`)
    alert('Succès: Rappel envoyé avec succès')
  } catch (error) {
    alert('Erreur: Impossible d\'envoyer le rappel')
    console.error('Error sending reminder:', error)
  }
}

const downloadReminder = async (rent) => {
  try {
    const response = await api.get(`/api/documents/rent-reminder/${rent.id}`, {
      responseType: 'blob'
    })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `rappel-loyer-${rent.month}-${rent.year}.pdf`)
    document.body.appendChild(link)
    link.click()
    link.remove()
  } catch (error) {
    alert('Erreur: Impossible de télécharger le rappel')
    console.error('Error downloading reminder:', error)
  }
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

const getMonthName = (month) => {
  return months.find(m => m.value === month)?.label || month
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(value || 0)
}

onMounted(() => {
  loadRents()
})
</script>
