<template>
  <div class="modern-view">
    <!-- En-tête moderne -->
    <div class="page-header-modern">
      <div>
        <h1 class="page-title-modern">Gestion des locataires</h1>
        <p class="subtitle-modern">Suivi et gestion de vos locataires</p>
      </div>
      <Button
        label="Nouveau locataire"
        icon="pi pi-plus"
        @click="showDialog = true"
        class="p-button-rounded p-button-lg p-button-success"
      />
    </div>

    <!-- Cartes de statistiques -->
    <div class="stats-grid">
      <div class="stat-card stat-primary">
        <div class="stat-icon">
          <i class="pi pi-users"></i>
        </div>
        <div class="stat-content">
          <div class="stat-label">Total locataires</div>
          <div class="stat-value">{{ tenants.length }}</div>
        </div>
      </div>

      <div class="stat-card stat-success">
        <div class="stat-icon">
          <i class="pi pi-check-circle"></i>
        </div>
        <div class="stat-content">
          <div class="stat-label">Baux actifs</div>
          <div class="stat-value">{{ activeLeaseCount }}</div>
        </div>
      </div>

      <div class="stat-card stat-info">
        <div class="stat-icon">
          <i class="pi pi-home"></i>
        </div>
        <div class="stat-content">
          <div class="stat-label">Locataires avec bail</div>
          <div class="stat-value">{{ tenantsWithLeaseCount }}</div>
        </div>
      </div>

      <div class="stat-card stat-warning">
        <div class="stat-icon">
          <i class="pi pi-user-plus"></i>
        </div>
        <div class="stat-content">
          <div class="stat-label">Sans bail actif</div>
          <div class="stat-value">{{ tenantsWithoutLeaseCount }}</div>
        </div>
      </div>
    </div>

    <Card class="modern-card">
      <template #content>
        <div class="filters-modern">
          <span class="p-input-icon-left search-input">
            <i class="pi pi-search" />
            <InputText
              v-model="search"
              placeholder="Rechercher un locataire..."
              @input="loadTenants"
              class="w-full"
            />
          </span>
        </div>

        <DataTable
          :value="tenants"
          :loading="loading"
          :paginator="true"
          :rows="10"
          responsiveLayout="scroll"
          class="modern-table tenants-table"
          stripedRows
        >
          <Column field="fullName" header="Locataire" sortable>
            <template #body="{ data }">
              <div class="tenant-name-cell">
                <span class="tenant-name-highlight">{{ data.firstName }} {{ data.lastName }}</span>
              </div>
            </template>
          </Column>
          <Column field="email" header="Email">
            <template #body="{ data }">
              <span v-if="data.email">{{ data.email }}</span>
              <span v-else class="text-muted">-</span>
            </template>
          </Column>
          <Column field="phone" header="Téléphone">
            <template #body="{ data }">
              <span v-if="data.phone">{{ data.phone }}</span>
              <span v-else class="text-muted">-</span>
            </template>
          </Column>
          <Column field="city" header="Ville">
            <template #body="{ data }">
              <span v-if="data.city">{{ data.city }}</span>
              <span v-else class="text-muted">-</span>
            </template>
          </Column>
          <Column header="Baux actifs">
            <template #body="{ data }">
              <Badge
                :value="data.Leases?.filter(l => l.status === 'actif').length || 0"
                :severity="data.Leases?.filter(l => l.status === 'actif').length ? 'success' : 'secondary'"
              />
            </template>
          </Column>
          <Column header="Actions">
            <template #body="{ data }">
              <div class="action-buttons">
                <Button
                  icon="pi pi-eye"
                  class="p-button-rounded p-button-text p-button-info"
                  @click="viewTenant(data)"
                  v-tooltip.top="'Voir détails'"
                />
                <Button
                  icon="pi pi-pencil"
                  class="p-button-rounded p-button-text p-button-warning"
                  @click="editTenant(data)"
                  v-tooltip.top="'Modifier'"
                />
              </div>
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>

    <Dialog
      v-model:visible="showDialog"
      :header="editingTenant ? 'Modifier le locataire' : 'Nouveau locataire'"
      :modal="true"
      :style="{ width: '600px' }"
      class="modern-dialog"
    >
      <div class="modern-form">
        <div class="p-field-group">
          <div class="p-field">
            <label><i class="pi pi-user"></i> Prénom *</label>
            <InputText v-model="form.firstName" required class="w-full" />
          </div>
          <div class="p-field">
            <label><i class="pi pi-user"></i> Nom *</label>
            <InputText v-model="form.lastName" required class="w-full" />
          </div>
        </div>
        <div class="p-field">
          <label><i class="pi pi-envelope"></i> Email</label>
          <InputText v-model="form.email" type="email" class="w-full" />
        </div>
        <div class="p-field-group">
          <div class="p-field">
            <label><i class="pi pi-phone"></i> Téléphone</label>
            <InputText v-model="form.phone" class="w-full" />
          </div>
          <div class="p-field">
            <label><i class="pi pi-mobile"></i> Mobile</label>
            <InputText v-model="form.mobile" class="w-full" />
          </div>
        </div>
        <div class="p-field">
          <label><i class="pi pi-map-marker"></i> Adresse</label>
          <InputText v-model="form.address" class="w-full" />
        </div>
        <div class="p-field-group">
          <div class="p-field">
            <label><i class="pi pi-map"></i> Ville</label>
            <InputText v-model="form.city" class="w-full" />
          </div>
          <div class="p-field">
            <label><i class="pi pi-map"></i> Code postal</label>
            <InputText v-model="form.postalCode" class="w-full" />
          </div>
        </div>
        <div class="p-field">
          <label><i class="pi pi-wallet"></i> IBAN</label>
          <InputText v-model="form.iban" class="w-full" />
        </div>
        <div class="p-field">
          <label><i class="pi pi-file-edit"></i> Notes</label>
          <Textarea v-model="form.notes" rows="3" class="w-full" />
        </div>
      </div>
      <template #footer>
        <Button label="Annuler" @click="showDialog = false" class="p-button-text" />
        <Button label="Enregistrer" @click="saveTenant" :loading="saving" />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import api from '@/services/api'
import Button from 'primevue/button'
import Card from 'primevue/card'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Dialog from 'primevue/dialog'
import Badge from 'primevue/badge'

const router = useRouter()
const toast = useToast()

const tenants = ref([])
const loading = ref(false)
const showDialog = ref(false)
const editingTenant = ref(null)
const saving = ref(false)
const search = ref('')

// Computed properties for statistics
const activeLeaseCount = computed(() => {
  return tenants.value.reduce((count, tenant) => {
    return count + (tenant.Leases?.filter(l => l.status === 'actif').length || 0)
  }, 0)
})

const tenantsWithLeaseCount = computed(() => {
  return tenants.value.filter(tenant =>
    tenant.Leases && tenant.Leases.some(l => l.status === 'actif')
  ).length
})

const tenantsWithoutLeaseCount = computed(() => {
  return tenants.value.filter(tenant =>
    !tenant.Leases || !tenant.Leases.some(l => l.status === 'actif')
  ).length
})

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  mobile: '',
  address: '',
  city: '',
  postalCode: '',
  iban: '',
  notes: ''
})

const loadTenants = async () => {
  loading.value = true
  try {
    const params = search.value ? { search: search.value } : {}
    const response = await api.get('/api/tenants', { params })
    tenants.value = response.data.data
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: 'Impossible de charger les locataires',
      life: 3000
    })
  } finally {
    loading.value = false
  }
}

const viewTenant = (tenant) => {
  router.push(`/tenants/${tenant.id}`)
}

const editTenant = (tenant) => {
  editingTenant.value = tenant
  Object.assign(form, tenant)
  showDialog.value = true
}

const saveTenant = async () => {
  saving.value = true
  try {
    if (editingTenant.value) {
      await api.put(`/api/tenants/${editingTenant.value.id}`, form)
      toast.add({
        severity: 'success',
        summary: 'Succès',
        detail: 'Locataire modifié avec succès',
        life: 3000
      })
    } else {
      const { id, ...tenantData } = form
      await api.post('/api/tenants', tenantData)
      toast.add({
        severity: 'success',
        summary: 'Succès',
        detail: 'Locataire créé avec succès',
        life: 3000
      })
    }
    showDialog.value = false
    loadTenants()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: 'Impossible d\'enregistrer le locataire',
      life: 3000
    })
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadTenants()
})
</script>

<style scoped>
/* Styles spécifiques uniquement - les styles globaux sont dans modern-views.css */

/* Table des locataires - Espacement entre colonnes */
.tenants-table :deep(.p-datatable-tbody > tr > td) {
  padding: 1rem 1.5rem;
  white-space: normal;
  word-wrap: break-word;
}

.tenants-table :deep(.p-datatable-thead > tr > th) {
  padding: 0.75rem 1.5rem;
}

/* Nom du locataire en highlight */
.tenant-name-cell {
  display: flex;
  align-items: center;
}

.tenant-name-highlight {
  font-weight: 600;
  color: var(--primary-color);
  font-size: 0.95rem;
  line-height: 1.4;
}

/* Mode sombre */
.dark-mode .tenant-name-highlight {
  color: #60a5fa;
}

/* Permettre le texte sur 2 lignes */
.tenants-table :deep(.p-datatable-tbody > tr > td) {
  max-width: 250px;
  overflow-wrap: break-word;
  line-height: 1.4;
}
</style>
