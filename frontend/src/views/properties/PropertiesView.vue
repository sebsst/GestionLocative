<template>
  <div class="properties-view">
    <!-- En-tête moderne -->
    <div class="page-header-modern">
      <div>
        <h1 class="page-title-modern">Biens immobiliers</h1>
        <p class="subtitle-modern">Gestion de votre patrimoine immobilier</p>
      </div>
      <Button
        label="Nouveau bien"
        icon="pi pi-plus"
        @click="showDialog = true"
        class="p-button-rounded p-button-lg p-button-success"
      />
    </div>

    <!-- Cartes de statistiques -->
    <div class="stats-grid">
      <div class="stat-card stat-primary">
        <div class="stat-icon">
          <i class="pi pi-home"></i>
        </div>
        <div class="stat-content">
          <div class="stat-label">Total biens</div>
          <div class="stat-value">{{ properties.length }}</div>
        </div>
      </div>

      <div class="stat-card stat-available">
        <div class="stat-icon">
          <i class="pi pi-check-circle"></i>
        </div>
        <div class="stat-content">
          <div class="stat-label">Disponibles</div>
          <div class="stat-value">{{ availableCount }}</div>
        </div>
      </div>

      <div class="stat-card stat-rented">
        <div class="stat-icon">
          <i class="pi pi-users"></i>
        </div>
        <div class="stat-content">
          <div class="stat-label">Loués</div>
          <div class="stat-value">{{ rentedCount }}</div>
        </div>
      </div>

      <div class="stat-card stat-revenue">
        <div class="stat-icon">
          <i class="pi pi-euro"></i>
        </div>
        <div class="stat-content">
          <div class="stat-label">Revenus mensuels</div>
          <div class="stat-value-small">{{ formatCurrency(totalRevenue) }}</div>
        </div>
      </div>
    </div>

    <!-- Contenu principal -->
    <Card class="modern-card">
      <template #content>
        <!-- Filtres modernes -->
        <div class="filters-modern">
          <span class="p-input-icon-left search-input">
            <i class="pi pi-search" />
            <InputText
              v-model="filters.search"
              placeholder="Rechercher un bien..."
              @input="loadProperties"
              class="w-full"
            />
          </span>
          <Dropdown
            v-model="filters.type"
            :options="propertyTypes"
            optionLabel="label"
            optionValue="value"
            placeholder="Type de bien"
            @change="loadProperties"
            showClear
            class="filter-dropdown"
          >
            <template #value="slotProps">
              <div v-if="slotProps.value" class="dropdown-value">
                <i class="pi pi-tag"></i>
                <span>{{ propertyTypes.find(t => t.value === slotProps.value)?.label }}</span>
              </div>
              <span v-else>Type de bien</span>
            </template>
          </Dropdown>
          <Dropdown
            v-model="filters.status"
            :options="statusOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Statut"
            @change="loadProperties"
            showClear
            class="filter-dropdown"
          >
            <template #value="slotProps">
              <div v-if="slotProps.value" class="dropdown-value">
                <i class="pi pi-flag"></i>
                <span>{{ statusOptions.find(s => s.value === slotProps.value)?.label }}</span>
              </div>
              <span v-else>Statut</span>
            </template>
          </Dropdown>
        </div>

        <!-- Table moderne -->
        <DataTable
          :value="properties"
          :loading="loading"
          :paginator="true"
          :rows="10"
          class="modern-table"
          stripedRows
        >
          <Column field="name" header="Nom" sortable>
            <template #body="{ data }">
              <div class="name-cell">
                <i class="pi pi-building"></i>
                <strong>{{ data.name }}</strong>
              </div>
            </template>
          </Column>
          <Column field="type" header="Type" sortable>
            <template #body="{ data }">
              <Tag :value="formatPropertyType(data.type)" severity="info" icon="pi pi-tag" />
            </template>
          </Column>
          <Column field="address" header="Adresse">
            <template #body="{ data }">
              <div class="address-cell">
                <i class="pi pi-map-marker"></i>
                <span>{{ data.address }}</span>
              </div>
            </template>
          </Column>
          <Column field="city" header="Ville" sortable>
            <template #body="{ data }">
              {{ data.city }}
            </template>
          </Column>
          <Column field="surface" header="Surface" sortable>
            <template #body="{ data }">
              <Tag :value="`${data.surface} m²`" severity="secondary" icon="pi pi-th-large" />
            </template>
          </Column>
          <Column field="currentRent" header="Loyer" sortable>
            <template #body="{ data }">
              <span class="currency-cell">{{ formatCurrency(data.currentRent) }}</span>
            </template>
          </Column>
          <Column field="status" header="Statut" sortable>
            <template #body="{ data }">
              <Tag
                :value="formatStatus(data.status)"
                :severity="getStatusSeverity(data.status)"
                :icon="getStatusIcon(data.status)"
              />
            </template>
          </Column>
          <Column header="Actions" :frozen="true" alignFrozen="right">
            <template #body="{ data }">
              <div class="action-buttons">
                <Button
                  icon="pi pi-eye"
                  class="p-button-rounded p-button-sm p-button-info"
                  @click="viewProperty(data)"
                  v-tooltip.top="'Voir les détails'"
                />
                <Button
                  icon="pi pi-pencil"
                  class="p-button-rounded p-button-sm p-button-warning"
                  @click="editProperty(data)"
                  v-tooltip.top="'Modifier'"
                />
                <Button
                  icon="pi pi-trash"
                  class="p-button-rounded p-button-sm p-button-danger"
                  @click="deleteProperty(data)"
                  v-tooltip.top="'Supprimer'"
                />
              </div>
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>

    <!-- Dialog moderne -->
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import api from '@/services/api'
import Button from 'primevue/button'
import Card from 'primevue/card'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Textarea from 'primevue/textarea'
import Dropdown from 'primevue/dropdown'
import Dialog from 'primevue/dialog'
import Tag from 'primevue/tag'

const router = useRouter()
const toast = useToast()
const confirm = useConfirm()

const properties = ref([])
const loading = ref(false)
const showDialog = ref(false)
const editingProperty = ref(null)
const saving = ref(false)

const filters = reactive({
  search: '',
  type: null,
  status: null
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

// Computed statistics
const availableCount = computed(() => {
  return properties.value.filter(p => p.status === 'disponible').length
})

const rentedCount = computed(() => {
  return properties.value.filter(p => p.status === 'loue').length
})

const totalRevenue = computed(() => {
  return properties.value
    .filter(p => p.status === 'loue')
    .reduce((sum, p) => sum + (parseFloat(p.currentRent) || 0), 0)
})

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
      // Créer une copie sans l'id pour la création
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
  confirm.require({
    message: 'Voulez-vous vraiment supprimer ce bien ?',
    header: 'Confirmation',
    icon: 'pi pi-exclamation-triangle',
    accept: async () => {
      try {
        await api.delete(`/api/properties/${property.id}`)
        toast.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Bien supprimé avec succès',
          life: 3000
        })
        loadProperties()
      } catch (error) {
        toast.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de supprimer le bien',
          life: 3000
        })
      }
    }
  })
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

const getStatusSeverity = (status) => {
  const severityMap = {
    disponible: 'success',
    loue: 'info',
    en_travaux: 'warning',
    vendu: 'danger'
  }
  return severityMap[status] || 'info'
}

const getStatusIcon = (status) => {
  const iconMap = {
    disponible: 'pi-check-circle',
    loue: 'pi-users',
    en_travaux: 'pi-wrench',
    vendu: 'pi-times-circle'
  }
  return iconMap[status] || 'pi-circle'
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
.properties-view {
  padding: 1.5rem;
  max-width: 1600px;
  margin: 0 auto;
}

/* En-tête moderne */
.page-header-modern {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 2rem;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-600) 100%);
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  color: white;
}

.page-title-modern {
  font-size: 2.25rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.subtitle-modern {
  font-size: 1.1rem;
  opacity: 0.95;
  margin: 0;
}

/* Statistiques */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 1.75rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  flex-shrink: 0;
  color: white;
}

.stat-primary .stat-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-available .stat-icon {
  background: linear-gradient(135deg, #10b981 0%, #047857 100%);
}

.stat-rented .stat-icon {
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
}

.stat-revenue .stat-icon {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-color-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 2.25rem;
  font-weight: 700;
  color: var(--text-color);
  line-height: 1;
}

.stat-value-small {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-color);
  line-height: 1;
}

/* Carte moderne */
.modern-card {
  border-radius: 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.modern-card :deep(.p-card-content) {
  padding: 1.5rem;
}

/* Filtres modernes */
.filters-modern {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.search-input {
  flex: 1;
  min-width: 250px;
}

.filter-dropdown {
  min-width: 200px;
}

.dropdown-value {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Table moderne */
.modern-table :deep(.p-datatable-thead > tr > th) {
  background: var(--primary-50);
  color: var(--primary-color);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: 0.875rem;
  padding: 1.25rem 1rem;
  border: none;
}

.modern-table :deep(.p-datatable-tbody > tr) {
  transition: all 0.2s;
}

.modern-table :deep(.p-datatable-tbody > tr:hover) {
  background: var(--primary-50) !important;
  transform: scale(1.005);
}

.modern-table :deep(.p-datatable-tbody > tr > td) {
  padding: 1.25rem 1rem;
  font-size: 1rem;
  border-color: var(--surface-200);
}

.name-cell,
.address-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.name-cell i,
.address-cell i {
  color: var(--primary-color);
  font-size: 1.1rem;
}

.currency-cell {
  font-weight: 700;
  color: var(--green-600);
  font-size: 1.1rem;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
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

.modern-dialog :deep(.p-dialog-header) {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-600) 100%);
  color: white;
  padding: 1.5rem 2rem;
  border-radius: 12px 12px 0 0;
}

.modern-dialog :deep(.p-dialog-title) {
  font-weight: 700;
  font-size: 1.5rem;
}

.modern-dialog :deep(.p-dialog-content) {
  padding: 2rem;
}

.w-full {
  width: 100%;
}

/* Mode sombre */
.dark-mode .stat-card {
  background: #1e293b;
  border-color: #334155;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.dark-mode .stat-label {
  color: #94a3b8;
}

.dark-mode .stat-value,
.dark-mode .stat-value-small {
  color: #f1f5f9;
}

/* Responsive */
@media (max-width: 768px) {
  .properties-view {
    padding: 1rem;
  }

  .page-header-modern {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .page-title-modern {
    font-size: 1.75rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .filters-modern {
    flex-direction: column;
  }

  .search-input {
    min-width: 100%;
  }

  .filter-dropdown {
    width: 100%;
  }

  .p-field-group {
    grid-template-columns: 1fr;
  }
}
</style>
