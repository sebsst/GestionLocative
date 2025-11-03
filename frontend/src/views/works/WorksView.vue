<template>
  <div class="modern-view">
    <!-- En-tête moderne -->
    <div class="page-header-modern">
      <div>
        <h1 class="page-title-modern">Gestion des travaux</h1>
        <p class="subtitle-modern">Suivi et gestion de vos interventions</p>
      </div>
      <Button
        label="Nouveaux travaux"
        icon="pi pi-plus"
        @click="showDialog = true"
        class="p-button-rounded p-button-lg p-button-success"
      />
    </div>

    <!-- Cartes de statistiques -->
    <div class="stats-grid">
      <div class="stat-card stat-total">
        <div class="stat-icon">
          <i class="pi pi-wrench"></i>
        </div>
        <div class="stat-content">
          <div class="stat-label">Total travaux</div>
          <div class="stat-value">{{ works.length }}</div>
        </div>
      </div>

      <div class="stat-card stat-pending">
        <div class="stat-icon">
          <i class="pi pi-clock"></i>
        </div>
        <div class="stat-content">
          <div class="stat-label">Prévus</div>
          <div class="stat-value">{{ pendingCount }}</div>
        </div>
      </div>

      <div class="stat-card stat-progress">
        <div class="stat-icon">
          <i class="pi pi-cog"></i>
        </div>
        <div class="stat-content">
          <div class="stat-label">En cours</div>
          <div class="stat-value">{{ inProgressCount }}</div>
        </div>
      </div>

      <div class="stat-card stat-done">
        <div class="stat-icon">
          <i class="pi pi-check-circle"></i>
        </div>
        <div class="stat-content">
          <div class="stat-label">Terminés</div>
          <div class="stat-value">{{ completedCount }}</div>
        </div>
      </div>
    </div>

    <Dialog
      v-model:visible="showDialog"
      :modal="true"
      header="Nouveaux travaux"
      :style="{ width: '500px' }"
      :closable="false"
      class="modern-dialog"
    >
      <div class="modern-form">
        <div class="p-field">
          <label>Bien</label>
          <Dropdown
            v-model="workForm.propertyId"
            :options="properties"
            optionLabel="name"
            optionValue="id"
            placeholder="Sélectionnez un bien"
            class="w-full"
            required
          />
        </div>
        <div class="p-field">
          <label>Type de travaux</label>
          <Dropdown
            v-model="workForm.type"
            :options="workTypes"
            optionLabel="label"
            optionValue="value"
            placeholder="Sélectionnez un type"
            class="w-full"
            required
          />
        </div>
        <div class="p-field">
          <label>Nature des travaux</label>
          <InputText
            v-model="workForm.nature"
            placeholder="Nature des travaux"
            class="w-full"
            required
          />
        </div>
        <div class="p-field">
          <label>Description</label>
          <Textarea
            v-model="workForm.description"
            rows="3"
            placeholder="Description détaillée des travaux"
            class="w-full"
          />
        </div>
        <div class="p-field">
          <label>Artisan</label>
          <div style="display: flex; gap: 0.5rem;">
            <Dropdown
              v-model="workForm.artisanId"
              :options="artisans"
              optionLabel="name"
              optionValue="id"
              placeholder="Sélectionnez un artisan"
              style="flex: 1;"
              :filter="true"
            />
            <Button
              icon="pi pi-plus"
              @click="showArtisanDialog = true"
              v-tooltip.top="'Créer un nouvel artisan'"
              class="p-button-success"
            />
          </div>
        </div>
        <div class="p-field">
          <label>Montant estimé</label>
          <InputNumber
            v-model="workForm.estimatedAmount"
            mode="currency"
            currency="EUR"
            locale="fr-FR"
            class="w-full"
          />
        </div>
        <div class="p-field">
          <label>Date prévue</label>
          <Calendar
            v-model="workForm.estimatedDate"
            dateFormat="dd/mm/yy"
            class="w-full"
          />
        </div>
        <div class="p-field-checkbox">
          <Checkbox
            v-model="workForm.isCommon"
            :binary="true"
          />
          <label class="ml-2">Travaux communs</label>
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
          @click="createWork"
          :loading="saving"
        />
      </template>
    </Dialog>

    <!-- Dialog Créer un artisan -->
    <Dialog
      v-model:visible="showArtisanDialog"
      :modal="true"
      header="Créer un nouvel artisan"
      :style="{ width: '600px' }"
      :closable="false"
      class="modern-dialog"
    >
      <div class="modern-form">
        <div class="p-field">
          <label>Nom *</label>
          <InputText
            v-model="artisanForm.name"
            placeholder="Nom de l'artisan"
            class="w-full"
            required
          />
        </div>
        <div class="p-field">
          <label>Entreprise</label>
          <InputText
            v-model="artisanForm.company"
            placeholder="Nom de l'entreprise"
            class="w-full"
          />
        </div>
        <div class="p-field">
          <label>Spécialité</label>
          <InputText
            v-model="artisanForm.specialty"
            placeholder="Ex: Plomberie, Électricité, Peinture..."
            class="w-full"
          />
        </div>
        <div class="p-field-group" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div class="p-field">
            <label>Téléphone</label>
            <InputText
              v-model="artisanForm.phone"
              placeholder="Téléphone"
              class="w-full"
            />
          </div>
          <div class="p-field">
            <label>Email</label>
            <InputText
              v-model="artisanForm.email"
              type="email"
              placeholder="Email"
              class="w-full"
            />
          </div>
        </div>
        <div class="p-field">
          <label>Adresse</label>
          <InputText
            v-model="artisanForm.address"
            placeholder="Adresse"
            class="w-full"
          />
        </div>
        <div class="p-field-group" style="display: grid; grid-template-columns: 2fr 1fr; gap: 1rem;">
          <div class="p-field">
            <label>Ville</label>
            <InputText
              v-model="artisanForm.city"
              placeholder="Ville"
              class="w-full"
            />
          </div>
          <div class="p-field">
            <label>Code postal</label>
            <InputText
              v-model="artisanForm.postalCode"
              placeholder="Code postal"
              class="w-full"
            />
          </div>
        </div>
        <div class="p-field">
          <label>SIRET</label>
          <InputText
            v-model="artisanForm.siret"
            placeholder="Numéro SIRET"
            class="w-full"
          />
        </div>
        <div class="p-field">
          <label>Notes</label>
          <Textarea
            v-model="artisanForm.notes"
            rows="3"
            placeholder="Notes supplémentaires"
            class="w-full"
          />
        </div>
      </div>
      <template #footer>
        <Button
          label="Annuler"
          icon="pi pi-times"
          @click="showArtisanDialog = false"
          class="p-button-text"
        />
        <Button
          label="Créer"
          icon="pi pi-check"
          @click="createArtisan"
          :loading="savingArtisan"
        />
      </template>
    </Dialog>

    <Card class="modern-card">
      <template #content>
        <DataTable
          :value="works"
          :loading="loading"
          :paginator="true"
          :rows="10"
          responsiveLayout="scroll"
          class="modern-table"
          stripedRows
        >
          <Column field="Property.name" header="Bien"></Column>
          <Column field="nature" header="Nature"></Column>
          <Column field="type" header="Type">
            <template #body="{ data }">
              <Tag :value="data.type" :severity="getWorkTypeSeverity(data.type)" />
            </template>
          </Column>
          <Column field="Artisan.name" header="Artisan"></Column>
          <Column field="amount" header="Montant">
            <template #body="{ data }">
              {{ formatCurrency(data.amount || data.estimatedAmount) }}
            </template>
          </Column>
          <Column field="workDate" header="Date">
            <template #body="{ data }">
              {{ formatDate(data.workDate || data.estimatedDate) }}
            </template>
          </Column>
          <Column field="status" header="Statut">
            <template #body="{ data }">
              <Tag
                :value="data.status"
                :severity="getStatusSeverity(data.status)"
              />
            </template>
          </Column>
          <Column header="Actions">
            <template #body="{ data }">
              <Button
                icon="pi pi-pencil"
                class="p-button-rounded p-button-text"
                @click="editWork(data)"
              />
              <Button
                icon="pi pi-trash"
                class="p-button-rounded p-button-text p-button-danger"
                @click="deleteWork(data)"
              />
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
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
import Textarea from 'primevue/textarea'

const toast = useToast()
const confirm = useConfirm()

const works = ref([])
const properties = ref([])
const artisans = ref([])
const loading = ref(false)
const showDialog = ref(false)
const saving = ref(false)
const showArtisanDialog = ref(false)
const savingArtisan = ref(false)

// Computed properties for statistics
const pendingCount = computed(() => {
  return works.value.filter(w => w.status === 'prevu').length
})

const inProgressCount = computed(() => {
  return works.value.filter(w => w.status === 'en_cours').length
})

const completedCount = computed(() => {
  return works.value.filter(w => w.status === 'termine' || w.status === 'paye').length
})

const workForm = ref({
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

const artisanForm = ref({
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

const resetForm = () => {
  workForm.value = {
    propertyId: null,
    type: null,
    nature: '',
    description: '',
    artisanId: null,
    estimatedAmount: null,
    estimatedDate: null,
    isCommon: false,
    status: 'prevu'
  }
}

const loadWorks = async () => {
  loading.value = true
  try {
    const response = await api.get('/api/works')
    works.value = response.data.data
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: 'Impossible de charger les travaux',
      life: 3000
    })
  } finally {
    loading.value = false
  }
}

const loadProperties = async () => {
  try {
    const response = await api.get('/api/properties')
    properties.value = response.data.data
  } catch (error) {
    console.error('Erreur lors du chargement des biens:', error)
  }
}

const loadArtisans = async () => {
  try {
    const response = await api.get('/api/works/artisans/list')
    artisans.value = response.data.data
  } catch (error) {
    console.error('Erreur lors du chargement des artisans:', error)
  }
}

const createWork = async () => {
  saving.value = true
  try {
    await api.post('/api/works', workForm.value)
    toast.add({
      severity: 'success',
      summary: 'Succès',
      detail: 'Travaux créés avec succès',
      life: 3000
    })
    showDialog.value = false
    resetForm()
    loadWorks()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: error.response?.data?.error?.message || 'Impossible de créer les travaux',
      life: 3000
    })
  } finally {
    saving.value = false
  }
}

const resetArtisanForm = () => {
  artisanForm.value = {
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
  }
}

const createArtisan = async () => {
  if (!artisanForm.value.name) {
    toast.add({
      severity: 'warn',
      summary: 'Attention',
      detail: 'Le nom de l\'artisan est obligatoire',
      life: 3000
    })
    return
  }

  savingArtisan.value = true
  try {
    const response = await api.post('/api/works/artisans', artisanForm.value)
    toast.add({
      severity: 'success',
      summary: 'Succès',
      detail: 'Artisan créé avec succès',
      life: 3000
    })

    // Fermer le dialogue
    showArtisanDialog.value = false

    // Réinitialiser le formulaire
    resetArtisanForm()

    // Recharger la liste des artisans
    await loadArtisans()

    // Sélectionner automatiquement le nouvel artisan dans le formulaire de travaux
    workForm.value.artisanId = response.data.data.id
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: error.response?.data?.error?.message || 'Impossible de créer l\'artisan',
      life: 3000
    })
  } finally {
    savingArtisan.value = false
  }
}

const editWork = (work) => {
  // À implémenter
}

const deleteWork = (work) => {
  confirm.require({
    message: 'Voulez-vous vraiment supprimer ces travaux ?',
    header: 'Confirmation de suppression',
    icon: 'pi pi-exclamation-triangle',
    accept: async () => {
      try {
        await api.delete(`/api/works/${work.id}`)
        toast.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Travaux supprimés avec succès',
          life: 3000
        })
        loadWorks()
      } catch (error) {
        toast.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de supprimer les travaux',
          life: 3000
        })
      }
    }
  })
}

const getStatusSeverity = (status) => {
  const severityMap = {
    prevu: 'info',
    en_cours: 'warning',
    termine: 'success',
    paye: 'success',
    annule: 'danger'
  }
  return severityMap[status] || 'info'
}

const getWorkTypeSeverity = (type) => {
  const severityMap = {
    reparation: 'danger',
    renovation: 'warning',
    entretien: 'info',
    amelioration: 'success'
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
  return date ? new Date(date).toLocaleDateString('fr-FR') : '-'
}

onMounted(() => {
  loadWorks()
  loadProperties()
  loadArtisans()
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
</style>