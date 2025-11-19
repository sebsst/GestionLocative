<template>
  <Modal
    v-model="isOpen"
    title="Ajouter des documents"
    size="xl"
    :hide-footer="true"
  >
    <form @submit.prevent="uploadDocuments" class="space-y-4">
      <!-- Document Type (applied to all) -->
      <div class="form-control">
        <label class="label">
          <span class="label-text font-semibold">Type de document</span>
        </label>
        <select v-model="formData.type" class="select select-bordered w-full">
          <option value="contrat">Contrat</option>
          <option value="photo">Photo</option>
          <option value="facture">Facture</option>
          <option value="diagnostic">Diagnostic</option>
          <option value="autre">Autre</option>
        </select>
      </div>

      <!-- File Upload Section -->
      <div class="form-control">
        <label class="label">
          <span class="label-text font-semibold">Fichiers</span>
        </label>
        <input
          ref="fileInput"
          type="file"
          @change="handleFileChange"
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          multiple
          class="file-input file-input-bordered w-full"
        />
        <label class="label">
          <span class="label-text-alt">Formats acceptés: PDF, JPG, PNG, DOC, DOCX (max 10MB chacun). Sélectionnez plusieurs fichiers à la fois.</span>
        </label>
      </div>

      <!-- URL Link Section -->
      <div class="form-control">
        <label class="label">
          <span class="label-text font-semibold">Ou ajouter un lien URL</span>
        </label>
        <input
          v-model="formData.url"
          type="url"
          placeholder="https://exemple.com/document"
          class="input input-bordered w-full"
        />
        <label class="label">
          <span class="label-text-alt">Optionnel: ajoutez un lien vers un document externe</span>
        </label>
      </div>

      <!-- Selected Files Preview -->
      <div v-if="selectedFiles.length > 0" class="space-y-2">
        <h4 class="font-semibold">Fichiers sélectionnés:</h4>
        <div class="max-h-40 overflow-y-auto space-y-2">
          <div v-for="(file, index) in selectedFiles" :key="index"
               class="alert alert-info py-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div class="flex-1">
              <div class="font-semibold text-sm">{{ file.name }}</div>
              <div class="text-xs">{{ formatFileSize(file.size) }}</div>
            </div>
            <button type="button" @click="removeFile(index)" class="btn btn-ghost btn-xs text-error">
              ✕
            </button>
          </div>
        </div>
      </div>

      <!-- URL Preview -->
      <div v-if="formData.url" class="alert alert-success">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
        <div>
          <div class="font-semibold">Lien externe</div>
          <div class="text-sm">{{ formData.url }}</div>
        </div>
      </div>

      <div v-if="error" class="alert alert-error">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{{ error }}</span>
      </div>

      <div class="modal-action">
        <button type="button" @click="closeModal" class="btn btn-ghost">
          Annuler
        </button>
        <button type="submit" class="btn btn-primary" :disabled="uploading || (selectedFiles.length === 0 && !formData.url.trim())">
          <span v-if="uploading" class="loading loading-spinner loading-sm"></span>
          {{ uploading ? 'Téléchargement...' : `Ajouter ${selectedFiles.length + (formData.url.trim() ? 1 : 0)} document(s)` }}
        </button>
      </div>
    </form>
  </Modal>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { useToast } from 'vue-toastification'
import api from '@/services/api'
import Modal from '@/components/ui/Modal.vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  propertyId: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['close', 'uploaded'])

const toast = useToast()
const fileInput = ref(null)
const selectedFiles = ref([])
const uploading = ref(false)
const error = ref(null)

const formData = reactive({
  type: 'autre',
  url: ''
})

const isOpen = ref(false)

watch(() => props.isOpen, (newValue) => {
  isOpen.value = newValue
  if (newValue) {
    resetForm()
  }
})

const handleFileChange = (event) => {
  const files = Array.from(event.target.files)
  selectedFiles.value.push(...files)
}

const removeFile = (index) => {
  selectedFiles.value.splice(index, 1)
}

const uploadDocuments = async () => {
  if (selectedFiles.value.length === 0 && !formData.url.trim()) {
    error.value = 'Veuillez sélectionner au moins un fichier ou saisir une URL'
    return
  }

  error.value = null
  uploading.value = true

  try {
    const uploadPromises = []

    // Upload files
    for (const file of selectedFiles.value) {
      const formDataToSend = new FormData()
      formDataToSend.append('document', file)
      formDataToSend.append('name', file.name.replace(/\.[^/.]+$/, '')) // Default name is filename without extension
      formDataToSend.append('type', formData.type)
      formDataToSend.append('description', file.name) // Default description is filename

      uploadPromises.push(
        api.post(`/api/documents/property/${props.propertyId}`, formDataToSend)
      )
    }

    // Upload URL if provided
    if (formData.url.trim()) {
      const urlFormData = new FormData()
      urlFormData.append('name', 'Lien externe')
      urlFormData.append('type', formData.type)
      urlFormData.append('description', formData.url)
      urlFormData.append('url', formData.url)

      uploadPromises.push(
        api.post(`/api/documents/property/${props.propertyId}`, urlFormData)
      )
    }

    await Promise.all(uploadPromises)

    const totalUploaded = selectedFiles.value.length + (formData.url.trim() ? 1 : 0)
    toast.success(`${totalUploaded} document(s) ajouté(s) avec succès`)
    emit('uploaded')
    closeModal()
  } catch (err) {
    console.error('Upload error:', err)
    error.value = err.response?.data?.error?.message || 'Erreur lors du téléchargement'
  } finally {
    uploading.value = false
  }
}

const resetForm = () => {
  formData.type = 'autre'
  formData.url = ''
  selectedFiles.value = []
  error.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const closeModal = () => {
  resetForm()
  emit('close')
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>