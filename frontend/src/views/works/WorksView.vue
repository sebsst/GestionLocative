<template>
  <div class="p-8">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold">Gestion des travaux</h1>
        <p class="text-base-content/70 mt-1">Suivi et gestion de vos interventions</p>
      </div>
      <button
        @click="showDialog = true"
        class="btn btn-primary gap-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Nouveaux travaux
      </button>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <div class="stats shadow">
        <div class="stat">
          <div class="stat-title">Total travaux</div>
          <div class="stat-value">{{ works.length }}</div>
        </div>
      </div>

      <div class="stats shadow bg-info text-info-content">
        <div class="stat">
          <div class="stat-title text-info-content/70">Prévus</div>
          <div class="stat-value">{{ pendingCount }}</div>
        </div>
      </div>

      <div class="stats shadow bg-warning text-warning-content">
        <div class="stat">
          <div class="stat-title text-warning-content/70">En cours</div>
          <div class="stat-value">{{ inProgressCount }}</div>
        </div>
      </div>

      <div class="stats shadow bg-success text-success-content">
        <div class="stat">
          <div class="stat-title text-success-content/70">Terminés</div>
          <div class="stat-value">{{ completedCount }}</div>
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
              placeholder="Nature des travaux..."
              class="input input-bordered w-full"
              @input="loadWorks"
            />
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">Type</span>
            </label>
            <select v-model="filters.type" class="select select-bordered w-full" @change="loadWorks">
              <option value="">Tous les types</option>
              <option v-for="type in workTypes" :key="type.value" :value="type.value">
                {{ type.label }}
              </option>
            </select>
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">Statut</span>
            </label>
            <select v-model="filters.status" class="select select-bordered w-full" @change="loadWorks">
              <option value="">Tous les statuts</option>
              <option value="prevu">Prévu</option>
              <option value="en_cours">En cours</option>
              <option value="termine">Terminé</option>
              <option value="paye">Payé</option>
              <option value="annule">Annulé</option>
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
    <div v-else-if="works.length > 0" class="card bg-base-100 shadow-xl overflow-hidden">
      <div class="overflow-x-auto">
        <table class="table table-zebra">
          <thead class="bg-base-200">
            <tr class="border-b-2 border-base-300">
              <th class="border-r border-base-300">Bien</th>
              <th class="border-r border-base-300">Nature</th>
              <th class="text-center border-r border-base-300">Type</th>
              <th class="border-r border-base-300">Artisan</th>
              <th class="text-right border-r border-base-300">Montant</th>
              <th class="border-r border-base-300">Date</th>
              <th class="text-center border-r border-base-300">Statut</th>
              <th class="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="work in works" :key="work.id" class="hover">
              <td>
                <div class="font-medium">
                  {{ work.Property?.name }}
                </div>
              </td>
              <td>
                <div class="text-sm">
                  {{ work.nature }}
                </div>
                <div v-if="work.description" class="text-xs opacity-60 mt-1">
                  {{ work.description.substring(0, 50) }}{{ work.description.length > 50 ? '...' : '' }}
                </div>
              </td>
              <td class="text-center">
                <div
                  :class="getTypeBadgeClass(work.type)"
                  class="badge badge-sm"
                >
                  {{ getTypeLabel(work.type) }}
                </div>
              </td>
              <td>
                <div class="text-sm">
                  {{ work.Artisan?.name || '-' }}
                </div>
                <div v-if="work.Artisan?.company" class="text-xs opacity-60">
                  {{ work.Artisan.company }}
                </div>
              </td>
              <td class="text-right">
                <div class="text-sm font-medium">
                  {{ formatCurrency(work.amount || work.estimatedAmount) }}
                </div>
              </td>
              <td>
                <div class="text-sm">
                  {{ formatDate(work.workDate || work.estimatedDate) }}
                </div>
              </td>
              <td class="text-center">
                <div
                  :class="getStatusBadgeClass(work.status)"
                  class="badge badge-sm"
                >
                  {{ getStatusLabel(work.status) }}
                </div>
              </td>
              <td>
                <div class="flex items-center justify-center gap-2">
                  <button
                    @click="editWork(work)"
                    class="btn btn-ghost btn-xs"
                    title="Modifier"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    @click="deleteWork(work)"
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
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <h3 class="text-lg font-semibold mb-2">Aucun travaux trouvé</h3>
        <p class="text-base-content/60">{{ filters.search ? 'Essayez de modifier les filtres' : 'Ajoutez vos premiers travaux' }}</p>
      </div>
    </div>

    <!-- Dialog Create/Edit Work -->
    <Modal
      v-model="showDialog"
      :title="editingWork ? 'Modifier les travaux' : 'Nouveaux travaux'"
      size="lg"
      :hide-footer="true"
    >
      <div class="space-y-4">
        <div class="form-control">
          <label class="label">
            <span class="label-text">Bien *</span>
          </label>
          <select v-model="workForm.propertyId" class="select select-bordered w-full" required>
            <option value="">Sélectionnez un bien</option>
            <option v-for="property in properties" :key="property.id" :value="property.id">
              {{ property.name }}
            </option>
          </select>
        </div>

        <div class="form-control">
          <label class="label">
            <span class="label-text">Type de travaux *</span>
          </label>
          <select v-model="workForm.type" class="select select-bordered w-full" required>
            <option value="">Sélectionnez un type</option>
            <option v-for="type in workTypes" :key="type.value" :value="type.value">
              {{ type.label }}
            </option>
          </select>
        </div>

        <div class="form-control">
          <label class="label">
            <span class="label-text">Nature des travaux *</span>
          </label>
          <input
            v-model="workForm.nature"
            type="text"
            placeholder="Nature des travaux"
            class="input input-bordered w-full"
            required
          />
        </div>

        <div class="form-control">
          <label class="label">
            <span class="label-text">Description</span>
          </label>
          <textarea
            v-model="workForm.description"
            rows="3"
            placeholder="Description détaillée des travaux"
            class="textarea textarea-bordered w-full"
          ></textarea>
        </div>

        <div class="form-control">
          <label class="label">
            <span class="label-text">Artisan</span>
          </label>
          <div class="flex gap-2">
            <select v-model="workForm.artisanId" class="select select-bordered flex-1">
              <option value="">Sélectionnez un artisan</option>
              <option v-for="artisan in artisans" :key="artisan.id" :value="artisan.id">
                {{ artisan.name }}{{ artisan.company ? ` - ${artisan.company}` : '' }}
              </option>
            </select>
            <button
              @click="showArtisanDialog = true"
              class="btn btn-primary btn-square"
              title="Créer un nouvel artisan"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text">Montant estimé (€)</span>
            </label>
            <input
              v-model.number="workForm.estimatedAmount"
              type="number"
              min="0"
              step="0.01"
              placeholder="1000.00"
              class="input input-bordered w-full"
            />
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">Date prévue</span>
            </label>
            <input
              v-model="workForm.estimatedDate"
              type="date"
              class="input input-bordered w-full"
            />
          </div>
        </div>

        <div class="form-control">
          <label class="label cursor-pointer justify-start gap-2">
            <input
              type="checkbox"
              id="isCommon"
              v-model="workForm.isCommon"
              class="checkbox"
            />
            <span class="label-text">Travaux communs</span>
          </label>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <button @click="closeDialog" class="btn">Annuler</button>
          <button @click="saveWork" :disabled="saving" class="btn btn-primary">
            {{ saving ? 'Enregistrement...' : (editingWork ? 'Modifier' : 'Créer') }}
          </button>
        </div>
      </template>
    </Modal>

    <!-- Dialog Create Artisan -->
    <Modal
      v-model="showArtisanDialog"
      title="Créer un nouvel artisan"
      size="lg"
      :hide-footer="true"
    >
      <div class="space-y-4">
        <div class="form-control">
          <label class="label">
            <span class="label-text">Nom *</span>
          </label>
          <input
            v-model="artisanForm.name"
            type="text"
            placeholder="Nom de l'artisan"
            class="input input-bordered w-full"
            required
          />
        </div>

        <div class="form-control">
          <label class="label">
            <span class="label-text">Entreprise</span>
          </label>
          <input
            v-model="artisanForm.company"
            type="text"
            placeholder="Nom de l'entreprise"
            class="input input-bordered w-full"
          />
        </div>

        <div class="form-control">
          <label class="label">
            <span class="label-text">Spécialité</span>
          </label>
          <input
            v-model="artisanForm.specialty"
            type="text"
            placeholder="Ex: Plomberie, Électricité, Peinture..."
            class="input input-bordered w-full"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text">Téléphone</span>
            </label>
            <input
              v-model="artisanForm.phone"
              type="tel"
              placeholder="Téléphone"
              class="input input-bordered w-full"
            />
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">Email</span>
            </label>
            <input
              v-model="artisanForm.email"
              type="email"
              placeholder="Email"
              class="input input-bordered w-full"
            />
          </div>
        </div>

        <div class="form-control">
          <label class="label">
            <span class="label-text">Adresse</span>
          </label>
          <input
            v-model="artisanForm.address"
            type="text"
            placeholder="Adresse"
            class="input input-bordered w-full"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text">Ville</span>
            </label>
            <input
              v-model="artisanForm.city"
              type="text"
              placeholder="Ville"
              class="input input-bordered w-full"
            />
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">Code postal</span>
            </label>
            <input
              v-model="artisanForm.postalCode"
              type="text"
              placeholder="Code postal"
              class="input input-bordered w-full"
            />
          </div>
        </div>

        <div class="form-control">
          <label class="label">
            <span class="label-text">SIRET</span>
          </label>
          <input
            v-model="artisanForm.siret"
            type="text"
            placeholder="Numéro SIRET"
            class="input input-bordered w-full"
          />
        </div>

        <div class="form-control">
          <label class="label">
            <span class="label-text">Notes</span>
          </label>
          <textarea
            v-model="artisanForm.notes"
            rows="3"
            placeholder="Notes supplémentaires"
            class="textarea textarea-bordered w-full"
          ></textarea>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <button @click="showArtisanDialog = false" class="btn">Annuler</button>
          <button @click="createArtisan" :disabled="savingArtisan" class="btn btn-primary">
            {{ savingArtisan ? 'Création...' : 'Créer' }}
          </button>
        </div>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import api from '@/services/api'
import Modal from '@/components/ui/Modal.vue'

const works = ref([])
const properties = ref([])
const artisans = ref([])
const loading = ref(false)
const showDialog = ref(false)
const showArtisanDialog = ref(false)
const saving = ref(false)
const savingArtisan = ref(false)
const editingWork = ref(null)

const filters = reactive({
  search: '',
  type: '',
  status: ''
})

const workForm = reactive({
  propertyId: null,
  type: null,
  nature: '',
  description: '',
  artisanId: null,
  estimatedAmount: null,
  estimatedDate: null,
  isCommon: false,
  status: 'prevu'
})

const artisanForm = reactive({
  name: '',
  company: '',
  specialty: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  postalCode: '',
  siret: '',
  notes: ''
})

const workTypes = [
  { label: 'Réparation', value: 'reparation' },
  { label: 'Rénovation', value: 'renovation' },
  { label: 'Entretien', value: 'entretien' },
  { label: 'Amélioration', value: 'amelioration' }
]

// Computed stats
const pendingCount = computed(() => {
  return works.value.filter(w => w.status === 'prevu').length
})

const inProgressCount = computed(() => {
  return works.value.filter(w => w.status === 'en_cours').length
})

const completedCount = computed(() => {
  return works.value.filter(w => w.status === 'termine' || w.status === 'paye').length
})

const loadWorks = async () => {
  loading.value = true
  try {
    const params = {}
    if (filters.search) params.search = filters.search
    if (filters.type) params.type = filters.type
    if (filters.status) params.status = filters.status

    const response = await api.get('/api/works', { params })
    works.value = response.data.data || []
  } catch (error) {
    alert('Erreur: Impossible de charger les travaux')
    console.error('Error loading works:', error)
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

const loadArtisans = async () => {
  try {
    const response = await api.get('/api/works/artisans/list')
    artisans.value = response.data.data || []
  } catch (error) {
    console.error('Erreur lors du chargement des artisans:', error)
  }
}

const resetWorkForm = () => {
  Object.assign(workForm, {
    propertyId: null,
    type: null,
    nature: '',
    description: '',
    artisanId: null,
    estimatedAmount: null,
    estimatedDate: null,
    isCommon: false,
    status: 'prevu'
  })
}

const resetArtisanForm = () => {
  Object.assign(artisanForm, {
    name: '',
    company: '',
    specialty: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    siret: '',
    notes: ''
  })
}

const closeDialog = () => {
  showDialog.value = false
  editingWork.value = null
  resetWorkForm()
}

const saveWork = async () => {
  if (!workForm.propertyId || !workForm.type || !workForm.nature) {
    alert('Attention: Veuillez remplir tous les champs obligatoires')
    return
  }

  saving.value = true
  try {
    if (editingWork.value) {
      await api.put(`/api/works/${editingWork.value.id}`, workForm)
      alert('Succès: Travaux modifiés avec succès')
    } else {
      await api.post('/api/works', workForm)
      alert('Succès: Travaux créés avec succès')
    }
    closeDialog()
    loadWorks()
  } catch (error) {
    alert(`Erreur: ${error.response?.data?.error?.message || 'Impossible de sauvegarder les travaux'}`)
    console.error('Error saving work:', error)
  } finally {
    saving.value = false
  }
}

const editWork = (work) => {
  editingWork.value = work
  Object.assign(workForm, {
    propertyId: work.propertyId,
    type: work.type,
    nature: work.nature,
    description: work.description || '',
    artisanId: work.artisanId,
    estimatedAmount: work.estimatedAmount,
    estimatedDate: work.estimatedDate ? new Date(work.estimatedDate) : null,
    isCommon: work.isCommon || false,
    status: work.status
  })
  showDialog.value = true
}

const deleteWork = async (work) => {
  if (!confirm(`Voulez-vous vraiment supprimer ces travaux : ${work.nature} ?`)) {
    return
  }

  try {
    await api.delete(`/api/works/${work.id}`)
    alert('Succès: Travaux supprimés avec succès')
    loadWorks()
  } catch (error) {
    alert('Erreur: Impossible de supprimer les travaux')
    console.error('Error deleting work:', error)
  }
}

const createArtisan = async () => {
  if (!artisanForm.name) {
    alert('Attention: Le nom de l\'artisan est obligatoire')
    return
  }

  savingArtisan.value = true
  try {
    const response = await api.post('/api/works/artisans', artisanForm)
    alert('Succès: Artisan créé avec succès')

    showArtisanDialog.value = false
    resetArtisanForm()
    await loadArtisans()

    // Sélectionner automatiquement le nouvel artisan
    workForm.artisanId = response.data.data.id
  } catch (error) {
    alert(`Erreur: ${error.response?.data?.error?.message || 'Impossible de créer l\'artisan'}`)
    console.error('Error creating artisan:', error)
  } finally {
    savingArtisan.value = false
  }
}

const getTypeBadgeClass = (type) => {
  const classMap = {
    reparation: 'badge-error',
    renovation: 'badge-warning',
    entretien: 'badge-info',
    amelioration: 'badge-success'
  }
  return classMap[type] || 'badge-ghost'
}

const getTypeLabel = (type) => {
  const labelMap = {
    reparation: 'Réparation',
    renovation: 'Rénovation',
    entretien: 'Entretien',
    amelioration: 'Amélioration'
  }
  return labelMap[type] || type
}

const getStatusBadgeClass = (status) => {
  const classMap = {
    prevu: 'badge-info',
    en_cours: 'badge-warning',
    termine: 'badge-success',
    paye: 'badge-success',
    annule: 'badge-error'
  }
  return classMap[status] || 'badge-ghost'
}

const getStatusLabel = (status) => {
  const labelMap = {
    prevu: 'Prévu',
    en_cours: 'En cours',
    termine: 'Terminé',
    paye: 'Payé',
    annule: 'Annulé'
  }
  return labelMap[status] || status
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(value || 0)
}

const formatDate = (date) => {
  return date ? new Date(date).toLocaleDateString('fr-FR') : '-'
}

onMounted(() => {
  loadWorks()
  loadProperties()
  loadArtisans()
})
</script>
