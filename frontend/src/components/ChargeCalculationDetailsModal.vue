<template>
  <Modal
    :model-value="show"
    @update:model-value="$emit('close')"
    title="Détail du calcul de répartition"
    size="lg"
  >
    <div v-if="!details" class="text-center py-8 text-base-content/60">
      <p>Aucun détail de calcul disponible pour cette charge.</p>
      <p class="text-sm mt-2">Les détails sont générés lors de la distribution automatique par appartement.</p>
    </div>

    <div v-else class="space-y-6">
      <!-- Summary -->
      <div class="alert alert-info">
        <div>
          <div class="font-semibold">Répartition par appartement - Année {{ details.year }}</div>
          <div class="text-sm mt-1">
            Montant total : <span class="font-bold">{{ formatCurrency(details.totalAmount) }}</span>
          </div>
          <div class="text-sm">
            Total des unités pondérées : <span class="font-bold">{{ details.totalWeight }}</span>
            <span class="text-xs opacity-70 ml-1">(jours × occupants)</span>
          </div>
        </div>
      </div>

      <!-- Note if fallback -->
      <div v-if="details.note" class="alert alert-warning">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <span>{{ details.note }}</span>
      </div>

      <!-- Apartments Details -->
      <div class="space-y-4">
        <h3 class="font-semibold text-lg">Détail par appartement</h3>
        
        <div
          v-for="(apartment, index) in details.apartments"
          :key="apartment.propertyId"
          class="card bg-base-100 border border-base-300"
        >
          <div class="card-body p-4">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <h4 class="font-semibold text-base">
                  {{ apartment.propertyName }}
                </h4>
                <div class="text-sm opacity-70 mt-1">
                  Total : {{ apartment.weight }} unités
                  <span v-if="details.totalWeight > 0">
                    ({{ ((apartment.weight / details.totalWeight) * 100).toFixed(2) }}%)
                  </span>
                </div>
              </div>
              <div class="text-right">
                <div class="text-lg font-bold text-primary">
                  {{ formatCurrency(getDistributionAmount(apartment.propertyId)) }}
                </div>
              </div>
            </div>

            <!-- Periods breakdown -->
            <div v-if="apartment.periods && apartment.periods.length > 0" class="mt-4">
              <div class="text-xs font-semibold uppercase opacity-60 mb-2">Périodes d'occupation</div>
              <div class="overflow-x-auto">
                <table class="table table-xs">
                  <thead>
                    <tr>
                      <th>Début</th>
                      <th>Fin</th>
                      <th class="text-center">Jours</th>
                      <th class="text-center">Occupants</th>
                      <th class="text-right">Unités</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(period, pIndex) in apartment.periods" :key="pIndex">
                      <td>{{ formatDate(period.startDate) }}</td>
                      <td>{{ formatDate(period.endDate) }}</td>
                      <td class="text-center">{{ period.days }}</td>
                      <td class="text-center">{{ period.occupants }}</td>
                      <td class="text-right font-semibold">{{ period.weight }}</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr class="font-semibold">
                      <td colspan="4" class="text-right">Total :</td>
                      <td class="text-right">{{ apartment.weight }}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div v-else class="text-sm opacity-60 mt-2">
              Aucune période d'occupation enregistrée
            </div>
          </div>
        </div>
      </div>

      <!-- Calculation Formula -->
      <div class="alert">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div class="text-sm">
          <div class="font-semibold mb-1">Formule de calcul</div>
          <div>Unités = Nombre de jours × Nombre d'occupants</div>
          <div>Part de l'appartement = (Unités de l'appartement / Total des unités) × Montant total</div>
        </div>
      </div>
    </div>

    <template #footer>
      <button @click="$emit('close')" class="btn">Fermer</button>
    </template>
  </Modal>
</template>

<script setup>
import { ref, watch } from 'vue';
import Modal from '@/components/ui/Modal.vue';
import api from '@/services/api';

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  chargeId: {
    type: String,
    default: null
  },
  distributions: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['close']);

const details = ref(null);
const loading = ref(false);

watch(() => props.show, async (newValue) => {
  if (newValue && props.chargeId) {
    await loadCalculationDetails();
  }
});

const loadCalculationDetails = async () => {
  loading.value = true;
  try {
    const response = await api.get(`/api/charges/${props.chargeId}/calculation-details`);
    details.value = response.data.data;
  } catch (error) {
    console.error('Error loading calculation details:', error);
    details.value = null;
  } finally {
    loading.value = false;
  }
};

const getDistributionAmount = (propertyId) => {
  const dist = props.distributions.find(d => d.propertyId === propertyId);
  return dist ? parseFloat(dist.amount) : 0;
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};
</script>
