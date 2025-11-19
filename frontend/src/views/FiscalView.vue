<template>
  <div class="p-8">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold">Déclaration Fiscale</h1>
        <p class="text-base-content/70 mt-1">Gestion de vos déclarations fiscales annuelles</p>
      </div>
      <div class="flex gap-2">
        <select v-model="selectedYear" class="select select-bordered" @change="loadDeclaration">
          <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
        </select>
        <button @click="createNewDeclaration" class="btn btn-success gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Nouvelle déclaration
        </button>
        <button @click="generateReport" class="btn btn-primary gap-2" :disabled="!declaration">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Générer le rapport
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center items-center h-64">
      <span class="loading loading-spinner loading-lg text-primary"></span>
    </div>

    <div v-else-if="declaration">
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div class="stats shadow bg-success text-success-content">
          <div class="stat">
            <div class="stat-title text-success-content/70">Revenus locatifs</div>
            <div class="stat-value text-2xl">{{ formatCurrency(parseFloat(declaration.revenuBrut)) }}</div>
          </div>
        </div>

        <div class="stats shadow bg-error text-error-content">
          <div class="stat">
            <div class="stat-title text-error-content/70">Charges déductibles</div>
            <div class="stat-value text-2xl">{{ formatCurrency(totalCharges) }}</div>
          </div>
        </div>

        <div class="stats shadow" :class="declaration.status === 'declaree' ? 'bg-info text-info-content' : 'bg-warning text-warning-content'">
          <div class="stat">
            <div class="stat-title" :class="declaration.status === 'declaree' ? 'text-info-content/70' : 'text-warning-content/70'">Statut</div>
            <div class="stat-value text-lg">{{ getStatusLabel(declaration.status) }}</div>
          </div>
        </div>

        <div class="stats shadow bg-primary text-primary-content">
          <div class="stat">
            <div class="stat-title text-primary-content/70">Résultat net</div>
            <div class="stat-value text-2xl">{{ formatCurrency(netResult) }}</div>
          </div>
        </div>
      </div>

      <!-- Régime fiscal -->
      <div class="card bg-base-100 shadow-xl mb-6">
        <div class="card-body">
          <h2 class="card-title mb-4">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Régime fiscal
          </h2>
          <div class="btn-group w-full">
            <button
              @click="declaration.regime = 'reel'; saveDeclaration()"
              :class="['btn flex-1', declaration.regime === 'reel' ? 'btn-primary' : 'btn-outline']"
            >
              <div class="text-left">
                <div class="font-semibold">Régime réel</div>
                <div class="text-xs opacity-70">Déduction des charges réelles</div>
              </div>
            </button>
            <button
              @click="declaration.regime = 'micro'; saveDeclaration()"
              :class="['btn flex-1', declaration.regime === 'micro' ? 'btn-primary' : 'btn-outline']"
            >
              <div class="text-left">
                <div class="font-semibold">Micro-foncier</div>
                <div class="text-xs opacity-70">Abattement 30% (revenus &lt; 15 000 €)</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Revenus -->
        <div class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <h2 class="card-title mb-4 text-success">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Revenus locatifs
            </h2>
            <div class="alert alert-info mb-4">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div class="text-sm">
                <p class="font-semibold">Revenus calculés depuis les loyers</p>
                <p>Total des loyers encaissés : {{ formatCurrency(calculatedRentalIncome) }}</p>
              </div>
            </div>
            <div class="form-control">
              <label class="label">
                <span class="label-text font-semibold">Revenus bruts perçus (Case 211)</span>
              </label>
              <div class="join w-full">
                <input
                  v-model.number="declaration.revenuBrut"
                  type="number"
                  step="0.01"
                  class="input input-bordered join-item flex-1"
                  @change="saveDeclaration"
                />
                <button
                  @click="useCalculatedIncome"
                  class="btn btn-primary join-item"
                  title="Utiliser les revenus calculés"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
            </div>
            <div v-if="declaration.regime === 'micro'" class="alert alert-info mt-4">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p class="font-semibold">Abattement 30%</p>
                <p class="text-sm">Revenu imposable : {{ formatCurrency(parseFloat(declaration.revenuBrut) * 0.7) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Charges déductibles (Régime réel) -->
        <div v-if="declaration.regime === 'reel'" class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <h2 class="card-title mb-4 text-error">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Charges déductibles
            </h2>
            <div class="space-y-4">
              <div class="form-control">
                <label class="label">
                  <span class="label-text">Case 221 - Frais d'administration et de gestion</span>
                </label>
                <input
                  v-model.number="declaration.fraisGestion"
                  type="number"
                  step="0.01"
                  class="input input-bordered input-sm"
                  @change="saveDeclaration"
                />
              </div>

              <div class="form-control">
                <label class="label">
                  <span class="label-text">Case 223 - Primes d'assurance</span>
                </label>
                <input
                  v-model.number="declaration.primesAssurance"
                  type="number"
                  step="0.01"
                  class="input input-bordered input-sm"
                  @change="saveDeclaration"
                />
              </div>

              <div class="form-control">
                <label class="label">
                  <span class="label-text">Case 224 - Dépenses de réparation et d'entretien</span>
                </label>
                <input
                  v-model.number="declaration.depensesReparation"
                  type="number"
                  step="0.01"
                  class="input input-bordered input-sm"
                  @change="saveDeclaration"
                />
              </div>

              <div class="form-control">
                <label class="label">
                  <span class="label-text">Case 227 - Charges récupérables non récupérées</span>
                </label>
                <input
                  v-model.number="declaration.chargesNonRecuperees"
                  type="number"
                  step="0.01"
                  class="input input-bordered input-sm"
                  @change="saveDeclaration"
                />
              </div>

              <div class="form-control">
                <label class="label">
                  <span class="label-text">Case 229 - Taxe foncière</span>
                </label>
                <input
                  v-model.number="declaration.taxeFonciere"
                  type="number"
                  step="0.01"
                  class="input input-bordered input-sm"
                  @change="saveDeclaration"
                />
              </div>

              <div class="form-control">
                <label class="label">
                  <span class="label-text">Case 230 - Autres charges</span>
                </label>
                <input
                  v-model.number="declaration.autresCharges"
                  type="number"
                  step="0.01"
                  class="input input-bordered input-sm"
                  @change="saveDeclaration"
                />
              </div>

              <div class="form-control">
                <label class="label">
                  <span class="label-text">Case 250 - Intérêts d'emprunt</span>
                </label>
                <input
                  v-model.number="declaration.interetsEmprunt"
                  type="number"
                  step="0.01"
                  class="input input-bordered input-sm"
                  @change="saveDeclaration"
                />
              </div>

              <div class="divider"></div>

              <div class="flex justify-between items-center font-bold text-lg">
                <span>Total des charges</span>
                <span class="text-error">{{ formatCurrency(totalCharges) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Info micro-foncier -->
        <div v-else class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <h2 class="card-title mb-4">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Information
            </h2>
            <div class="alert alert-info">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <div>
                <p class="font-semibold">Régime micro-foncier</p>
                <p class="text-sm">Les charges ne sont pas déductibles individuellement. Un abattement forfaitaire de 30% est appliqué automatiquement.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Résultat et Notes -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <!-- Résultat -->
        <div class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <h2 class="card-title mb-4">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Résultat fiscal
            </h2>
            <div class="bg-gradient-to-r from-primary to-info p-6 rounded-lg text-white">
              <div class="text-sm opacity-90 mb-2">
                {{ declaration.regime === 'reel' ? 'Case 261 - Résultat foncier' : 'Revenu imposable' }}
              </div>
              <div class="text-4xl font-bold">{{ formatCurrency(netResult) }}</div>
              <div class="mt-4 text-sm opacity-90">
                {{ netResult >= 0 ? 'Bénéfice foncier à reporter sur votre déclaration' : 'Déficit foncier déductible' }}
              </div>
            </div>
          </div>
        </div>

        <!-- Notes -->
        <div class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <h2 class="card-title mb-4">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              Notes
            </h2>
            <textarea
              v-model="declaration.notes"
              rows="6"
              class="textarea textarea-bordered w-full"
              placeholder="Notes et observations pour cette déclaration..."
              @change="saveDeclaration"
            ></textarea>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="card bg-base-100 shadow-xl mt-6">
        <div class="card-body">
          <h2 class="card-title mb-4">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Statut de la déclaration
          </h2>
          <div class="flex gap-2">
            <button
              @click="updateStatus('brouillon')"
              :class="['btn', declaration.status === 'brouillon' ? 'btn-warning' : 'btn-outline']"
            >
              Brouillon
            </button>
            <button
              @click="updateStatus('complete')"
              :class="['btn', declaration.status === 'complete' ? 'btn-info' : 'btn-outline']"
            >
              Complète
            </button>
            <button
              @click="updateStatus('declaree')"
              :class="['btn', declaration.status === 'declaree' ? 'btn-success' : 'btn-outline']"
            >
              Déclarée
            </button>
          </div>
        </div>
      </div>

      <!-- Historique -->
      <div class="card bg-base-100 shadow-xl mt-6">
        <div class="card-body">
          <h2 class="card-title mb-4">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Historique des déclarations
          </h2>
          <div v-if="allDeclarations.length > 0" class="overflow-x-auto">
            <table class="table table-zebra">
              <thead class="bg-base-200">
                <tr class="border-b-2 border-base-300">
                  <th class="border-r border-base-300">Année</th>
                  <th class="border-r border-base-300">Régime</th>
                  <th class="text-right border-r border-base-300">Revenus</th>
                  <th class="text-right border-r border-base-300">Charges</th>
                  <th class="text-right border-r border-base-300">Résultat</th>
                  <th class="text-center border-r border-base-300">Statut</th>
                  <th class="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="decl in allDeclarations" :key="decl.id" class="hover">
                  <td class="font-semibold">{{ decl.year }}</td>
                  <td>
                    <div class="badge" :class="decl.regime === 'reel' ? 'badge-primary' : 'badge-secondary'">
                      {{ decl.regime === 'reel' ? 'Réel' : 'Micro-foncier' }}
                    </div>
                  </td>
                  <td class="text-right">{{ formatCurrency(parseFloat(decl.revenuBrut)) }}</td>
                  <td class="text-right">{{ formatCurrency(calculateTotalCharges(decl)) }}</td>
                  <td class="text-right font-semibold" :class="calculateNetResult(decl) >= 0 ? 'text-success' : 'text-error'">
                    {{ formatCurrency(calculateNetResult(decl)) }}
                  </td>
                  <td class="text-center">
                    <div class="badge badge-sm" :class="getStatusBadgeClass(decl.status)">
                      {{ getStatusLabel(decl.status) }}
                    </div>
                  </td>
                  <td class="text-center">
                    <div class="flex gap-1 justify-center">
                      <button @click="loadDeclarationById(decl.id)" class="btn btn-ghost btn-xs" title="Voir">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button @click="deleteDeclaration(decl.id)" class="btn btn-ghost btn-xs text-error" title="Supprimer">
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
          <div v-else class="text-center py-8 text-base-content/60">
            Aucun historique de déclarations
          </div>
        </div>
      </div>
    </div>

    <div v-else class="card bg-base-100 shadow-xl">
      <div class="card-body items-center text-center py-12">
        <svg class="w-16 h-6 text-base-content/30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 class="text-lg font-semibold mb-2">Aucune déclaration pour {{ selectedYear }}</h3>
        <p class="text-base-content/60 mb-4">Créez une nouvelle déclaration pour commencer</p>
        <button @click="createNewDeclaration" class="btn btn-primary">
          Créer la déclaration {{ selectedYear }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import api from '@/services/api'

const toast = useToast()
const loading = ref(false)
const selectedYear = ref(new Date().getFullYear())
const declaration = ref(null)
const allDeclarations = ref([])
const rents = ref([])

const years = computed(() => {
  const currentYear = new Date().getFullYear()
  return Array.from({ length: 10 }, (_, i) => currentYear - i)
})

const calculatedRentalIncome = computed(() => {
  if (!rents.value || rents.value.length === 0) return 0

  // Filter rents for the selected year that are paid
  const yearRents = rents.value.filter(rent => {
    // Status is 'paye' (without accent) in database
    if (rent.status !== 'paye') return false
    // Year is a separate field in the Rent model
    return rent.year === selectedYear.value
  })

  // Sum up all paid rents for the year using paidAmount
  return yearRents.reduce((sum, rent) => sum + parseFloat(rent.paidAmount || 0), 0)
})

const totalCharges = computed(() => {
  if (!declaration.value || declaration.value.regime !== 'reel') return 0
  return (
    parseFloat(declaration.value.fraisGestion || 0) +
    parseFloat(declaration.value.primesAssurance || 0) +
    parseFloat(declaration.value.depensesReparation || 0) +
    parseFloat(declaration.value.chargesNonRecuperees || 0) +
    parseFloat(declaration.value.taxeFonciere || 0) +
    parseFloat(declaration.value.autresCharges || 0) +
    parseFloat(declaration.value.interetsEmprunt || 0)
  )
})

const netResult = computed(() => {
  if (!declaration.value) return 0
  if (declaration.value.regime === 'micro') {
    return parseFloat(declaration.value.revenuBrut || 0) * 0.7
  }
  return parseFloat(declaration.value.revenuBrut || 0) - totalCharges.value
})

const loadDeclaration = async () => {
  loading.value = true
  try {
    const response = await api.get(`/api/fiscal-declarations/year/${selectedYear.value}`)
    declaration.value = response.data.data
    // Reload rents to recalculate income for the selected year
    await loadRents()
  } catch (error) {
    console.error('Error loading declaration:', error)
    declaration.value = null
  } finally {
    loading.value = false
  }
}

const loadAllDeclarations = async () => {
  try {
    const response = await api.get('/api/fiscal-declarations')
    allDeclarations.value = response.data.data || []
  } catch (error) {
    console.error('Error loading all declarations:', error)
  }
}

const loadRents = async () => {
  try {
    const response = await api.get('/api/rents')
    rents.value = response.data.data || []
  } catch (error) {
    console.error('Error loading rents:', error)
  }
}

const useCalculatedIncome = async () => {
  if (!declaration.value) return
  declaration.value.revenuBrut = calculatedRentalIncome.value
  await saveDeclaration()
  toast.success('Revenus mis à jour depuis les loyers')
}

const loadDeclarationById = async (id) => {
  loading.value = true
  try {
    const response = await api.get(`/api/fiscal-declarations/${id}`)
    declaration.value = response.data.data
    selectedYear.value = declaration.value.year
  } catch (error) {
    console.error('Error loading declaration:', error)
    toast.error('Impossible de charger la déclaration')
  } finally {
    loading.value = false
  }
}

const createNewDeclaration = async () => {
  try {
    const response = await api.post('/api/fiscal-declarations', {
      year: selectedYear.value,
      regime: 'reel',
      status: 'brouillon'
    })
    declaration.value = response.data.data
    toast.success(`Déclaration ${selectedYear.value} créée`)
    await loadAllDeclarations()
  } catch (error) {
    console.error('Error creating declaration:', error)
    toast.error(error.response?.data?.error?.message || 'Impossible de créer la déclaration')
  }
}

const saveDeclaration = async () => {
  if (!declaration.value) return
  try {
    await api.put(`/api/fiscal-declarations/${declaration.value.id}`, declaration.value)
    toast.success('Déclaration enregistrée')
    await loadAllDeclarations()
  } catch (error) {
    console.error('Error saving declaration:', error)
    toast.error('Impossible de sauvegarder la déclaration')
  }
}

const updateStatus = async (status) => {
  if (!declaration.value) return
  declaration.value.status = status
  if (status === 'declaree') {
    declaration.value.declarationDate = new Date().toISOString()
  }
  await saveDeclaration()
}

const deleteDeclaration = async (id) => {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cette déclaration ?')) {
    return
  }
  try {
    await api.delete(`/api/fiscal-declarations/${id}`)
    toast.success('Déclaration supprimée')
    if (declaration.value && declaration.value.id === id) {
      declaration.value = null
    }
    await loadAllDeclarations()
  } catch (error) {
    console.error('Error deleting declaration:', error)
    toast.error('Impossible de supprimer la déclaration')
  }
}

const calculateTotalCharges = (decl) => {
  if (decl.regime !== 'reel') return 0
  return (
    parseFloat(decl.fraisGestion || 0) +
    parseFloat(decl.primesAssurance || 0) +
    parseFloat(decl.depensesReparation || 0) +
    parseFloat(decl.chargesNonRecuperees || 0) +
    parseFloat(decl.taxeFonciere || 0) +
    parseFloat(decl.autresCharges || 0) +
    parseFloat(decl.interetsEmprunt || 0)
  )
}

const calculateNetResult = (decl) => {
  if (decl.regime === 'micro') {
    return parseFloat(decl.revenuBrut || 0) * 0.7
  }
  return parseFloat(decl.revenuBrut || 0) - calculateTotalCharges(decl)
}

const getStatusLabel = (status) => {
  const labels = {
    'brouillon': 'Brouillon',
    'complete': 'Complète',
    'declaree': 'Déclarée'
  }
  return labels[status] || status
}

const getStatusBadgeClass = (status) => {
  const classes = {
    'brouillon': 'badge-warning',
    'complete': 'badge-info',
    'declaree': 'badge-success'
  }
  return classes[status] || 'badge-ghost'
}

const generateReport = () => {
  if (!declaration.value) return

  const reportContent = `
==============================================
    DÉCLARATION FISCALE ${declaration.value.year}
    Revenus Fonciers - ${declaration.value.regime === 'reel' ? 'Régime Réel' : 'Micro-foncier'}
    Statut: ${getStatusLabel(declaration.value.status)}
==============================================

${declaration.value.regime === 'reel' ? `
FORMULAIRE 2044 - RÉGIME RÉEL

REVENUS
-------
Case 211 - Revenus bruts perçus
Montant: ${formatCurrency(parseFloat(declaration.value.revenuBrut))}

CHARGES DÉDUCTIBLES
-------------------
Case 221 - Frais d'administration et de gestion
Montant: ${formatCurrency(parseFloat(declaration.value.fraisGestion || 0))}

Case 223 - Primes d'assurance
Montant: ${formatCurrency(parseFloat(declaration.value.primesAssurance || 0))}

Case 224 - Dépenses de réparation et d'entretien
Montant: ${formatCurrency(parseFloat(declaration.value.depensesReparation || 0))}

Case 227 - Charges récupérables non récupérées
Montant: ${formatCurrency(parseFloat(declaration.value.chargesNonRecuperees || 0))}

Case 229 - Taxe foncière
Montant: ${formatCurrency(parseFloat(declaration.value.taxeFonciere || 0))}

Case 230 - Autres charges
Montant: ${formatCurrency(parseFloat(declaration.value.autresCharges || 0))}

Case 250 - Intérêts d'emprunt
Montant: ${formatCurrency(parseFloat(declaration.value.interetsEmprunt || 0))}

TOTAL DES CHARGES: ${formatCurrency(totalCharges.value)}

RÉSULTAT FONCIER
----------------
Case 261 - Résultat (Revenus - Charges)
Montant: ${formatCurrency(netResult.value)}
Statut: ${netResult.value >= 0 ? 'BÉNÉFICE FONCIER' : 'DÉFICIT FONCIER'}
` : `
DÉCLARATION 2042 - MICRO-FONCIER

Case 4BE - Revenus fonciers bruts
Montant à déclarer: ${formatCurrency(parseFloat(declaration.value.revenuBrut))}

Note: L'abattement de 30% sera appliqué automatiquement
      par l'administration fiscale.

Revenu net imposable (après abattement 30%): ${formatCurrency(netResult.value)}
`}

${declaration.value.notes ? `\nNOTES ET OBSERVATIONS\n---------------------\n${declaration.value.notes}\n` : ''}

==============================================
Document généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}
Application Gestion Locative v1.0
==============================================
`

  const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = `declaration_fiscale_${declaration.value.year}_${declaration.value.regime}.txt`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  toast.success('Rapport généré et téléchargé')
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(value || 0)
}

onMounted(async () => {
  await loadDeclaration()
  await loadAllDeclarations()
  await loadRents()
})
</script>
