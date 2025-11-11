<template>
  <div class="modern-view">
    <!-- En-tête moderne -->
    <div class="page-header-modern">
      <div>
        <h1 class="page-title-modern">Gestion des charges</h1>
        <p class="subtitle-modern">Suivi et gestion de vos charges</p>
      </div>
      <Button
        label="Nouvelle charge"
        icon="pi pi-plus"
        @click="showDialog = true"
        class="p-button-rounded p-button-lg p-button-success"
      />
    </div>

    <!-- Cartes de statistiques -->
    <div class="stats-grid">
      <div class="stat-card stat-total">
        <div class="stat-icon">
          <i class="pi pi-chart-bar"></i>
        </div>
        <div class="stat-content">
          <div class="stat-label">Total charges</div>
          <div class="stat-value">{{ filteredCharges.length }}</div>
        </div>
      </div>

      <div class="stat-card stat-primary">
        <div class="stat-icon">
          <i class="pi pi-euro"></i>
        </div>
        <div class="stat-content">
          <div class="stat-label">Montant total</div>
          <div class="stat-value-currency">{{ formatCurrency(totalAmount) }}</div>
        </div>
      </div>

      <div class="stat-card stat-info">
        <div class="stat-icon">
          <i class="pi pi-building"></i>
        </div>
        <div class="stat-content">
          <div class="stat-label">Charges communes</div>
          <div class="stat-value">{{ commonChargesCount }}</div>
        </div>
      </div>

      <div class="stat-card stat-success">
        <div class="stat-icon">
          <i class="pi pi-home"></i>
        </div>
        <div class="stat-content">
          <div class="stat-label">Charges individuelles</div>
          <div class="stat-value">{{ individualChargesCount }}</div>
        </div>
      </div>
    </div>

    <Dialog
      v-model:visible="showDialog"
      :modal="true"
      header="Nouvelle charge"
      :style="{ width: '500px' }"
      :closable="false"
      class="modern-dialog"
    >
      <div class="modern-form">
        <div class="p-field">
          <label>Bien</label>
          <Dropdown
            v-model="chargeForm.propertyId"
            :options="filteredPropertiesForForm"
            optionLabel="name"
            optionValue="id"
            :placeholder="chargeForm.isCommon ? 'Sélectionnez un immeuble' : 'Sélectionnez un bien'"
            class="w-full"
            required
          />
        </div>
        <div class="p-field">
          <label>Type de charge</label>
          <Dropdown
            v-model="chargeForm.type"
            :options="chargeTypes"
            optionLabel="label"
            optionValue="value"
            placeholder="Sélectionnez un type"
            class="w-full"
            required
          />
        </div>
        <div class="p-field">
          <label>Libellé</label>
          <InputText
            v-model="chargeForm.name"
            placeholder="Libellé de la charge"
            class="w-full"
            required
          />
        </div>
        <div class="p-field">
          <label>Montant</label>
          <InputNumber
            v-model="chargeForm.amount"
            mode="currency"
            currency="EUR"
            locale="fr-FR"
            class="w-full"
            required
          />
        </div>
        <div class="p-field">
          <label>Fréquence</label>
          <Dropdown
            v-model="chargeForm.frequency"
            :options="frequencies"
            optionLabel="label"
            optionValue="value"
            placeholder="Sélectionnez une fréquence"
            class="w-full"
            required
          />
        </div>
        <div class="p-field">
          <label>Date</label>
          <Calendar
            v-model="chargeForm.date"
            dateFormat="dd/mm/yy"
            class="w-full"
            required
          />
        </div>
        <div class="p-field-checkbox">
          <Checkbox
            v-model="chargeForm.isCommon"
            :binary="true"
            @change="onChargeTypeChange"
          />
          <label class="ml-2">Charge commune</label>
        </div>
        <div v-if="chargeForm.isCommon" class="p-field">
          <label>Méthode de distribution</label>
          <Dropdown
            v-model="chargeForm.distributionMethod"
            :options="distributionMethods"
            optionLabel="label"
            optionValue="value"
            placeholder="Sélectionnez une méthode"
            class="w-full"
            required
          />
        </div>
      </div>
      <template #footer>
        <Button
          label="Annuler"
          icon="pi pi-times"
          @click="showDialog = false"
          class="p-button-text"
        />
        <Button
          label="Créer"
          icon="pi pi-check"
          @click="createCharge"
          :loading="saving"
        />
      </template>
    </Dialog>

    <Card class="modern-card">
      <template #content>
        <!-- Filtres -->
        <div class="filters-modern">
          <div class="filter-group">
            <label>Filtrer par bien</label>
            <Dropdown
              v-model="filterPropertyId"
              :options="propertiesFilter"
              optionLabel="name"
              optionValue="id"
              placeholder="Tous les biens"
              class="filter-dropdown"
              :showClear="true"
            />
          </div>
          <div class="filter-group">
            <label>Filtrer par année</label>
            <Dropdown
              v-model="filterYear"
              :options="yearOptions"
              placeholder="Toutes les années"
              class="filter-dropdown"
              :showClear="true"
            />
          </div>
        </div>

        <DataTable
          :value="filteredCharges"
          :loading="loading"
          :paginator="true"
          :rows="10"
          responsiveLayout="scroll"
          class="modern-table"
          stripedRows
        >
          <Column field="Property.name" header="Bien"></Column>
          <Column field="type" header="Type">
            <template #body="{ data }">
              <Tag :value="data.type" :severity="getChargeTypeSeverity(data.type)" />
            </template>
          </Column>
          <Column field="name" header="Libellé"></Column>
          <Column field="amount" header="Montant">
            <template #body="{ data }">
              {{ formatCurrency(data.amount) }}
            </template>
          </Column>
          <Column field="frequency" header="Fréquence">
            <template #body="{ data }">
              <Tag :value="data.frequency" severity="info" />
            </template>
          </Column>
          <Column field="date" header="Date">
            <template #body="{ data }">
              {{ formatDate(data.date) }}
            </template>
          </Column>
          <Column field="isCommon" header="Commune">
            <template #body="{ data }">
              <i :class="data.isCommon ? 'pi pi-check text-green-500' : 'pi pi-times text-red-500'"></i>
            </template>
          </Column>
          <Column header="Actions">
            <template #body="{ data }">
              <Button
                icon="pi pi-pencil"
                class="p-button-rounded p-button-text"
                @click="editCharge(data)"
              />
              <Button
                icon="pi pi-trash"
                class="p-button-rounded p-button-text p-button-danger"
                @click="deleteCharge(data)"
              />
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import api from '@/services/api'
import Button from 'primevue/button'
import Card from 'primevue/card'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Dropdown from 'primevue/dropdown'
import Calendar from 'primevue/calendar'
import Checkbox from 'primevue/checkbox'

const toast = useToast()
const confirm = useConfirm()

const charges = ref([])
const properties = ref([])
const loading = ref(false)
const showDialog = ref(false)
const saving = ref(false)
const filterPropertyId = ref(null)
const filterYear = ref(null)

const chargeForm = ref({
  propertyId: null,
  type: null,
  name: '',
  amount: null,
  frequency: null,
  date: new Date(),
  isCommon: false,
  distributionMethod: null
})

const chargeTypes = [
  { label: 'Copropriété', value: 'copropriete' },
  { label: 'Électricité', value: 'electricite' },
  { label: 'Eau', value: 'eau' },
  { label: 'Ordures ménagères', value: 'ordures' },
  { label: 'Jardin', value: 'jardin' },
  { label: 'Entretien', value: 'entretien' },
  { label: 'Assurance', value: 'assurance' },
  { label: 'Chauffage', value: 'chauffage' },
  { label: 'Taxe foncière', value: 'taxe_fonciere' },
  { label: 'Autre', value: 'autre' }
]

const frequencies = [
  { label: 'Mensuel', value: 'mensuel' },
  { label: 'Trimestriel', value: 'trimestriel' },
  { label: 'Annuel', value: 'annuel' },
  { label: 'Ponctuel', value: 'ponctuel' }
]

const distributionMethods = [
  { label: 'Par surface', value: 'surface' },
  { label: "Par nombre d'occupants", value: 'occupants' },
  { label: 'Par appartement', value: 'appartement' },
  { label: 'Personnalisé', value: 'personnalise' }
]

// Propriétés pour le formulaire (selon si charge commune ou non)
const filteredPropertiesForForm = computed(() => {
  if (chargeForm.value.isCommon) {
    return properties.value.filter(property => property.type === 'immeuble')
  }
  return properties.value
})

// Propriétés pour le filtre (toutes)
const propertiesFilter = computed(() => {
  return properties.value
})

// Options d'années disponibles
const yearOptions = computed(() => {
  const years = new Set()
  charges.value.forEach(charge => {
    const year = new Date(charge.date).getFullYear()
    years.add(year)
  })
  return Array.from(years).sort((a, b) => b - a)
})

// Charges filtrées
const filteredCharges = computed(() => {
  let result = charges.value

  // Filtrer par bien
  if (filterPropertyId.value) {
    result = result.filter(charge => charge.propertyId === filterPropertyId.value)
  }

  // Filtrer par année
  if (filterYear.value) {
    result = result.filter(charge => {
      const chargeYear = new Date(charge.date).getFullYear()
      return chargeYear === filterYear.value
    })
  }

  return result
})

// Statistiques calculées
const totalAmount = computed(() => {
  return filteredCharges.value.reduce((sum, charge) => sum + (parseFloat(charge.amount) || 0), 0)
})

const commonChargesCount = computed(() => {
  return filteredCharges.value.filter(charge => charge.isCommon).length
})

const individualChargesCount = computed(() => {
  return filteredCharges.value.filter(charge => !charge.isCommon).length
})

const loadProperties = async () => {
  try {
    const response = await api.get('/api/properties')
    properties.value = response.data.data
  } catch (error) {
    console.error('Erreur lors du chargement des biens:', error)
  }
}

const onChargeTypeChange = () => {
  chargeForm.value.propertyId = null
}

const resetForm = () => {
  chargeForm.value = {
    propertyId: null,
    type: null,
    name: '',
    amount: null,
    frequency: null,
    date: new Date(),
    isCommon: false,
    distributionMethod: null
  }
}

const createCharge = async () => {
  saving.value = true
  try {
    await api.post('/api/charges', chargeForm.value)
    toast.add({
      severity: 'success',
      summary: 'Succès',
      detail: 'Charge créée avec succès',
      life: 3000
    })
    showDialog.value = false
    resetForm()
    loadCharges()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: error.response?.data?.error?.message || 'Impossible de créer la charge',
      life: 3000
    })
  } finally {
    saving.value = false
  }
}

const loadCharges = async () => {
  loading.value = true
  try {
    const response = await api.get('/api/charges')
    charges.value = response.data.data
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: 'Impossible de charger les charges',
      life: 3000
    })
  } finally {
    loading.value = false
  }
}

const editCharge = (charge) => {
  // Edit functionality
}

const deleteCharge = (charge) => {
  confirm.require({
    message: `Voulez-vous vraiment supprimer la charge "${charge.name}" ?`,
    header: 'Confirmation de suppression',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Oui, supprimer',
    rejectLabel: 'Annuler',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await api.delete(`/api/charges/${charge.id}`)
        toast.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Charge supprimée avec succès',
          life: 3000
        })
        loadCharges()
      } catch (error) {
        toast.add({
          severity: 'error',
          summary: 'Erreur',
          detail: error.response?.data?.error?.message || 'Impossible de supprimer la charge',
          life: 3000
        })
      }
    }
  })
}

const getChargeTypeSeverity = (type) => {
  const severityMap = {
    copropriete: 'info',
    electricite: 'warning',
    eau: 'info',
    ordures: 'secondary',
    jardin: 'success',
    entretien: 'info',
    assurance: 'danger',
    chauffage: 'warning',
    taxe_fonciere: 'danger',
    autre: 'secondary'
  }
  return severityMap[type] || 'info'
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(value || 0)
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('fr-FR')
}

onMounted(() => {
  loadCharges()
  loadProperties()
})
</script>

<style scoped>
/* Styles spécifiques uniquement - les styles globaux sont dans modern-views.css */

.p-field-checkbox {
  display: flex;
  align-items: center;
  padding: 1rem 0;
  gap: 0.5rem;
}

:deep(.p-tag) {
  text-transform: capitalize;
}

.stat-value-currency {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-color);
  line-height: 1;
}

/* Filtres modernes */
.filters-modern {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: var(--surface-50);
  border-radius: 12px;
  border: 1px solid var(--surface-200);
}

.filter-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.filter-group label {
  font-weight: 600;
  color: var(--text-color-secondary);
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.filter-dropdown {
  width: 100%;
}

@media (max-width: 768px) {
  .filters-modern {
    flex-direction: column;
  }
}
</style>
