<template>
  <div v-if="isOpen" class="modal modal-open" @click.self="closeModal">
    <div class="modal-box max-w-4xl">
      <h3 class="font-bold text-lg mb-4">Historique des montants de loyer</h3>

      <!-- Current Period Summary -->
      <div v-if="currentPeriod" class="alert alert-info mb-6">
        <div>
          <div class="text-sm font-semibold">Montants actuels</div>
          <div class="flex gap-4 mt-2">
            <div>
              <span class="text-xs opacity-70">Loyer HC:</span>
              <span class="font-bold ml-1">{{ formatCurrency(currentPeriod.rentAmount) }}</span>
            </div>
            <div>
              <span class="text-xs opacity-70">Charges:</span>
              <span class="font-bold ml-1">{{ formatCurrency(currentPeriod.chargesAmount) }}</span>
            </div>
            <div>
              <span class="text-xs opacity-70">Total:</span>
              <span class="font-bold ml-1">{{ formatCurrency(currentPeriod.totalAmount) }}</span>
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
          Nouveau montant
        </a>
        <a
          class="tab tab-lg"
          :class="{ 'tab-active': activeTab === 'irl' }"
          @click="activeTab = 'irl'"
        >
          Révision IRL
        </a>
      </div>

      <!-- History Tab -->
      <div v-if="activeTab === 'history'" class="overflow-x-auto">
        <table class="table table-zebra">
          <thead>
            <tr>
              <th>Période</th>
              <th>Loyer HC</th>
              <th>Charges</th>
              <th>Total</th>
              <th>Motif</th>
              <th>IRL</th>
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
              <td class="font-semibold">{{ formatCurrency(period.rentAmount) }}</td>
              <td>{{ formatCurrency(period.chargesAmount) }}</td>
              <td class="font-bold">{{ formatCurrency(period.totalAmount) }}</td>
              <td>
                <span class="badge badge-sm" :class="getReasonBadgeClass(period.changeReason)">
                  {{ getReasonLabel(period.changeReason) }}
                </span>
              </td>
              <td>
                <div v-if="period.irlIndex" class="text-xs">
                  {{ period.irlQuarter }}: {{ period.irlIndex }}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- New Amount Tab -->
      <div v-if="activeTab === 'new'">
        <form @submit.prevent="createNewPeriod" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="form-control">
              <label class="label pb-2">
                <span class="label-text font-semibold">Date de début</span>
              </label>
              <input
                type="date"
                v-model="newPeriod.startDate"
                class="input input-bordered bg-base-200 focus:bg-base-100 focus:border-primary"
                required
              >
            </div>

            <div class="form-control">
              <label class="label pb-2">
                <span class="label-text font-semibold">Motif du changement</span>
              </label>
              <select v-model="newPeriod.changeReason" class="select select-bordered bg-base-200 focus:bg-base-100 focus:border-primary" required>
                <option value="irl_revision">Révision IRL</option>
                <option value="tenant_change">Changement de locataire</option>
                <option value="work_completion">Fin de travaux</option>
                <option value="occupant_change">Changement nombre d'occupants</option>
                <option value="charge_increase">Augmentation provisions charges</option>
                <option value="rent_decrease">Diminution du loyer</option>
                <option value="other">Autre raison</option>
              </select>
            </div>

            <div class="form-control">
              <label class="label pb-2">
                <span class="label-text font-semibold">Loyer hors charges (€)</span>
              </label>
              <input
                type="number"
                step="0.01"
                v-model="newPeriod.rentAmount"
                class="input input-bordered bg-base-200 focus:bg-base-100 focus:border-primary"
                placeholder="0.00"
                required
              >
            </div>

            <div class="form-control">
              <label class="label pb-2">
                <span class="label-text font-semibold">Provisions sur charges (€)</span>
              </label>
              <input
                type="number"
                step="0.01"
                v-model="newPeriod.chargesAmount"
                class="input input-bordered bg-base-200 focus:bg-base-100 focus:border-primary"
                placeholder="0.00"
                required
              >
            </div>

            <div v-if="newPeriod.changeReason === 'irl_revision'" class="form-control">
              <label class="label pb-2">
                <span class="label-text font-semibold">Trimestre IRL</span>
              </label>
              <input
                type="text"
                v-model="newPeriod.irlQuarter"
                placeholder="T1 2024"
                class="input input-bordered bg-base-200 focus:bg-base-100 focus:border-primary"
              >
            </div>

            <div v-if="newPeriod.changeReason === 'irl_revision'" class="form-control">
              <label class="label pb-2">
                <span class="label-text font-semibold">Indice IRL</span>
              </label>
              <input
                type="number"
                step="0.0001"
                v-model="newPeriod.irlIndex"
                placeholder="142.5687"
                class="input input-bordered bg-base-200 focus:bg-base-100 focus:border-primary"
              >
            </div>
          </div>

          <div class="form-control">
            <label class="label pb-2">
              <span class="label-text font-semibold">Notes</span>
            </label>
            <textarea
              v-model="newPeriod.notes"
              class="textarea textarea-bordered bg-base-200 focus:bg-base-100 focus:border-primary"
              rows="3"
              placeholder="Notes et commentaires sur ce changement..."
            ></textarea>
          </div>

          <div class="alert alert-warning">
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>La période actuelle sera automatiquement clôturée la veille de la nouvelle date de début.</span>
          </div>

          <div class="modal-action">
            <button type="button" @click="closeModal" class="btn btn-ghost">Annuler</button>
            <button type="submit" class="btn btn-primary" :disabled="loading">
              <span v-if="loading" class="loading loading-spinner loading-sm"></span>
              Créer la période
            </button>
          </div>
        </form>
      </div>

      <!-- IRL Revision Tab -->
      <div v-if="activeTab === 'irl'">
        <form @submit.prevent="calculateIRL" class="space-y-4">
          <div class="alert alert-info">
            <div>
              <div class="font-semibold mb-2">Calculateur de révision IRL</div>
              <div class="text-sm">
                Cet outil calcule automatiquement le nouveau loyer en fonction de l'évolution de l'indice IRL.
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="form-control">
              <label class="label pb-2">
                <span class="label-text font-semibold">Nouvel indice IRL</span>
              </label>
              <input
                type="number"
                step="0.0001"
                v-model="irlCalculation.newIrlIndex"
                class="input input-bordered bg-base-200 focus:bg-base-100 focus:border-primary"
                placeholder="ex: 142.5687"
                required
              >
            </div>

            <div class="form-control">
              <label class="label pb-2">
                <span class="label-text font-semibold">Trimestre</span>
              </label>
              <input
                type="text"
                v-model="irlCalculation.irlQuarter"
                class="input input-bordered bg-base-200 focus:bg-base-100 focus:border-primary"
                placeholder="ex: T1 2024"
                required
              >
            </div>

            <div class="form-control col-span-2">
              <label class="label pb-2">
                <span class="label-text font-semibold">Date d'application de la révision</span>
              </label>
              <input
                type="date"
                v-model="irlCalculation.revisionDate"
                class="input input-bordered bg-base-200 focus:bg-base-100 focus:border-primary"
                required
              >
            </div>
          </div>

          <div class="flex gap-2">
            <button type="submit" class="btn btn-primary" :disabled="loading">
              <span v-if="loading" class="loading loading-spinner loading-sm"></span>
              Calculer
            </button>
          </div>

          <!-- IRL Calculation Result -->
          <div v-if="irlResult" class="card bg-base-200 mt-4">
            <div class="card-body">
              <h4 class="card-title text-base">Résultat du calcul</h4>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <div class="text-xs opacity-70">IRL précédent</div>
                  <div class="font-semibold">{{ irlResult.previousIrlIndex }}</div>
                </div>
                <div>
                  <div class="text-xs opacity-70">Nouvel IRL</div>
                  <div class="font-semibold">{{ irlResult.newIrlIndex }}</div>
                </div>
                <div>
                  <div class="text-xs opacity-70">Augmentation</div>
                  <div class="font-semibold text-success">{{ irlResult.irlIncrease }}</div>
                </div>
              </div>

              <div class="divider"></div>

              <div class="grid grid-cols-3 gap-4">
                <div>
                  <div class="text-xs opacity-70">Loyer actuel HC</div>
                  <div class="font-semibold">{{ formatCurrency(irlResult.currentRentAmount) }}</div>
                </div>
                <div>
                  <div class="text-xs opacity-70">→</div>
                </div>
                <div>
                  <div class="text-xs opacity-70">Nouveau loyer HC</div>
                  <div class="font-bold text-success">{{ formatCurrency(irlResult.newRentAmount) }}</div>
                </div>

                <div>
                  <div class="text-xs opacity-70">Charges actuelles</div>
                  <div class="font-semibold">{{ formatCurrency(irlResult.currentChargesAmount) }}</div>
                </div>
                <div>
                  <div class="text-xs opacity-70">→</div>
                </div>
                <div>
                  <div class="text-xs opacity-70">Nouvelles charges</div>
                  <div class="font-semibold">{{ formatCurrency(irlResult.newChargesAmount) }}</div>
                </div>

                <div>
                  <div class="text-xs opacity-70">Total actuel</div>
                  <div class="font-bold">{{ formatCurrency(irlResult.currentTotalAmount) }}</div>
                </div>
                <div>
                  <div class="text-xs opacity-70">→</div>
                </div>
                <div>
                  <div class="text-xs opacity-70">Nouveau total</div>
                  <div class="font-bold text-success text-lg">{{ formatCurrency(irlResult.newTotalAmount) }}</div>
                </div>
              </div>

              <div class="card-actions justify-end mt-4">
                <button @click="applyIRLRevision" class="btn btn-success">
                  Appliquer cette révision
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      <!-- Close Button -->
      <div v-if="activeTab === 'history'" class="modal-action">
        <button @click="closeModal" class="btn">Fermer</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import api from '@/services/api';
import { useToast } from 'vue-toastification';

const props = defineProps({
  isOpen: Boolean,
  leaseId: String
});

const emit = defineEmits(['close', 'updated']);

const toast = useToast();
const activeTab = ref('history');
const periods = ref([]);
const currentPeriod = ref(null);
const loading = ref(false);

const newPeriod = ref({
  startDate: '',
  rentAmount: '',
  chargesAmount: '',
  changeReason: 'irl_revision',
  irlIndex: '',
  irlQuarter: '',
  notes: ''
});

const irlCalculation = ref({
  newIrlIndex: '',
  irlQuarter: '',
  revisionDate: ''
});

const irlResult = ref(null);

watch(() => props.isOpen, async (isOpen) => {
  if (isOpen && props.leaseId) {
    await loadPeriods();
    await loadCurrentPeriod();
  }
});

const loadPeriods = async () => {
  try {
    const response = await api.get(`/api/lease-rent-periods/history/${props.leaseId}`);
    periods.value = response.data.data;
  } catch (error) {
    console.error('Error loading rent periods:', error);
    toast.error('Erreur lors du chargement de l\'historique');
  }
};

const loadCurrentPeriod = async () => {
  try {
    const response = await api.get(`/api/lease-rent-periods/current/${props.leaseId}`);
    currentPeriod.value = response.data.data;

    // Pre-fill new period with current values
    if (currentPeriod.value) {
      newPeriod.value.rentAmount = currentPeriod.value.rentAmount;
      newPeriod.value.chargesAmount = currentPeriod.value.chargesAmount;
    }
  } catch (error) {
    console.error('Error loading current period:', error);
    // It's ok if there's no current period
  }
};

const createNewPeriod = async () => {
  try {
    loading.value = true;
    await api.post('/api/lease-rent-periods', {
      leaseId: props.leaseId,
      ...newPeriod.value
    });

    toast.success('Période créée avec succès');

    // Reload data
    await loadPeriods();
    await loadCurrentPeriod();

    // Reset form
    newPeriod.value = {
      startDate: '',
      rentAmount: currentPeriod.value?.rentAmount || '',
      chargesAmount: currentPeriod.value?.chargesAmount || '',
      changeReason: 'irl_revision',
      irlIndex: '',
      irlQuarter: '',
      notes: ''
    };

    activeTab.value = 'history';
    emit('updated');
  } catch (error) {
    console.error('Error creating new period:', error);
    toast.error(error.response?.data?.error?.message || 'Erreur lors de la création de la période');
  } finally {
    loading.value = false;
  }
};

const calculateIRL = async () => {
  try {
    loading.value = true;
    const response = await api.post('/api/lease-rent-periods/calculate-irl', {
      leaseId: props.leaseId,
      ...irlCalculation.value
    });

    irlResult.value = response.data.data;
  } catch (error) {
    console.error('Error calculating IRL:', error);
    toast.error(error.response?.data?.error?.message || 'Erreur lors du calcul IRL');
  } finally {
    loading.value = false;
  }
};

const applyIRLRevision = () => {
  newPeriod.value = {
    startDate: irlResult.value.suggestedStartDate,
    rentAmount: irlResult.value.newRentAmount,
    chargesAmount: irlResult.value.newChargesAmount,
    changeReason: 'irl_revision',
    irlIndex: irlCalculation.value.newIrlIndex,
    irlQuarter: irlCalculation.value.irlQuarter,
    notes: `Révision IRL: ${irlResult.value.irlIncrease}`
  };

  activeTab.value = 'new';
  irlResult.value = null;
};

const closeModal = () => {
  emit('close');
  activeTab.value = 'history';
  irlResult.value = null;
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('fr-FR');
};

const getReasonLabel = (reason) => {
  const labels = {
    initial: 'Initial',
    irl_revision: 'IRL',
    tenant_change: 'Locataire',
    work_completion: 'Travaux',
    occupant_change: 'Occupants',
    charge_increase: 'Charges',
    rent_decrease: 'Diminution',
    other: 'Autre'
  };
  return labels[reason] || reason;
};

const getReasonBadgeClass = (reason) => {
  const classes = {
    initial: 'badge-neutral',
    irl_revision: 'badge-primary',
    tenant_change: 'badge-secondary',
    work_completion: 'badge-accent',
    occupant_change: 'badge-info',
    charge_increase: 'badge-warning',
    rent_decrease: 'badge-error',
    other: 'badge-ghost'
  };
  return classes[reason] || 'badge-ghost';
};
</script>
