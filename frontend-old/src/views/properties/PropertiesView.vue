<template>
  <div class="modern-view">
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
          <div class="search-input">
            <label>Recherche</label>
            <span class="p-input-icon-left">
              <i class="pi pi-search" />
              <InputText
                v-model="filters.search"
                placeholder="Nom du bien ou adresse..."
                @input="loadProperties"
              />
            </span>
          </div>
          <div class="filter-dropdown">
            <label>Type de bien</label>
            <Dropdown
              v-model="filters.type"
              :options="propertyTypes"
              optionLabel="label"
              optionValue="value"
              placeholder="Tous les types"
              @change="loadProperties"
              showClear
            />
          </div>
          <div class="filter-dropdown">
            <label>Statut</label>
            <Dropdown
              v-model="filters.status"
              :options="statusOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Tous les statuts"
              @change="loadProperties"
              showClear
            />
          </div>
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
              <span class="currency-cell success">{{ formatCurrency(data.currentRent) }}</span>
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
                  class="p-button-rounded p-button-text p-button-info"
                  @click="viewProperty(data)"
                  v-tooltip.top="'Voir les détails'"
                />
                <Button
                  icon="pi pi-pencil"
                  class="p-button-rounded p-button-text p-button-warning"
                  @click="editProperty(data)"
                  v-tooltip.top="'Modifier'"
                />
                <Button
                  icon="pi pi-trash"
                  class="p-button-rounded p-button-text p-button-danger"
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
      <div class="modern-form" style="max-height: 60vh; overflow-y: auto;">
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
