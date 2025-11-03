<template>
  <div class="modern-view">
    <!-- En-tête moderne -->
    <div class="page-header-modern">
      <div>
        <h1 class="page-title-modern">Gestion des loyers</h1>
        <p class="subtitle-modern">Suivi des paiements et génération des loyers</p>
      </div>
      <Button
        label="Générer les loyers du mois"
        icon="pi pi-plus"
        @click="showGenerateDialog = true"
        class="p-button-rounded p-button-lg p-button-success"
      />
    </div>

    <!-- Cartes de statistiques -->
    <div class="stats-grid">
      <div class="stat-card stat-primary">
        <div class="stat-icon">
          <i class="pi pi-money-bill"></i>
        </div>
        <div class="stat-content">
          <div class="stat-label">Total loyers</div>
          <div class="stat-value">{{ rents.length }}</div>
        </div>
      </div>

      <div class="stat-card stat-warning">
        <div class="stat-icon">
          <i class="pi pi-clock"></i>
        </div>
        <div class="stat-content">
          <div class="stat-label">En attente</div>
          <div class="stat-value">{{ pendingCount }}</div>
        </div>
      </div>

      <div class="stat-card stat-danger">
        <div class="stat-icon">
          <i class="pi pi-exclamation-triangle"></i>
        </div>
        <div class="stat-content">
          <div class="stat-label">En retard</div>
          <div class="stat-value">{{ lateCount }}</div>
        </div>
      </div>

      <div class="stat-card stat-success">
        <div class="stat-icon">
          <i class="pi pi-check-circle"></i>
        </div>
        <div class="stat-content">
          <div class="stat-label">Payés</div>
          <div class="stat-value">{{ paidCount }}</div>
        </div>
      </div>

      <div class="stat-card stat-revenue">
        <div class="stat-icon">
          <i class="pi pi-euro"></i>
        </div>
        <div class="stat-content">
          <div class="stat-label">Montant perçu</div>
          <div class="stat-value-small">{{ formatCurrency(totalPaidAmount) }}</div>
        </div>
      </div>

      <div class="stat-card stat-info">
        <div class="stat-icon">
          <i class="pi pi-wallet"></i>
        </div>
        <div class="stat-content">
          <div class="stat-label">Montant attendu</div>
          <div class="stat-value-small">{{ formatCurrency(totalExpectedAmount) }}</div>
        </div>
      </div>
    </div>

    <Card class="modern-card">
      <template #content>
        <div class="filters-modern">
          <Dropdown
            v-model="filters.year"
            :options="years"
            placeholder="Année"
            @change="loadRents"
            class="filter-dropdown"
          >
            <template #value="slotProps">
              <div v-if="slotProps.value" class="dropdown-value">
                <i class="pi pi-calendar"></i>
                <span>{{ slotProps.value }}</span>
              </div>
              <span v-else>{{ slotProps.placeholder }}</span>
            </template>
          </Dropdown>
          <Dropdown
            v-model="filters.month"
            :options="months"
            optionLabel="label"
            optionValue="value"
            placeholder="Mois"
            @change="loadRents"
            showClear
            class="filter-dropdown"
          >
            <template #value="slotProps">
              <div v-if="slotProps.value" class="dropdown-value">
                <i class="pi pi-calendar"></i>
                <span>{{ getMonthName(slotProps.value) }}</span>
              </div>
              <span v-else>{{ slotProps.placeholder }}</span>
            </template>
          </Dropdown>
          <Dropdown
            v-model="filters.status"
            :options="statusOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Statut"
            @change="loadRents"
            showClear
            class="filter-dropdown"
          >
            <template #value="slotProps">
              <div v-if="slotProps.value" class="dropdown-value">
                <i class="pi pi-filter"></i>
                <span>{{ statusOptions.find(s => s.value === slotProps.value)?.label }}</span>
              </div>
              <span v-else>{{ slotProps.placeholder }}</span>
            </template>
          </Dropdown>
        </div>

        <DataTable
          :value="rents"
          :loading="loading"
          :paginator="true"
          :rows="10"
          responsiveLayout="scroll"
          class="modern-table"
          stripedRows
        >
          <Column field="Lease.Tenant.firstName" header="Locataire">
            <template #body="{ data }">
              {{ data.Lease.Tenant.firstName }} {{ data.Lease.Tenant.lastName }}
            </template>
          </Column>
          <Column field="Lease.Property.name" header="Bien"></Column>
          <Column field="month" header="Période">
            <template #body="{ data }">
              {{ getMonthName(data.month) }} {{ data.year }}
            </template>
          </Column>
          <Column field="expectedAmount" header="Montant attendu">
            <template #body="{ data }">
              {{ formatCurrency(data.expectedAmount) }}
            </template>
          </Column>
          <Column field="paidAmount" header="Montant payé">
            <template #body="{ data }">
              {{ formatCurrency(data.paidAmount) }}
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
                icon="pi pi-check"
                class="p-button-rounded p-button-text p-button-success"
                @click="markAsPaid(data)"
                v-tooltip.top="'Marquer comme payé'"
                v-if="data.status !== 'paye'"
              />
              <Button
                icon="pi pi-envelope"
                class="p-button-rounded p-button-text"
                @click="sendReminder(data)"
                v-tooltip.top="'Envoyer un rappel'"
              />
              <Button
                icon="pi pi-download"
                class="p-button-rounded p-button-text"
                @click="downloadReminder(data)"
                v-tooltip.top="'Télécharger le rappel'"
              />
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>

    <Dialog
      v-model:visible="showGenerateDialog"
      header="Générer les loyers"
      :modal="true"
      :style="{ width: '400px' }"
    >
      <div class="generate-form">
        <div class="p-field">
          <label>Mois</label>
          <Dropdown
            v-model="generateForm.month"
            :options="months"
            optionLabel="label"
            optionValue="value"
            required
          />
        </div>
        <div class="p-field">
          <label>Année</label>
          <Dropdown
            v-model="generateForm.year"
            :options="years"
            required
          />
        </div>
      </div>
      <template #footer>
        <Button label="Annuler" @click="showGenerateDialog = false" class="p-button-text" />
        <Button label="Générer" @click="generateRents" :loading="generating" />
      </template>
    </Dialog>

    <Dialog
      v-model:visible="showPaymentDialog"
      header="Enregistrer un paiement"
      :modal="true"
      :style="{ width: '400px' }"
    >
      <div class="payment-form">
        <div class="p-field">
          <label>Montant payé</label>
          <InputNumber v-model="paymentForm.paidAmount" mode="currency" currency="EUR" required />
        </div>
        <div class="p-field">
          <label>Date de paiement</label>
          <Calendar v-model="paymentForm.paymentDate" dateFormat="dd/mm/yy" required />
        </div>
        <div class="p-field">
          <label>Moyen de paiement</label>
          <Dropdown
            v-model="paymentForm.paymentMethod"
            :options="paymentMethods"
            optionLabel="label"
            optionValue="value"
            required
          />
        </div>
      </div>
      <template #footer>
        <Button label="Annuler" @click="showPaymentDialog = false" class="p-button-text" />
        <Button label="Enregistrer" @click="savePayment" :loading="saving" />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useToast } from 'primevue/usetoast'
import api from '@/services/api'
import Button from 'primevue/button'
import Card from 'primevue/card'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dropdown from 'primevue/dropdown'
import Dialog from 'primevue/dialog'
import Tag from 'primevue/tag'
import InputNumber from 'primevue/inputnumber'
import Calendar from 'primevue/calendar'

const toast = useToast()

const rents = ref([])
const loading = ref(false)
const showGenerateDialog = ref(false)
const showPaymentDialog = ref(false)
const generating = ref(false)
const saving = ref(false)
const selectedRent = ref(null)

const filters = reactive({
  year: new Date().getFullYear(),
  month: null,
  status: null
})

const generateForm = reactive({
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear()
})

const paymentForm = reactive({
  paidAmount: 0,
  paymentDate: new Date(),
  paymentMethod: 'virement'
})

const years = computed(() => {
  const currentYear = new Date().getFullYear()
  return Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)
})

const months = [
  { label: 'Janvier', value: 1 },
  { label: 'Février', value: 2 },
  { label: 'Mars', value: 3 },
  { label: 'Avril', value: 4 },
  { label: 'Mai', value: 5 },
  { label: 'Juin', value: 6 },
  { label: 'Juillet', value: 7 },
  { label: 'Août', value: 8 },
  { label: 'Septembre', value: 9 },
  { label: 'Octobre', value: 10 },
  { label: 'Novembre', value: 11 },
  { label: 'Décembre', value: 12 }
]

const statusOptions = [
  { label: 'En attente', value: 'en_attente' },
  { label: 'Payé', value: 'paye' },
  { label: 'Partiel', value: 'partiel' },
  { label: 'En retard', value: 'en_retard' }
]

const paymentMethods = [
  { label: 'Virement', value: 'virement' },
  { label: 'Chèque', value: 'cheque' },
  { label: 'Espèces', value: 'especes' },
  { label: 'Prélèvement', value: 'prelevement' }
]

const loadRents = async () => {
  loading.value = true
  try {
    const params = {}
    if (filters.year) params.year = filters.year
    if (filters.month) params.month = filters.month
    if (filters.status) params.status = filters.status

    const response = await api.get('/api/rents', { params })
    rents.value = response.data.data
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: 'Impossible de charger les loyers',
      life: 3000
    })
  } finally {
    loading.value = false
  }
}

const generateRents = async () => {
  generating.value = true
  try {
    await api.post('/api/rents/generate', generateForm)
    toast.add({
      severity: 'success',
      summary: 'Succès',
      detail: 'Loyers générés avec succès',
      life: 3000
    })
    showGenerateDialog.value = false
    loadRents()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: error.response?.data?.error?.message || 'Impossible de générer les loyers',
      life: 3000
    })
  } finally {
    generating.value = false
  }
}

const markAsPaid = (rent) => {
  selectedRent.value = rent
  paymentForm.paidAmount = rent.expectedAmount
  paymentForm.paymentDate = new Date()
  showPaymentDialog.value = true
}

const savePayment = async () => {
  saving.value = true
  try {
    await api.put(`/api/rents/${selectedRent.value.id}/pay`, paymentForm)
    toast.add({
      severity: 'success',
      summary: 'Succès',
      detail: 'Paiement enregistré avec succès',
      life: 3000
    })
    showPaymentDialog.value = false
    loadRents()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: 'Impossible d\'enregistrer le paiement',
      life: 3000
    })
  } finally {
    saving.value = false
  }
}

const sendReminder = async (rent) => {
  try {
    await api.post(`/api/documents/rent-reminder/${rent.id}/send`)
    toast.add({
      severity: 'success',
      summary: 'Succès',
      detail: 'Rappel envoyé avec succès',
      life: 3000
    })
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: 'Impossible d\'envoyer le rappel',
      life: 3000
    })
  }
}

const downloadReminder = async (rent) => {
  try {
    const response = await api.get(`/api/documents/rent-reminder/${rent.id}`, {
      responseType: 'blob'
    })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `rappel-loyer-${rent.month}-${rent.year}.pdf`)
    document.body.appendChild(link)
    link.click()
    link.remove()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: 'Impossible de télécharger le rappel',
      life: 3000
    })
  }
}

const getStatusSeverity = (status) => {
  const severityMap = {
    en_attente: 'warning',
    paye: 'success',
    partiel: 'info',
    en_retard: 'danger'
  }
  return severityMap[status] || 'info'
}

const getMonthName = (month) => {
  return months.find(m => m.value === month)?.label || month
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(value || 0)
}

onMounted(() => {
  loadRents()
})
</script>

<style scoped>
.filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.generate-form,
.payment-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.p-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.p-field label {
  font-weight: 600;
}
</style>
