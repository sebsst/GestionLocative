<template>
  <div class="tenant-detail">
    <Button
      icon="pi pi-arrow-left"
      label="Retour"
      class="p-button-text"
      @click="$router.back()"
    />

    <div v-if="loading" class="loading">
      <ProgressSpinner />
    </div>

    <div v-else-if="tenant">
      <div class="page-header">
        <h1 class="page-title">{{ tenant.firstName }} {{ tenant.lastName }}</h1>
      </div>

      <div class="detail-grid">
        <Card>
          <template #title>Coordonnées</template>
          <template #content>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">Email:</span>
                <span>{{ tenant.email || '-' }}</span>
              </div>
              <div class="info-item">
                <span class="label">Téléphone:</span>
                <span>{{ tenant.phone || '-' }}</span>
              </div>
              <div class="info-item">
                <span class="label">Mobile:</span>
                <span>{{ tenant.mobile || '-' }}</span>
              </div>
              <div class="info-item">
                <span class="label">Adresse:</span>
                <span>{{ tenant.address || '-' }}</span>
              </div>
              <div class="info-item">
                <span class="label">Ville:</span>
                <span>{{ tenant.city }} {{ tenant.postalCode }}</span>
              </div>
              <div class="info-item">
                <span class="label">IBAN:</span>
                <span>{{ tenant.iban || '-' }}</span>
              </div>
            </div>
          </template>
        </Card>

        <Card v-if="tenant.Leases && tenant.Leases.length">
          <template #title>Baux</template>
          <template #content>
            <DataTable :value="tenant.Leases">
              <Column field="Property.name" header="Bien"></Column>
              <Column field="startDate" header="Début">
                <template #body="{ data }">
                  {{ formatDate(data.startDate) }}
                </template>
              </Column>
              <Column field="rentAmount" header="Loyer">
                <template #body="{ data }">
                  {{ formatCurrency(data.rentAmount) }}
                </template>
              </Column>
              <Column field="status" header="Statut">
                <template #body="{ data }">
                  <Tag :value="data.status" />
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
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import api from '@/services/api'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Tag from 'primevue/tag'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import ProgressSpinner from 'primevue/progressspinner'

const route = useRoute()
const toast = useToast()

const tenant = ref(null)
const loading = ref(false)

const loadTenant = async () => {
  loading.value = true
  try {
    const response = await api.get(`/api/tenants/${route.params.id}`)
    tenant.value = response.data.data
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: 'Impossible de charger le locataire',
      life: 3000
    })
  } finally {
    loading.value = false
  }
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
  loadTenant()
})
</script>

<style scoped>
.loading {
  display: flex;
  justify-content: center;
  padding: 3rem;
}

.detail-grid {
  display: grid;
  gap: 2rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
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
</style>
