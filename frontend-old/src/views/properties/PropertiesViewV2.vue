<template>
  <div class="p-8">
    <!-- En-tête -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">Biens immobiliers</h1>
        <p class="text-gray-600 dark:text-gray-400 mt-1">Gestion de votre patrimoine immobilier</p>
      </div>
      <button
        @click="showDialog = true"
        class="btn-primary flex items-center gap-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Nouveau bien
      </button>
    </div>

    <!-- Filtres -->
    <div class="card mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Recherche</label>
          <input
            v-model="filters.search"
            type="text"
            placeholder="Nom du bien ou adresse..."
            class="input-field"
            @input="loadProperties"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type de bien</label>
          <select v-model="filters.type" class="input-field" @change="loadProperties">
            <option value="">Tous les types</option>
            <option v-for="type in propertyTypes" :key="type.value" :value="type.value">
              {{ type.label }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Statut</label>
          <select v-model="filters.status" class="input-field" @change="loadProperties">
            <option value="">Tous les statuts</option>
            <option v-for="status in statusOptions" :key="status.value" :value="status.value">
              {{ status.label }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>

    <!-- Table -->
    <div v-else-if="properties.length > 0" class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Bien</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Adresse</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ville</th>
              <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Surface</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Loyer</th>
              <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Statut</th>
              <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="property in properties" :key="property.id" class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-6 rounded-lg flex items-center justify-center text-white font-bold text-sm bg-gradient-to-br from-purple-600 to-purple-700 shadow-sm">
                    {{ property.name.charAt(0).toUpperCase() }}
                  </div>
                  <div>
                    <p class="font-medium text-gray-900 dark:text-gray-100">{{ property.name }}</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">{{ property.postalCode }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {{ formatPropertyType(property.type) }}
                </span>
              </td>
              <td class="px-6 py-4">
                <span class="text-sm text-gray-900 dark:text-gray-100">{{ property.address }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm text-gray-600 dark:text-gray-400">{{ property.city }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-center">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                  {{ property.surface }} m²
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right">
                <p class="font-semibold text-green-600 dark:text-green-400">
                  {{ formatCurrency(property.currentRent) }}
                </p>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-center">
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="getStatusClass(property.status)"
                >
                  {{ formatStatus(property.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center justify-center gap-2">
                  <button
                    @click="viewProperty(property)"
                    class="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title="Voir détails"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  <button
                    @click="editProperty(property)"
                    class="p-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
                    title="Modifier"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    @click="deleteProperty(property)"
                    class="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                    title="Supprimer"
                  >
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
    </div>

    <!-- Empty State -->
    <div v-else class="card text-center py-12">
      <svg class="w-16 h-6 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
      <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Aucun bien trouvé</h3>
      <p class="text-gray-600 dark:text-gray-400">{{ filters.search || filters.type || filters.status ? 'Essayez de modifier les filtres' : 'Ajoutez votre premier bien' }}</p>
    </div>

    <!-- Dialog -->
    <Dialog
      v-model:visible="showDialog"
      :header="editingProperty ? 'Modifier le bien' : 'Nouveau bien'"
      :modal="true"
      :style="{ width: '600px', maxHeight: '90vh' }"
      class="modern-dialog"
    >
      <div class="property-form" style="max-height: 60vh; overflow-y: auto;">
        <div class="p-field">
          <label><i class="pi pi-tag"></i> Nom du bien *</label>
          <InputText v-model="form.name" required class="w-full" placeholder="Ex: Appartement Centre-ville" />
        </div>
        <div class="p-field">
          <label><i class="pi pi-home"></i> Type de bien *</label>
          <Dropdown
            v-model="form.type"
            :options="propertyTypes"
            optionLabel="label"
            optionValue="value"
            required
            class="w-full"
            placeholder="Sélectionnez un type"
          />
        </div>
        <div class="p-field" v-if="form.type && form.type !== 'immeuble'">
          <label><i class="pi pi-building"></i> Immeuble (optionnel)</label>
          <Dropdown
            v-model="form.buildingId"
            :options="buildings"
            optionLabel="name"
            optionValue="id"
            class="w-full"
            placeholder="Sélectionnez un immeuble"
            showClear
          />
        </div>
        <div class="p-field">
          <label><i class="pi pi-map-marker"></i> Adresse *</label>
          <InputText v-model="form.address" required class="w-full" placeholder="Numéro et nom de rue" />
        </div>
        <div class="p-field-group">
          <div class="p-field">
            <label><i class="pi pi-building"></i> Ville *</label>
            <InputText v-model="form.city" required class="w-full" placeholder="Ville" />
          </div>
          <div class="p-field">
            <label><i class="pi pi-map"></i> Code postal *</label>
            <InputText v-model="form.postalCode" required class="w-full" placeholder="Code postal" />
          </div>
        </div>
        <div class="p-field-group">
          <div class="p-field">
            <label><i class="pi pi-th-large"></i> Surface (m²)</label>
            <InputNumber v-model="form.surface" class="w-full" :min="0" />
          </div>
          <div class="p-field">
            <label><i class="pi pi-th-large"></i> Nombre de pièces</label>
            <InputNumber v-model="form.rooms" class="w-full" :min="0" />
          </div>
        </div>
        <div class="p-field">
          <label><i class="pi pi-euro"></i> Loyer actuel (€)</label>
          <InputNumber v-model="form.currentRent" mode="currency" currency="EUR" locale="fr-FR" class="w-full" />
        </div>
        <div class="p-field">
          <label><i class="pi pi-align-left"></i> Description</label>
          <Textarea v-model="form.description" rows="2" class="w-full" placeholder="Description du bien..." />
        </div>
        <div class="p-field-group">
          <div class="p-field">
            <label><i class="pi pi-id-card"></i> Numéro fiscal</label>
            <InputText v-model="form.fiscalNumber" class="w-full" placeholder="Ex: 2024123456789" />
          </div>
          <div class="p-field">
            <label><i class="pi pi-map"></i> Référence cadastrale</label>
            <InputText v-model="form.cadastralReference" class="w-full" placeholder="Ex: 123 ABC 456" />
          </div>
        </div>
      </div>
      <template #footer>
        <Button label="Annuler" @click="showDialog = false" class="p-button-text" />
        <Button label="Enregistrer" icon="pi pi-check" @click="saveProperty" :loading="saving" class="p-button-rounded" />
      </template>
    </Dialog>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteConfirm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 shadow-xl">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Confirmer la suppression</h3>
        <p class="text-gray-600 dark:text-gray-400 mb-2">
          Êtes-vous sûr de vouloir supprimer le bien <strong>{{ propertyToDelete?.name }}</strong> ?
        </p>
        <p class="text-sm text-red-600 dark:text-red-400 mb-6">
          Cette action est irréversible.
        </p>
        <div class="flex gap-3">
          <button @click="showDeleteConfirm = false" class="btn-secondary flex-1">
            Annuler
          </button>
          <button @click="confirmDelete" class="btn-danger flex-1">
            Supprimer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import api from '@/services/api'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Textarea from 'primevue/textarea'
import Dropdown from 'primevue/dropdown'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'

const router = useRouter()
const toast = useToast()

const properties = ref([])
const loading = ref(false)
const showDialog = ref(false)
const editingProperty = ref(null)
const saving = ref(false)
const showDeleteConfirm = ref(false)
const propertyToDelete = ref(null)

const filters = reactive({
  search: '',
  type: '',
  status: ''
})

const form = reactive({
  name: '',
  type: '',
  buildingId: null,
  address: '',
  city: '',
  postalCode: '',
  surface: null,
  rooms: null,
  currentRent: null,
  description: '',
  fiscalNumber: '',
  cadastralReference: ''
})

const propertyTypes = [
  { label: 'Appartement', value: 'appartement' },
  { label: 'Maison', value: 'maison' },
  { label: 'Immeuble', value: 'immeuble' },
  { label: 'Terrain', value: 'terrain' },
  { label: 'Garage', value: 'garage' },
  { label: 'Fond de commerce', value: 'fond_commerce' },
  { label: 'Meublé', value: 'meuble' }
]

const statusOptions = [
  { label: 'Disponible', value: 'disponible' },
  { label: 'Loué', value: 'loue' },
  { label: 'En travaux', value: 'en_travaux' },
  { label: 'Vendu', value: 'vendu' }
]

const buildings = computed(() => {
  return properties.value.filter(p => p.type === 'immeuble')
})

const loadProperties = async () => {
  loading.value = true
  try {
    const params = {}
    if (filters.search) params.search = filters.search
    if (filters.type) params.type = filters.type
    if (filters.status) params.status = filters.status

    const response = await api.get('/api/properties', { params })
    properties.value = response.data.data
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: 'Impossible de charger les biens',
      life: 3000
    })
  } finally {
    loading.value = false
  }
}

const viewProperty = (property) => {
  if (property.type === 'immeuble') {
    router.push(`/buildings/${property.id}`)
  } else {
    router.push(`/properties/${property.id}`)
  }
}

const editProperty = (property) => {
  editingProperty.value = property
  Object.assign(form, property)
  showDialog.value = true
}

const resetForm = () => {
  editingProperty.value = null
  Object.assign(form, {
    name: '',
    type: '',
    buildingId: null,
    address: '',
    city: '',
    postalCode: '',
    surface: null,
    rooms: null,
    currentRent: null,
    description: '',
    fiscalNumber: '',
    cadastralReference: ''
  })
}

const saveProperty = async () => {
  saving.value = true
  try {
    if (editingProperty.value) {
      await api.put(`/api/properties/${editingProperty.value.id}`, form)
      toast.add({
        severity: 'success',
        summary: 'Succès',
        detail: 'Bien modifié avec succès',
        life: 3000
      })
    } else {
      const { id, ...propertyData } = form
      await api.post('/api/properties', propertyData)
      toast.add({
        severity: 'success',
        summary: 'Succès',
        detail: 'Bien créé avec succès',
        life: 3000
      })
    }
    showDialog.value = false
    resetForm()
    loadProperties()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: 'Impossible d\'enregistrer le bien',
      life: 3000
    })
  } finally {
    saving.value = false
  }
}

const deleteProperty = (property) => {
  propertyToDelete.value = property
  showDeleteConfirm.value = true
}

const confirmDelete = async () => {
  try {
    await api.delete(`/api/properties/${propertyToDelete.value.id}`)
    toast.add({
      severity: 'success',
      summary: 'Succès',
      detail: 'Bien supprimé avec succès',
      life: 3000
    })
    loadProperties()
    showDeleteConfirm.value = false
    propertyToDelete.value = null
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: 'Impossible de supprimer le bien',
      life: 3000
    })
  }
}

const formatPropertyType = (type) => {
  const typeMap = {
    appartement: 'Appartement',
    maison: 'Maison',
    immeuble: 'Immeuble',
    terrain: 'Terrain',
    garage: 'Garage',
    fond_commerce: 'Commerce',
    meuble: 'Meublé'
  }
  return typeMap[type] || type
}

const formatStatus = (status) => {
  const statusMap = {
    disponible: 'Disponible',
    loue: 'Loué',
    en_travaux: 'En travaux',
    vendu: 'Vendu'
  }
  return statusMap[status] || status
}

const getStatusClass = (status) => {
  const classMap = {
    disponible: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    loue: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    en_travaux: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
    vendu: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  }
  return classMap[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(value || 0)
}

onMounted(() => {
  loadProperties()
})
</script>

<style scoped>
/* Classes Tailwind personnalisées pour ressembler à bank-manager */
.btn-primary {
  @apply bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200 font-medium;
}

.btn-secondary {
  @apply bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600;
}

.btn-danger {
  @apply bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium;
}

.input-field {
  @apply w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400;
}

.card {
  @apply bg-white rounded-xl shadow-sm border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-700;
}

/* Formulaire */
.property-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1rem 0;
}

.p-field {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.p-field-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.p-field label {
  font-weight: 700;
  color: var(--text-color);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
}

.p-field label i {
  color: var(--primary-color);
  font-size: 1rem;
}

.w-full {
  width: 100%;
}

/* Responsive */
@media (max-width: 768px) {
  .p-field-group {
    grid-template-columns: 1fr;
  }
}
</style>
