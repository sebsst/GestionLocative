import { defineStore } from 'pinia'
import api from '@/services/api'
import { useToast } from 'vue-toastification'

export const usePropertyStore = defineStore('property', {
    state: () => ({
        property: null,
        leases: [],
        documents: [],
        tenants: [],
        financialData: {
            yearlyRevenue: 0,
            yearlyCharges: 0
        },
        loading: false,
        error: null
    }),

    actions: {
        async fetchProperty(id) {
            this.loading = true
            this.error = null
            try {
                const response = await api.get(`/api/properties/${id}`)
                this.property = response.data.data
                return this.property
            } catch (error) {
                this.error = error
                throw error
            } finally {
                this.loading = false
            }
        },

        async fetchLeases(propertyId) {
            try {
                const response = await api.get(`/api/leases?propertyId=${propertyId}`)
                this.leases = response.data.data || []
                return this.leases
            } catch (error) {
                console.error('Error loading leases:', error)
                this.leases = []
                throw error
            }
        },

        async fetchDocuments(propertyId) {
            try {
                const response = await api.get(`/api/documents/property/${propertyId}`)
                this.documents = response.data.data || []
                return this.documents
            } catch (error) {
                console.error('Error loading documents:', error)
                this.documents = []
                throw error
            }
        },

        async fetchTenants() {
            try {
                const response = await api.get('/api/tenants')
                this.tenants = response.data.data || []
                return this.tenants
            } catch (error) {
                console.error('Error loading tenants:', error)
                this.tenants = []
                throw error
            }
        },

        async updateProperty(id, data) {
            try {
                const response = await api.put(`/api/properties/${id}`, data)
                this.property = response.data.data
                return this.property
            } catch (error) {
                throw error
            }
        },

        async fetchFinances(propertyId) {
            try {
                const currentYear = new Date().getFullYear()

                // Charger les loyers de l'année
                const rentsResponse = await api.get('/api/rents', {
                    params: {
                        year: currentYear,
                        propertyId: propertyId,
                        status: 'paye'
                    }
                })
                const rents = rentsResponse.data.data || []
                this.financialData.yearlyRevenue = rents.reduce((sum, r) => sum + (parseFloat(r.paidAmount) || 0), 0)

                // Charger les charges de l'année
                const chargesResponse = await api.get('/api/charges', {
                    params: {
                        year: currentYear,
                        propertyId: propertyId
                    }
                })
                const charges = chargesResponse.data.data || []
                this.financialData.yearlyCharges = charges.reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0)

                return this.financialData
            } catch (error) {
                console.error('Error loading finances:', error)
                throw error
            }
        },

        async deleteLease(leaseId) {
            try {
                await api.delete(`/api/leases/${leaseId}`)
                this.leases = this.leases.filter(l => l.id !== leaseId)
            } catch (error) {
                throw error
            }
        },

        async deleteDocument(documentId) {
            try {
                await api.delete(`/api/documents/${documentId}`)
                this.documents = this.documents.filter(d => d.id !== documentId)
            } catch (error) {
                throw error
            }
        },

        async updateDocument(documentId, updates) {
            try {
                await api.put(`/api/documents/${documentId}`, updates)
                const index = this.documents.findIndex(d => d.id === documentId)
                if (index !== -1) {
                    this.documents[index] = { ...this.documents[index], ...updates }
                }
            } catch (error) {
                throw error
            }
        }
    }
})
