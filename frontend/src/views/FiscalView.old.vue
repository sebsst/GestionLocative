<template>
  <div class="fiscal-view">
    <div class="page-header">
      <h1 class="page-title">Déclaration fiscale</h1>
      <div>
        <Dropdown
          v-model="selectedYear"
          :options="years"
          @change="loadFiscalData"
          class="mr-2"
        />
        <Button
          label="Télécharger PDF"
          icon="pi pi-download"
          @click="downloadPDF"
          :loading="downloading"
        />
      </div>
    </div>

    <div v-if="loading" class="loading">
      <ProgressSpinner />
    </div>

    <div v-else-if="fiscalData">
      <div class="stats-grid">
        <div class="stat-card" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);">
          <h3>Total Recettes</h3>
          <div class="value">{{ formatCurrency(fiscalData.recettes.total) }}</div>
        </div>
        <div class="stat-card" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
          <h3>Total Charges</h3>
          <div class="value">{{ formatCurrency(fiscalData.fraisEtCharges.total) }}</div>
        </div>
        <div class="stat-card" :style="`background: linear-gradient(135deg, ${fiscalData.revenu.type === 'benefice' ? '#667eea' : '#f093fb'} 0%, ${fiscalData.revenu.type === 'benefice' ? '#764ba2' : '#f5576c'} 100%);`">
          <h3>{{ fiscalData.revenu.type === 'benefice' ? 'Bénéfice' : 'Déficit' }}</h3>
          <div class="value">{{ formatCurrency(Math.abs(fiscalData.revenu.net)) }}</div>
        </div>
      </div>

      <div class="fiscal-grid">
        <Card>
          <template #title>RECETTES</template>
          <template #content>
            <div class="fiscal-section">
              <div class="fiscal-line">
                <span class="code">211</span>
                <span class="label">Loyers bruts</span>
                <span class="amount">{{ formatCurrency(fiscalData.recettes.loyersBruts) }}</span>
              </div>
              <div class="fiscal-line total">
                <span class="code">215</span>
                <span class="label">TOTAL REVENUS BRUTS</span>
                <span class="amount">{{ formatCurrency(fiscalData.recettes.total) }}</span>
              </div>
            </div>
          </template>
        </Card>

        <Card>
          <template #title>FRAIS ET CHARGES</template>
          <template #content>
            <div class="fiscal-section">
              <div
                v-for="(value, key) in fiscalData.fraisEtCharges.byType"
                :key="key"
                class="fiscal-line"
              >
                <span class="label">{{ getChargeLabel(key) }}</span>
                <span class="amount">{{ formatCurrency(value.total) }}</span>
              </div>
              <div class="fiscal-line">
                <span class="code">224</span>
                <span class="label">Paiements travaux</span>
                <span class="amount">{{ formatCurrency(fiscalData.fraisEtCharges.travaux) }}</span>
              </div>
              <div class="fiscal-line total">
                <span class="code">240</span>
                <span class="label">TOTAL FRAIS ET CHARGES</span>
                <span class="amount">{{ formatCurrency(fiscalData.fraisEtCharges.total) }}</span>
              </div>
            </div>
          </template>
        </Card>

        <Card v-if="fiscalData.properties && fiscalData.properties.length">
          <template #title>REVENUS PAR IMMEUBLE</template>
          <template #content>
            <DataTable :value="fiscalData.properties">
              <Column field="property.name" header="Bien"></Column>
              <Column field="totalRents" header="Loyers">
                <template #body="{ data }">
                  {{ formatCurrency(data.totalRents) }}
                </template>
              </Column>
              <Column field="totalCharges" header="Charges">
                <template #body="{ data }">
                  {{ formatCurrency(data.totalCharges) }}
                </template>
              </Column>
              <Column field="totalWorks" header="Travaux">
                <template #body="{ data }">
                  {{ formatCurrency(data.totalWorks) }}
                </template>
              </Column>
              <Column field="revenu" header="Revenu">
                <template #body="{ data }">
                  <span :class="data.revenu >= 0 ? 'text-green-600' : 'text-red-600'">
                    {{ formatCurrency(data.revenu) }}
                  </span>
                </template>
              </Column>
            </DataTable>
          </template>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import api from '@/services/api'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Dropdown from 'primevue/dropdown'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import ProgressSpinner from 'primevue/progressspinner'

const toast = useToast()

const fiscalData = ref(null)
const loading = ref(false)
const downloading = ref(false)
const selectedYear = ref(new Date().getFullYear())

const years = computed(() => {
  const currentYear = new Date().getFullYear()
  return Array.from({ length: 10 }, (_, i) => currentYear - i)
})

const loadFiscalData = async () => {
  loading.value = true
  try {
    const response = await api.get(`/api/fiscal/${selectedYear.value}`)
    fiscalData.value = response.data.data
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: 'Impossible de charger les données fiscales',
      life: 3000
    })
  } finally {
    loading.value = false
  }
}

const downloadPDF = async () => {
  downloading.value = true
  try {
    const response = await api.get(`/api/fiscal/${selectedYear.value}/pdf`, {
      responseType: 'blob'
    })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `declaration-fiscale-${selectedYear.value}.pdf`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    toast.add({
      severity: 'success',
      summary: 'Succès',
      detail: 'PDF téléchargé avec succès',
      life: 3000
    })
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: 'Impossible de télécharger le PDF',
      life: 3000
    })
  } finally {
    downloading.value = false
  }
}

const getChargeLabel = (key) => {
  const labels = {
    assurance: '223 - Primes d\'assurances',
    taxe_fonciere: '227 - Taxes foncières',
    copropriete: 'Charges de copropriété',
    electricite: 'Électricité',
    eau: 'Eau',
    ordures: 'Ordures ménagères',
    jardin: 'Jardin',
    entretien: 'Entretien',
    chauffage: 'Chauffage'
  }
  return labels[key] || key
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(value || 0)
}

onMounted(() => {
  loadFiscalData()
})
</script>

<style scoped>
.loading {
  display: flex;
  justify-content: center;
  padding: 3rem;
}

.fiscal-grid {
  display: grid;
  gap: 2rem;
}

.fiscal-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.fiscal-line {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem;
  background: var(--surface-50);
  border-radius: 6px;
}

.fiscal-line.total {
  background: var(--primary-color);
  color: white;
  font-weight: bold;
}

.fiscal-line .code {
  font-weight: 600;
  min-width: 50px;
}

.fiscal-line .label {
  flex: 1;
}

.fiscal-line .amount {
  font-weight: 600;
  min-width: 120px;
  text-align: right;
}
</style>
