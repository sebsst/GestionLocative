<template>
  <Modal v-model="isOpen" title="Partager ce bien" size="lg">
    <div class="space-y-6">
      <!-- Current shared users -->
      <div v-if="sharedUsers.length > 0">
        <h3 class="font-semibold mb-3">Utilisateurs ayant accès</h3>
        <div class="space-y-2">
          <div
            v-for="access in sharedUsers"
            :key="access.id"
            class="flex items-center justify-between p-3 bg-base-200 rounded-lg"
          >
            <div class="flex-1">
              <div class="font-medium">
                {{ access.user.firstName }} {{ access.user.lastName }}
              </div>
              <div class="text-sm opacity-70">{{ access.user.email }}</div>
            </div>
            
            <div class="flex items-center gap-2">
              <div class="badge" :class="getRoleBadgeClass(access.role)">
                {{ getRoleLabel(access.role) }}
              </div>
              
              <button
                @click="handleRevokeAccess(access.id)"
                class="btn btn-ghost btn-sm btn-square"
                title="Révoquer l'accès"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-4 text-base-content/60">
        Ce bien n'est partagé avec personne
      </div>

      <div class="divider">Inviter un utilisateur</div>

      <!-- Invite form -->
      <form @submit.prevent="handleShare" class="space-y-4">
        <div class="form-control">
          <label class="label">
            <span class="label-text">Email de l'utilisateur</span>
          </label>
          <input
            v-model="inviteEmail"
            type="email"
            placeholder="utilisateur@example.com"
            class="input input-bordered w-full"
            required
          />
        </div>

        <div class="form-control">
          <label class="label">
            <span class="label-text">Rôle</span>
          </label>
          <select v-model="inviteRole" class="select select-bordered w-full">
            <option value="viewer">Lecteur (consultation uniquement)</option>
            <option value="manager">Gestionnaire (peut modifier)</option>
            <option value="owner">Propriétaire (tous les droits)</option>
          </select>
          
          <label class="label">
            <span class="label-text-alt opacity-70">
              {{ getRoleDescription(inviteRole) }}
            </span>
          </label>
        </div>

        <div class="flex justify-end gap-2">
          <button type="button" @click="close" class="btn btn-ghost">
            Annuler
          </button>
          <button type="submit" class="btn btn-primary" :disabled="loading">
            <span v-if="loading" class="loading loading-spinner loading-sm"></span>
            <span v-else>Partager</span>
          </button>
        </div>
      </form>
    </div>
  </Modal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useUserAccessStore } from '@/stores/userAccess'
import { usePermissions } from '@/composables/usePermissions'
import Modal from '@/components/ui/Modal.vue'

const props = defineProps({
  modelValue: Boolean,
  propertyId: String
})

const emit = defineEmits(['update:modelValue'])

const userAccessStore = useUserAccessStore()
const { getRoleLabel, getRoleBadgeClass } = usePermissions()

const inviteEmail = ref('')
const inviteRole = ref('viewer')
const loading = ref(false)

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const sharedUsers = computed(() => {
  return userAccessStore.getSharedUsersForProperty(props.propertyId)
})

const getRoleDescription = (role) => {
  const descriptions = {
    viewer: 'Peut consulter le bien et ses informations',
    manager: 'Peut modifier le bien et créer/modifier des baux',
    owner: 'Tous les droits, y compris suppression et partage'
  }
  return descriptions[role] || ''
}

const handleShare = async () => {
  if (!inviteEmail.value || !props.propertyId) return

  loading.value = true
  try {
    await userAccessStore.shareProperty(
      props.propertyId,
      inviteEmail.value,
      inviteRole.value
    )
    
    // Reset form
    inviteEmail.value = ''
    inviteRole.value = 'viewer'
  } catch (error) {
    console.error('Error sharing property:', error)
  } finally {
    loading.value = false
  }
}

const handleRevokeAccess = async (accessId) => {
  if (!confirm('Êtes-vous sûr de vouloir révoquer cet accès ?')) return

  try {
    await userAccessStore.revokeAccess(accessId, props.propertyId)
  } catch (error) {
    console.error('Error revoking access:', error)
  }
}

const close = () => {
  isOpen.value = false
}

// Load shared users when modal opens
watch(isOpen, async (value) => {
  if (value && props.propertyId) {
    await userAccessStore.fetchSharedUsers(props.propertyId)
  }
})
</script>
