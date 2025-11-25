<template>
  <Modal v-model="isOpen" title="Modifier le bail" size="lg" :hide-footer="true">
    <div v-if="lease" class="space-y-4">
      <!-- Lease Info (read-only) -->
      <div class="alert alert-info">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <div class="font-semibold">{{ lease.Property?.name }}</div>
          <div class="text-sm">{{ lease.Tenant?.firstName }} {{ lease.Tenant?.lastName }}</div>
        </div>
      </div>

      <form @submit.prevent="handleSubmit">
        <div class="space-y-4">
          <!-- Dates -->
          <div class="grid grid-cols-2 gap-4">
            <div class="form-control">
              <label class="label">
                <span class="label-text font-semibold">Date de début *</span>
              </label>
              <input
                v-model="form.startDate"
                type="date"
                class="input input-bordered w-full"
                required
              />
            </div>
            <div class="form-control">
              <label class="label">
                <span class="label-text font-semibold">Date de fin</span>
              </label>
              <input
                v-model="form.endDate"
                type="date"
                class="input input-bordered w-full"
                :min="form.startDate"
              />
            </div>
          </div>

          <!-- Rent and Charges -->
          <div class="grid grid-cols-2 gap-4">
            <div class="form-control">
              <label class="label">
                <span class="label-text font-semibold">Loyer mensuel (€) *</span>
              </label>
              <input
                v-model.number="form.rentAmount"
                type="number"
                step="0.01"
                min="0"
                class="input input-bordered w-full"
                required
              />
            </div>
            <div class="form-control">
              <label class="label">
                <span class="label-text font-semibold">Charges (€)</span>
              </label>
              <input
                v-model.number="form.chargesAmount"
                type="number"
                step="0.01"
                min="0"
                class="input input-bordered w-full"
              />
            </div>
          </div>

          <!-- Deposit -->
          <div class="form-control">
            <label class="label">
              <span class="label-text font-semibold">Dépôt de garantie (€)</span>
            </label>
            <input
              v-model.number="form.deposit"
              type="number"
              step="0.01"
              min="0"
              class="input input-bordered w-full"
            />
          </div>

          <!-- Status -->
          <div class="form-control">
            <label class="label">
              <span class="label-text font-semibold">Statut</span>
            </label>
            <select v-model="form.status" class="select select-bordered w-full">
              <option value="actif">Actif</option>
              <option value="termine">Terminé</option>
              <option value="resilie">Résilié</option>
            </select>
          </div>

          <!-- Notes -->
          <div class="form-control">
            <label class="label">
              <span class="label-text font-semibold">Notes</span>
            </label>
            <textarea
              v-model="form.notes"
              rows="3"
              class="textarea textarea-bordered w-full"
              placeholder="Notes supplémentaires..."
            ></textarea>
          </div>
        </div>
      </form>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <button @click="close" class="btn">Annuler</button>
        <button @click="handleSubmit" :disabled="saving" class="btn btn-primary">
          <span v-if="saving" class="loading loading-spinner loading-sm"></span>
          {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
        </button>
      </div>
    </template>
  </Modal>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue';
import { useToast } from 'vue-toastification';
import api from '@/services/api';
import Modal from '@/components/ui/Modal.vue';

const props = defineProps({
  modelValue: Boolean,
  lease: Object
});

const emit = defineEmits(['update:modelValue', 'updated']);

const toast = useToast();
const saving = ref(false);

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const form = reactive({
  startDate: '',
  endDate: '',
  rentAmount: 0,
  chargesAmount: 0,
  deposit: 0,
  status: 'actif',
  notes: ''
});

const handleSubmit = async () => {
  if (!form.startDate || !form.rentAmount) {
    toast.error('Veuillez remplir tous les champs obligatoires');
    return;
  }

  saving.value = true;
  try {
    await api.put(`/api/leases/${props.lease.id}`, {
      startDate: form.startDate,
      endDate: form.endDate || null,
      rentAmount: form.rentAmount,
      chargesAmount: form.chargesAmount || 0,
      deposit: form.deposit || 0,
      status: form.status,
      notes: form.notes
    });

    toast.success('Bail modifié avec succès');
    emit('updated');
    close();
  } catch (error) {
    console.error('Error updating lease:', error);
    toast.error(error.response?.data?.message || 'Erreur lors de la modification du bail');
  } finally {
    saving.value = false;
  }
};

const close = () => {
  isOpen.value = false;
};

const loadLeaseData = () => {
  if (props.lease) {
    Object.assign(form, {
      startDate: props.lease.startDate?.split('T')[0] || '',
      endDate: props.lease.endDate?.split('T')[0] || '',
      rentAmount: parseFloat(props.lease.rentAmount) || 0,
      chargesAmount: parseFloat(props.lease.chargesAmount) || 0,
      deposit: parseFloat(props.lease.deposit) || 0,
      status: props.lease.status || 'actif',
      notes: props.lease.notes || ''
    });
  }
};

watch(isOpen, (value) => {
  if (value) {
    loadLeaseData();
  }
});
</script>
