<template>
  <div class="mt-6">
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <!-- Documents Section Header -->
        <div class="flex justify-between items-center mb-6">
          <div>
            <h3 class="text-xl font-bold">Documents du bien</h3>
            <p class="text-sm text-base-content/60 mt-1">Gérez les documents associés à ce bien immobilier</p>
          </div>
          <button @click="$emit('add-document')" class="btn btn-primary gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Ajouter un document
          </button>
        </div>

        <div v-if="documents.length > 0" class="space-y-4">
          <div v-for="document in documents" :key="document.id"
               class="border border-base-300 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div class="flex items-start justify-between">
              <div class="flex items-start gap-3 flex-1">
                <div class="avatar placeholder">
                  <div class="bg-primary text-primary-content rounded-lg w-12 h-12 flex items-center justify-center">
                    <svg v-if="document.type === 'photo'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <svg v-else-if="document.type === 'contrat'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <h4 class="font-semibold text-lg truncate">{{ document.name }}</h4>
                  <div class="flex items-center gap-4 mt-1 text-sm text-base-content/60">
                    <span class="badge badge-outline">{{ formatDocumentType(document.type) }}</span>
                    <span v-if="document.fileSize">{{ formatFileSize(document.fileSize) }}</span>
                    <span v-else-if="document.url" class="badge badge-info badge-sm">Lien externe</span>
                    <span>{{ formatDate(document.createdAt) }}</span>
                  </div>
                  <p v-if="document.description" class="text-sm text-base-content/70 mt-2">
                    {{ document.description }}
                  </p>
                  <p v-if="document.url" class="text-sm text-blue-600 mt-1 truncate">
                    🔗 {{ document.url }}
                  </p>
                </div>
              </div>
              <div class="flex gap-2">
                <button v-if="document.filePath" @click="$emit('download-document', document)" class="btn btn-ghost btn-sm" title="Télécharger">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>
                <button v-if="document.url" @click="$emit('open-url', document.url)" class="btn btn-ghost btn-sm" title="Ouvrir le lien">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </button>
                <button @click="$emit('edit-document', document)" class="btn btn-ghost btn-sm" title="Modifier">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button @click="$emit('delete-document', document)" class="btn btn-ghost btn-sm text-error" title="Supprimer">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-12 text-base-content/60">
          <svg class="w-16 h-6 mx-auto text-base-content/30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p class="text-lg font-medium mb-2">Aucun document</p>
          <p class="text-sm">Ajoutez des documents pour ce bien (contrats, photos, factures...)</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  documents: {
    type: Array,
    required: true
  }
})

defineEmits(['add-document', 'download-document', 'open-url', 'edit-document', 'delete-document'])

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('fr-FR')
}

const formatDocumentType = (type) => {
  const types = {
    contrat: 'Contrat',
    photo: 'Photo',
    facture: 'Facture',
    diagnostic: 'Diagnostic',
    autre: 'Autre'
  }
  return types[type] || type
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>
