<template>
  <Modal v-model="isOpen" title="Créer un bail" size="lg" :hide-footer="true">
    <form @submit.prevent="handleSubmit">
      <div class="space-y-4">
        <!-- Property Selection -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-semibold">Bien *</span>
          </label>
          <select v-model="form.propertyId" class="select select-bordered w-full" required>
            <option value="">Sélectionner un bien</option>
            <option v-for="property in availableProperties" :key="property.id" :value="property.id">
              {{ property.name }} - {{ property.address }}
            </option>
          </select>
        </div>

        <!-- Tenant Selection -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-semibold">Locataire *</span>
          </label>
          <select v-model="form.tenantId" class="select select-bordered w-full" required>
            <option value="">Sélectionner un locataire</option>
            <option v-for="tenant in tenants" :key="tenant.id" :value="tenant.id">
              {{ tenant.firstName }} {{ tenant.lastName }}
            </option>
          </select>
        </div>

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

        <!-- Documents Upload -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-semibold">Documents (Contrat, État des lieux...)</span>
          </label>
          <input
            type="file"
            @change="handleFileChange"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            multiple
            class="file-input file-input-bordered w-full"
          />
          <label class="label">
            <span class="label-text-alt">PDF, images, documents (max 10MB par fichier)</span>
          </label>
          <div v-if="selectedFiles.length > 0" class="mt-2 space-y-1">
            <div v-for="(file, index) in selectedFiles" :key="index" class="flex items-center gap-2 text-sm">
              <span class="text-success">✓</span>
              <span>{{ file.name }}</span>
              <button type="button" @click="removeFile(index)" class="btn btn-ghost btn-xs text-error">✕</button>
            </div>
          </div>
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

    <template #footer>
      <div class="flex justify-end gap-2">
        <button @click="close" class="btn">Annuler</button>
        <button @click="handleSubmit" :disabled="saving" class="btn btn-primary">
          <span v-if="saving" class="loading loading-spinner loading-sm"></span>
          {{ saving ? 'Création...' : 'Créer le bail' }}
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
  modelValue: Boolean
});

const emit = defineEmits(['update:modelValue', 'created']);

const toast = useToast();
const saving = ref(false);
const selectedFiles = ref([]);
const properties = ref([]);
const tenants = ref([]);

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const form = reactive({
  propertyId: '',
  tenantId: '',
  startDate: '',
  endDate: '',
  rentAmount: 0,
  chargesAmount: 0,
  deposit: 0,
  notes: ''
});

const availableProperties = computed(() => {
  return properties.value.filter(p => p.status === 'disponible');
});

const loadProperties = async () => {
  try {
    const response = await api.get('/api/properties');
    properties.value = response.data.data || [];
  } catch (error) {
    console.error('Error loading properties:', error);
  }
};

const loadTenants = async () => {
  try {
    const response = await api.get('/api/tenants');
    tenants.value = response.data.data || [];
  } catch (error) {
    console.error('Error loading tenants:', error);
  }
};

const handleFileChange = (event) => {
  const files = Array.from(event.target.files);
  selectedFiles.value = [...selectedFiles.value, ...files];
};

const removeFile = (index) => {
  selectedFiles.value.splice(index, 1);
};

const handleSubmit = async () => {
  if (!form.propertyId || !form.tenantId || !form.startDate || !form.rentAmount) {
    toast.error('Veuillez remplir tous les champs obligatoires');
    return;
  }

  saving.value = true;
  try {
    // Create lease
    const leaseResponse = await api.post('/api/leases', {
      propertyId: form.propertyId,
      tenantId: form.tenantId,
      startDate: form.startDate,
      endDate: form.endDate || null,
      rentAmount: form.rentAmount,
      chargesAmount: form.chargesAmount || 0,
      deposit: form.deposit || 0,
      status: 'actif',
      notes: form.notes
    });

    const leaseId = leaseResponse.data.data.id;

    // Upload documents if any
    if (selectedFiles.value.length > 0) {
      const formData = new FormData();
      selectedFiles.value.forEach(file => {
        formData.append('files', file);
      });
      formData.append('category', 'contract');

      try {
        await api.post(`/api/leases/${leaseId}/documents`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } catch (error) {
        console.error('Error uploading documents:', error);
        toast.warning('Bail créé mais erreur lors de l\'upload des documents');
      }
    }

    toast.success('Bail créé avec succès');
    emit('created');
    close();
  } catch (error) {
    console.error('Error creating lease:', error);
    toast.error(error.response?.data?.message || 'Erreur lors de la création du bail');
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
    propertyId: '',
    tenantId: '',
    startDate: '',
    endDate: '',
    rentAmount: 0,
    chargesAmount: 0,
    deposit: 0,
    notes: ''
  });
  selectedFiles.value = [];
};

watch(isOpen, (value) => {
  if (value) {
    loadProperties();
    loadTenants();
  }
});
</script>
