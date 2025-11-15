<template>
  <div class="p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold">Paramètres</h1>
      <p class="text-base-content/70 mt-1">Configuration de votre compte</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Profil -->
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title mb-4">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Profil
          </h2>
          <div class="space-y-4">
            <div class="form-control">
              <label class="label">
                <span class="label-text">Email</span>
              </label>
              <input
                type="email"
                :value="user?.email || 'Non connecté'"
                class="input input-bordered"
                disabled
              />
            </div>
            <div class="form-control">
              <label class="label">
                <span class="label-text">Rôle</span>
              </label>
              <input
                type="text"
                :value="user?.role || 'Utilisateur'"
                class="input input-bordered"
                disabled
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Sécurité -->
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title mb-4">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Sécurité
          </h2>
          <div class="space-y-4">
            <button @click="showPasswordDialog = true" class="btn btn-outline btn-primary w-full">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              Changer le mot de passe
            </button>
          </div>
        </div>
      </div>

      <!-- Préférences -->
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title mb-4">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            Préférences
          </h2>
          <div class="space-y-4">
            <div class="form-control">
              <label class="label cursor-pointer">
                <span class="label-text">Notifications par email</span>
                <input type="checkbox" class="toggle toggle-primary" checked />
              </label>
            </div>
            <div class="form-control">
              <label class="label cursor-pointer">
                <span class="label-text">Alertes loyers impayés</span>
                <input type="checkbox" class="toggle toggle-primary" checked />
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Données -->
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title mb-4">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
            </svg>
            Données
          </h2>
          <div class="space-y-4">
            <button @click="exportData" :disabled="exporting" class="btn btn-outline btn-success w-full">
              <span v-if="exporting" class="loading loading-spinner loading-sm"></span>
              <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {{ exporting ? 'Export en cours...' : 'Exporter toutes les données' }}
            </button>
            <button @click="triggerImport" :disabled="importing" class="btn btn-outline btn-info w-full">
              <span v-if="importing" class="loading loading-spinner loading-sm"></span>
              <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L9 8m4-4v12" />
              </svg>
              {{ importing ? 'Import en cours...' : 'Importer des données' }}
            </button>
            <input
              ref="fileInput"
              type="file"
              accept=".json"
              @change="handleFileSelect"
              class="hidden"
            />
            <div class="divider my-2"></div>
            <button @click="showResetDialog = true" class="btn btn-outline btn-error w-full">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Réinitialiser toutes les données
            </button>
          </div>
        </div>
      </div>

      <!-- À propos -->
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title mb-4">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            À propos
          </h2>
          <div class="space-y-2">
            <p class="text-sm text-base-content/70">
              <strong>Application:</strong> Gestion Locative
            </p>
            <p class="text-sm text-base-content/70">
              <strong>Version:</strong> 1.0.0
            </p>
            <p class="text-sm text-base-content/70">
              <strong>Framework:</strong> Vue 3 + DaisyUI
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Changement de mot de passe -->
    <Modal
      v-model="showPasswordDialog"
      title="Changer le mot de passe"
      size="md"
      :hide-footer="true"
    >
      <div class="space-y-4">
        <div class="form-control">
          <label class="label">
            <span class="label-text">Mot de passe actuel *</span>
          </label>
          <input
            v-model="passwordForm.currentPassword"
            type="password"
            placeholder="••••••••"
            class="input input-bordered w-full"
            required
          />
        </div>

        <div class="form-control">
          <label class="label">
            <span class="label-text">Nouveau mot de passe *</span>
          </label>
          <input
            v-model="passwordForm.newPassword"
            type="password"
            placeholder="••••••••"
            class="input input-bordered w-full"
            required
          />
        </div>

        <div class="form-control">
          <label class="label">
            <span class="label-text">Confirmer le mot de passe *</span>
          </label>
          <input
            v-model="passwordForm.confirmPassword"
            type="password"
            placeholder="••••••••"
            class="input input-bordered w-full"
            required
          />
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <button @click="closePasswordDialog" class="btn btn-ghost">Annuler</button>
          <button @click="changePassword" :disabled="saving" class="btn btn-primary">
            <span v-if="saving" class="loading loading-spinner loading-sm"></span>
            {{ saving ? 'Enregistrement...' : 'Changer' }}
          </button>
        </div>
      </template>
    </Modal>

    <!-- Modal Réinitialisation -->
    <Modal
      v-model="showResetDialog"
      title="Réinitialiser toutes les données"
      size="md"
      :hide-footer="true"
    >
      <div class="space-y-4">
        <div class="alert alert-error">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <h3 class="font-bold">Action irréversible!</h3>
            <p class="text-sm">Cette action supprimera définitivement toutes vos données (biens, locataires, loyers, charges, etc.). Cette opération ne peut pas être annulée.</p>
          </div>
        </div>
        <p class="text-sm text-base-content/70">
          Pour confirmer, tapez <strong class="text-error">SUPPRIMER</strong> dans le champ ci-dessous:
        </p>
        <div class="form-control">
          <input
            v-model="resetConfirmation"
            type="text"
            placeholder="SUPPRIMER"
            class="input input-bordered w-full"
          />
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <button @click="closeResetDialog" class="btn btn-ghost">Annuler</button>
          <button
            @click="resetAllData"
            :disabled="resetting || resetConfirmation !== 'SUPPRIMER'"
            class="btn btn-error"
          >
            <span v-if="resetting" class="loading loading-spinner loading-sm"></span>
            {{ resetting ? 'Réinitialisation...' : 'Réinitialiser' }}
          </button>
        </div>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toastification'
import api from '@/services/api'
import Modal from '@/components/ui/Modal.vue'

const authStore = useAuthStore()
const toast = useToast()
const user = authStore.user

const showPasswordDialog = ref(false)
const showResetDialog = ref(false)
const saving = ref(false)
const exporting = ref(false)
const importing = ref(false)
const resetting = ref(false)
const resetConfirmation = ref('')
const fileInput = ref(null)

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const resetPasswordForm = () => {
  Object.assign(passwordForm, {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
}

const closePasswordDialog = () => {
  showPasswordDialog.value = false
  resetPasswordForm()
}

const closeResetDialog = () => {
  showResetDialog.value = false
  resetConfirmation.value = ''
}

const changePassword = async () => {
  if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
    toast.warning('Veuillez remplir tous les champs')
    return
  }

  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    toast.error('Les mots de passe ne correspondent pas')
    return
  }

  if (passwordForm.newPassword.length < 6) {
    toast.error('Le mot de passe doit contenir au moins 6 caractères')
    return
  }

  saving.value = true
  try {
    await api.post('/api/auth/change-password', {
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword
    })
    toast.success('Mot de passe modifié avec succès')
    closePasswordDialog()
  } catch (error) {
    toast.error(error.response?.data?.error?.message || 'Impossible de modifier le mot de passe')
    console.error('Error changing password:', error)
  } finally {
    saving.value = false
  }
}

// Export des données
const exportData = async () => {
  exporting.value = true
  try {
    const response = await api.get('/api/data/export')

    // Créer un blob avec les données JSON
    const dataStr = JSON.stringify(response.data, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })

    // Créer un lien de téléchargement et le déclencher
    const url = window.URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `gestion-locative-export-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    toast.success('Données exportées avec succès')
  } catch (error) {
    console.error('Erreur lors de l\'export:', error)
    toast.error('Erreur lors de l\'export des données')
  } finally {
    exporting.value = false
  }
}

// Déclencher l'input file
const triggerImport = () => {
  fileInput.value.click()
}

// Gérer la sélection du fichier
const handleFileSelect = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  if (!file.name.endsWith('.json')) {
    toast.error('Veuillez sélectionner un fichier JSON')
    return
  }

  const reader = new FileReader()
  reader.onload = async (e) => {
    try {
      const data = JSON.parse(e.target.result)
      await importData(data)
    } catch (error) {
      console.error('Erreur lors de la lecture du fichier:', error)
      toast.error('Fichier JSON invalide')
    }
  }
  reader.readAsText(file)

  // Réinitialiser l'input pour permettre la sélection du même fichier
  event.target.value = ''
}

// Import des données
const importData = async (data) => {
  if (!confirm('Attention: L\'import va écraser toutes les données existantes. Voulez-vous continuer?')) {
    return
  }

  importing.value = true
  try {
    await api.post('/api/data/import', data)
    toast.success('Données importées avec succès. Rechargement de la page...')
    setTimeout(() => {
      window.location.reload()
    }, 1500)
  } catch (error) {
    console.error('Erreur lors de l\'import:', error)
    toast.error('Erreur lors de l\'import des données')
  } finally {
    importing.value = false
  }
}

// Réinitialiser toutes les données
const resetAllData = async () => {
  resetting.value = true
  try {
    await api.post('/api/data/reset')
    toast.success('Toutes les données ont été supprimées. Rechargement de la page...')
    closeResetDialog()
    setTimeout(() => {
      window.location.reload()
    }, 1500)
  } catch (error) {
    console.error('Erreur lors de la réinitialisation:', error)
    toast.error('Erreur lors de la réinitialisation des données')
  } finally {
    resetting.value = false
  }
}
</script>
