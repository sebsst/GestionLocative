<template>
  <Modal v-model="isOpen" title="Documents du bail" size="lg" :hide-footer="true">
    <div v-if="lease" class="space-y-4">
      <!-- Lease Info -->
      <div class="flex items-center justify-between p-3 bg-base-200 rounded-lg">
        <div>
          <div class="font-semibold">{{ lease.Property?.name }}</div>
          <div class="text-sm opacity-70">{{ lease.Tenant?.firstName }} {{ lease.Tenant?.lastName }}</div>
        </div>
        <div class="badge badge-primary">{{ documents.length }} document(s)</div>
      </div>

      <!-- Upload Section -->
      <div class="card bg-base-200">
        <div class="card-body p-4">
          <h3 class="font-semibold mb-2">Ajouter des documents</h3>
          <div class="form-control">
            <select v-model="uploadCategory" class="select select-bordered select-sm mb-2">
              <option value="contract">Contrat de bail</option>
              <option value="inventory_in">État des lieux entrée</option>
              <option value="inventory_out">État des lieux sortie</option>
              <option value="amendment">Avenant</option>
              <option value="letter">Courrier</option>
              <option value="insurance">Assurance</option>
              <option value="receipt">Quittance</option>
              <option value="other">Autre</option>
            </select>
            <input
              type="file"
              @change="handleFileChange"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              multiple
              class="file-input file-input-bordered file-input-sm"
            />
            <button
              v-if="selectedFiles.length > 0"
              @click="uploadDocuments"
              :disabled="uploading"
              class="btn btn-primary btn-sm mt-2"
            >
              <span v-if="uploading" class="loading loading-spinner loading-xs"></span>
              {{ uploading ? 'Upload...' : `Uploader ${selectedFiles.length} fichier(s)` }}
            </button>
          </div>
        </div>
      </div>

      <!-- Documents List -->
      <div v-if="loading" class="flex justify-center py-8">
        <span class="loading loading-spinner loading-lg"></span>
      </div>

      <div v-else-if="documentsByCategory.length > 0" class="space-y-3">
        <div v-for="category in documentsByCategory" :key="category.name" class="card bg-base-100 shadow">
          <div class="card-body p-3">
            <h4 class="font-semibold text-sm mb-2">{{ category.label }} ({{ category.docs.length }})</h4>
            <div class="space-y-1">
              <div
                v-for="doc in category.docs"
                :key="doc.id"
                class="flex items-center justify-between p-2 hover:bg-base-200 rounded"
              >
                <div class="flex items-center gap-2 flex-1">
                  <svg class="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <div class="flex-1">
                    <div class="text-sm font-medium">{{ doc.originalName }}</div>
                    <div class="text-xs opacity-60">{{ formatFileSize(doc.fileSize) }} • {{ formatDate(doc.createdAt) }}</div>
                  </div>
                </div>
                <div class="flex gap-1">
                  <button
                    @click="downloadDocument(doc)"
                    class="btn btn-ghost btn-xs"
                    title="Télécharger"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </button>
                  <button
                    @click="deleteDocument(doc)"
                    class="btn btn-ghost btn-xs text-error"
                    title="Supprimer"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-8 text-base-content/60">
        Aucun document pour ce bail
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

const emit = defineEmits(['update:modelValue', 'updated']);

const toast = useToast();
const loading = ref(false);
const uploading = ref(false);
const documents = ref([]);
const selectedFiles = ref([]);
const uploadCategory = ref('other');

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

const documentsByCategory = computed(() => {
  const categories = {};
  
  documents.value.forEach(doc => {
    if (!categories[doc.category]) {
      categories[doc.category] = [];
    }
    categories[doc.category].push(doc);
  });

  return Object.keys(categories).map(key => ({
    name: key,
    label: categoryLabels[key] || key,
    docs: categories[key]
  }));
});

const loadDocuments = async () => {
  if (!props.lease) return;
  
  loading.value = true;
  try {
    const response = await api.get(`/api/leases/${props.lease.id}/documents`);
    documents.value = response.data.data || [];
  } catch (error) {
    console.error('Error loading documents:', error);
    toast.error('Erreur lors du chargement des documents');
  } finally {
    loading.value = false;
  }
};

const handleFileChange = (event) => {
  selectedFiles.value = Array.from(event.target.files);
};

const uploadDocuments = async () => {
  if (selectedFiles.value.length === 0) return;

  uploading.value = true;
  try {
    const formData = new FormData();
    selectedFiles.value.forEach(file => {
      formData.append('files', file);
    });
    formData.append('category', uploadCategory.value);

    await api.post(`/api/leases/${props.lease.id}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    toast.success(`${selectedFiles.value.length} document(s) uploadé(s)`);
    selectedFiles.value = [];
    await loadDocuments();
    emit('updated');
  } catch (error) {
    console.error('Error uploading documents:', error);
    toast.error('Erreur lors de l\'upload des documents');
  } finally {
    uploading.value = false;
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

const deleteDocument = async (doc) => {
  if (!confirm(`Supprimer ${doc.originalName} ?`)) return;

  try {
    await api.delete(`/api/lease-documents/${doc.id}`);
    toast.success('Document supprimé');
    await loadDocuments();
    emit('updated');
  } catch (error) {
    console.error('Error deleting document:', error);
    toast.error('Erreur lors de la suppression');
  }
};

const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('fr-FR');
};

const close = () => {
  isOpen.value = false;
};

watch(isOpen, (value) => {
  if (value) {
    loadDocuments();
  }
});
</script>
