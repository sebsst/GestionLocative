<template>
  <div class="building-detail">
    <Button
      icon="pi pi-arrow-left"
      label="Retour"
      class="p-button-text"
      @click="$router.back()"
    />

    <div v-if="loading" class="loading">
      <ProgressSpinner />
    </div>

    <div v-else-if="building">
      <div class="page-header">
        <div>
          <h1 class="page-title">{{ building.name }}</h1>
          <p class="subtitle">{{ building.address }}, {{ building.city }}</p>
        </div>
        <div class="header-actions">
          <Button
            label="Ajouter un appartement"
            icon="pi pi-plus"
            @click="showApartmentDialog = true"
          />
        </div>
      </div>

      <!-- Informations générales de l'immeuble -->
      <Card class="mb-4">
        <template #title>Informations de l'immeuble</template>
        <template #content>
          <div class="info-grid">
            <div class="info-item">
              <span class="label">Statut:</span>
              <Tag :value="building.status" :severity="getStatusSeverity(building.status)" />
            </div>
            <div class="info-item">
              <span class="label">Nombre d'appartements:</span>
              <span>{{ apartments.length }}</span>
            </div>
            <div class="info-item">
              <span class="label">Appartements loués:</span>
              <span>{{ apartments.filter(a => a.status === 'loue').length }}</span>
            </div>
            <div class="info-item">
              <span class="label">Appartements disponibles:</span>
              <span>{{ apartments.filter(a => a.status === 'disponible').length }}</span>
            </div>
          </div>
        </template>
      </Card>

      <!-- Liste des appartements -->
      <Card>
        <template #title>Appartements</template>
        <template #content>
          <DataTable
            :value="apartments"
            :loading="loadingApartments"
            responsiveLayout="scroll"
          >
            <Column field="name" header="Nom" sortable></Column>
            <Column field="surface" header="Surface">
              <template #body="{ data }">
                {{ data.surface }} m²
              </template>
            </Column>
            <Column field="rooms" header="Pièces"></Column>
            <Column field="currentRent" header="Loyer">
              <template #body="{ data }">
                {{ formatCurrency(data.currentRent) }}
              </template>
            </Column>
            <Column field="status" header="Statut">
              <template #body="{ data }">
                <Tag :value="data.status" :severity="getStatusSeverity(data.status)" />
              </template>
            </Column>
            <Column header="Occupant actuel">
              <template #body="{ data }">
                <div v-if="data.Leases && data.Leases.length > 0">
                  <div v-for="lease in data.Leases.filter(l => l.status === 'actif')" :key="lease.id">
                    <strong>{{ lease.Tenant.firstName }} {{ lease.Tenant.lastName }}</strong>
                    <div class="occupant-details">
                      <small>Depuis le {{ formatDate(lease.startDate) }}</small>
                      <br>
                      <small>{{ lease.numberOfOccupants }} occupant(s)</small>
                    </div>
                  </div>
                </div>
                <span v-else class="text-gray-500">Vacant</span>
              </template>
            </Column>
            <Column header="Actions">
              <template #body="{ data }">
                <Button
                  icon="pi pi-user-plus"
                  class="p-button-rounded p-button-text p-button-success"
                  @click="openLeaseDialog(data)"
                  v-tooltip.top="'Gérer les occupants'"
                />
                <Button
                  icon="pi pi-eye"
                  class="p-button-rounded p-button-text"
                  @click="viewApartment(data)"
                  v-tooltip.top="'Voir les détails'"
                />
                <Button
                  icon="pi pi-pencil"
                  class="p-button-rounded p-button-text"
                  @click="editApartment(data)"
                  v-tooltip.top="'Modifier'"
                />
              </template>
            </Column>
          </DataTable>
        </template>
      </Card>
    </div>

    <!-- Dialog pour ajouter un appartement -->
    <Dialog
      v-model:visible="showApartmentDialog"
      :header="editingApartment ? 'Modifier l\'appartement' : 'Ajouter un appartement'"
      :modal="true"
      :style="{ width: '600px' }"
    >
      <div class="apartment-form">
        <div class="p-field">
          <label>Nom de l'appartement</label>
          <InputText v-model="apartmentForm.name" placeholder="Ex: Appartement 101" required />
        </div>
        <div class="p-field-group">
          <div class="p-field">
            <label>Surface (m²)</label>
            <InputNumber v-model="apartmentForm.surface" />
          </div>
          <div class="p-field">
            <label>Nombre de pièces</label>
            <InputNumber v-model="apartmentForm.rooms" />
          </div>
        </div>
        <div class="p-field-group">
          <div class="p-field">
            <label>Nombre de chambres</label>
            <InputNumber v-model="apartmentForm.bedrooms" />
          </div>
          <div class="p-field">
            <label>Loyer (€)</label>
            <InputNumber v-model="apartmentForm.currentRent" mode="currency" currency="EUR" />
          </div>
        </div>
        <div class="p-field">
          <label>Description</label>
          <Textarea v-model="apartmentForm.description" rows="3" />
        </div>
      </div>
      <template #footer>
        <Button label="Annuler" @click="showApartmentDialog = false" class="p-button-text" />
        <Button label="Enregistrer" @click="saveApartment" :loading="savingApartment" />
      </template>
    </Dialog>

    <!-- Dialog pour gérer les baux/occupants -->
    <Dialog
      v-model:visible="showLeaseDialog"
      header="Gérer les occupants"
      :modal="true"
      :style="{ width: '700px' }"
    >
      <div v-if="selectedApartment">
        <h3>{{ selectedApartment.name }}</h3>

        <!-- Bail actif -->
        <Card class="mb-3" v-if="currentLease">
          <template #title>
            <div class="flex justify-content-between align-items-center">
              <span>Occupant actuel</span>
              <Button
                label="Terminer le bail"
                icon="pi pi-times"
                class="p-button-sm p-button-danger"
                @click="confirmTerminateLease"
              />
            </div>
          </template>
          <template #content>
            <div class="lease-info">
              <p><strong>Locataire:</strong> {{ currentLease.Tenant.firstName }} {{ currentLease.Tenant.lastName }}</p>
              <p><strong>Date d'arrivée:</strong> {{ formatDate(currentLease.startDate) }}</p>
              <p><strong>Nombre d'occupants:</strong> {{ currentLease.numberOfOccupants }}</p>
              <p><strong>Loyer:</strong> {{ formatCurrency(currentLease.rentAmount) }}</p>
            </div>
          </template>
        </Card>

        <!-- Formulaire nouveau bail -->
        <Card v-else>
          <template #title>Nouveau bail</template>
          <template #content>
            <div class="lease-form">
              <div class="p-field">
                <label>Locataire</label>
                <Dropdown
                  v-model="leaseForm.tenantId"
                  :options="tenants"
                  optionLabel="fullName"
                  optionValue="id"
                  placeholder="Sélectionnez un locataire"
                  :filter="true"
                  required
                />
              </div>
              <div class="p-field-group">
                <div class="p-field">
                  <label>Date d'arrivée</label>
                  <Calendar v-model="leaseForm.startDate" dateFormat="dd/mm/yy" required />
                </div>
                <div class="p-field">
                  <label>Date de fin (optionnel)</label>
                  <Calendar v-model="leaseForm.endDate" dateFormat="dd/mm/yy" showButtonBar />
                </div>
              </div>
              <div class="p-field-group">
                <div class="p-field">
                  <label>Loyer mensuel (€)</label>
                  <InputNumber v-model="leaseForm.rentAmount" mode="currency" currency="EUR" required />
                </div>
                <div class="p-field">
                  <label>Charges (€)</label>
                  <InputNumber v-model="leaseForm.chargesAmount" mode="currency" currency="EUR" />
                </div>
              </div>
              <div class="p-field-group">
                <div class="p-field">
                  <label>Dépôt de garantie (€)</label>
                  <InputNumber v-model="leaseForm.deposit" mode="currency" currency="EUR" />
                </div>
                <div class="p-field">
                  <label>Nombre d'occupants</label>
                  <InputNumber v-model="leaseForm.numberOfOccupants" :min="1" />
                </div>
              </div>
            </div>
          </template>
        </Card>

        <!-- Historique des baux -->
        <Card v-if="pastLeases.length > 0" class="mt-3">
          <template #title>Historique des occupants</template>
          <template #content>
            <DataTable :value="pastLeases">
              <Column field="Tenant.firstName" header="Locataire">
                <template #body="{ data }">
                  {{ data.Tenant.firstName }} {{ data.Tenant.lastName }}
                </template>
              </Column>
              <Column field="startDate" header="Arrivée">
                <template #body="{ data }">
                  {{ formatDate(data.startDate) }}
                </template>
              </Column>
              <Column field="endDate" header="Départ">
                <template #body="{ data }">
                  {{ formatDate(data.endDate) }}
                </template>
              </Column>
              <Column field="numberOfOccupants" header="Occupants"></Column>
            </DataTable>
          </template>
        </Card>
      </div>
      <template #footer>
        <Button label="Annuler" @click="showLeaseDialog = false" class="p-button-text" />
        <Button
          v-if="!currentLease"
          label="Créer le bail"
          @click="createLease"
          :loading="savingLease"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import api from '@/services/api'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Tag from 'primevue/tag'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Textarea from 'primevue/textarea'
import Dropdown from 'primevue/dropdown'
import Calendar from 'primevue/calendar'
import ProgressSpinner from 'primevue/progressspinner'

const route = useRoute()
const toast = useToast()
const confirm = useConfirm()

const building = ref(null)
const apartments = ref([])
const tenants = ref([])
const selectedApartment = ref(null)
const loading = ref(false)
const loadingApartments = ref(false)
const showApartmentDialog = ref(false)
const showLeaseDialog = ref(false)
const editingApartment = ref(null)
const savingApartment = ref(false)
const savingLease = ref(false)

const apartmentForm = reactive({
  name: '',
  type: 'appartement',
  address: '',
  city: '',
  postalCode: '',
  surface: null,
  rooms: null,
  bedrooms: null,
  currentRent: null,
  description: '',
  buildingId: route.params.id,
  inImmeuble: true
})

const leaseForm = reactive({
  propertyId: null,
  tenantId: null,
  startDate: new Date(),
  endDate: null,
  rentAmount: null,
  chargesAmount: 0,
  deposit: null,
  numberOfOccupants: 1,
  status: 'actif'
})

const currentLease = computed(() => {
  if (!selectedApartment.value || !selectedApartment.value.Leases) return null
  return selectedApartment.value.Leases.find(l => l.status === 'actif')
})

const pastLeases = computed(() => {
  if (!selectedApartment.value || !selectedApartment.value.Leases) return []
  return selectedApartment.value.Leases.filter(l => l.status !== 'actif')
})

const loadBuilding = async () => {
  loading.value = true
  try {
    const response = await api.get(`/api/properties/${route.params.id}`)
    building.value = response.data.data

    // Pré-remplir l'adresse du formulaire d'appartement avec celle de l'immeuble
    apartmentForm.address = building.value.address
    apartmentForm.city = building.value.city
    apartmentForm.postalCode = building.value.postalCode

    if (building.value.apartments) {
      apartments.value = building.value.apartments
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: 'Impossible de charger l\'immeuble',
      life: 3000
    })
  } finally {
    loading.value = false
  }
}

const loadTenants = async () => {
  try {
    const response = await api.get('/api/tenants')
    tenants.value = response.data.data.map(t => ({
      ...t,
      fullName: `${t.firstName} ${t.lastName}`
    }))
  } catch (error) {
    console.error('Error loading tenants:', error)
  }
}

const saveApartment = async () => {
  savingApartment.value = true
  try {
    if (editingApartment.value) {
      await api.put(`/api/properties/${editingApartment.value.id}`, apartmentForm)
      toast.add({
        severity: 'success',
        summary: 'Succès',
        detail: 'Appartement modifié avec succès',
        life: 3000
      })
    } else {
      await api.post('/api/properties', apartmentForm)
      toast.add({
        severity: 'success',
        summary: 'Succès',
        detail: 'Appartement ajouté avec succès',
        life: 3000
      })
    }
    showApartmentDialog.value = false
    loadBuilding()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: 'Impossible d\'enregistrer l\'appartement',
      life: 3000
    })
  } finally {
    savingApartment.value = false
  }
}

const openLeaseDialog = async (apartment) => {
  selectedApartment.value = apartment

  // Charger les baux de l'appartement
  try {
    const response = await api.get(`/api/leases?propertyId=${apartment.id}`)
    selectedApartment.value.Leases = response.data.data
  } catch (error) {
    console.error('Error loading leases:', error)
  }

  leaseForm.propertyId = apartment.id
  leaseForm.rentAmount = apartment.currentRent || null
  showLeaseDialog.value = true
}

const createLease = async () => {
  savingLease.value = true
  try {
    await api.post('/api/leases', leaseForm)
    toast.add({
      severity: 'success',
      summary: 'Succès',
      detail: 'Bail créé avec succès',
      life: 3000
    })
    showLeaseDialog.value = false
    loadBuilding()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: error.response?.data?.error?.message || 'Impossible de créer le bail',
      life: 3000
    })
  } finally {
    savingLease.value = false
  }
}

const confirmTerminateLease = () => {
  confirm.require({
    message: 'Voulez-vous vraiment terminer ce bail ?',
    header: 'Confirmation',
    icon: 'pi pi-exclamation-triangle',
    accept: async () => {
      try {
        await api.put(`/api/leases/${currentLease.value.id}/terminate`, {
          endDate: new Date()
        })
        toast.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Bail terminé avec succès',
          life: 3000
        })
        showLeaseDialog.value = false
        loadBuilding()
      } catch (error) {
        toast.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de terminer le bail',
          life: 3000
        })
      }
    }
  })
}

const viewApartment = (apartment) => {
  // Navigate to apartment detail
}

const editApartment = (apartment) => {
  editingApartment.value = apartment
  Object.assign(apartmentForm, apartment)
  showApartmentDialog.value = true
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
  loadBuilding()
  loadTenants()
})
</script>

<style scoped>
.loading {
  display: flex;
  justify-content: center;
  padding: 3rem;
}

.subtitle {
  color: var(--text-color-secondary);
  margin-top: 0.5rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-item .label {
  font-weight: 600;
  color: var(--text-color-secondary);
  font-size: 0.9rem;
}

.apartment-form,
.lease-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.p-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.p-field-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.p-field label {
  font-weight: 600;
}

.occupant-details {
  margin-top: 0.25rem;
  color: var(--text-color-secondary);
}

.lease-info p {
  margin: 0.5rem 0;
}

.mb-3 {
  margin-bottom: 1rem;
}

.mb-4 {
  margin-bottom: 2rem;
}

.mt-3 {
  margin-top: 1rem;
}
</style>
