<template>
  <Modal v-model="isOpen" title="Détails du bail" size="xl" :hide-footer="true">
    <div v-if="lease" class="space-y-4">
      <!-- Tabs -->
      <div class="tabs tabs-boxed">
        <a
          class="tab"
          :class="{ 'tab-active': activeTab === 'info' }"
          @click="activeTab = 'info'"
        >
          Informations
        </a>
        <a
          class="tab"
          :class="{ 'tab-active': activeTab === 'history' }"
          @click="activeTab = 'history'"
        >
          Historique
        </a>
        <a
          class="tab"
          :class="{ 'tab-active': activeTab === 'documents' }"
          @click="activeTab = 'documents'"
        >
          Documents
        </a>
      </div>

      <!-- Tab: Informations -->
      <div v-if="activeTab === 'info'" class="space-y-4">
        <!-- Property & Tenant -->
        <div class="grid grid-cols-2 gap-4">
          <div class="card bg-base-200">
            <div class="card-body p-4">
              <h3 class="font-semibold mb-2">Bien</h3>
              <div class="space-y-1">
                <div class="font-medium">{{ lease.Property?.name }}</div>
                <div class="text-sm opacity-70">{{ lease.Property?.address }}</div>
                <div class="text-sm opacity-70">{{ lease.Property?.postalCode }} {{ lease.Property?.city }}</div>
              </div>
            </div>
          </div>
          <div class="card bg-base-200">
            <div class="card-body p-4">
              <h3 class="font-semibold mb-2">Locataire</h3>
              <div class="space-y-1">
                <div class="font-medium">{{ lease.Tenant?.firstName }} {{ lease.Tenant?.lastName }}</div>
                <div class="text-sm opacity-70">{{ lease.Tenant?.email }}</div>
                <div class="text-sm opacity-70">{{ lease.Tenant?.phone }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Lease Details -->
        <div class="card bg-base-100 shadow">
          <div class="card-body p-4">
            <h3 class="font-semibold mb-3">Détails du bail</h3>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <div class="text-sm opacity-70">Date de début</div>
                <div class="font-medium">{{ formatDate(lease.startDate) }}</div>
              </div>
              <div>
                <div class="text-sm opacity-70">Date de fin</div>
                <div class="font-medium">{{ lease.endDate ? formatDate(lease.endDate) : 'En cours' }}</div>
              </div>
              <div>
                <div class="text-sm opacity-70">Loyer mensuel</div>
                <div class="font-medium text-success">{{ formatCurrency(lease.rentAmount) }}</div>
              </div>
              <div>
                <div class="text-sm opacity-70">Charges</div>
                <div class="font-medium">{{ formatCurrency(lease.chargesAmount) }}</div>
              </div>
              <div>
                <div class="text-sm opacity-70">Dépôt de garantie</div>
                <div class="font-medium">{{ formatCurrency(lease.deposit) }}</div>
              </div>
              <div>
                <div class="text-sm opacity-70">Statut</div>
                <div class="badge" :class="getStatusBadgeClass(lease.status)">
                  {{ getStatusLabel(lease.status) }}
                </div>
              </div>
            </div>
            <div v-if="lease.notes" class="mt-3">
              <div class="text-sm opacity-70">Notes</div>
              <div class="text-sm mt-1">{{ lease.notes }}</div>
            </div>
          </div>
        </div>

        <!-- Closure Info (if terminated) -->
        <div v-if="lease.status === 'termine' && lease.closureReason" class="card bg-warning/10 border border-warning">
          <div class="card-body p-4">
            <h3 class="font-semibold mb-3">Informations de clôture</h3>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <div class="text-sm opacity-70">Motif</div>
                <div class="font-medium">{{ getClosureReasonLabel(lease.closureReason) }}</div>
              </div>
              <div>
                <div class="text-sm opacity-70">Dépôt restitué</div>
                <div class="font-medium">{{ lease.depositReturned ? 'Oui' : 'Non' }}</div>
              </div>
              <div v-if="lease.depositReturnedDate" class="col-span-2">
                <div class="text-sm opacity-70">Date de restitution</div>
                <div class="font-medium">{{ formatDate(lease.depositReturnedDate) }}</div>
              </div>
              <div v-if="lease.closureNotes" class="col-span-2">
                <div class="text-sm opacity-70">Notes de clôture</div>
                <div class="text-sm mt-1">{{ lease.closureNotes }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab: History -->
      <div v-if="activeTab === 'history'" class="space-y-4">
        <div v-if="loadingHistory" class="flex justify-center py-8">
          <span class="loading loading-spinner loading-lg"></span>
        </div>
        <div v-else>
          <!-- Rent Periods -->
          <div class="card bg-base-100 shadow">
            <div class="card-body p-4">
              <h3 class="font-semibold mb-3">Périodes de loyer</h3>
              <div v-if="history.rentPeriods?.length > 0" class="space-y-2">
                <div
                  v-for="period in history.rentPeriods"
                  :key="period.id"
                  class="flex items-center justify-between p-2 bg-base-200 rounded"
                >
                  <div>
                    <div class="font-medium">{{ formatCurrency(period.totalAmount) }}</div>
                    <div class="text-xs opacity-70">
                      {{ formatDate(period.startDate) }} → {{ period.endDate ? formatDate(period.endDate) : 'En cours' }}
                    </div>
                  </div>
                  <div class="text-sm opacity-70">
                    Loyer: {{ formatCurrency(period.rentAmount) }} + Charges: {{ formatCurrency(period.chargesAmount) }}
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-4 text-base-content/60">
                Aucune période de loyer
              </div>
            </div>
          </div>

          <!-- Occupancy Periods -->
          <div class="card bg-base-100 shadow">
            <div class="card-body p-4">
              <h3 class="font-semibold mb-3">Périodes d'occupation</h3>
              <div v-if="history.occupancyPeriods?.length > 0" class="space-y-2">
                <div
                  v-for="period in history.occupancyPeriods"
                  :key="period.id"
                  class="flex items-center justify-between p-2 bg-base-200 rounded"
                >
                  <div>
                    <div class="font-medium">{{ period.numberOfOccupants }} occupant(s)</div>
                    <div class="text-xs opacity-70">
                      {{ formatDate(period.startDate) }} → {{ period.endDate ? formatDate(period.endDate) : 'En cours' }}
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-4 text-base-content/60">
                Aucune période d'occupation
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab: Documents -->
      <div v-if="activeTab === 'documents'" class="space-y-4">
        <div v-if="loadingHistory" class="flex justify-center py-8">
          <span class="loading loading-spinner loading-lg"></span>
        </div>
        <div v-else-if="history.documents?.length > 0" class="space-y-2">
          <div
            v-for="doc in history.documents"
            :key="doc.id"
            class="flex items-center justify-between p-3 bg-base-100 shadow rounded hover:bg-base-200"
          >
            <div class="flex items-center gap-3">
              <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <div>
                <div class="font-medium">{{ doc.originalName }}</div>
                <div class="text-xs opacity-70">
                  {{ getCategoryLabel(doc.category) }} • {{ formatFileSize(doc.fileSize) }} • {{ formatDate(doc.createdAt) }}
                </div>
              </div>
            </div>
            <button
              @click="downloadDocument(doc)"
              class="btn btn-ghost btn-sm"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
          </div>
        </div>
        <div v-else class="text-center py-8 text-base-content/60">
          Aucun document
        </div>
      </div>
    </div>

    <template #footer>
      <button @click="close" class="btn">Fermer</button>
    </template>
  </Modal>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useToast } from 'vue-toastification';
import api from '@/services/api';
import Modal from '@/components/ui/Modal.vue';

const props = defineProps({
  modelValue: Boolean,
  lease: Object
});

const emit = defineEmits(['update:modelValue']);

const toast = useToast();
const activeTab = ref('info');
const loadingHistory = ref(false);
const history = ref({
  rentPeriods: [],
  occupancyPeriods: [],
  documents: []
});

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const categoryLabels = {
  contract: 'Contrat de bail',
  inventory_in: 'État des lieux entrée',
  inventory_out: 'État des lieux sortie',
  amendment: 'Avenant',
  letter: 'Courrier',
  insurance: 'Assurance',
  receipt: 'Quittance',
  other: 'Autre'
};

const closureReasonLabels = {
  normal_end: 'Fin normale du bail',
  tenant_termination: 'Résiliation par le locataire',
  owner_termination: 'Résiliation par le propriétaire',
  mutual_agreement: 'Accord mutuel',
  other: 'Autre'
};

const loadHistory = async () => {
  if (!props.lease) return;

  loadingHistory.value = true;
  try {
    const response = await api.get(`/api/leases/${props.lease.id}/history`);
    history.value = response.data.data;
  } catch (error) {
    console.error('Error loading history:', error);
    toast.error('Erreur lors du chargement de l\'historique');
  } finally {
    loadingHistory.value = false;
  }
};

const downloadDocument = async (doc) => {
  try {
    const response = await api.get(`/api/lease-documents/${doc.id}/download`, {
      responseType: 'blob'
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', doc.originalName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading document:', error);
    toast.error('Erreur lors du téléchargement');
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

const getCategoryLabel = (category) => {
  return categoryLabels[category] || category;
};

const getClosureReasonLabel = (reason) => {
  return closureReasonLabels[reason] || reason;
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

const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const close = () => {
  isOpen.value = false;
  activeTab.value = 'info';
};

watch(isOpen, (value) => {
  if (value) {
    loadHistory();
  }
});
</script>
