import { defineStore } from 'pinia'
import api from '@/services/api'
import { useToast } from 'vue-toastification'

const toast = useToast()

export const useUserAccessStore = defineStore('userAccess', {
    state: () => ({
        sharedProperties: [],
        sharedUsers: {},
        loading: false,
        error: null
    }),

    getters: {
        getSharedUsersForProperty: (state) => (propertyId) => {
            return state.sharedUsers[propertyId] || []
        }
    },

    actions: {
        /**
         * Share a property with another user
         */
        async shareProperty(propertyId, email, role = 'viewer') {
            this.loading = true
            this.error = null
            try {
                const response = await api.post(`/api/properties/${propertyId}/share`, {
                    email,
                    role
                })

                // Refresh shared users list for this property
                await this.fetchSharedUsers(propertyId)

                toast.success(`Bien partagé avec ${email}`)
                return response.data.data
            } catch (error) {
                this.error = error
                const message = error.response?.data?.message || 'Erreur lors du partage du bien'
                toast.error(message)
                throw error
            } finally {
                this.loading = false
            }
        },

        /**
         * Get list of users who have access to a property
         */
        async fetchSharedUsers(propertyId) {
            try {
                const response = await api.get(`/api/properties/${propertyId}/shared-with`)
                this.sharedUsers[propertyId] = response.data.data || []
                return this.sharedUsers[propertyId]
            } catch (error) {
                console.error('Error fetching shared users:', error)
                this.sharedUsers[propertyId] = []
                throw error
            }
        },

        /**
         * Revoke a user's access to a property
         */
        async revokeAccess(accessId, propertyId) {
            this.loading = true
            try {
                await api.delete(`/api/property-access/${accessId}`)

                // Update local state
                if (this.sharedUsers[propertyId]) {
                    this.sharedUsers[propertyId] = this.sharedUsers[propertyId].filter(
                        access => access.id !== accessId
                    )
                }

                toast.success('Accès révoqué avec succès')
            } catch (error) {
                const message = error.response?.data?.message || 'Erreur lors de la révocation'
                toast.error(message)
                throw error
            } finally {
                this.loading = false
            }
        },

        /**
         * Update permissions for a user's access
         */
        async updatePermissions(accessId, propertyId, permissions) {
            this.loading = true
            try {
                const response = await api.patch(`/api/property-access/${accessId}`, permissions)

                // Update local state
                if (this.sharedUsers[propertyId]) {
                    const index = this.sharedUsers[propertyId].findIndex(
                        access => access.id === accessId
                    )
                    if (index !== -1) {
                        this.sharedUsers[propertyId][index] = response.data.data
                    }
                }

                toast.success('Permissions mises à jour')
                return response.data.data
            } catch (error) {
                const message = error.response?.data?.message || 'Erreur lors de la mise à jour'
                toast.error(message)
                throw error
            } finally {
                this.loading = false
            }
        },

        /**
         * Get properties shared with the current user
         */
        async fetchMySharedProperties() {
            this.loading = true
            try {
                const response = await api.get('/api/my-shared-properties')
                this.sharedProperties = response.data.data || []
                return this.sharedProperties
            } catch (error) {
                console.error('Error fetching shared properties:', error)
                this.sharedProperties = []
                throw error
            } finally {
                this.loading = false
            }
        },

        /**
         * Check if current user can perform an action on a property
         */
        canPerformAction(property, action) {
            if (!property) return false

            // Owner can do everything
            if (!property.isShared) return true

            // Check specific permissions for shared properties
            switch (action) {
                case 'edit':
                    return property.canEdit || false
                case 'delete':
                    return property.canDelete || false
                case 'invite':
                    return property.canInvite || false
                case 'view':
                    return true // If user has the property, they can view it
                default:
                    return false
            }
        }
    }
})
