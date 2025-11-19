<template>
  <div class="p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold">Répartition des charges</h1>
      <p class="text-base-content/70 mt-1">Visualisez la répartition des charges d'immeuble par appartement et locataire</p>
    </div>

    <!-- Filtres -->
    <div class="card bg-base-100 shadow-xl mb-6">
      <div class="card-body">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Filtre par année -->
          <div class="form-control">
            <label class="label">
              <span class="label-text font-semibold">Année</span>
            </label>
            <select v-model="selectedYear" class="select select-bordered" @change="loadData">
              <option v-for="year in availableYears" :key="year" :value="year">
                {{ year }}
              </option>
            </select>
          </div>

          <!-- Filtre par immeuble -->
          <div class="form-control">
            <label class="label">
              <span class="label-text font-semibold">Immeuble</span>
            </label>
            <select v-model="selectedBuilding" class="select select-bordered" @change="loadData">
              <option value="">Tous les immeubles</option>
              <option v-for="building in buildings" :key="building.id" :value="building.id">
                {{ building.name }}
              </option>
            </select>
          </div>

          <!-- Filtre par type de charge -->
          <div class="form-control">
            <label class="label">
              <span class="label-text font-semibold">Type de charge</span>
            </label>
            <select v-model="selectedType" class="select select-bordered" @change="loadData">
              <option value="">Tous les types</option>
              <option value="eau">Eau</option>
              <option value="electricite">Électricité</option>
              <option value="taxe_ordures">Taxe ordures ménagères</option>
              <option value="entretien">Entretien</option>
              <option value="assurance">Assurance</option>
              <option value="taxe_fonciere">Taxe foncière</option>
              <option value="jardin">Entretien jardin</option>
              <option value="chauffage">Chauffage</option>
              <option value="copropriete">Copropriété</option>
              <option value="autre">Autre</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center items-center h-64">
      <span class="loading loading-spinner loading-lg text-primary"></span>
    </div>

    <!-- Content -->
    <div v-else class="space-y-6">
      <!-- Statistiques globales -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="stats shadow">
          <div class="stat">
            <div class="stat-title">Total Charges</div>
            <div class="stat-value text-2xl">{{ formatCurrency(totalCharges) }}</div>
            <div class="stat-desc">{{ buildingCharges.length }} charge(s)</div>
          </div>
        </div>

        <div class="stats shadow bg-success text-success-content">
          <div class="stat">
            <div class="stat-title text-success-content/70">Appartements</div>
            <div class="stat-value text-2xl">{{ totalApartments }}</div>
            <div class="stat-desc text-success-content/70">{{ activeLeases.length }} location(s) active(s)</div>
          </div>
        </div>

        <div class="stats shadow bg-info text-info-content">
          <div class="stat">
            <div class="stat-title text-info-content/70">Par appartement</div>
            <div class="stat-value text-2xl">{{ formatCurrency(averagePerApartment) }}</div>
            <div class="stat-desc text-info-content/70">Moyenne</div>
          </div>
        </div>

        <div class="stats shadow bg-warning text-warning-content">
          <div class="stat">
            <div class="stat-title text-warning-content/70">Par locataire</div>
            <div class="stat-value text-2xl">{{ formatCurrency(averagePerTenant) }}</div>
            <div class="stat-desc text-warning-content/70">Moyenne</div>
          </div>
        </div>
      </div>

      <!-- Message si pas de charges -->
      <div v-if="buildingCharges.length === 0" class="card bg-base-100 shadow-xl">
        <div class="card-body text-center py-12">
          <svg class="w-16 h-6 mx-auto text-base-content/30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p class="text-base-content/60">Aucune charge d'immeuble pour cette période</p>
        </div>
      </div>

      <!-- Répartition par immeuble -->
      <div v-for="buildingData in buildingsData" :key="buildingData.building.id" class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <!-- En-tête de l'immeuble -->
          <div class="flex justify-between items-start mb-4">
            <div>
              <h2 class="card-title text-2xl">{{ buildingData.building.name }}</h2>
              <p class="text-sm text-base-content/60">{{ buildingData.building.address }}</p>
              <div class="flex gap-2 mt-2">
                <span class="badge badge-outline">{{ buildingData.apartments.length }} appartement(s)</span>
                <span class="badge badge-outline">{{ buildingData.activeLeases.length }} location(s) active(s)</span>
              </div>
            </div>
            <div class="text-right">
              <p class="text-3xl font-bold text-primary">{{ formatCurrency(buildingData.totalCharges) }}</p>
              <p class="text-sm text-base-content/60">{{ buildingData.charges.length }} charge(s)</p>
            </div>
          </div>

          <div class="divider my-0"></div>

          <!-- Liste des charges de l'immeuble -->
          <div class="mb-6">
            <h3 class="font-bold text-lg mb-3">Charges de l'immeuble</h3>
            <div class="overflow-x-auto">
              <table class="table table-sm">
                <thead class="bg-base-200">
                  <tr class="border-b-2 border-base-300">
                    <th class="border-r border-base-300">Charge</th>
                    <th class="border-r border-base-300">Type</th>
                    <th class="border-r border-base-300">Date</th>
                    <th class="border-r border-base-300">Méthode</th>
                    <th class="text-right">Montant total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="charge in buildingData.charges" :key="charge.id">
                    <td class="font-semibold">{{ charge.name }}</td>
                    <td>
                      <span class="badge badge-sm" :class="getTypeBadgeClass(charge.type)">
                        {{ formatType(charge.type) }}
                      </span>
                    </td>
                    <td>{{ formatDate(charge.date) }}</td>
                    <td>
                      <span class="badge badge-sm badge-outline">
                        {{ formatDistributionMethod(charge.distributionMethod || 'appartement') }}
                      </span>
                    </td>
                    <td class="text-right font-bold">{{ formatCurrency(charge.amount) }}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr class="font-bold">
                    <td colspan="4" class="text-right">Total:</td>
                    <td class="text-right text-primary">{{ formatCurrency(buildingData.totalCharges) }}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <!-- Répartition par appartement -->
          <div>
            <h3 class="font-bold text-lg mb-3">Répartition par appartement</h3>

            <div v-if="buildingData.apartments.length === 0" class="text-center py-8 text-base-content/60">
              Aucun appartement dans cet immeuble
            </div>

            <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div v-for="apartment in buildingData.apartments" :key="apartment.id"
                   class="border border-base-300 rounded-lg p-4 hover:shadow-lg transition-shadow">
                <!-- Info appartement -->
                <div class="flex justify-between items-start mb-3">
                  <div>
                    <h4 class="font-bold">{{ apartment.name }}</h4>
                    <p class="text-xs text-base-content/60">{{ apartment.surface }} m²</p>
                  </div>
                  <div class="text-right">
                    <p class="font-bold text-lg text-primary">
                      {{ formatCurrency(calculateApartmentShare(buildingData, apartment)) }}
                    </p>
                    <p class="text-xs text-base-content/60">
                      {{ getApartmentSharePercentage(buildingData, apartment) }}%
                    </p>
                  </div>
                </div>

                <!-- Info locataire -->
                <div class="pt-3 border-t border-base-300">
                  <div v-if="getApartmentLease(apartment.id)" class="flex items-start gap-2">
                    <div class="avatar placeholder">
                      <div class="bg-success text-success-content rounded-full w-8 flex items-center justify-center">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="font-semibold text-sm truncate">
                        {{ getTenantName(getApartmentLease(apartment.id)) }}
                      </p>
                      <p class="text-xs text-base-content/60">
                        Loyer: {{ formatCurrency(getApartmentLease(apartment.id).rentAmount) }}
                      </p>
                    </div>
                  </div>
                  <div v-else class="text-center py-2">
                    <span class="badge badge-ghost badge-sm">Non loué</span>
                  </div>
                </div>

                <!-- Détail des charges pour cet appartement -->
                <div class="mt-3 pt-3 border-t border-base-300">
                  <details class="collapse collapse-arrow bg-base-200 rounded-lg">
                    <summary class="collapse-title text-xs font-medium">Détail des charges</summary>
                    <div class="collapse-content">
                      <div class="space-y-1 text-xs">
                        <div v-for="charge in buildingData.charges" :key="charge.id"
                             class="flex justify-between py-1 border-b border-base-300">
                          <span class="truncate">{{ charge.name }}</span>
                          <span class="font-semibold">
                            {{ formatCurrency(calculateChargeShare(buildingData, apartment, charge)) }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </details>
                </div>
              </div>
            </div>
          </div>

          <!-- Tableau récapitulatif par locataire -->
          <div v-if="buildingData.activeLeases.length > 0" class="mt-6 pt-6 border-t border-base-300">
            <div class="flex justify-between items-center mb-3">
              <h3 class="font-bold text-lg">Récapitulatif par locataire</h3>
              <button @click="saveAllocations(buildingData)"
                      class="btn btn-primary btn-sm"
                      :class="{ 'loading': savingAllocations }">
                <svg v-if="!savingAllocations" class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                Sauvegarder la répartition
              </button>
            </div>
            <div class="overflow-x-auto">
              <table class="table">
                <thead class="bg-base-200">
                  <tr class="border-b-2 border-base-300">
                    <th class="border-r border-base-300">Locataire</th>
                    <th class="border-r border-base-300">Appartement</th>
                    <th class="text-right border-r border-base-300">Surface</th>
                    <th class="text-center border-r border-base-300">Occupants</th>
                    <th class="text-right border-r border-base-300">Part des charges</th>
                    <th class="text-right">% du total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="lease in buildingData.activeLeases" :key="lease.id">
                    <td>
                      <div class="font-semibold">{{ getTenantName(lease) }}</div>
                      <div class="text-sm text-base-content/60">{{ lease.Tenant?.email }}</div>
                    </td>
                    <td>{{ lease.Property?.name }}</td>
                    <td class="text-right">{{ lease.Property?.surface }} m²</td>
                    <td class="text-center">
                      <input
                        type="number"
                        min="1"
                        v-model.number="lease.numberOfOccupants"
                        @change="updateLeaseOccupants(lease)"
                        class="input input-bordered input-sm w-20 text-center"
                      />
                    </td>
                    <td class="text-right font-bold text-primary">
                      {{ formatCurrency(calculateApartmentShare(buildingData, lease.Property)) }}
                    </td>
                    <td class="text-right">
                      <span class="badge badge-outline">
                        {{ getApartmentSharePercentage(buildingData, lease.Property) }}%
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/services/api'
import { useToast } from 'vue-toastification'

const toast = useToast()

const loading = ref(true)
const savingAllocations = ref(false)
const selectedYear = ref(new Date().getFullYear())
const selectedBuilding = ref('')
const selectedType = ref('')

const buildings = ref([])
const apartments = ref([])
const charges = ref([])
const leases = ref([])

const availableYears = computed(() => {
  const currentYear = new Date().getFullYear()
  const years = []
  for (let i = currentYear - 5; i <= currentYear + 1; i++) {
    years.push(i)
  }
  return years.reverse()
})

// Charges d'immeuble uniquement (avec propertyId non null et type = immeuble)
const buildingCharges = computed(() => {
  let filtered = charges.value.filter(charge => {
    // On ne garde que les charges liées à un bien
    if (!charge.propertyId) return false

    // On vérifie que le bien est un immeuble
    const property = buildings.value.find(b => b.id === charge.propertyId)
    if (!property || property.type !== 'immeuble') return false

    // Filtre par type
    if (selectedType.value && charge.type !== selectedType.value) return false

    return true
  })

  return filtered
})

// Baux actifs pour l'année sélectionnée
const activeLeases = computed(() => {
  const yearStart = new Date(`${selectedYear.value}-01-01`)
  const yearEnd = new Date(`${selectedYear.value}-12-31`)

  return leases.value.filter(lease => {
    const startDate = new Date(lease.startDate)
    const endDate = lease.endDate ? new Date(lease.endDate) : null

    // Le bail est actif si il commence avant la fin de l'année
    // et n'est pas terminé avant le début de l'année
    return startDate <= yearEnd && (!endDate || endDate >= yearStart)
  })
})

const totalCharges = computed(() => {
  return buildingCharges.value.reduce((sum, charge) => sum + parseFloat(charge.amount || 0), 0)
})

const totalApartments = computed(() => {
  if (selectedBuilding.value) {
    return apartments.value.filter(apt => apt.buildingId === selectedBuilding.value).length
  }
  return apartments.value.length
})

const averagePerApartment = computed(() => {
  if (totalApartments.value === 0) return 0
  return totalCharges.value / totalApartments.value
})

const averagePerTenant = computed(() => {
  if (activeLeases.value.length === 0) return 0
  return totalCharges.value / activeLeases.value.length
})

// Données groupées par immeuble
const buildingsData = computed(() => {
  let buildingsToShow = buildings.value.filter(b => b.type === 'immeuble')

  if (selectedBuilding.value) {
    buildingsToShow = buildingsToShow.filter(b => b.id === selectedBuilding.value)
  }

  return buildingsToShow.map(building => {
    const buildingApartments = apartments.value.filter(apt => apt.buildingId === building.id)
    const buildingChargesFiltered = buildingCharges.value.filter(charge => charge.propertyId === building.id)
    const buildingLeases = activeLeases.value.filter(lease =>
      buildingApartments.some(apt => apt.id === lease.propertyId)
    )

    return {
      building,
      apartments: buildingApartments,
      charges: buildingChargesFiltered,
      activeLeases: buildingLeases,
      totalCharges: buildingChargesFiltered.reduce((sum, c) => sum + parseFloat(c.amount || 0), 0)
    }
  }).filter(data => data.charges.length > 0) // On garde seulement les immeubles avec des charges
})

// Calculer la part d'un appartement dans les charges
const calculateApartmentShare = (buildingData, apartment) => {
  let total = 0

  buildingData.charges.forEach(charge => {
    total += calculateChargeShare(buildingData, apartment, charge)
  })

  return total
}

// Calculer la part d'un appartement pour une charge spécifique
const calculateChargeShare = (buildingData, apartment, charge) => {
  const method = charge.distributionMethod || 'appartement'
  const amount = parseFloat(charge.amount || 0)

  // Normaliser la méthode (peut venir du backend avec différents formats)
  let normalizedMethod = method
  if (method === 'personnalise') {
    normalizedMethod = 'appartement' // par défaut pour personnalisé
  }

  switch (normalizedMethod) {
    case 'surface':
      const totalSurface = buildingData.apartments.reduce((sum, apt) => sum + parseFloat(apt.surface || 0), 0)
      if (totalSurface === 0) return 0
      return (parseFloat(apartment.surface || 0) / totalSurface) * amount

    case 'appartement':
      if (buildingData.apartments.length === 0) return 0
      return amount / buildingData.apartments.length

    case 'occupants':
      // Utiliser le nombre d'occupants du bail
      const lease = getApartmentLease(apartment.id)
      if (!lease) return 0

      const totalOccupants = buildingData.activeLeases.reduce((sum, l) => {
        return sum + (l.numberOfOccupants || 1)
      }, 0)

      if (totalOccupants === 0) return 0
      return ((lease.numberOfOccupants || 1) / totalOccupants) * amount

    default:
      // Par défaut, répartition égale par appartement
      if (buildingData.apartments.length === 0) return 0
      return amount / buildingData.apartments.length
  }
}

// Mettre à jour le nombre d'occupants d'un bail
const updateLeaseOccupants = async (lease) => {
  try {
    await api.put(`/api/leases/${lease.id}`, {
      numberOfOccupants: lease.numberOfOccupants
    })
    toast.success('Nombre d\'occupants mis à jour')
  } catch (error) {
    console.error('Erreur lors de la mise à jour du nombre d\'occupants:', error)
    toast.error('Erreur lors de la mise à jour')
  }
}

// Sauvegarder les allocations de charges pour un immeuble
const saveAllocations = async (buildingData) => {
  // Demander confirmation avant de sauvegarder
  if (!confirm('Voulez-vous sauvegarder la répartition des charges pour cet immeuble ? Cela créera des allocations pour tous les locataires actifs.')) {
    return
  }

  savingAllocations.value = true
  try {
    const allocations = []

    // Vérifier s'il existe déjà des allocations pour ces charges
    const chargeIds = buildingData.charges.map(c => c.id)
    const existingAllocationsResponse = await api.get('/api/charge-allocations', {
      params: { year: selectedYear.value }
    })
    const existingAllocations = (existingAllocationsResponse.data.data || []).filter(alloc =>
      chargeIds.includes(alloc.chargeId)
    )

    // Si des allocations existent déjà, proposer de les supprimer
    if (existingAllocations.length > 0) {
      if (!confirm(`${existingAllocations.length} allocation(s) existent déjà pour ces charges. Voulez-vous les remplacer ?`)) {
        savingAllocations.value = false
        return
      }

      // Supprimer les allocations existantes
      for (const alloc of existingAllocations) {
        await api.delete(`/api/charge-allocations/${alloc.id}`)
      }
      toast.info(`${existingAllocations.length} allocation(s) existante(s) supprimée(s)`)
    }

    // Pour chaque charge de l'immeuble
    for (const charge of buildingData.charges) {
      // Pour chaque bail actif
      for (const lease of buildingData.activeLeases) {
        const apartment = buildingData.apartments.find(apt => apt.id === lease.propertyId)
        if (!apartment) continue

        const allocatedAmount = calculateChargeShare(buildingData, apartment, charge)
        const rawMethod = charge.distributionMethod || 'appartement'

        // Normaliser la méthode pour l'affichage et le calcul
        let normalizedMethod = rawMethod
        if (rawMethod === 'personnalise') {
          normalizedMethod = 'appartement'
        }

        // Convertir pour l'enregistrement dans ChargeAllocation
        let allocationMethod = 'par_appartement' // par défaut
        if (normalizedMethod === 'occupants') {
          allocationMethod = 'par_occupant'
        } else if (normalizedMethod === 'surface') {
          allocationMethod = 'par_appartement'
        } else if (normalizedMethod === 'appartement') {
          allocationMethod = 'par_appartement'
        }

        // Calculer le coefficient selon la méthode
        let coefficient = null
        if (normalizedMethod === 'surface') {
          const totalSurface = buildingData.apartments.reduce((sum, apt) => sum + parseFloat(apt.surface || 0), 0)
          coefficient = totalSurface > 0 ? parseFloat(apartment.surface || 0) / totalSurface : 0
        } else if (normalizedMethod === 'occupants') {
          const totalOccupants = buildingData.activeLeases.reduce((sum, l) => sum + (l.numberOfOccupants || 1), 0)
          coefficient = totalOccupants > 0 ? (lease.numberOfOccupants || 1) / totalOccupants : 0
        } else {
          coefficient = buildingData.apartments.length > 0 ? 1 / buildingData.apartments.length : 0
        }

        allocations.push({
          chargeId: charge.id,
          leaseId: lease.id,
          allocationMethod: allocationMethod,
          allocatedAmount: allocatedAmount,
          coefficient: coefficient,
          daysOccupied: null,
          notes: `Répartition automatique pour ${selectedYear.value}`
        })
      }
    }

    // Enregistrer toutes les allocations
    for (const allocation of allocations) {
      await api.post('/api/charge-allocations', allocation)
    }

    toast.success(`Répartition sauvegardée avec succès ! ${allocations.length} allocation(s) créée(s).`)
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des allocations:', error)
    toast.error('Erreur lors de la sauvegarde de la répartition')
  } finally {
    savingAllocations.value = false
  }
}

// Obtenir le pourcentage d'un appartement
const getApartmentSharePercentage = (buildingData, apartment) => {
  if (buildingData.totalCharges === 0) return 0
  const share = calculateApartmentShare(buildingData, apartment)
  return ((share / buildingData.totalCharges) * 100).toFixed(2)
}

// Obtenir le bail actif pour un appartement
const getApartmentLease = (apartmentId) => {
  return activeLeases.value.find(lease => lease.propertyId === apartmentId)
}

// Obtenir le nom du locataire
const getTenantName = (lease) => {
  if (!lease || !lease.Tenant) return 'Inconnu'
  return `${lease.Tenant.firstName} ${lease.Tenant.lastName}`
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
    autre: 'Autre'
  }
  return types[type] || type
}

const getTypeBadgeClass = (type) => {
  const classes = {
    eau: 'badge-info',
    electricite: 'badge-warning',
    gaz: 'badge-error',
    taxe_ordures: 'badge-accent',
    entretien: 'badge-secondary',
    assurance: 'badge-primary',
    taxe_fonciere: 'badge-accent',
    jardin: 'badge-success',
    chauffage: 'badge-error',
    copropriete: 'badge-neutral',
    autre: 'badge-ghost'
  }
  return classes[type] || 'badge-ghost'
}

const formatDistributionMethod = (method) => {
  const methods = {
    surface: 'Par surface',
    occupants: 'Par occupants',
    appartement: 'Par appartement',
    personnalise: 'Personnalisé'
  }
  return methods[method] || 'Par appartement'
}

const loadData = async () => {
  loading.value = true
  try {
    // Construire les paramètres de filtre
    const params = new URLSearchParams()
    params.append('year', selectedYear.value)

    // Charger les données en parallèle
    const [propertiesRes, chargesRes, leasesRes] = await Promise.all([
      api.get('/api/properties'),
      api.get(`/api/charges?${params.toString()}`),
      api.get('/api/leases')
    ])

    const allProperties = propertiesRes.data.data || []

    // Séparer immeubles et appartements
    buildings.value = allProperties.filter(p => p.type === 'immeuble')
    apartments.value = allProperties.filter(p => p.type === 'appartement')

    charges.value = chargesRes.data.data || []
    leases.value = leasesRes.data.data || []
  } catch (error) {
    console.error('Erreur lors du chargement des données:', error)
    buildings.value = []
    apartments.value = []
    charges.value = []
    leases.value = []
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadData()
})
</script>
