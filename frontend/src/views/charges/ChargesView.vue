<template>
  <div class="p-8">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold">Charges</h1>
        <p class="text-base-content/70 mt-1">Gestion des charges locatives et répartition</p>
      </div>
      <button @click="showDialog = true" class="btn btn-primary gap-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Nouvelle charge
      </button>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div class="stats shadow">
        <div class="stat">
          <div class="stat-title">Total charges</div>
          <div class="stat-value text-2xl">{{ charges.length }}</div>
        </div>
      </div>

      <div class="stats shadow bg-info text-info-content">
        <div class="stat">
          <div class="stat-title text-info-content/70">Montant total</div>
          <div class="stat-value text-2xl">{{ formatCurrency(totalAmount) }}</div>
        </div>
      </div>

      <div class="stats shadow bg-success text-success-content">
        <div class="stat">
          <div class="stat-title text-success-content/70">Ce mois</div>
          <div class="stat-value text-2xl">{{ formatCurrency(currentMonthAmount) }}</div>
        </div>
      </div>
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
              placeholder="Rechercher une charge..."
              class="input input-bordered w-full"
              @input="loadCharges"
            />
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">Type</span>
            </label>
            <select v-model="filters.type" class="select select-bordered w-full" @change="loadCharges">
              <option value="">Tous les types</option>
              <option value="eau">Eau</option>
              <option value="electricite">Électricité</option>
              <option value="gaz">Gaz</option>
              <option value="taxe_ordures">Taxe ordures ménagères</option>
              <option value="entretien">Entretien</option>
              <option value="assurance">Assurance</option>
              <option value="taxe_fonciere">Taxe foncière</option>
              <option value="taxe">Taxe (autre)</option>
              <option value="autre">Autre</option>
            </select>
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">Bien</span>
            </label>
            <select v-model="filters.property" class="select select-bordered w-full" @change="loadCharges">
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
    <div v-else-if="charges.length > 0" class="card bg-base-100 shadow-xl overflow-hidden">
      <div class="overflow-x-auto">
        <table class="table table-zebra">
          <thead class="bg-base-200">
            <tr class="border-b-2 border-base-300">
              <th class="border-r border-base-300">Type</th>
              <th class="border-r border-base-300">Description</th>
              <th class="border-r border-base-300">Bien</th>
              <th class="border-r border-base-300">Date</th>
              <th class="text-right border-r border-base-300">Montant</th>
              <th class="text-center border-r border-base-300">Répartition</th>
              <th class="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="charge in charges" :key="charge.id" class="hover">
              <td>
                <div class="badge" :class="getTypeBadgeClass(charge.type)">{{ formatType(charge.type) }}</div>
              </td>
              <td>{{ charge.name }}</td>
              <td>{{ charge.Property?.name || 'N/A' }}</td>
              <td>{{ formatDate(charge.date) }}</td>
              <td class="text-right font-semibold">{{ formatCurrency(charge.amount) }}</td>
              <td class="text-center">
                <div v-if="charge.distributions && charge.distributions.length > 0" class="badge badge-success gap-1">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  {{ charge.distributions.length }} bail(x)
                </div>
                <div v-else class="badge badge-ghost">Non réparti</div>
              </td>
              <td>
                <div class="flex items-center justify-center gap-2">
                  <button @click="openDistribution(charge)" class="btn btn-ghost btn-xs text-primary" title="Gérer la répartition">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
                    </svg>
                  </button>
                  <button @click="editCharge(charge)" class="btn btn-ghost btn-xs" title="Modifier">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button @click="deleteCharge(charge)" class="btn btn-ghost btn-xs text-error" title="Supprimer">
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
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        <h3 class="text-lg font-semibold mb-2">Aucune charge trouvée</h3>
        <p class="text-base-content/60">{{ filters.search ? 'Essayez de modifier les filtres' : 'Ajoutez votre première charge' }}</p>
      </div>
    </div>

    <!-- Modal Create/Edit Charge -->
    <Modal
      v-model="showDialog"
      :title="editingCharge ? 'Modifier la charge' : 'Nouvelle charge'"
      size="lg"
      :hide-footer="true"
    >
      <div class="space-y-4">
        <div class="form-control">
          <label class="label">
            <span class="label-text">Type *</span>
          </label>
          <select v-model="chargeForm.type" class="select select-bordered w-full" required @change="updateNameFromType">
            <option value="">Sélectionnez un type</option>
            <option value="eau">Eau</option>
            <option value="electricite">Électricité</option>
            <option value="gaz">Gaz</option>
            <option value="taxe_ordures">Taxe ordures ménagères</option>
            <option value="entretien">Entretien</option>
            <option value="assurance">Assurance</option>
            <option value="taxe_fonciere">Taxe foncière</option>
            <option value="taxe">Taxe (autre)</option>
            <option value="autre">Autre</option>
          </select>
        </div>

        <div class="form-control">
          <label class="label">
            <span class="label-text">Nom de la charge *</span>
          </label>
          <input
            v-model="chargeForm.name"
            type="text"
            placeholder="Ex: Eau, Électricité, Taxe foncière..."
            class="input input-bordered w-full"
            required
          />
        </div>

        <div class="form-control">
          <label class="label">
            <span class="label-text">Bien</span>
          </label>
          <select v-model="chargeForm.propertyId" class="select select-bordered w-full">
            <option value="">Aucun bien spécifique</option>
            <option v-for="property in properties" :key="property.id" :value="property.id">
              {{ property.name }}
            </option>
          </select>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text">Date *</span>
            </label>
            <input
              v-model="chargeForm.date"
              type="date"
              class="input input-bordered w-full"
              required
            />
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">Montant (€) *</span>
            </label>
            <input
              v-model.number="chargeForm.amount"
              type="number"
              min="0"
              step="0.01"
              placeholder="100.00"
              class="input input-bordered w-full"
              required
            />
          </div>
        </div>

        <div class="form-control">
          <label class="label">
            <span class="label-text">Fréquence *</span>
          </label>
          <select v-model="chargeForm.frequency" class="select select-bordered w-full" required>
            <option value="">Sélectionnez une fréquence</option>
            <option value="mensuel">Mensuelle</option>
            <option value="trimestriel">Trimestrielle</option>
            <option value="annuel">Annuelle</option>
            <option value="ponctuel">Ponctuelle</option>
          </select>
        </div>

        <div class="form-control">
          <label class="label">
            <span class="label-text">Notes</span>
          </label>
          <textarea
            v-model="chargeForm.notes"
            rows="3"
            placeholder="Notes supplémentaires..."
            class="textarea textarea-bordered w-full"
          ></textarea>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <button @click="closeDialog" class="btn btn-ghost">Annuler</button>
          <button @click="saveCharge" :disabled="saving" class="btn btn-primary">
            <span v-if="saving" class="loading loading-spinner loading-sm"></span>
            {{ saving ? 'Enregistrement...' : (editingCharge ? 'Modifier' : 'Créer') }}
          </button>
        </div>
      </template>
    </Modal>

    <!-- Modal Distribution -->
    <Modal
      v-model="showDistributionDialog"
      title="Répartir la charge"
      size="xl"
      :hide-footer="true"
    >
      <div v-if="selectedCharge" class="space-y-6">
        <!-- Info charge -->
        <div class="alert alert-info">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p class="font-semibold">{{ selectedCharge.name }}</p>
            <p class="text-sm">Montant total : {{ formatCurrency(selectedCharge.amount) }} - Date : {{ formatDate(selectedCharge.date) }}</p>
          </div>
        </div>

        <!-- Méthode de répartition -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-semibold">Méthode de répartition</span>
          </label>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
            <button
              @click="distributionForm.method = 'aucune'"
              :class="['btn', distributionForm.method === 'aucune' ? 'btn-primary' : 'btn-outline']"
            >
              Aucune
            </button>
            <button
              @click="distributionForm.method = 'par_occupant'"
              :class="['btn', distributionForm.method === 'par_occupant' ? 'btn-primary' : 'btn-outline']"
            >
              Par occupant
            </button>
            <button
              @click="distributionForm.method = 'par_appartement'"
              :class="['btn', distributionForm.method === 'par_appartement' ? 'btn-primary' : 'btn-outline']"
            >
              Par appartement
            </button>
            <button
              @click="distributionForm.method = 'par_jours'"
              :class="['btn', distributionForm.method === 'par_jours' ? 'btn-primary' : 'btn-outline']"
            >
              Par jours
            </button>
          </div>
        </div>

        <!-- Description de la méthode -->
        <div class="alert" :class="distributionForm.method === 'aucune' ? 'alert-warning' : 'alert-success'">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="text-sm">{{ getMethodDescription(distributionForm.method) }}</span>
        </div>

        <!-- Aperçu de la répartition -->
        <div v-if="distributionForm.method !== 'aucune' && activeLeases.length > 0">
          <h4 class="font-semibold mb-3">Aperçu de la répartition par période</h4>

          <div class="space-y-4">
            <div v-for="(lease, index) in activeLeases" :key="lease.id" class="card bg-base-200">
              <div class="card-body p-4">
                <div class="flex justify-between items-center mb-2">
                  <div class="flex items-center gap-2">
                    <h5 class="font-semibold">{{ lease.Tenant?.firstName }} {{ lease.Tenant?.lastName }} - {{ lease.Property?.name }}</h5>
                    <div v-if="lease.occupancyPeriods && lease.occupancyPeriods.length > 0" class="badge badge-info badge-sm" title="Calculé depuis les périodes d'occupation">
                      <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Auto
                    </div>
                  </div>
                  <button @click="removeLease(index)" class="btn btn-ghost btn-xs text-error">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div v-if="distributionForm.method === 'par_occupant'" class="form-control">
                    <label class="label label-text-alt">Nombre d'occupants</label>
                    <input
                      v-model.number="lease.customOccupants"
                      type="number"
                      min="1"
                      :placeholder="lease.numberOfOccupants || '1'"
                      class="input input-sm input-bordered"
                      @input="recalculateDistributions"
                    />
                  </div>

                  <div v-if="distributionForm.method === 'par_jours'" class="form-control">
                    <label class="label label-text-alt">Jours d'occupation</label>
                    <input
                      v-model.number="lease.customDays"
                      type="number"
                      min="1"
                      :max="daysInChargeMonth"
                      :placeholder="daysInChargeMonth.toString()"
                      class="input input-sm input-bordered"
                      @input="recalculateDistributions"
                    />
                  </div>

                  <div class="form-control">
                    <label class="label label-text-alt">Montant alloué</label>
                    <div class="badge badge-lg badge-success">{{ formatCurrency(getLeaseAmount(lease)) }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Total -->
          <div class="divider"></div>
          <div class="flex justify-between items-center bg-base-200 p-4 rounded-lg">
            <span class="font-bold">Total distribué</span>
            <span class="text-xl font-bold" :class="totalDistributed === parseFloat(selectedCharge.amount) ? 'text-success' : 'text-warning'">
              {{ formatCurrency(totalDistributed) }}
            </span>
          </div>
          <div v-if="Math.abs(totalDistributed - parseFloat(selectedCharge.amount)) > 0.01" class="alert alert-warning">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>Différence de {{ formatCurrency(Math.abs(totalDistributed - parseFloat(selectedCharge.amount))) }} entre le total distribué et le montant de la charge</span>
          </div>
        </div>

        <div v-else-if="distributionForm.method !== 'aucune'" class="alert alert-warning">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>Aucun bail actif trouvé</span>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <button @click="showDistributionDialog = false" class="btn btn-ghost">Annuler</button>
          <button @click="saveDistribution" :disabled="saving" class="btn btn-primary">
            <span v-if="saving" class="loading loading-spinner loading-sm"></span>
            {{ saving ? 'Enregistrement...' : 'Enregistrer la répartition' }}
          </button>
        </div>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import api from '@/services/api'
import Modal from '@/components/ui/Modal.vue'

const toast = useToast()
const charges = ref([])
const properties = ref([])
const activeLeases = ref([])
const loading = ref(false)
const showDialog = ref(false)
const showDistributionDialog = ref(false)
const saving = ref(false)
const editingCharge = ref(null)
const selectedCharge = ref(null)

const filters = reactive({
  search: '',
  type: '',
  property: ''
})

const chargeForm = reactive({
  type: '',
  name: '',
  propertyId: '',
  date: new Date().toISOString().split('T')[0],
  amount: null,
  frequency: '',
  notes: ''
})

const distributionForm = reactive({
  method: 'aucune'
})

const daysInChargeMonth = computed(() => {
  if (!selectedCharge.value) return 30
  const chargeDate = new Date(selectedCharge.value.date)
  return new Date(chargeDate.getFullYear(), chargeDate.getMonth() + 1, 0).getDate()
})

const totalAmount = computed(() => {
  return charges.value.reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0)
})

const currentMonthAmount = computed(() => {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  return charges.value
    .filter(c => {
      const chargeDate = new Date(c.date)
      return chargeDate.getMonth() === currentMonth && chargeDate.getFullYear() === currentYear
    })
    .reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0)
})

const totalDistributed = computed(() => {
  return activeLeases.value.reduce((sum, lease) => sum + getLeaseAmount(lease), 0)
})

const getLeaseAmount = (lease) => {
  if (!selectedCharge.value || distributionForm.method === 'aucune') return 0

  const chargeAmount = parseFloat(selectedCharge.value.amount)

  switch (distributionForm.method) {
    case 'par_occupant': {
      const totalOccupants = activeLeases.value.reduce((sum, l) =>
        sum + (l.customOccupants || l.numberOfOccupants || 1), 0
      )
      const occupants = lease.customOccupants || lease.numberOfOccupants || 1
      return totalOccupants > 0 ? (chargeAmount * occupants) / totalOccupants : 0
    }

    case 'par_appartement': {
      return chargeAmount / activeLeases.value.length
    }

    case 'par_jours': {
      const totalDays = activeLeases.value.reduce((sum, l) =>
        sum + (l.customDays || daysInChargeMonth.value), 0
      )
      const days = lease.customDays || daysInChargeMonth.value
      return totalDays > 0 ? (chargeAmount * days) / totalDays : 0
    }

    default:
      return 0
  }
}

const loadCharges = async () => {
  loading.value = true
  try {
    const params = {}
    if (filters.search) params.search = filters.search
    if (filters.type) params.type = filters.type
    if (filters.property) params.property = filters.property

    const response = await api.get('/api/charges', { params })
    charges.value = response.data.data || []
  } catch (error) {
    toast.error('Impossible de charger les charges')
    console.error('Error loading charges:', error)
  } finally {
    loading.value = false
  }
}

const loadProperties = async () => {
  try {
    const response = await api.get('/api/properties')
    properties.value = response.data.data || []
  } catch (error) {
    console.error('Error loading properties:', error)
  }
}

const loadActiveLeases = async () => {
  try {
    const response = await api.get('/api/leases', { params: { status: 'actif' } })
    activeLeases.value = (response.data.data || []).map(lease => ({
      ...lease,
      customOccupants: null,
      customDays: null,
      occupancyPeriods: []
    }))

    // Load occupancy periods for each lease
    await loadOccupancyPeriods()
  } catch (error) {
    console.error('Error loading leases:', error)
  }
}

const loadOccupancyPeriods = async () => {
  try {
    for (const lease of activeLeases.value) {
      const response = await api.get(`/api/lease-occupancy-periods/lease/${lease.id}`)
      lease.occupancyPeriods = response.data.data || []
    }

    // Calculate initial values based on occupancy periods
    calculateOccupancyValues()
  } catch (error) {
    console.error('Error loading occupancy periods:', error)
  }
}

const calculateOccupancyValues = () => {
  if (!selectedCharge.value) return

  const chargeDate = new Date(selectedCharge.value.date)
  const chargeYear = chargeDate.getFullYear()
  const chargeMonth = chargeDate.getMonth()
  const firstDay = new Date(chargeYear, chargeMonth, 1)
  const lastDay = new Date(chargeYear, chargeMonth + 1, 0)

  for (const lease of activeLeases.value) {
    if (!lease.occupancyPeriods || lease.occupancyPeriods.length === 0) {
      // No periods defined, use default values
      lease.customOccupants = lease.numberOfOccupants || 1
      lease.customDays = daysInChargeMonth.value
      continue
    }

    // Calculate days and weighted occupants for periods overlapping with charge month
    let totalDays = 0
    let weightedOccupants = 0

    for (const period of lease.occupancyPeriods) {
      const periodStart = new Date(period.startDate)
      const periodEnd = period.endDate ? new Date(period.endDate) : lastDay

      // Check if period overlaps with charge month
      const overlapStart = periodStart > firstDay ? periodStart : firstDay
      const overlapEnd = periodEnd < lastDay ? periodEnd : lastDay

      if (overlapStart <= overlapEnd) {
        // Calculate number of days in overlap
        const days = Math.floor((overlapEnd - overlapStart) / (1000 * 60 * 60 * 24)) + 1
        totalDays += days
        weightedOccupants += days * period.numberOfOccupants
      }
    }

    // Set calculated values
    lease.customDays = totalDays > 0 ? totalDays : null
    lease.customOccupants = totalDays > 0 ? Math.round(weightedOccupants / totalDays) : (lease.numberOfOccupants || 1)
  }
}

const resetForm = () => {
  Object.assign(chargeForm, {
    type: '',
    name: '',
    propertyId: '',
    date: new Date().toISOString().split('T')[0],
    amount: null,
    frequency: '',
    notes: ''
  })
}

const updateNameFromType = () => {
  if (!chargeForm.type) return

  const typeNames = {
    eau: 'Eau',
    electricite: 'Électricité',
    gaz: 'Gaz',
    taxe_ordures: 'Taxe ordures ménagères',
    entretien: 'Entretien',
    assurance: 'Assurance',
    taxe_fonciere: 'Taxe foncière',
    jardin: 'Entretien jardin',
    chauffage: 'Chauffage',
    copropriete: 'Copropriété',
    taxe: 'Taxe',
    autre: 'Autre charge'
  }

  const year = new Date(chargeForm.date).getFullYear()
  const typeName = typeNames[chargeForm.type] || 'Charge'
  chargeForm.name = `${typeName} ${year}`
}

const closeDialog = () => {
  showDialog.value = false
  editingCharge.value = null
  resetForm()
}

const saveCharge = async () => {
  if (!chargeForm.type || !chargeForm.name || !chargeForm.date || !chargeForm.amount || !chargeForm.frequency) {
    toast.warning('Veuillez remplir tous les champs obligatoires')
    return
  }

  saving.value = true
  try {
    const data = {
      ...chargeForm,
      propertyId: chargeForm.propertyId || null
    }

    if (editingCharge.value) {
      await api.put(`/api/charges/${editingCharge.value.id}`, data)
      toast.success('Charge modifiée avec succès')
    } else {
      await api.post('/api/charges', data)
      toast.success('Charge créée avec succès')
    }
    closeDialog()
    loadCharges()
  } catch (error) {
    toast.error(error.response?.data?.error?.message || 'Impossible de sauvegarder la charge')
    console.error('Error saving charge:', error)
  } finally {
    saving.value = false
  }
}

const editCharge = (charge) => {
  editingCharge.value = charge
  Object.assign(chargeForm, {
    type: charge.type,
    name: charge.name,
    propertyId: charge.propertyId || '',
    date: charge.date ? charge.date.split('T')[0] : new Date().toISOString().split('T')[0],
    amount: charge.amount,
    frequency: charge.frequency || '',
    notes: charge.notes || ''
  })
  showDialog.value = true
}

const deleteCharge = async (charge) => {
  if (!confirm(`Voulez-vous vraiment supprimer cette charge : ${charge.name} ?`)) {
    return
  }

  try {
    await api.delete(`/api/charges/${charge.id}`)
    toast.success('Charge supprimée avec succès')
    loadCharges()
  } catch (error) {
    toast.error('Impossible de supprimer la charge')
    console.error('Error deleting charge:', error)
  }
}

const openDistribution = async (charge) => {
  selectedCharge.value = charge

  // Load distribution method from charge
  if (charge.distributionMethod) {
    // Convert from charge.distributionMethod to distributionForm.method
    const methodMap = {
      'occupants': 'par_occupant',
      'appartement': 'par_appartement',
      'surface': 'par_appartement', // surface uses same as appartement
      'personnalise': 'par_jours'
    }
    distributionForm.method = methodMap[charge.distributionMethod] || 'aucune'
  } else {
    distributionForm.method = 'aucune'
  }

  await loadActiveLeases()
  showDistributionDialog.value = true
}

const removeLease = (index) => {
  activeLeases.value.splice(index, 1)
}

const recalculateDistributions = () => {
  // Force reactivity update
  activeLeases.value = [...activeLeases.value]
}

const saveDistribution = async () => {
  if (distributionForm.method === 'aucune') {
    // Delete all distributions
    try {
      await api.delete(`/api/charges/${selectedCharge.value.id}/distributions`)
      toast.success('Répartition supprimée')
      showDistributionDialog.value = false
      loadCharges()
    } catch (error) {
      toast.error('Impossible de supprimer la répartition')
    }
    return
  }

  if (activeLeases.value.length === 0) {
    toast.warning('Aucune distribution à enregistrer')
    return
  }

  // Verify total matches
  const diff = Math.abs(totalDistributed.value - parseFloat(selectedCharge.value.amount))
  if (diff > 0.01) {
    const confirm = window.confirm(
      `Le total distribué (${formatCurrency(totalDistributed.value)}) ne correspond pas exactement au montant de la charge (${formatCurrency(selectedCharge.value.amount)}).\n\nVoulez-vous continuer ?`
    )
    if (!confirm) return
  }

  saving.value = true
  try {
    const distributions = activeLeases.value.map(lease => ({
      leaseId: lease.id,
      amount: getLeaseAmount(lease),
      occupantsCount: distributionForm.method === 'par_occupant'
        ? (lease.customOccupants || lease.numberOfOccupants || 1)
        : null,
      daysOccupied: distributionForm.method === 'par_jours'
        ? (lease.customDays || daysInChargeMonth.value)
        : null
    }))

    await api.post(`/api/charges/${selectedCharge.value.id}/distributions`, {
      method: distributionForm.method,
      distributions
    })

    toast.success('Répartition enregistrée avec succès')
    showDistributionDialog.value = false
    loadCharges()
  } catch (error) {
    toast.error('Impossible d\'enregistrer la répartition')
    console.error('Error saving distribution:', error)
  } finally {
    saving.value = false
  }
}

const getMethodDescription = (method) => {
  const descriptions = {
    'aucune': 'Aucune répartition - La charge ne sera pas distribuée aux locataires',
    'par_occupant': 'Répartition proportionnelle au nombre d\'occupants de chaque bail. Vous pouvez ajuster le nombre d\'occupants par bail.',
    'par_appartement': 'Répartition égale entre tous les appartements/baux actifs',
    'par_jours': 'Répartition selon le nombre de jours d\'occupation. Par défaut, le nombre de jours dans le mois de la charge.'
  }
  return descriptions[method] || ''
}

const formatType = (type) => {
  const types = {
    eau: 'Eau',
    electricite: 'Électricité',
    gaz: 'Gaz',
    taxe_ordures: 'Taxe ordures ménagères',
    entretien: 'Entretien',
    assurance: 'Assurance',
    taxe_fonciere: 'Taxe foncière',
    jardin: 'Entretien jardin',
    chauffage: 'Chauffage',
    copropriete: 'Copropriété',
    taxe: 'Taxe',
    autre: 'Autre'
  }
  return types[type] || type
}

const getTypeBadgeClass = (type) => {
  const classes = {
    eau: 'badge-info',
    electricite: 'badge-warning',
    gaz: 'badge-error',
    taxe_ordures: 'badge-secondary',
    entretien: 'badge-success',
    assurance: 'badge-primary',
    taxe_fonciere: 'badge-secondary',
    jardin: 'badge-success',
    chauffage: 'badge-warning',
    copropriete: 'badge-info',
    taxe: 'badge-accent',
    autre: 'badge-ghost'
  }
  return classes[type] || 'badge-ghost'
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

onMounted(() => {
  loadCharges()
  loadProperties()
  loadActiveLeases()
})
</script>
