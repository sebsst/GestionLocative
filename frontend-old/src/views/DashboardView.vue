<template>
  <div class="dashboard">
    <!-- En-tête moderne -->
    <div class="page-header-modern">
      <div>
        <h1 class="page-title-modern">Tableau de bord</h1>
        <p class="subtitle-modern">Vue d'ensemble de votre activité locative</p>
      </div>
      <Button
        label="Actualiser"
        icon="pi pi-refresh"
        @click="loadDashboardData"
        :loading="loading"
        class="p-button-rounded p-button-lg p-button-success"
      />
    </div>


    <!-- Cartes de statistiques modernes -->
    <div class="stats-grid-modern">
      <div class="stat-card-modern stat-primary" @click="$router.push('/properties')">
        <div class="stat-icon-modern">
          <i class="pi pi-home"></i>
        </div>
        <div class="stat-content-modern">
          <div class="stat-label-modern">Total Biens</div>
          <div class="stat-value-modern">{{ propertyStats.total || 0 }}</div>
          <div class="stat-sub-modern">
            <i class="pi pi-check-circle"></i>
            {{ propertyStats.rented || 0 }} loués
          </div>
        </div>
      </div>

      <div class="stat-card-modern stat-danger" @click="$router.push('/rents')">
        <div class="stat-icon-modern">
          <i class="pi pi-exclamation-triangle"></i>
        </div>
        <div class="stat-content-modern">
          <div class="stat-label-modern">Loyers en retard</div>
          <div class="stat-value-modern">{{ lateRents.length || 0 }}</div>
          <div class="stat-sub-modern">
            <i class="pi pi-clock"></i>
            À recouvrer
          </div>
        </div>
      </div>

      <div class="stat-card-modern stat-success" @click="$router.push('/rents')">
        <div class="stat-icon-modern">
          <i class="pi pi-euro"></i>
        </div>
        <div class="stat-content-modern">
          <div class="stat-label-modern">Revenus {{ new Date().getFullYear() }}</div>
          <div class="stat-value-modern">{{ formatCurrency(rentStats.totalPaid) }}</div>
          <div class="stat-sub-modern">
            <i class="pi pi-chart-line"></i>
            Taux: {{ rentStats.collectionRate }}%
          </div>
        </div>
      </div>

      <div class="stat-card-modern stat-info" @click="$router.push('/works')">
        <div class="stat-icon-modern">
          <i class="pi pi-wrench"></i>
        </div>
        <div class="stat-content-modern">
          <div class="stat-label-modern">Travaux</div>
          <div class="stat-value-modern">{{ workStats.total || 0 }}</div>
          <div class="stat-sub-modern">
            <i class="pi pi-check"></i>
            {{ workStats.completed || 0 }} terminés
          </div>
        </div>
      </div>
    </div>

    <!-- Grille de contenu -->
    <div class="dashboard-grid-modern">
      <!-- Loyers en retard -->
      <Card class="modern-card">
        <template #title>
          <div class="card-title-icon">
            <i class="pi pi-exclamation-circle"></i>
            <span>Loyers en retard</span>
            <Badge :value="lateRents.length" severity="danger" class="ml-auto" />
          </div>
        </template>
        <template #content>
          <DataTable
            v-if="lateRents.length > 0"
            :value="lateRents"
            :rows="5"
            :paginator="lateRents.length > 5"
            class="modern-table"
            stripedRows
          >
            <Column field="Lease.Tenant.firstName" header="Locataire">
              <template #body="{ data }">
                <div class="tenant-cell">
                  <i class="pi pi-user"></i>
                  <span>{{ data.Lease.Tenant.firstName }} {{ data.Lease.Tenant.lastName }}</span>
                </div>
              </template>
            </Column>
            <Column field="Lease.Property.name" header="Bien">
              <template #body="{ data }">
                <div class="property-cell">
                  <i class="pi pi-home"></i>
                  <span>{{ data.Lease.Property.name }}</span>
                </div>
              </template>
            </Column>
            <Column field="month" header="Période">
              <template #body="{ data }">
                <Tag :value="`${data.month}/${data.year}`" severity="warning" icon="pi pi-calendar" />
              </template>
            </Column>
            <Column field="expectedAmount" header="Montant">
              <template #body="{ data }">
                <span class="currency-cell danger">{{ formatCurrency(data.expectedAmount) }}</span>
              </template>
            </Column>
            <Column header="Actions">
              <template #body="{ data }">
                <Button
                  icon="pi pi-envelope"
                  class="p-button-rounded p-button-sm p-button-warning"
                  @click="sendReminder(data)"
                  v-tooltip.top="'Envoyer un rappel'"
                />
              </template>
            </Column>
          </DataTable>
          <div v-else class="empty-state-small">
            <i class="pi pi-check-circle"></i>
            <p>Aucun loyer en retard</p>
          </div>
        </template>
      </Card>

      <!-- Activité récente -->
      <Card class="modern-card">
        <template #title>
          <div class="card-title-icon">
            <i class="pi pi-history"></i>
            <span>Activité récente</span>
            <Badge :value="recentActivities.length" severity="info" class="ml-auto" />
          </div>
        </template>
        <template #content>
          <Timeline :value="recentActivities" align="left" v-if="recentActivities.length > 0">
            <template #marker="{ item }">
              <span :class="['timeline-marker', `severity-${item.severity}`]">
                <i :class="['pi', item.icon]"></i>
              </span>
            </template>
            <template #content="{ item }">
              <div class="timeline-item">
                <h4>{{ item.title }}</h4>
                <p>{{ item.description }}</p>
                <small>{{ formatDate(item.date) }}</small>
              </div>
            </template>
          </Timeline>
          <div v-else class="empty-state-small">
            <i class="pi pi-inbox"></i>
            <p>Aucune activité récente</p>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import api from '@/services/api'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Badge from 'primevue/badge'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Timeline from 'primevue/timeline'
import Tag from 'primevue/tag'

const toast = useToast()
const loading = ref(false)

const propertyStats = ref({})
const rentStats = ref({ totalPaid: 0, collectionRate: 0 })
const workStats = ref({})
const lateRents = ref([])
const recentActivities = ref([])

const loadDashboardData = async () => {
  loading.value = true
  try {
    const [propStats, rentsData, worksData, lateRentsData, activitiesData] = await Promise.all([
      api.get('/api/properties/statistics'),
      api.get('/api/rents/statistics'),
      api.get('/api/works/statistics'),
      api.get('/api/rents/late'),
      api.get('/api/activities/recent?limit=15')
    ])

    propertyStats.value = propStats.data.data
    rentStats.value = rentsData.data.data
    workStats.value = worksData.data.data
    lateRents.value = lateRentsData.data.data
    recentActivities.value = activitiesData.data.data
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: 'Impossible de charger les données',
      life: 3000
    })
  } finally {
    loading.value = false
  }
}

const sendReminder = async (rent) => {
  try {
    await api.post(`/api/documents/rent-reminder/${rent.id}/send`)
    toast.add({
      severity: 'success',
      summary: 'Rappel envoyé',
      detail: 'Le rappel a été envoyé au locataire',
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
  loadDashboardData()
})
</script>

<style scoped>
.dashboard {
  padding: 0.5rem 1.25rem 1rem;
  max-width: 1400px;
  margin: 0 auto;
}

/* En-tête moderne */
.page-header-modern {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.875rem;
  padding: 0.875rem 1.25rem;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-600) 100%);
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  color: white;
}

.page-title-modern {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 0.2rem 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.subtitle-modern {
  font-size: 0.875rem;
  opacity: 0.95;
  margin: 0;
}

/* Cartes de statistiques modernes */
.stats-grid-modern {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.stat-card-modern {
  background: white;
  border-radius: 12px;
  padding: 1rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
  cursor: pointer;
}

.stat-card-modern::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  transition: width 0.3s ease;
}

.stat-card-modern:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
}

.stat-card-modern:hover::before {
  width: 8px;
}

.stat-card-modern.stat-primary::before {
  background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
}

.stat-card-modern.stat-danger::before {
  background: linear-gradient(180deg, #f093fb 0%, #f5576c 100%);
}

.stat-card-modern.stat-success::before {
  background: linear-gradient(180deg, #43e97b 0%, #38f9d7 100%);
}

.stat-card-modern.stat-info::before {
  background: linear-gradient(180deg, #4facfe 0%, #00f2fe 100%);
}

.stat-icon-modern {
  width: 45px;
  height: 45px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  flex-shrink: 0;
  color: white;
}

.stat-primary .stat-icon-modern {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-danger .stat-icon-modern {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-success .stat-icon-modern {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-info .stat-icon-modern {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-content-modern {
  flex: 1;
}

.stat-label-modern {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-color-secondary);
  text-transform: uppercase;
  letter-spacing: 0.3px;
  margin-bottom: 0.25rem;
}

.stat-value-modern {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-color);
  line-height: 1;
  margin-bottom: 0.35rem;
}

.stat-sub-modern {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.8rem;
  color: var(--text-color-secondary);
  font-weight: 500;
}

.stat-sub-modern i {
  font-size: 0.875rem;
}

/* Grille du dashboard */
.dashboard-grid-modern {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 2rem;
}

/* Cartes modernes */
.modern-card {
  border-radius: 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.modern-card :deep(.p-card-title) {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-color);
  padding-bottom: 0.75rem;
  border-bottom: 2px solid var(--surface-100);
  margin-bottom: 1rem;
}

.modern-card :deep(.p-card-content) {
  padding: 1rem;
}

.card-title-icon {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.25rem;
  font-weight: 700;
}

.card-title-icon i {
  color: var(--primary-color);
  font-size: 1.5rem;
}

.ml-auto {
  margin-left: auto;
}

/* Table moderne - Style bank-manager */
.modern-table :deep(.p-datatable-thead > tr > th) {
  background: #f9fafb;
  color: #6b7280;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 0.75rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-bottom: 1px solid #e5e7eb;
}

.modern-table :deep(.p-datatable-tbody > tr) {
  transition: background-color 0.2s;
  border-bottom: 1px solid #e5e7eb;
  background: white;
}

.modern-table :deep(.p-datatable-tbody > tr:nth-child(even)) {
  background: white;
}

.modern-table :deep(.p-datatable-tbody > tr:hover) {
  background: #f9fafb !important;
}

.modern-table :deep(.p-datatable-tbody > tr > td) {
  padding: 1rem 1.5rem;
  font-size: 0.875rem;
  border-right: none;
  color: #111827;
}

.modern-table :deep(.p-datatable-tbody > tr > td:last-child) {
  border-right: none;
}

/* Pagination et filtres */
.modern-table :deep(.p-paginator) {
  background: white;
  border-top: 1px solid #e5e7eb;
  padding: 0.75rem 1rem;
}

.modern-table :deep(.p-paginator .p-paginator-current) {
  color: #6b7280;
  font-weight: 500;
  font-size: 0.875rem;
}

.modern-table :deep(.p-paginator-pages .p-paginator-page) {
  min-width: 2rem;
  height: 2rem;
  border-radius: 0.5rem;
  font-weight: 500;
  font-size: 0.875rem;
  transition: all 0.2s;
  color: #6b7280;
}

.modern-table :deep(.p-paginator-pages .p-paginator-page:hover) {
  background: #f3f4f6;
  color: #111827;
}

.modern-table :deep(.p-paginator-pages .p-paginator-page.p-highlight) {
  background: var(--primary-color);
  color: white;
}

.tenant-cell,
.property-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.tenant-cell i,
.property-cell i {
  color: var(--primary-color);
  font-size: 1.1rem;
}

.currency-cell {
  font-weight: 600;
  color: var(--text-color);
}

.currency-cell.danger {
  color: #ef4444;
  font-weight: 700;
  font-size: 1.1rem;
}

/* Timeline */
.timeline-item h4 {
  margin: 0 0 0.25rem 0;
  color: var(--primary-color);
  font-size: 1rem;
  font-weight: 600;
}

.timeline-item p {
  margin: 0 0 0.5rem 0;
  color: var(--text-color);
  line-height: 1.5;
}

.timeline-item small {
  color: var(--text-color-secondary);
  font-size: 0.85rem;
}

.timeline-marker {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.25rem;
}

.timeline-marker.severity-success {
  background: linear-gradient(135deg, #10b981 0%, #047857 100%);
}

.timeline-marker.severity-info {
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
}

.timeline-marker.severity-warning {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.timeline-marker.severity-danger {
  background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
}

/* État vide */
.empty-state-small {
  text-align: center;
  padding: 2rem 1rem;
  color: var(--text-color-secondary);
}

.empty-state-small i {
  font-size: 2.5rem;
  margin-bottom: 0.75rem;
  opacity: 0.5;
}

.empty-state-small p {
  margin: 0;
  font-size: 0.95rem;
}

/* Mode sombre */
.dark-mode .stat-card-modern {
  background: #1e293b;
  border-color: #334155;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.dark-mode .stat-card-modern:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
}

.dark-mode .stat-label-modern {
  color: #94a3b8;
}

.dark-mode .stat-value-modern {
  color: #f1f5f9;
}

.dark-mode .stat-sub-modern {
  color: #94a3b8;
}

.dark-mode .modern-card {
  background: #1e293b;
  border-color: #334155;
}

.dark-mode .modern-card :deep(.p-card-title) {
  color: #f1f5f9;
  border-bottom-color: #334155;
}

.dark-mode .card-title-icon i {
  color: #60a5fa;
}

/* Tableaux en mode sombre */
.dark-mode .modern-table :deep(.p-datatable-thead > tr > th) {
  background: #111827;
  color: #9ca3af;
  border-bottom-color: #374151;
}

.dark-mode .modern-table :deep(.p-datatable-tbody > tr) {
  background: #1f2937;
  border-bottom-color: #374151;
}

.dark-mode .modern-table :deep(.p-datatable-tbody > tr:nth-child(even)) {
  background: #1f2937;
}

.dark-mode .modern-table :deep(.p-datatable-tbody > tr:hover) {
  background: #374151 !important;
}

.dark-mode .modern-table :deep(.p-datatable-tbody > tr > td) {
  color: #f3f4f6;
}

.dark-mode .modern-table :deep(.p-paginator) {
  background: #1f2937;
  border-top-color: #374151;
}

.dark-mode .modern-table :deep(.p-paginator .p-paginator-current) {
  color: #9ca3af;
}

.dark-mode .modern-table :deep(.p-paginator-pages .p-paginator-page) {
  color: #9ca3af;
}

.dark-mode .modern-table :deep(.p-paginator-pages .p-paginator-page:hover) {
  background: #374151;
  color: #f3f4f6;
}

/* Responsive */
@media (max-width: 768px) {
  .dashboard {
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

  .stats-grid-modern {
    grid-template-columns: 1fr;
  }

  .dashboard-grid-modern {
    grid-template-columns: 1fr;
  }

  .stat-value-modern {
    font-size: 2rem;
  }
}
</style>
