<template>
  <Modal
    :model-value="show"
    @update:model-value="close"
    title="Gestion des périodes d'occupation"
    size="lg"
    :show-close="true"
  >
    <!-- Current Period Summary -->
    <div v-if="currentPeriod" class="alert alert-info mb-6">
      <div>
        <div class="text-sm font-semibold">Période actuelle</div>
        <div class="flex gap-4 mt-2">
          <div>
            <span class="text-xs opacity-70">Depuis:</span>
            <span class="font-bold ml-1">{{ formatDate(currentPeriod.startDate) }}</span>
          </div>
          <div>
            <span class="text-xs opacity-70">Occupants:</span>
            <span class="font-bold ml-1">{{ currentPeriod.numberOfOccupants }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Accordion Sections -->
    <div class="space-y-4">
      <!-- Tenants Section (open by default) -->
      <div class="collapse collapse-arrow bg-base-200 border border-base-300">
        <input type="checkbox" checked />
        <div class="collapse-title text-lg font-semibold">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>Locataires du bail</span>
            <span class="badge badge-primary badge-sm">{{ leaseTenantsRelations.length }}</span>
          </div>
        </div>
        <div class="collapse-content">
          <!-- Header with Add Tenant Button -->
          <div class="flex items-center justify-between mb-4 mt-2">
            <p class="text-sm text-base-content/70">Gérez les locataires associés à ce bail</p>
            <button @click="openAddTenantToLeaseModal" class="btn btn-primary btn-sm">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Ajouter un locataire
            </button>
          </div>

          <div v-if="leaseTenantsRelations.length === 0" class="text-center py-8 text-base-content/60">
            Aucun locataire associé à ce bail
          </div>

          <div v-else class="space-y-1">
            <div
              v-for="relation in leaseTenantsRelations"
              :key="relation.id"
              class="card bg-base-100 shadow-sm border border-base-200"
            >
              <div class="card-body p-2">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <div class="avatar placeholder">
                      <div class="bg-primary text-primary-content rounded-lg w-8 h-8">
                        <span class="text-xs font-bold">
                          {{ relation.Tenant?.firstName?.charAt(0).toUpperCase() }}{{ relation.Tenant?.lastName?.charAt(0).toUpperCase() }}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div class="flex items-center gap-2">
                        <h3 class="font-semibold text-sm leading-none">
                          {{ relation.Tenant?.firstName }} {{ relation.Tenant?.lastName }}
                        </h3>
                        <span v-if="relation.isPrimary" class="badge badge-primary badge-xs text-[10px] h-4">Principal</span>
                      </div>
                      <p class="text-[10px] opacity-70 leading-tight mt-0.5">{{ relation.Tenant?.email }}</p>
                      <p class="text-[10px] opacity-60 leading-tight">
                        Depuis le {{ formatDate(relation.startDate) }}
                        <span v-if="relation.endDate"> jusqu'au {{ formatDate(relation.endDate) }}</span>
                      </p>
                    </div>
                  </div>
                  <div class="flex gap-1">
                    <button
                      v-if="!relation.isPrimary"
                      @click="setPrimaryTenant(relation.tenantId)"
                      class="btn btn-ghost btn-xs h-6 min-h-0 px-1"
                      title="Définir comme principal"
                    >
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </button>
                    <button
                      @click="removeTenantFromLease(relation.id)"
                      class="btn btn-ghost btn-xs text-error h-6 min-h-0 px-1"
                      title="Retirer du bail"
                    >
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Periods Section (collapsed by default) -->
      <div class="collapse collapse-arrow bg-base-200 border border-base-300">
        <input type="checkbox" />
        <div class="collapse-title text-lg font-semibold">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Historique des périodes</span>
            <span class="badge badge-secondary badge-sm">{{ periods.length }}</span>
          </div>
        </div>
        <div class="collapse-content">
          <p class="text-sm text-base-content/70 mb-4 mt-2">Consultez et gérez l'historique des périodes d'occupation</p>
          
          <div class="overflow-x-auto">
            <table class="table table-zebra">
              <thead>
                <tr>
                  <th>Période</th>
                  <th>Nombre d'occupants</th>
                  <th>Durée</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="period in periods" :key="period.id" class="h-6">
                  <td>
                    <div class="text-sm">
                      {{ formatDate(period.startDate) }}
                      <span v-if="period.endDate"> → {{ formatDate(period.endDate) }}</span>
                      <span v-else class="badge badge-success badge-xs ml-1">Actuel</span>
                    </div>
                  </td>
                  <td>
                    <div class="flex items-center gap-2">
                      <svg class="w-4 h-4 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span class="font-semibold">{{ period.numberOfOccupants }}</span>
                    </div>
                  </td>
                  <td>
                    <span class="text-sm">{{ calculateDuration(period) }}</span>
                  </td>
                  <td>
                    <div class="flex gap-2">
                      <button @click="editPeriod(period)" class="btn btn-ghost btn-xs" title="Modifier">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button @click="incrementPeriodOccupants(period)" class="btn btn-ghost btn-xs text-success" title="Ajouter un occupant">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                      <button @click="decrementPeriodOccupants(period)" class="btn btn-ghost btn-xs text-warning" title="Retirer un occupant">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                        </svg>
                      </button>
                      <button @click="deletePeriod(period.id)" class="btn btn-ghost btn-xs text-error" title="Supprimer">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            <div v-if="periods.length === 0" class="text-center py-8 text-base-content/60">
              <div v-if="!props.lease || !props.lease.id">
                <p class="mb-2">Gestion des occupants au niveau du bien</p>
                <p class="text-sm">Les périodes d'occupation sont gérées par bail. Sélectionnez un bail actif pour commencer.</p>
              </div>
              <div v-else>
                Aucune période d'occupation enregistrée pour ce bail
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <button @click="close" class="btn">Fermer</button>
    </template>
  </Modal>

      <!-- Edit Period Modal -->
      <Modal
        v-model="showEditPeriodModal"
        title="Modifier la période"
        size="md"
        :hide-footer="true"
      >
        <form @submit.prevent="savePeriodEdit" class="space-y-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text font-semibold">Date de début *</span>
            </label>
            <input
              v-model="periodForm.startDate"
              type="date"
              class="input input-bordered"
              required
            />
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text font-semibold">Date de fin</span>
            </label>
            <input
              v-model="periodForm.endDate"
              type="date"
              class="input input-bordered"
              :min="periodForm.startDate"
            />
            <label class="label">
              <span class="label-text-alt opacity-70">Laisser vide si en cours</span>
            </label>
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text font-semibold">Nombre d'occupants *</span>
            </label>
            <input
              v-model.number="periodForm.numberOfOccupants"
              type="number"
              min="1"
              class="input input-bordered"
              required
            />
          </div>

          <div v-if="error" class="alert alert-error">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{{ error }}</span>
          </div>

          <div class="flex justify-end gap-2">
            <button type="button" @click="cancelPeriodEdit" class="btn">Annuler</button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              <span v-if="saving" class="loading loading-spinner loading-sm"></span>
              Modifier
            </button>
          </div>
        </form>
      </Modal>

     <!-- Add Tenant Modal -->
     <Modal
       v-model="showAddTenantModal"
       title="Ajouter un locataire"
       size="md"
       :hide-footer="true"
     >
       <div class="space-y-4">
         <div class="form-control">
           <label class="label">
             <span class="label-text">Locataire *</span>
           </label>
           <div class="flex gap-2">
             <select v-model="tenantForm.tenantId" class="select select-bordered flex-1">
               <option value="">Sélectionner un locataire</option>
               <option v-for="tenant in tenants" :key="tenant.id" :value="tenant.id">
                 {{ tenant.firstName }} {{ tenant.lastName }}
               </option>
             </select>
             <button
               @click="showCreateTenantModal = true"
               class="btn btn-primary btn-square"
               title="Créer un nouveau locataire"
             >
               <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
               </svg>
             </button>
           </div>
         </div>

         <div class="form-control">
           <label class="label">
             <span class="label-text">Date de début *</span>
           </label>
           <input
             v-model="tenantForm.startDate"
             type="date"
             class="input input-bordered w-full"
             required
           />
         </div>
       </div>

       <template #footer>
         <div class="flex justify-end gap-2">
           <button @click="showAddTenantModal = false" class="btn">Annuler</button>
           <button @click="addTenantToLease" class="btn btn-primary">
             Ajouter le locataire
           </button>
         </div>
       </template>
     </Modal>

     <!-- Remove Tenant Modal -->
     <Modal
       v-model="showRemoveTenantModal"
       title="Retirer un locataire"
       size="md"
       :hide-footer="true"
     >
       <div class="space-y-4">
         <div class="form-control">
           <label class="label">
             <span class="label-text">Locataire à retirer *</span>
           </label>
            <select v-model="selectedTenantToRemove" class="select select-bordered w-full">
              <option value="">Sélectionner un locataire</option>
              <option v-for="tenant in tenantsInPeriod" :key="tenant.id" :value="tenant.id">
                {{ tenant.firstName }} {{ tenant.lastName }}
              </option>
            </select>
         </div>

         <div class="form-control">
           <label class="label">
             <span class="label-text">Date de fin</span>
           </label>
           <input
             v-model="tenantRemoveForm.endDate"
             type="date"
             class="input input-bordered w-full"
           />
         </div>
       </div>

       <template #footer>
         <div class="flex justify-end gap-2">
           <button @click="showRemoveTenantModal = false" class="btn">Annuler</button>
           <button @click="removeTenantFromPeriodConfirm" class="btn btn-warning">
             Retirer le locataire
           </button>
         </div>
       </template>
     </Modal>

     <!-- Create Tenant Modal -->
     <Modal
       v-model="showCreateTenantModal"
       title="Créer un nouveau locataire"
       size="md"
       :hide-footer="true"
     >
       <div class="space-y-4">
         <div class="grid grid-cols-2 gap-4">
           <div class="form-control">
             <label class="label">
               <span class="label-text">Prénom *</span>
             </label>
             <input
               v-model="newTenantForm.firstName"
               type="text"
               placeholder="Prénom"
               class="input input-bordered w-full"
               required
             />
           </div>

           <div class="form-control">
             <label class="label">
               <span class="label-text">Nom *</span>
             </label>
             <input
               v-model="newTenantForm.lastName"
               type="text"
               placeholder="Nom"
               class="input input-bordered w-full"
               required
             />
           </div>
         </div>

         <div class="form-control">
           <label class="label">
             <span class="label-text">Email</span>
           </label>
           <input
             v-model="newTenantForm.email"
             type="email"
             placeholder="email@exemple.com"
             class="input input-bordered w-full"
           />
         </div>

         <div class="form-control">
           <label class="label">
             <span class="label-text">Téléphone</span>
           </label>
           <input
             v-model="newTenantForm.phone"
             type="tel"
             placeholder="06 12 34 56 78"
             class="input input-bordered w-full"
           />
         </div>
       </div>

       <template #footer>
         <div class="flex justify-end gap-2">
           <button @click="showCreateTenantModal = false" class="btn">Annuler</button>
           <button @click="createTenant" class="btn btn-primary">
             Créer le locataire
           </button>
         </div>
       </template>
     </Modal>
 </template>

<script setup>
import { ref, watch, reactive } from 'vue';
import api from '@/services/api';
import { useToast } from 'vue-toastification';
import Modal from '@/components/ui/Modal.vue';

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  lease: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['close', 'updated']);

const toast = useToast();
const periods = ref([]);
const currentPeriod = ref(null);
const loading = ref(false);
const saving = ref(false);
const error = ref(null);
const editingPeriod = ref(null);
const showAddTenantModal = ref(false);
const showEditPeriodModal = ref(false);
const showRemoveTenantModal = ref(false);
const selectedPeriod = ref(null);
const tenantForm = reactive({
  tenantId: '',
  startDate: ''
});
const tenantRemoveForm = reactive({
  endDate: ''
});
const newTenantForm = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: ''
});
const tenants = ref([]);
const leaseTenantsRelations = ref([]);
const selectedTenantToRemove = ref('');
const tenantsInPeriod = ref([]);
const showCreateTenantModal = ref(false);

const periodForm = ref({
  startDate: '',
  endDate: '',
  numberOfOccupants: 1
});

watch(() => props.show, async (newValue) => {
  if (newValue && props.lease && props.lease.id) {
    await loadPeriods();
    await loadCurrentPeriod();
    await loadLeaseTenants();
    initializeForm();
  } else if (newValue && (!props.lease || !props.lease.id)) {
    console.log('LeaseOccupancyModal: No valid lease, showing property-level view', props.lease);
    // For property-level occupancy management, show empty state
    periods.value = [];
    currentPeriod.value = null;
    leaseTenantsRelations.value = [];
    // Could show a message that occupancy periods require an active lease
  }
});

const initializeForm = () => {
  // Set start date to today or day after current period ends
  let startDate = new Date().toISOString().split('T')[0]; // Today's date in YYYY-MM-DD format

  if (currentPeriod.value && currentPeriod.value.endDate) {
    const nextDay = new Date(currentPeriod.value.endDate);
    nextDay.setDate(nextDay.getDate() + 1);
    startDate = nextDay.toISOString().split('T')[0];
  }

  // Set number of occupants to current period's count or default to 1
  const occupants = currentPeriod.value ? currentPeriod.value.numberOfOccupants : 1;

  periodForm.value = {
    startDate: startDate,
    endDate: '',
    numberOfOccupants: occupants
  };
};

const loadPeriods = async () => {
  if (!props.lease || !props.lease.id) {
    console.error('loadPeriods: Invalid lease', props.lease);
    return;
  }

  loading.value = true;
  try {
    const response = await api.get(`/api/lease-occupancy-periods/lease/${props.lease.id}`);
    const data = response.data.data || [];
    // Sort by startDate in descending order (most recent first)
    periods.value = data.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
  } catch (err) {
    console.error('Erreur chargement périodes:', err);
    toast.error('Erreur lors du chargement des périodes');
  } finally {
    loading.value = false;
  }
};

const loadCurrentPeriod = async () => {
  if (!props.lease || !props.lease.id) {
    console.error('loadCurrentPeriod: Invalid lease', props.lease);
    currentPeriod.value = null;
    return;
  }

  try {
    const response = await api.get(`/api/lease-occupancy-periods/current/${props.lease.id}`);
    currentPeriod.value = response.data.data;
  } catch (err) {
    // It's ok if there's no current period
    currentPeriod.value = null;
  }
};

const loadLeaseTenants = async () => {
  if (!props.lease || !props.lease.id) {
    console.error('loadLeaseTenants: Invalid lease', props.lease);
    leaseTenantsRelations.value = [];
    return;
  }

  try {
    const response = await api.get(`/api/lease-tenants/lease/${props.lease.id}`);
    leaseTenantsRelations.value = response.data.data || [];
  } catch (err) {
    console.error('Erreur chargement locataires du bail:', err);
    leaseTenantsRelations.value = [];
  }
};

const savePeriod = async () => {
  if (!props.lease || !props.lease.id) {
    console.error('savePeriod: Invalid lease', props.lease);
    error.value = 'Bail invalide';
    return;
  }

  error.value = null;
  saving.value = true;

  try {
    const data = {
      leaseId: props.lease.id,
      startDate: periodForm.value.startDate,
      endDate: periodForm.value.endDate || null,
      numberOfOccupants: periodForm.value.numberOfOccupants
    };

    if (editingPeriod.value) {
      await api.put(`/api/lease-occupancy-periods/${editingPeriod.value.id}`, data);
      toast.success('Période modifiée avec succès');
    } else {
      // When creating a new period, automatically close any open periods
      const newStartDate = new Date(periodForm.value.startDate);
      const closeDate = new Date(newStartDate);
      closeDate.setDate(closeDate.getDate() - 1); // 1 day before new period
      const closeDateString = closeDate.toISOString().split('T')[0];

      // Find and close any open periods (periods without endDate)
      const openPeriods = periods.value.filter(period => !period.endDate);
      console.log('Found open periods to close:', openPeriods.length);

      for (const openPeriod of openPeriods) {
        try {
          await api.put(`/api/lease-occupancy-periods/${openPeriod.id}`, {
            ...openPeriod,
            endDate: closeDateString
          });
          console.log(`Closed period ${openPeriod.id} with end date ${closeDateString}`);
        } catch (closeError) {
          console.error(`Failed to close period ${openPeriod.id}:`, closeError);
          // Continue with creating new period even if closing fails
        }
      }

      // Create the new period
      await api.post('/api/lease-occupancy-periods', data);
      toast.success('Période ajoutée avec succès');
    }

    await loadPeriods();
    await loadCurrentPeriod();
    cancelEdit();
    activeTab.value = 'history';
    emit('updated');
  } catch (err) {
    console.error('Erreur sauvegarde période:', err);
    error.value = err.response?.data?.message || 'Erreur lors de la sauvegarde';
  } finally {
    saving.value = false;
  }
};

const editPeriod = (period) => {
  editingPeriod.value = period;
  periodForm.value = {
    startDate: period.startDate,
    endDate: period.endDate || '',
    numberOfOccupants: period.numberOfOccupants
  };
  showEditPeriodModal.value = true;
};

const savePeriodEdit = async () => {
  if (!editingPeriod.value) return;
  
  error.value = null;
  saving.value = true;

  try {
    const data = {
      leaseId: props.lease.id,
      startDate: periodForm.value.startDate,
      endDate: periodForm.value.endDate || null,
      numberOfOccupants: periodForm.value.numberOfOccupants
    };

    await api.put(`/api/lease-occupancy-periods/${editingPeriod.value.id}`, data);
    toast.success('Période modifiée avec succès');

    await loadPeriods();
    await loadCurrentPeriod();
    cancelPeriodEdit();
    emit('updated');
  } catch (err) {
    console.error('Erreur sauvegarde période:', err);
    error.value = err.response?.data?.message || 'Erreur lors de la sauvegarde';
  } finally {
    saving.value = false;
  }
};

const cancelPeriodEdit = () => {
  showEditPeriodModal.value = false;
  editingPeriod.value = null;
  periodForm.value = {
    startDate: '',
    endDate: '',
    numberOfOccupants: 1
  };
  error.value = null;
};

const cancelEdit = () => {
  editingPeriod.value = null;
  periodForm.value = {
    startDate: '',
    endDate: '',
    numberOfOccupants: 1
  };
  error.value = null;
};

const setToday = () => {
  periodForm.value.startDate = new Date().toISOString().split('T')[0];
};

const deletePeriod = async (periodId) => {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cette période ?')) return;

  try {
    await api.delete(`/api/lease-occupancy-periods/${periodId}`);
    toast.success('Période supprimée avec succès');
    await loadPeriods();
    await loadCurrentPeriod();
    emit('updated');
  } catch (err) {
    console.error('Erreur suppression période:', err);
    toast.error(err.response?.data?.message || 'Erreur lors de la suppression');
  }
};

const calculateDuration = (period) => {
  const start = new Date(period.startDate);
  const end = period.endDate ? new Date(period.endDate) : new Date();

  const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (years > 0 && remainingMonths > 0) {
    return `${years} an${years > 1 ? 's' : ''} et ${remainingMonths} mois`;
  } else if (years > 0) {
    return `${years} an${years > 1 ? 's' : ''}`;
  } else if (months > 0) {
    return `${months} mois`;
  } else {
    const days = Math.floor((end - start) / (1000 * 60 * 60 * 24));
    return `${days} jour${days > 1 ? 's' : ''}`;
  }
};

const calculateFormDuration = () => {
  if (!periodForm.value.startDate || !periodForm.value.endDate) return '';

  const start = new Date(periodForm.value.startDate);
  const end = new Date(periodForm.value.endDate);

  const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (years > 0 && remainingMonths > 0) {
    return `${years} an${years > 1 ? 's' : ''} et ${remainingMonths} mois`;
  } else if (years > 0) {
    return `${years} an${years > 1 ? 's' : ''}`;
  } else if (months > 0) {
    return `${months} mois`;
  } else {
    const days = Math.floor((end - start) / (1000 * 60 * 60 * 24));
    return `${days} jour${days > 1 ? 's' : ''}`;
  }
};

const incrementPeriodOccupants = async (period) => {
  try {
    await api.put(`/api/lease-occupancy-periods/${period.id}`, {
      ...period,
      numberOfOccupants: period.numberOfOccupants + 1
    });
    toast.success('Nombre d\'occupants mis à jour');
    await loadPeriods();
    await loadCurrentPeriod();
    emit('updated');
  } catch (err) {
    console.error('Erreur mise à jour occupants:', err);
    toast.error('Erreur lors de la mise à jour');
  }
};

const decrementPeriodOccupants = async (period) => {
  if (period.numberOfOccupants <= 1) {
    toast.warning('Le nombre d\'occupants ne peut pas être inférieur à 1');
    return;
  }
  
  try {
    await api.put(`/api/lease-occupancy-periods/${period.id}`, {
      ...period,
      numberOfOccupants: period.numberOfOccupants - 1
    });
    toast.success('Nombre d\'occupants mis à jour');
    await loadPeriods();
    await loadCurrentPeriod();
    emit('updated');
  } catch (err) {
    console.error('Erreur mise à jour occupants:', err);
    toast.error('Erreur lors de la mise à jour');
  }
};

const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const addTenantToPeriod = (period) => {
  selectedPeriod.value = period;
  tenantForm.tenantId = '';
  tenantForm.startDate = period.startDate;
  showAddTenantModal.value = true;
  loadTenants();
};

const removeTenantFromPeriod = async (period) => {
  selectedPeriod.value = period;
  selectedTenantToRemove.value = '';
  showRemoveTenantModal.value = true;

  // Load tenants currently associated with this lease
  try {
    const response = await api.get(`/api/lease-tenants?leaseId=${props.lease.id}`);
    const leaseTenants = response.data.data || [];
    tenantsInPeriod.value = leaseTenants.map(lt => lt.Tenant).filter(tenant => tenant);
  } catch (error) {
    console.error('Error loading tenants for period:', error);
    tenantsInPeriod.value = [];
  }
};

const openAddTenantToLeaseModal = () => {
  tenantForm.tenantId = '';
  tenantForm.startDate = new Date().toISOString().split('T')[0]; // Default to today
  showAddTenantModal.value = true;
  loadTenants();
};

const loadTenants = async () => {
  try {
    const response = await api.get('/api/tenants');
    tenants.value = response.data.data || [];
  } catch (error) {
    console.error('Error loading tenants:', error);
    tenants.value = [];
  }
};

const saveTenantToPeriod = async () => {
  if (!tenantForm.tenantId || !tenantForm.startDate) {
    toast.error('Veuillez sélectionner un locataire et une date de début');
    return;
  }

  if (!props.lease || !props.lease.id) {
    toast.error('Bail invalide');
    return;
  }

  try {
    // Call the API to associate the tenant with the lease
    await api.post('/api/lease-tenants', {
      leaseId: props.lease.id,
      tenantId: tenantForm.tenantId,
      isPrimary: false,
      startDate: tenantForm.startDate,
      endDate: null
    });

    // Update occupancy period
    try {
      // Get current occupancy period
      let currentPeriod = null;
      try {
        const currentPeriodResponse = await api.get(`/api/lease-occupancy-periods/current/${props.lease.id}`);
        currentPeriod = currentPeriodResponse.data.data;
      } catch (err) {
        if (err.response && err.response.status === 404) {
          currentPeriod = null;
        } else {
          throw err;
        }
      }

      // Get updated tenant count
      const tenantsResponse = await api.get(`/api/lease-tenants/lease/${props.lease.id}`);
      const tenantCount = tenantsResponse.data.data?.length || 1;

      if (currentPeriod) {
        const currentStartDate = new Date(currentPeriod.startDate).toISOString().split('T')[0];
        const newStartDate = new Date(tenantForm.startDate).toISOString().split('T')[0];

        if (currentStartDate === newStartDate) {
          // If start dates match, just update the count
          await api.put(`/api/lease-occupancy-periods/${currentPeriod.id}`, {
            ...currentPeriod,
            numberOfOccupants: tenantCount
          });
        } else {
          // End the current period (one day before new tenant start date)
          const endDate = new Date(tenantForm.startDate);
          endDate.setDate(endDate.getDate() - 1);
          const endDateString = endDate.toISOString().split('T')[0];

          // Ensure end date is not before start date
          if (new Date(endDateString) < new Date(currentStartDate)) {
             // If end date would be before start date, it means we are trying to insert a period 
             // that starts before the current period ends but after it starts.
             // For now, let's just update the current period count as a fallback to avoid errors
             // or maybe we should split the period?
             // Simplest fix for "Add Tenant" flow is to just update current period if the dates are close
             await api.put(`/api/lease-occupancy-periods/${currentPeriod.id}`, {
              ...currentPeriod,
              numberOfOccupants: tenantCount
            });
          } else {
            await api.put(`/api/lease-occupancy-periods/${currentPeriod.id}`, {
              ...currentPeriod,
              endDate: endDateString
            });

            // Create new occupancy period
            await api.post('/api/lease-occupancy-periods', {
              leaseId: props.lease.id,
              startDate: tenantForm.startDate,
              numberOfOccupants: tenantCount,
              endDate: null
            });
          }
        }
      } else {
        // No current period, create one
        await api.post('/api/lease-occupancy-periods', {
          leaseId: props.lease.id,
          startDate: tenantForm.startDate,
          numberOfOccupants: tenantCount,
          endDate: null
        });
      }

    } catch (occupancyError) {
      console.error('Error updating occupancy period:', occupancyError);
      console.error('Error details:', occupancyError.response?.data);
      // Don't fail the whole operation if occupancy update fails
    }

    toast.success('Locataire ajouté au bail avec succès');
    showAddTenantModal.value = false;

    // Reset form
    tenantForm.tenantId = '';
    tenantForm.startDate = '';

    // Reload data to reflect changes
    await loadLeaseTenants();
    await loadPeriods();
    await loadCurrentPeriod();
  } catch (error) {
    console.error('Error adding tenant to lease:', error);
    toast.error(error.response?.data?.message || 'Erreur lors de l\'ajout du locataire');
  }
};

const addTenantToLease = async () => {
  if (!tenantForm.tenantId || !tenantForm.startDate) {
    toast.error('Veuillez sélectionner un locataire et une date de début');
    return;
  }

  if (!props.lease || !props.lease.id) {
    toast.error('Bail invalide');
    return;
  }

  try {
    // Call the API to associate the tenant with the lease
    await api.post('/api/lease-tenants', {
      leaseId: props.lease.id,
      tenantId: tenantForm.tenantId,
      isPrimary: false,
      startDate: tenantForm.startDate,
      endDate: null
    });

    // Update occupancy period
    try {
      // Get current occupancy period
      let currentPeriod = null;
      try {
        const currentPeriodResponse = await api.get(`/api/lease-occupancy-periods/current/${props.lease.id}`);
        currentPeriod = currentPeriodResponse.data.data;
        console.log('Current period:', currentPeriod);
      } catch (err) {
        // If 404, it means no current period, which is fine
        if (err.response && err.response.status === 404) {
          console.log('No current period found (404), will create new one');
          currentPeriod = null;
        } else {
          throw err; // Re-throw other errors
        }
      }

      // Get updated active tenant count
      const tenantsResponse = await api.get(`/api/lease-tenants/lease/${props.lease.id}/current`);
      let tenantCount = tenantsResponse.data.data?.length || 0;
      console.log('Tenant count from API:', tenantCount);

      // Ensure tenantCount is at least 1 since we just added a tenant
      if (tenantCount === 0) {
        console.warn('Tenant count is 0 but we just added a tenant. Defaulting to 1.');
        tenantCount = 1;
      }

      if (currentPeriod) {
        const currentStartDate = new Date(currentPeriod.startDate).toISOString().split('T')[0];
        const newStartDate = new Date(tenantForm.startDate).toISOString().split('T')[0];
        console.log('Dates:', { currentStartDate, newStartDate });

        if (currentStartDate === newStartDate) {
          // If start dates match, just update the count
          console.log('Updating current period count to', tenantCount);
          await api.put(`/api/lease-occupancy-periods/${currentPeriod.id}`, {
            ...currentPeriod,
            numberOfOccupants: tenantCount
          });
        } else {
          // End the current period (one day before new tenant start date)
          const endDate = new Date(tenantForm.startDate);
          endDate.setDate(endDate.getDate() - 1);
          const endDateString = endDate.toISOString().split('T')[0];
          console.log('Ending current period at', endDateString);

          // Ensure end date is not before start date
          if (new Date(endDateString) < new Date(currentStartDate)) {
             // Fallback: update current period
             console.warn('End date before start date, updating current period instead');
             await api.put(`/api/lease-occupancy-periods/${currentPeriod.id}`, {
              ...currentPeriod,
              numberOfOccupants: tenantCount
            });
          } else {
            await api.put(`/api/lease-occupancy-periods/${currentPeriod.id}`, {
              ...currentPeriod,
              endDate: endDateString
            });

            // Create new occupancy period
            console.log('Creating new period starting', tenantForm.startDate, 'with occupants', tenantCount);
            await api.post('/api/lease-occupancy-periods', {
              leaseId: props.lease.id,
              startDate: tenantForm.startDate,
              numberOfOccupants: tenantCount,
              endDate: null
            });
          }
        }
      } else {
        // No current period, create one
        console.log('No current period. Creating new period starting', tenantForm.startDate, 'with occupants', tenantCount);
        await api.post('/api/lease-occupancy-periods', {
          leaseId: props.lease.id,
          startDate: tenantForm.startDate,
          numberOfOccupants: tenantCount,
          endDate: null
        });
      }

    } catch (occupancyError) {
      console.error('Error updating occupancy period:', occupancyError);
      console.error('Error details:', occupancyError.response?.data);
      toast.error('Locataire ajouté, mais erreur lors de la création de la période: ' + (occupancyError.response?.data?.message || occupancyError.message));
    }

    toast.success('Locataire ajouté au bail avec succès');
    showAddTenantModal.value = false;

    // Reset form
    tenantForm.tenantId = '';
    tenantForm.startDate = '';

    // Reload data to reflect changes
    await loadLeaseTenants();
    await loadPeriods();
    await loadCurrentPeriod();
  } catch (error) {
    console.error('Error adding tenant to lease:', error);
    toast.error(error.response?.data?.message || 'Erreur lors de l\'ajout du locataire');
  }
};

const removeTenantFromPeriodConfirm = async () => {
  if (!selectedTenantToRemove.value) {
    toast.error('Veuillez sélectionner un locataire à retirer');
    return;
  }

  try {
    // Find the lease-tenant relationship to remove
    const leaseTenantsResponse = await api.get(`/api/lease-tenants/lease/${props.lease.id}`);
    const leaseTenants = leaseTenantsResponse.data.data || [];
    const leaseTenantToRemove = leaseTenants.find(lt => lt.tenantId === selectedTenantToRemove.value);

    if (!leaseTenantToRemove) {
      toast.error('Relation locataire-bail non trouvée');
      return;
    }

    // Remove the tenant from the lease
    await api.delete(`/api/lease-tenants/${leaseTenantToRemove.id}`);

    // Update occupancy period
    try {
      // Get current occupancy period
      let currentPeriod = null;
      try {
        const currentPeriodResponse = await api.get(`/api/lease-occupancy-periods/current/${props.lease.id}`);
        currentPeriod = currentPeriodResponse.data.data;
      } catch (err) {
        if (err.response && err.response.status === 404) {
          currentPeriod = null;
        } else {
          throw err;
        }
      }

      // Get updated tenant count (after removal)
      const updatedTenantsResponse = await api.get(`/api/lease-tenants/lease/${props.lease.id}`);
      const updatedTenantCount = updatedTenantsResponse.data.data?.length || 1;

      if (currentPeriod) {
        const today = new Date().toISOString().split('T')[0];
        const currentStartDate = new Date(currentPeriod.startDate).toISOString().split('T')[0];

        if (currentStartDate === today) {
           // If period started today, just update count
           await api.put(`/api/lease-occupancy-periods/${currentPeriod.id}`, {
            ...currentPeriod,
            numberOfOccupants: updatedTenantCount
          });
        } else {
          // End the current period (yesterday)
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const endDate = yesterday.toISOString().split('T')[0];

          // Ensure end date is not before start date
          if (new Date(endDate) < new Date(currentStartDate)) {
             // Fallback: update current period
             await api.put(`/api/lease-occupancy-periods/${currentPeriod.id}`, {
              ...currentPeriod,
              numberOfOccupants: updatedTenantCount
            });
          } else {
            await api.put(`/api/lease-occupancy-periods/${currentPeriod.id}`, {
              ...currentPeriod,
              endDate: endDate
            });

            // Create new occupancy period starting today
            await api.post('/api/lease-occupancy-periods', {
              leaseId: props.lease.id,
              startDate: today,
              numberOfOccupants: updatedTenantCount,
              endDate: null
            });
          }
        }
      }
    } catch (occupancyError) {
      console.error('Error updating occupancy period:', occupancyError);
      console.error('Error details:', occupancyError.response?.data);
      // Don't fail the whole operation if occupancy update fails
    }

    toast.success('Locataire retiré du bail avec succès');
    showRemoveTenantModal.value = false;

    // Reset form
    selectedTenantToRemove.value = '';

    // Reload data to reflect changes
    await loadLeaseTenants();
    await loadPeriods();
    await loadCurrentPeriod();
  } catch (error) {
    console.error('Error removing tenant from lease:', error);
    toast.error('Erreur lors du retrait du locataire');
  }
};

const createTenant = async () => {
  if (!newTenantForm.firstName || !newTenantForm.lastName) {
    toast.error('Veuillez saisir le prénom et le nom');
    return;
  }

  try {
    const response = await api.post('/api/tenants', newTenantForm);
    toast.success('Locataire créé avec succès');

    // Add the new tenant to the list and select it
    const newTenant = response.data.data;
    tenants.value.push(newTenant);
    tenantForm.tenantId = newTenant.id;

    showCreateTenantModal.value = false;

    // Reset form
    Object.assign(newTenantForm, {
      firstName: '',
      lastName: '',
      email: '',
      phone: ''
    });
  } catch (error) {
    console.error('Error creating tenant:', error);
    toast.error(error.response?.data?.message || 'Erreur lors de la création du locataire');
  }
};

const setPrimaryTenant = async (tenantId) => {
  if (!props.lease || !props.lease.id) {
    toast.error('Bail invalide');
    return;
  }

  try {
    await api.post('/api/lease-tenants/set-primary', {
      leaseId: props.lease.id,
      tenantId: tenantId
    });

    toast.success('Locataire principal défini avec succès');
    await loadLeaseTenants();
  } catch (error) {
    console.error('Error setting primary tenant:', error);
    toast.error(error.response?.data?.message || 'Erreur lors de la définition du locataire principal');
  }
};

const removeTenantFromLease = async (relationId) => {
  if (!confirm('Êtes-vous sûr de vouloir retirer ce locataire du bail ?')) return;

  try {
    // Remove the tenant from the lease
    await api.delete(`/api/lease-tenants/${relationId}`);

    // Update occupancy period
    try {
      // Get current occupancy period
      let currentPeriod = null;
      try {
        const currentPeriodResponse = await api.get(`/api/lease-occupancy-periods/current/${props.lease.id}`);
        currentPeriod = currentPeriodResponse.data.data;
      } catch (err) {
        if (err.response && err.response.status === 404) {
          currentPeriod = null;
        } else {
          throw err;
        }
      }

      // Get updated tenant count (after removal)
      const updatedTenantsResponse = await api.get(`/api/lease-tenants/lease/${props.lease.id}`);
      const updatedTenantCount = updatedTenantsResponse.data.data?.length || 0;

      if (currentPeriod) {
        const today = new Date().toISOString().split('T')[0];
        const currentStartDate = new Date(currentPeriod.startDate).toISOString().split('T')[0];

        if (currentStartDate === today) {
           // If period started today, just update count
           await api.put(`/api/lease-occupancy-periods/${currentPeriod.id}`, {
            ...currentPeriod,
            numberOfOccupants: updatedTenantCount
          });
        } else {
          // End the current period (yesterday)
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const endDate = yesterday.toISOString().split('T')[0];

          // Ensure end date is not before start date
          if (new Date(endDate) < new Date(currentStartDate)) {
             // Fallback: update current period
             await api.put(`/api/lease-occupancy-periods/${currentPeriod.id}`, {
              ...currentPeriod,
              numberOfOccupants: updatedTenantCount
            });
          } else {
            await api.put(`/api/lease-occupancy-periods/${currentPeriod.id}`, {
              ...currentPeriod,
              endDate: endDate
            });

            // Only create new period if there are still tenants
            if (updatedTenantCount > 0) {
              // Create new occupancy period starting today
              await api.post('/api/lease-occupancy-periods', {
                leaseId: props.lease.id,
                startDate: today,
                numberOfOccupants: updatedTenantCount,
                endDate: null
              });
            }
          }
        }
      }
    } catch (occupancyError) {
      console.error('Error updating occupancy period:', occupancyError);
      console.error('Error details:', occupancyError.response?.data);
      // Don't fail the whole operation if occupancy update fails
    }

    toast.success('Locataire retiré du bail avec succès');
    await loadLeaseTenants();
    await loadPeriods();
    await loadCurrentPeriod();
  } catch (error) {
    console.error('Error removing tenant from lease:', error);
    toast.error(error.response?.data?.message || 'Erreur lors du retrait du locataire');
  }
};

const close = () => {
  cancelEdit();
  emit('close');
};
</script>
