<template>
  <Modal v-model="isOpen" title="Clôturer le bail" size="md" :hide-footer="true">
    <div v-if="lease" class="space-y-4">
      <!-- Lease Info -->
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
          <!-- End Date -->
          <div class="form-control">
            <label class="label">
              <span class="label-text font-semibold">Date de fin effective *</span>
            </label>
            <input
              v-model="form.endDate"
              type="date"
              class="input input-bordered w-full"
              :min="lease.startDate"
              required
            />
          </div>

          <!-- Closure Reason -->
          <div class="form-control">
            <label class="label">
              <span class="label-text font-semibold">Motif de clôture *</span>
            </label>
            <select v-model="form.closureReason" class="select select-bordered w-full" required>
              <option value="">Sélectionner un motif</option>
              <option value="normal_end">Fin normale du bail</option>
              <option value="tenant_termination">Résiliation par le locataire</option>
              <option value="owner_termination">Résiliation par le propriétaire</option>
              <option value="mutual_agreement">Accord mutuel</option>
              <option value="other">Autre</option>
            </select>
          </div>

          <!-- Closure Notes -->
          <div class="form-control">
            <label class="label">
              <span class="label-text font-semibold">Notes de clôture</span>
            </label>
            <textarea
              v-model="form.closureNotes"
              rows="3"
              class="textarea textarea-bordered w-full"
              placeholder="Détails sur la clôture du bail..."
            ></textarea>
          </div>

          <!-- Deposit Return -->
          <div class="form-control">
            <label class="label cursor-pointer justify-start gap-2">
              <input
                type="checkbox"
                v-model="form.depositReturned"
                class="checkbox checkbox-primary"
              />
              <span class="label-text font-semibold">Dépôt de garantie restitué</span>
            </label>
          </div>

          <!-- Deposit Return Date -->
          <div v-if="form.depositReturned" class="form-control">
            <label class="label">
              <span class="label-text font-semibold">Date de restitution</span>
            </label>
            <input
              v-model="form.depositReturnedDate"
              type="date"
              class="input input-bordered w-full"
              :max="new Date().toISOString().split('T')[0]"
            />
          </div>

          <!-- Document Upload (État des lieux sortie) -->
          <div class="form-control">
            <label class="label">
              <span class="label-text font-semibold">État des lieux de sortie</span>
            </label>
            <input
              type="file"
              @change="handleFileChange"
              accept=".pdf,.jpg,.jpeg,.png"
              multiple
              class="file-input file-input-bordered w-full"
            />
            <div v-if="selectedFiles.length > 0" class="mt-2 space-y-1">
              <div v-for="(file, index) in selectedFiles" :key="index" class="flex items-center gap-2 text-sm">
                <span class="text-success">✓</span>
                <span>{{ file.name }}</span>
                <button type="button" @click="removeFile(index)" class="btn btn-ghost btn-xs text-error">✕</button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <button @click="close" class="btn">Annuler</button>
        <button @click="handleSubmit" :disabled="saving" class="btn btn-warning">
          <span v-if="saving" class="loading loading-spinner loading-sm"></span>
          {{ saving ? 'Clôture...' : 'Clôturer le bail' }}
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

const emit = defineEmits(['update:modelValue', 'closed']);

const toast = useToast();
const saving = ref(false);
const selectedFiles = ref([]);

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const form = reactive({
  endDate: '',
  closureReason: '',
  closureNotes: '',
  depositReturned: false,
  depositReturnedDate: ''
});

const handleFileChange = (event) => {
  const files = Array.from(event.target.files);
  selectedFiles.value = [...selectedFiles.value, ...files];
};

const removeFile = (index) => {
  selectedFiles.value.splice(index, 1);
};

const handleSubmit = async () => {
  if (!form.endDate || !form.closureReason) {
    toast.error('Veuillez remplir tous les champs obligatoires');
    return;
  }

  saving.value = true;
  try {
    // Close lease
    await api.put(`/api/leases/${props.lease.id}/close`, {
      endDate: form.endDate,
      closureReason: form.closureReason,
      closureNotes: form.closureNotes,
      depositReturned: form.depositReturned,
      depositReturnedDate: form.depositReturnedDate || null
    });

    // Upload état des lieux if any
    if (selectedFiles.value.length > 0) {
      const formData = new FormData();
      selectedFiles.value.forEach(file => {
        formData.append('files', file);
      });
      formData.append('category', 'inventory_out');

      try {
        await api.post(`/api/leases/${props.lease.id}/documents`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } catch (error) {
        console.error('Error uploading documents:', error);
        toast.warning('Bail clôturé mais erreur lors de l\'upload des documents');
      }
    }

    toast.success('Bail clôturé avec succès');
    emit('closed');
    close();
  } catch (error) {
    console.error('Error closing lease:', error);
    toast.error(error.response?.data?.message || 'Erreur lors de la clôture du bail');
  } finally {
    saving.value = false;
  }
};

const close = () => {
  isOpen.value = false;
  resetForm();
};

const resetForm = () => {
  Object.assign(form, {
    endDate: '',
    closureReason: '',
    closureNotes: '',
    depositReturned: false,
    depositReturnedDate: ''
  });
  selectedFiles.value = [];
};

watch(isOpen, (value) => {
  if (value && props.lease) {
    // Pre-fill with today's date
    form.endDate = new Date().toISOString().split('T')[0];
  }
});
</script>
