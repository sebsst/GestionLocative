<template>
  <Modal
    :model-value="isOpen"
    @update:model-value="handleClose"
    title="Historique des montants de loyer"
    size="xl"
    :show-close="true"
  >
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

    <!-- ACCORDION SECTION 1: New/Edit Amount (open by default) -->
    <div class="collapse collapse-arrow bg-base-200 mb-4 collapse-open">
      <input type="checkbox" checked />
      <div class="collapse-title text-lg font-medium flex items-center gap-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        {{ editingPeriod ? 'Modifier le montant' : 'Nouveau montant' }}
      </div>
      <div class="collapse-content">
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
                <span class="label-text font-semibold">Loyer charges comprises (€)</span>
              </label>
              <input
                type="number"
                step="0.01"
                v-model="newPeriod.totalAmount"
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

            <div class="form-control">
              <label class="label pb-2">
                <span class="label-text font-semibold">Loyer hors charges (€)</span>
              </label>
              <input
                type="number"
                step="0.01"
                :value="calculatedRentAmount"
                class="input input-bordered bg-base-300"
                placeholder="0.00"
                disabled
              >
            </div>

            <div v-if="newPeriod.changeReason === 'irl_revision'" class="form-control">
              <label class="label pb-2">
                <span class="label-text font-semibold">Trimestre IRL</span>
              </label>
              <input
                type="text"
                v-model="newPeriod.irlQuarter"
                placeholder="T1 2024 (optionnel)"
                class="input input-bordered bg-base-200 focus:bg-base-100 focus:border-primary"
              >
              <label class="label">
                <span class="label-text-alt">Optionnel</span>
              </label>
            </div>

            <div v-if="newPeriod.changeReason === 'irl_revision'" class="form-control">
              <label class="label pb-2">
                <span class="label-text font-semibold">Indice IRL</span>
              </label>
              <input
                type="number"
                step="0.0001"
                v-model="newPeriod.irlIndex"
                placeholder="142.5687 (optionnel)"
                class="input input-bordered bg-base-200 focus:bg-base-100 focus:border-primary"
              >
              <label class="label">
                <span class="label-text-alt">Optionnel</span>
              </label>
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

          <div class="flex justify-end gap-2">
            <button type="button" @click="handleClose" class="btn btn-ghost">Annuler</button>
            <button v-if="editingPeriod" type="button" @click="cancelEdit" class="btn btn-outline">Nouvelle période</button>
            <button type="submit" class="btn btn-primary" :disabled="loading">
              <span v-if="loading" class="loading loading-spinner loading-sm"></span>
              {{ editingPeriod ? 'Modifier la période' : 'Créer la période' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ACCORDION SECTION 2: IRL Revision -->
    <div class="collapse collapse-arrow bg-base-200 mb-4">
      <input type="checkbox" />
      <div class="collapse-title text-lg font-medium flex items-center gap-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        Révision IRL
      </div>
      <div class="collapse-content">
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
    </div>

    <!-- ACCORDION SECTION 3: History -->
    <div class="collapse collapse-arrow bg-base-200 mb-4">
      <input type="checkbox" />
      <div class="collapse-title text-lg font-medium flex items-center gap-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Historique des montants
        <span v-if="periods.length > 0" class="badge badge-neutral badge-sm ml-2">
          {{ periods.length }}
        </span>
      </div>
      <div class="collapse-content">
        <div v-if="periods.length > 0" class="overflow-x-auto">
          <table class="table table-zebra">
            <thead>
              <tr>
                <th>Période</th>
                <th>Loyer HC</th>
                <th>Charges</th>
                <th>Total</th>
                <th>Motif</th>
                <th>IRL</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="period in periods" :key="period.id" class="h-6">
                <td>
                  <div class="text-sm">
                    {{ formatDate(period.startDate) }}
                    <span v-if="period.endDate">→ {{ formatDate(period.endDate) }}</span>
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
        </div>
        <div v-else class="text-center py-8 text-base-content/60">
          Aucun historique de montant. Créez une première période ci-dessus.
        </div>
      </div>
    </div>

    <template #footer>
      <button @click="handleClose" class="btn">Fermer</button>
    </template>
  </Modal>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import Modal from '@/components/ui/Modal.vue';
import api from '@/services/api';
import { useToast } from 'vue-toastification';

const props = defineProps({
  isOpen: Boolean,
  leaseId: String
});

const emit = defineEmits(['close', 'updated']);

const toast = useToast();
const periods = ref([]);
const currentPeriod = ref(null);
const loading = ref(false);
const editingPeriod = ref(null);

const newPeriod = ref({
  startDate: '',
  totalAmount: '',
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

// Computed property for rent amount (total - charges)
const calculatedRentAmount = computed(() => {
  const total = parseFloat(newPeriod.value.totalAmount) || 0;
  const charges = parseFloat(newPeriod.value.chargesAmount) || 0;
  return (total - charges).toFixed(2);
});

watch(() => props.isOpen, async (isOpen) => {
  console.log('LeaseRentPeriodModal watch - isOpen:', isOpen, 'leaseId:', props.leaseId);
  if (isOpen && props.leaseId) {
    await loadPeriods();
    await loadCurrentPeriod();
  } else if (isOpen && !props.leaseId) {
    console.error('LeaseRentPeriodModal: leaseId is undefined');
  }
});

const loadPeriods = async () => {
  if (!props.leaseId) {
    console.error('loadPeriods: leaseId is undefined');
    periods.value = [];
    return;
  }

  try {
    console.log('Making API call for leaseId:', props.leaseId);
    const response = await api.get(`/api/lease-rent-periods/history/${props.leaseId}`);
    console.log('API response received:', response.data);
    const data = response.data.data || [];
    // Sort by startDate in descending order (most recent first)
    periods.value = data.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
    console.log('Periods sorted and set to:', periods.value);
  } catch (error) {
    console.error('Error loading rent periods:', error);
    console.error('Error details:', error.response);
    periods.value = [];
  }
};

const loadCurrentPeriod = async () => {
  if (!props.leaseId) {
    console.error('loadCurrentPeriod: leaseId is undefined');
    currentPeriod.value = null;
    return;
  }

  try {
    // Find the current period (no endDate)
    const current = periods.value.find(p => !p.endDate);
    currentPeriod.value = current || null;
  } catch (error) {
    console.error('Error loading current period:', error);
    currentPeriod.value = null;
  }
};

const editPeriod = (period) => {
  editingPeriod.value = period;

  // Populate form with period data for editing
  newPeriod.value = {
    startDate: period.startDate,
    totalAmount: period.totalAmount,
    chargesAmount: period.chargesAmount,
    changeReason: period.changeReason || 'irl_revision',
    irlIndex: period.irlIndex || '',
    irlQuarter: period.irlQuarter || '',
    notes: period.notes || ''
  };
};

const createNewPeriod = async () => {
  if (!newPeriod.value.startDate || !newPeriod.value.totalAmount || !newPeriod.value.chargesAmount) {
    toast.error('Veuillez remplir tous les champs obligatoires');
    return;
  }

  try {
    loading.value = true;

    // Calculate rentAmount from totalAmount - chargesAmount
    const rentAmount = parseFloat(newPeriod.value.totalAmount) - parseFloat(newPeriod.value.chargesAmount);

    const periodData = {
      leaseId: props.leaseId,
      startDate: newPeriod.value.startDate,
      rentAmount: rentAmount,
      chargesAmount: newPeriod.value.chargesAmount,
      totalAmount: newPeriod.value.totalAmount,
      changeReason: newPeriod.value.changeReason,
      // Convert empty strings to null for optional numeric fields
      irlIndex: newPeriod.value.irlIndex || null,
      irlQuarter: newPeriod.value.irlQuarter || null,
      notes: newPeriod.value.notes || null
    };

    if (editingPeriod.value) {
      // Update existing period
      await api.put(`/api/lease-rent-periods/${editingPeriod.value.id}`, periodData);
      toast.success('Période modifiée avec succès');
    } else {
      // Create new period
      await api.post('/api/lease-rent-periods', periodData);
      toast.success('Période créée avec succès');
    }

    // Reload data
    await loadPeriods();
    await loadCurrentPeriod();

    // Reset form and editing state
    editingPeriod.value = null;
    newPeriod.value = {
      startDate: '',
      totalAmount: currentPeriod.value?.totalAmount || '',
      chargesAmount: currentPeriod.value?.chargesAmount || '',
      changeReason: 'irl_revision',
      irlIndex: '',
      irlQuarter: '',
      notes: ''
    };

    emit('updated');
  } catch (error) {
    console.error('Error saving period:', error);
    toast.error(error.response?.data?.message || 'Erreur lors de la sauvegarde de la période');
  } finally {
    loading.value = false;
  }
};

const cancelEdit = () => {
  editingPeriod.value = null;
  newPeriod.value = {
    startDate: '',
    totalAmount: currentPeriod.value?.totalAmount || '',
    chargesAmount: currentPeriod.value?.chargesAmount || '',
    changeReason: 'irl_revision',
    irlIndex: '',
    irlQuarter: '',
    notes: ''
  };
};

const calculateIRL = async () => {
  if (!irlCalculation.value.newIrlIndex || !irlCalculation.value.irlQuarter || !irlCalculation.value.revisionDate) {
    toast.error('Veuillez remplir tous les champs');
    return;
  }

  try {
    loading.value = true;

    // Get current rent period
    const currentPeriod = periods.value.find(p => !p.endDate);
    if (!currentPeriod) {
      toast.error('Aucune période de loyer actuelle trouvée');
      return;
    }

    // Calculate new rent amount
    const newRentAmount = Math.round(currentPeriod.rentAmount * (irlCalculation.value.newIrlIndex / currentPeriod.irlIndex));

    irlResult.value = {
      previousIrlIndex: currentPeriod.irlIndex,
      newIrlIndex: irlCalculation.value.newIrlIndex,
      irlIncrease: ((irlCalculation.value.newIrlIndex - currentPeriod.irlIndex) / currentPeriod.irlIndex * 100).toFixed(2) + '%',
      currentRentAmount: currentPeriod.rentAmount,
      newRentAmount: newRentAmount,
      currentChargesAmount: currentPeriod.chargesAmount,
      newChargesAmount: currentPeriod.chargesAmount, // Charges typically don't change with IRL
      currentTotalAmount: currentPeriod.totalAmount,
      newTotalAmount: newRentAmount + currentPeriod.chargesAmount
    };

    toast.success('Calcul IRL effectué');
  } catch (error) {
    console.error('Error calculating IRL:', error);
    toast.error('Erreur lors du calcul IRL');
  } finally {
    loading.value = false;
  }
};

const applyIRLRevision = async () => {
  if (!irlResult.value) {
    toast.error('Veuillez d\'abord effectuer un calcul IRL');
    return;
  }

  try {
    loading.value = true;

    const data = {
      leaseId: props.leaseId,
      startDate: irlCalculation.value.revisionDate,
      rentAmount: irlResult.value.newRentAmount,
      chargesAmount: irlResult.value.newChargesAmount,
      changeReason: 'irl_revision',
      irlIndex: irlCalculation.value.newIrlIndex,
      irlQuarter: irlCalculation.value.irlQuarter,
      notes: `Révision IRL - Ancien IRL: ${irlResult.value.previousIrlIndex}, Nouveau IRL: ${irlResult.value.newIrlIndex}`
    };

    await api.post('/api/lease-rent-periods', data);
    toast.success('Révision IRL appliquée avec succès');

    // Reset form and reload data
    irlCalculation.value = {
      newIrlIndex: '',
      irlQuarter: '',
      revisionDate: ''
    };
    irlResult.value = null;

    await loadPeriods();
    await loadCurrentPeriod();
    emit('updated');
  } catch (error) {
    console.error('Error applying IRL revision:', error);
    toast.error('Erreur lors de l\'application de la révision IRL');
  } finally {
    loading.value = false;
  }
};

const closeModal = () => {
  cancelEdit();
  emit('close');
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

const handleClose = () => {
  emit('close');
};
</script>
