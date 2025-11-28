<template>
  <div class="p-4">
    <!-- En-tête -->
    <div class="flex items-center justify-between mb-4">
      <div>
        <h1 class="text-2xl font-bold">Baux</h1>
        <p class="text-sm text-base-content/70">Gestion de vos baux locatifs</p>
      </div>
      <button @click="showCreateModal = true" class="btn btn-primary gap-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Créer un bail
      </button>
    </div>

    <!-- Filtres -->
    <div class="card bg-base-100 shadow-xl mb-3">
      <div class="card-body py-2 px-4">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            v-model="filters.search"
            type="text"
            placeholder="Rechercher un bail..."
            class="input input-bordered input-sm w-full"
          />
          <select v-model="filters.status" class="select select-bordered select-sm w-full">
            <option value="">Tous les statuts</option>
            <option value="actif">Actif</option>
            <option value="termine">Terminé</option>
            <option value="resilie">Résilié</option>
          </select>
          <select v-model="filters.propertyId" class="select select-bordered select-sm w-full">
            <option value="">Tous les biens</option>
            <option v-for="property in properties" :key="property.id" :value="property.id">
              {{ property.name }}
            </option>
          </select>
          <button @click="resetFilters" class="btn btn-ghost btn-sm">Réinitialiser</button>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center items-center h-64">
      <span class="loading loading-spinner loading-lg text-primary"></span>
    </div>

    <!-- Leases Table -->
    <div v-else-if="filteredLeases.length > 0" class="card bg-base-100 shadow-xl">
      <div class="overflow-x-auto">
        <table class="table table-zebra">
          <thead class="bg-base-200">
            <tr class="border-b-2 border-base-300">
              <th class="border-r border-base-300">Bien</th>
              <th class="border-r border-base-300">Locataire</th>
              <th class="border-r border-base-300">Période</th>
              <th class="text-right border-r border-base-300">Loyer</th>
              <th class="text-center border-r border-base-300">Statut</th>
              <th class="text-center border-r border-base-300">Documents</th>
              <th class="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="lease in filteredLeases" :key="lease.id" class="hover cursor-pointer" @click="openDetailsModal(lease)">
              <td class="border-r border-base-300">
                <div class="font-medium">{{ lease.Property?.name }}</div>
                <div class="text-xs opacity-60">{{ lease.Property?.address }}</div>
              </td>
              <td class="border-r border-base-300">
                <div class="font-medium">{{ lease.Tenant?.firstName }} {{ lease.Tenant?.lastName }}</div>
                <div class="text-xs opacity-60">{{ lease.Tenant?.email }}</div>
              </td>
              <td class="border-r border-base-300">
                <div class="text-sm">{{ formatDate(lease.startDate) }}</div>
                <div class="text-xs opacity-60">
                  {{ lease.endDate ? '→ ' + formatDate(lease.endDate) : 'En cours' }}
                </div>
              </td>
              <td class="text-right font-semibold border-r border-base-300">
                {{ formatCurrency(parseFloat(lease.rentAmount) + parseFloat(lease.chargesAmount || 0)) }}
              </td>
              <td class="text-center border-r border-base-300">
                <div class="badge badge-sm" :class="getStatusBadgeClass(lease.status)">
                  {{ getStatusLabel(lease.status) }}
                </div>
              </td>
              <td class="text-center border-r border-base-300" @click.stop>
                <button
                  @click="openDocumentsModal(lease)"
                  class="btn btn-ghost btn-xs gap-1"
                  :class="{ 'text-primary': lease.documentsCount > 0 }"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  {{ lease.documentsCount || 0 }}
                </button>
              </td>
              <td @click.stop>
                <div class="flex items-center justify-center gap-1">
                  <button
                    @click="openDetailsModal(lease)"
                    class="btn btn-ghost btn-xs"
                    title="Détails"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  <button
                    @click="openEditModal(lease)"
                    class="btn btn-ghost btn-xs"
                    title="Modifier"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    v-if="lease.status === 'actif'"
                    @click="openCloseModal(lease)"
                    class="btn btn-ghost btn-xs text-warning"
                    title="Clôturer"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <button
                    @click="deleteLease(lease)"
                    class="btn btn-ghost btn-xs text-error"
                    title="Supprimer"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="card bg-base-100 shadow-xl">
      <div class="card-body items-center text-center py-12">
        <svg class="w-16 h-16 text-base-content/30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 class="text-lg font-semibold mb-2">Aucun bail trouvé</h3>
        <p class="text-base-content/60">{{ filters.search || filters.status ? 'Essayez de modifier les filtres' : 'Créez votre premier bail' }}</p>
      </div>
    </div>

    <!-- Modals -->
    <CreateLeaseModal
      v-model="showCreateModal"
      @created="handleLeaseCreated"
    />

    <EditLeaseModal
      v-model="showEditModal"
      :lease="selectedLeaseForAction"
      @updated="handleLeaseUpdated"
    />

    <CloseLeaseModal
      v-model="showCloseModal"
      :lease="selectedLeaseForAction"
      @closed="handleLeaseClosed"
    />

    <LeaseDocumentsModal
      v-model="showDocumentsModal"
      :lease="selectedLeaseForAction"
      @updated="loadLeases"
    />

    <LeaseDetailsModal
      v-model="showDetailsModal"
      :lease="selectedLeaseForAction"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue';
import { useToast } from 'vue-toastification';
import api from '@/services/api';
import CreateLeaseModal from '@/components/modals/CreateLeaseModal.vue';
import EditLeaseModal from '@/components/modals/EditLeaseModal.vue';
import CloseLeaseModal from '@/components/modals/CloseLeaseModal.vue';
import LeaseDocumentsModal from '@/components/modals/LeaseDocumentsModal.vue';
import LeaseDetailsModal from '@/components/modals/LeaseDetailsModal.vue';

const toast = useToast();

const leases = ref([]);
const properties = ref([]);
const loading = ref(false);
const showCreateModal = ref(false);
const showEditModal = ref(false);
const showCloseModal = ref(false);
const showDocumentsModal = ref(false);
const showDetailsModal = ref(false);
const selectedLeaseForAction = ref(null);

const filters = reactive({
  search: '',
  status: 'actif',  // Par défaut, afficher uniquement les baux actifs
  propertyId: ''
});

// Computed
const filteredLeases = computed(() => {
  let result = leases.value;

  if (filters.search) {
    const search = filters.search.toLowerCase();
    result = result.filter(l => 
      l.Property?.name?.toLowerCase().includes(search) ||
      l.Tenant?.firstName?.toLowerCase().includes(search) ||
      l.Tenant?.lastName?.toLowerCase().includes(search)
    );
  }

  if (filters.status) {
    result = result.filter(l => l.status === filters.status);
  }

  if (filters.propertyId) {
    result = result.filter(l => l.propertyId === filters.propertyId);
  }

  return result;
});

// Methods
const loadLeases = async () => {
  loading.value = true;
  try {
    const response = await api.get('/api/leases');
    leases.value = response.data.data || [];
    
    // Load document counts for each lease
    await Promise.all(leases.value.map(async (lease) => {
      try {
        const docsResponse = await api.get(`/api/leases/${lease.id}/documents`);
        lease.documentsCount = docsResponse.data.data?.length || 0;
      } catch (error) {
        lease.documentsCount = 0;
      }
    }));
  } catch (error) {
    console.error('Error loading leases:', error);
    toast.error('Erreur lors du chargement des baux');
  } finally {
    loading.value = false;
  }
};

const loadProperties = async () => {
  try {
    const response = await api.get('/api/properties');
    properties.value = response.data.data || [];
  } catch (error) {
    console.error('Error loading properties:', error);
  }
};

const resetFilters = () => {
  filters.search = '';
  filters.status = '';
  filters.propertyId = '';
};

const openDocumentsModal = (lease) => {
  selectedLeaseForAction.value = lease;
  showDocumentsModal.value = true;
};

const openDetailsModal = (lease) => {
  selectedLeaseForAction.value = lease;
  showDetailsModal.value = true;
};

const openEditModal = (lease) => {
  selectedLeaseForAction.value = lease;
  showEditModal.value = true;
};

const openCloseModal = (lease) => {
  selectedLeaseForAction.value = lease;
  showCloseModal.value = true;
};

const handleLeaseCreated = () => {
  loadLeases();
};

const handleLeaseUpdated = () => {
  loadLeases();
};

const handleLeaseClosed = () => {
  loadLeases();
};

const deleteLease = async (lease) => {
  if (!confirm(`Voulez-vous vraiment supprimer le bail de ${lease.Tenant?.firstName} ${lease.Tenant?.lastName} ?`)) {
    return;
  }

  try {
    await api.delete(`/api/leases/${lease.id}`);
    toast.success('Bail supprimé avec succès');
    loadLeases();
  } catch (error) {
    console.error('Error deleting lease:', error);
    toast.error('Erreur lors de la suppression du bail');
  }
};

const getStatusBadgeClass = (status) => {
  const classes = {
    actif: 'badge-success',
    termine: 'badge-ghost',
    resilie: 'badge-error'
  };
  return classes[status] || 'badge-ghost';
};

const getStatusLabel = (status) => {
  const labels = {
    actif: 'Actif',
    termine: 'Terminé',
    resilie: 'Résilié'
  };
  return labels[status] || status;
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(value || 0);
};

const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

onMounted(() => {
  loadLeases();
  loadProperties();
});
</script>
