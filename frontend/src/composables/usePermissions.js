import { computed } from 'vue'
import { usePropertyStore } from '@/stores/property'
import { useUserAccessStore } from '@/stores/userAccess'

/**
 * Composable for checking user permissions on properties
 */
export function usePermissions() {
    const propertyStore = usePropertyStore()
    const userAccessStore = useUserAccessStore()

    /**
     * Check if user can edit a property
     */
    const canEdit = computed(() => {
        return propertyStore.canEdit
    })

    /**
     * Check if user can delete a property
     */
    const canDelete = computed(() => {
        return propertyStore.canDelete
    })

    /**
     * Check if user can invite others to a property
     */
    const canInvite = computed(() => {
        return propertyStore.canInvite
    })

    /**
     * Check if property is shared
     */
    const isShared = computed(() => {
        return propertyStore.isShared
    })

    /**
     * Get user's role on the property
     */
    const accessRole = computed(() => {
        return propertyStore.accessRole
    })

    /**
     * Check if user can perform a specific action
     */
    const canPerformAction = (property, action) => {
        return userAccessStore.canPerformAction(property, action)
    }

    /**
     * Get role label for display
     */
    const getRoleLabel = (role) => {
        const labels = {
            owner: 'Propriétaire',
            manager: 'Gestionnaire',
            viewer: 'Lecteur'
        }
        return labels[role] || role
    }

    /**
     * Get role badge class
     */
    const getRoleBadgeClass = (role) => {
        const classes = {
            owner: 'badge-primary',
            manager: 'badge-secondary',
            viewer: 'badge-ghost'
        }
        return classes[role] || 'badge-ghost'
    }

    return {
        canEdit,
        canDelete,
        canInvite,
        isShared,
        accessRole,
        canPerformAction,
        getRoleLabel,
        getRoleBadgeClass
    }
}
