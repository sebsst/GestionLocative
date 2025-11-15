<template>
  <div v-if="show" class="modal modal-open" @click.self="close">
    <div class="modal-box max-w-4xl">
      <h3 class="font-bold text-lg mb-4">Gestion des périodes d'occupation</h3>

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

      <!-- Tabs -->
      <div class="tabs tabs-boxed mb-4 gap-1">
        <a
          class="tab tab-lg"
          :class="{ 'tab-active': activeTab === 'history' }"
          @click="activeTab = 'history'"
        >
          Historique
        </a>
        <a
          class="tab tab-lg"
          :class="{ 'tab-active': activeTab === 'new' }"
          @click="activeTab = 'new'"
        >
          Nouvelle période
        </a>
      </div>

      <!-- History Tab -->
      <div v-if="activeTab === 'history'" class="overflow-x-auto">
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
            <tr v-for="period in periods" :key="period.id">
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
          Aucune période d'occupation enregistrée
        </div>
      </div>

      <!-- New Period Tab -->
      <div v-if="activeTab === 'new'">
        <form @submit.prevent="savePeriod" class="space-y-4">
          <div class="grid grid-cols-3 gap-4">
            <div class="form-control">
              <label class="label pb-2">
                <span class="label-text font-semibold">Date d'entrée *</span>
              </label>
              <input
                v-model="periodForm.startDate"
                type="date"
                class="input input-bordered bg-base-200 focus:bg-base-100 focus:border-primary"
                required
              />
            </div>

            <div class="form-control">
              <label class="label pb-2">
                <span class="label-text font-semibold">Date de sortie</span>
              </label>
              <input
                v-model="periodForm.endDate"
                type="date"
                class="input input-bordered bg-base-200 focus:bg-base-100 focus:border-primary"
                :min="periodForm.startDate"
              />
              <label class="label pt-1">
                <span class="label-text-alt opacity-70">Laisser vide si en cours</span>
              </label>
            </div>

            <div class="form-control">
              <label class="label pb-2">
                <span class="label-text font-semibold">Nombre d'occupants *</span>
              </label>
              <input
                v-model.number="periodForm.numberOfOccupants"
                type="number"
                min="1"
                class="input input-bordered bg-base-200 focus:bg-base-100 focus:border-primary"
                placeholder="1"
                required
              />
            </div>
          </div>

          <!-- Info calculée -->
          <div v-if="periodForm.startDate && periodForm.endDate" class="alert">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Durée: {{ calculateFormDuration() }}</span>
          </div>

          <!-- Warning about automatic period closure -->
          <div v-if="!editingPeriod && currentPeriod && !periodForm.endDate" class="alert alert-warning">
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>La période actuelle sera automatiquement clôturée la veille de la nouvelle date de début.</span>
          </div>

          <div v-if="error" class="alert alert-error">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{{ error }}</span>
          </div>

          <div class="modal-action">
            <button type="button" @click="cancelEdit" class="btn btn-ghost">Annuler</button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              <span v-if="saving" class="loading loading-spinner loading-sm"></span>
              {{ editingPeriod ? 'Modifier' : 'Créer la période' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Close Button -->
      <div v-if="activeTab === 'history'" class="modal-action">
        <button @click="close" class="btn">Fermer</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import api from '@/services/api';
import { useToast } from 'vue-toastification';

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
const activeTab = ref('history');
const periods = ref([]);
const currentPeriod = ref(null);
const loading = ref(false);
const saving = ref(false);
const error = ref(null);
const editingPeriod = ref(null);

const periodForm = ref({
  startDate: '',
  endDate: '',
  numberOfOccupants: 1
});

watch(() => props.show, async (newValue) => {
  if (newValue && props.lease) {
    await loadPeriods();
    await loadCurrentPeriod();
  }
});

const loadPeriods = async () => {
  loading.value = true;
  try {
    const response = await api.get(`/api/lease-occupancy-periods/lease/${props.lease.id}`);
    periods.value = response.data.data || [];
  } catch (err) {
    console.error('Erreur chargement périodes:', err);
    toast.error('Erreur lors du chargement des périodes');
  } finally {
    loading.value = false;
  }
};

const loadCurrentPeriod = async () => {
  try {
    const response = await api.get(`/api/lease-occupancy-periods/current/${props.lease.id}`);
    currentPeriod.value = response.data.data;
  } catch (err) {
    // It's ok if there's no current period
    currentPeriod.value = null;
  }
};

const savePeriod = async () => {
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
  activeTab.value = 'new';
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

const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const close = () => {
  cancelEdit();
  activeTab.value = 'history';
  emit('close');
};
</script>
