<template>
  <div class="p-8">
    <!-- Back Button -->
    <button
      @click="$router.back()"
      class="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-6 transition-colors"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      <span class="font-medium">Retour</span>
    </button>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>

    <!-- Content -->
    <div v-else-if="tenant" class="space-y-6">
      <!-- Header -->
      <div class="card">
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-4">
            <div class="w-16 h-6 rounded-lg flex items-center justify-center text-white font-bold text-2xl bg-gradient-to-br from-green-600 to-green-700 shadow-sm">
              {{ tenant.firstName.charAt(0).toUpperCase() }}{{ tenant.lastName.charAt(0).toUpperCase() }}
            </div>
            <div>
              <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {{ tenant.firstName }} {{ tenant.lastName }}
              </h1>
              <p class="text-gray-600 dark:text-gray-400 mt-1">Locataire</p>
            </div>
          </div>
          <button
            @click="editTenant"
            class="btn-primary flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Modifier
          </button>
        </div>
      </div>

      <!-- Contact Information -->
      <div class="card">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Coordonnées</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Email</label>
            <p class="text-lg text-gray-900 dark:text-gray-100">{{ tenant.email || '-' }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Téléphone</label>
            <p class="text-lg text-gray-900 dark:text-gray-100">{{ tenant.phone || '-' }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Mobile</label>
            <p class="text-lg text-gray-900 dark:text-gray-100">{{ tenant.mobile || '-' }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Adresse</label>
            <p class="text-lg text-gray-900 dark:text-gray-100">{{ tenant.address || '-' }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Ville</label>
            <p class="text-lg text-gray-900 dark:text-gray-100">
              {{ tenant.city }} {{ tenant.postalCode }}
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">IBAN</label>
            <p class="text-lg text-gray-900 dark:text-gray-100 font-mono">{{ tenant.iban || '-' }}</p>
          </div>
        </div>

        <div v-if="tenant.notes" class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Notes</label>
          <p class="text-base text-gray-900 dark:text-gray-100 leading-relaxed">{{ tenant.notes }}</p>
        </div>
      </div>

      <!-- Leases -->
      <div v-if="tenant.Leases && tenant.Leases.length > 0" class="card">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Baux</h2>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Bien</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Début</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fin</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Loyer</th>
                <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Statut</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="lease in tenant.Leases" :key="lease.id" class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <td class="px-6 py-4">
                  <p class="font-medium text-gray-900 dark:text-gray-100">
                    {{ lease.Property?.name }}
                  </p>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <p class="text-sm text-gray-900 dark:text-gray-100">
                    {{ formatDate(lease.startDate) }}
                  </p>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <p class="text-sm text-gray-900 dark:text-gray-100">
                    {{ lease.endDate ? formatDate(lease.endDate) : '-' }}
                  </p>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right">
                  <p class="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {{ formatCurrency(lease.rentAmount) }}
                  </p>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                  <span
                    :class="getStatusClass(lease.status)"
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  >
                    {{ getStatusLabel(lease.status) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-else class="card text-center py-12">
        <svg class="w-16 h-6 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Aucun bail</h3>
        <p class="text-gray-600 dark:text-gray-400">Ce locataire n'a pas encore de bail</p>
      </div>
    </div>

    <!-- Dialog Edit Tenant -->
    <Dialog
      v-model:visible="showEditDialog"
      header="Modifier le locataire"
      :modal="true"
      :style="{ width: '600px' }"
    >
      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prénom *</label>
            <input v-model="tenantForm.firstName" type="text" class="input-field" required />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom *</label>
            <input v-model="tenantForm.lastName" type="text" class="input-field" required />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
          <input v-model="tenantForm.email" type="email" class="input-field" />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Téléphone</label>
            <input v-model="tenantForm.phone" type="tel" class="input-field" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mobile</label>
            <input v-model="tenantForm.mobile" type="tel" class="input-field" />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Adresse</label>
          <input v-model="tenantForm.address" type="text" class="input-field" />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ville</label>
            <input v-model="tenantForm.city" type="text" class="input-field" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Code postal</label>
            <input v-model="tenantForm.postalCode" type="text" class="input-field" />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">IBAN</label>
          <input v-model="tenantForm.iban" type="text" class="input-field" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
          <textarea v-model="tenantForm.notes" rows="3" class="input-field"></textarea>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <button @click="showEditDialog = false" class="btn-secondary">Annuler</button>
          <button @click="updateTenant" :disabled="saving" class="btn-primary">
            {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
          </button>
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import api from '@/services/api'
import Dialog from 'primevue/dialog'

const route = useRoute()
const toast = useToast()

const tenant = ref(null)
const loading = ref(false)
const showEditDialog = ref(false)
const saving = ref(false)

const tenantForm = reactive({
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

const editTenant = () => {
  if (tenant.value) {
    Object.assign(tenantForm, tenant.value)
    showEditDialog.value = true
  }
}

const updateTenant = async () => {
  saving.value = true
  try {
    await api.put(`/api/tenants/${tenant.value.id}`, tenantForm)
    toast.add({
      severity: 'success',
      summary: 'Succès',
      detail: 'Locataire modifié avec succès',
      life: 3000
    })
    showEditDialog.value = false
    loadTenant()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: error.response?.data?.error?.message || 'Impossible de modifier le locataire',
      life: 3000
    })
  } finally {
    saving.value = false
  }
}

const getStatusClass = (status) => {
  const classMap = {
    actif: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    termine: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
  }
  return classMap[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
}

const getStatusLabel = (status) => {
  const labelMap = {
    actif: 'Actif',
    termine: 'Terminé'
  }
  return labelMap[status] || status
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
  loadTenant()
})
</script>
