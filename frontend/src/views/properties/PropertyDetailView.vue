<template>
  <div class="p-8">
    <!-- Back Button -->
    <button
      @click="$router.back()"
      class="btn btn-ghost gap-2 mb-6"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      Retour
    </button>

    <!-- Loading -->
    <div v-if="loading" class="space-y-6">
      <!-- Header Skeleton -->
      <div class="card bg-gradient-to-r from-primary/10 to-secondary/10 shadow-xl">
        <div class="card-body">
          <div class="skeleton h-8 w-2/3 mb-4"></div>
          <div class="skeleton h-4 w-1/2"></div>
        </div>
      </div>

      <!-- Stats Skeletons -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SkeletonStats v-for="i in 4" :key="i" />
      </div>

      <!-- Actions Skeleton -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div v-for="i in 4" :key="i" class="skeleton h-20"></div>
      </div>

      <!-- Tabs Skeleton -->
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <div class="skeleton h-10 w-full mb-4"></div>
          <SkeletonTable :rows="5" :columns="6" />
        </div>
      </div>
    </div>

    <!-- Content -->
    <div v-else-if="property" class="space-y-6">
      <!-- Header -->
      <PropertyHeader :property="property" @share="showSharingModal = true" />

      <!-- Stats Cards -->
      <PropertyStats :property="property" />

      <!-- Management Actions -->
      <PropertyActions
        :has-leases="leases.length > 0"
        :generating-rents="generatingRents"
        @create-lease="openCreateLeaseModal"
        @manage-occupants="openOccupancyModal()"
        @manage-rents="openRentPeriodModal()"
        @generate-rents="generateRents"
      />

      <!-- Tabs -->
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body p-0">
          <!-- Tab Navigation -->
          <div class="flex border-b border-base-300 gap-1">
            <button
              @click="switchTab('leases')"
              :class="[
                'px-6 py-3 font-medium transition-colors border-b-2 whitespace-nowrap',
                activeTab === 'leases'
                  ? 'border-primary text-primary bg-base-200'
                  : 'border-transparent text-base-content/70 hover:text-base-content hover:bg-base-200'
              ]"
            >
              Baux
            </button>
            <button
              @click="switchTab('info')"
              :class="[
                'px-6 py-3 font-medium transition-colors border-b-2 whitespace-nowrap',
                activeTab === 'info'
                  ? 'border-primary text-primary bg-base-200'
                  : 'border-transparent text-base-content/70 hover:text-base-content hover:bg-base-200'
              ]"
            >
              Informations
            </button>
            <button
              @click="switchTab('documents')"
              :class="[
                'px-6 py-3 font-medium transition-colors border-b-2 whitespace-nowrap',
                activeTab === 'documents'
                  ? 'border-primary text-primary bg-base-200'
                  : 'border-transparent text-base-content/70 hover:text-base-content hover:bg-base-200'
              ]"
            >
              Documents
            </button>
            <button
              @click="switchTab('finances')"
              :class="[
                'px-6 py-3 font-medium transition-colors border-b-2 whitespace-nowrap',
                activeTab === 'finances'
                  ? 'border-primary text-primary bg-base-200'
                  : 'border-transparent text-base-content/70 hover:text-base-content hover:bg-base-200'
              ]"
            >
              Finances
            </button>
          </div>

          <!-- Tab Content -->
          <PropertyInfoTab
            v-if="activeTab === 'info'"
            :property="property"
          />

          <PropertyLeasesTab
            v-if="activeTab === 'leases'"
            :leases="leases"
            @manage-occupants="openOccupancyModal"
            @manage-rents="openRentPeriodModal"
            @edit-lease="editLease"
            @end-lease="openEndLeaseModal"
            @delete-lease="deleteLease"
          />

          <PropertyFinancialsTab
            v-if="activeTab === 'finances'"
            :property="property"
            :financial-data="financialData"
          />
        </div>
      </div>

      <!-- Documents Section (shown when documents tab is active) -->
      <!-- Note: The original code had this outside the card, but logically it's part of the tab content. 
           However, the original design had it separate. I'll use the new component which includes the card structure. -->
      <PropertyDocumentsTab
        v-if="activeTab === 'documents'"
        :documents="documents"
        @add-document="showDocumentUploadModal = true"
        @download-document="downloadDocument"
        @open-url="openUrl"
        @edit-document="editDocument"
        @delete-document="deleteDocument"
      />

    </div>

    <!-- Error State -->
    <div v-else-if="notFound" class="card bg-base-100 shadow-xl">
      <div class="card-body items-center text-center">
        <svg class="w-16 h-16 text-base-content/30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        <h3 class="text-lg font-semibold mb-2">Bien non trouvé</h3>
        <p class="text-base-content/60 mb-4">
          Ce bien n'existe pas ou a été supprimé.
          <br>
          <span class="text-sm">Commencez par créer un bien dans la section "Biens immobiliers".</span>
        </p>
        <div class="flex gap-2">
          <button @click="$router.push('/properties')" class="btn btn-primary">
            Voir tous les biens
          </button>
          <button @click="$router.go(-1)" class="btn btn-ghost">
            Retour
          </button>
        </div>
      </div>
    </div>

    <!-- Property Sharing Modal -->
    <PropertySharingModal
      v-model="showSharingModal"
      :property-id="property?.id"
    />

    <!-- Occupancy Modal -->
    <LeaseOccupancyModal
      :show="showOccupancyModal"
      :lease="selectedLease"
      @close="showOccupancyModal = false"
      @updated="loadLeases"
    />

    <!-- Rent Period Modal -->
    <LeaseRentPeriodModal
      :is-open="showRentPeriodModal"
      :lease-id="selectedLease?.id"
      @close="showRentPeriodModal = false"
      @updated="loadLeases"
    />

    <!-- Edit Lease Modal -->
    <Modal
      :model-value="showEditLeaseModal"
      @update:model-value="closeEditLeaseModal"
      :title="editingLease ? 'Modifier le bail' : 'Créer un nouveau bail'"
      size="md"
      :show-close="true"
      :hide-footer="true"
    >
      <form @submit.prevent="saveLease" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="form-control col-span-2">
            <label class="label">
              <span class="label-text">Locataire principal *</span>
            </label>
            <select
              v-model="leaseForm.tenantId"
              class="select select-bordered"
              required
            >
              <option value="">Sélectionner un locataire principal</option>
              <option v-for="tenant in tenants" :key="tenant.id" :value="tenant.id">
                {{ tenant.firstName }} {{ tenant.lastName }}
              </option>
            </select>
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">Date de début *</span>
            </label>
            <input
              v-model="leaseForm.startDate"
              type="date"
              class="input input-bordered"
              required
            />
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">Date de fin</span>
            </label>
            <input
              v-model="leaseForm.endDate"
              type="date"
              class="input input-bordered"
            />
            <label class="label">
              <span class="label-text-alt">Laisser vide si en cours</span>
            </label>
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">Loyer mensuel (€) *</span>
            </label>
            <input
              v-model.number="leaseForm.monthlyRent"
              type="number"
              step="0.01"
              class="input input-bordered"
              required
            />
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">Dépôt de garantie (€)</span>
            </label>
            <input
              v-model.number="leaseForm.deposit"
              type="number"
              step="0.01"
              class="input input-bordered"
            />
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">Nombre d'occupants</span>
            </label>
            <input
              v-model.number="leaseForm.numberOfOccupants"
              type="number"
              min="1"
              class="input input-bordered"
            />
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">Statut</span>
            </label>
            <select v-model="leaseForm.status" class="select select-bordered">
              <option value="actif">Actif</option>
              <option value="termine">Terminé</option>
              <option value="resilie">Résilié</option>
            </select>
          </div>
        </div>

        <div class="form-control">
          <label class="label">
            <span class="label-text">Notes</span>
          </label>
          <textarea
            v-model="leaseForm.notes"
            class="textarea textarea-bordered"
            rows="3"
          ></textarea>
        </div>

        <div class="modal-action">
          <button type="button" @click="closeEditLeaseModal" class="btn btn-ghost">
            Annuler
          </button>
          <button type="submit" class="btn btn-primary" :disabled="saving">
            <span v-if="saving" class="loading loading-spinner loading-sm"></span>
            {{ editingLease ? 'Enregistrer' : 'Créer le bail' }}
          </button>
        </div>
      </form>
    </Modal>

    <!-- End Lease Modal -->
    <Modal
      :model-value="showEndLeaseModal"
      @update:model-value="closeEndLeaseModal"
      title="Mettre fin au bail"
      size="sm"
      :show-close="true"
      :hide-footer="true"
    >
      <p class="py-4">Veuillez sélectionner la date de fin du bail pour {{ selectedLease?.Tenant?.firstName }} {{ selectedLease?.Tenant?.lastName }}</p>
      
      <div class="form-control">
        <label class="label">
          <span class="label-text">Date de fin</span>
        </label>
        <input type="date" v-model="endLeaseDate" class="input input-bordered" />
      </div>

      <div class="modal-action">
        <button @click="closeEndLeaseModal" class="btn">Annuler</button>
        <button @click="terminateLease" class="btn btn-warning" :disabled="!endLeaseDate || saving">
          <span v-if="saving" class="loading loading-spinner"></span>
          Terminer le bail
        </button>
      </div>
    </Modal>

    <!-- Document Upload Modal -->
    <DocumentUploadModal
      :is-open="showDocumentUploadModal"
      :property-id="property?.id"
      @close="showDocumentUploadModal = false"
      @uploaded="loadDocuments"
    />

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'
import { storeToRefs } from 'pinia'
import { usePropertyStore } from '@/stores/property'
import api from '@/services/api' // Still needed for some direct calls in modals if not moved to store yet
import LeaseOccupancyModal from '@/components/LeaseOccupancyModal.vue'
import LeaseRentPeriodModal from '@/components/LeaseRentPeriodModal.vue'
import DocumentUploadModal from '@/components/DocumentUploadModal.vue'
import Modal from '@/components/ui/Modal.vue'

// Components
import PropertyHeader from '@/components/properties/PropertyHeader.vue'
import PropertyStats from '@/components/properties/PropertyStats.vue'
import PropertyActions from '@/components/properties/PropertyActions.vue'
import PropertyInfoTab from '@/components/properties/PropertyInfoTab.vue'
import PropertyLeasesTab from '@/components/properties/PropertyLeasesTab.vue'
import PropertyDocumentsTab from '@/components/properties/PropertyDocumentsTab.vue'
import PropertyFinancialsTab from '@/components/properties/PropertyFinancialsTab.vue'
import PropertySharingModal from '@/components/modals/PropertySharingModal.vue'

// Skeleton components
import SkeletonStats from '@/components/ui/SkeletonStats.vue'
import SkeletonTable from '@/components/ui/SkeletonTable.vue'

const route = useRoute()
const toast = useToast()
const propertyStore = usePropertyStore()

const { property, leases, documents, tenants, financialData, loading } = storeToRefs(propertyStore)

const notFound = ref(false)
const activeTab = ref('leases')
const showOccupancyModal = ref(false)
const showRentPeriodModal = ref(false)
const showSharingModal = ref(false)
const showEditLeaseModal = ref(false)
const showDocumentUploadModal = ref(false)
const showEndLeaseModal = ref(false)
const generatingRents = ref(false)
const saving = ref(false)
const selectedLease = ref(null)
const editingLease = ref(null)
const endLeaseDate = ref('')

const leaseForm = ref({
  tenantId: '',
  startDate: '',
  endDate: '',
  monthlyRent: null,
  deposit: null,
  numberOfOccupants: 1,
  status: 'actif',
  notes: ''
})

const loadProperty = async () => {
  try {
    await propertyStore.fetchProperty(route.params.id)
  } catch (error) {
    if (error.response?.status === 404) {
      notFound.value = true
    } else {
      toast.error('Impossible de charger le bien')
      notFound.value = true
    }
  }
}

const loadLeases = async () => {
  try {
    await propertyStore.fetchLeases(route.params.id)
  } catch (error) {
    // Error handled in store
  }
}

const loadDocuments = async () => {
  try {
    await propertyStore.fetchDocuments(route.params.id)
  } catch (error) {
    // Error handled in store
  }
}

const loadTenants = async () => {
  try {
    await propertyStore.fetchTenants()
  } catch (error) {
    // Error handled in store
  }
}

const loadFinances = async () => {
  try {
    await propertyStore.fetchFinances(route.params.id)
  } catch (error) {
    // Error handled in store
  }
}

const switchTab = async (tab) => {
  activeTab.value = tab
  if (tab === 'leases') await loadLeases()
  if (tab === 'documents') await loadDocuments()
  if (tab === 'finances') await loadFinances()
}

const findActiveLease = () => {
  if (leases.value.length === 0) return null
  const currentDate = new Date()
  const activeLease = leases.value.find(l => {
    const startDate = new Date(l.startDate)
    const endDate = l.endDate ? new Date(l.endDate) : null
    return startDate <= currentDate && (!endDate || endDate >= currentDate)
  })
  return activeLease || leases.value.find(l => l.status === 'actif') || leases.value[0]
}

const openOccupancyModal = async (lease = null) => {
  if (leases.value.length === 0) await loadLeases()
  selectedLease.value = lease || findActiveLease()
  if (selectedLease.value?.id) {
    showOccupancyModal.value = true
  } else {
    toast.error('Aucun bail actif trouvé pour ce bien')
  }
}

const openRentPeriodModal = async (lease = null) => {
  if (leases.value.length === 0) await loadLeases()
  selectedLease.value = lease || findActiveLease()
  if (selectedLease.value?.id) {
    showRentPeriodModal.value = true
  } else {
    toast.error('Aucun bail trouvé pour ce bien')
  }
}

const generateRents = async () => {
  if (leases.value.length === 0) await loadLeases()
  if (!leases.value.length) {
    toast.error('Aucun bail associé à ce bien')
    return
  }

  const currentDate = new Date()
  const month = currentDate.getMonth() + 1
  const year = currentDate.getFullYear()

  const activeLeases = leases.value.filter(lease => {
    const startDate = new Date(lease.startDate)
    const endDate = lease.endDate ? new Date(lease.endDate) : null
    return startDate <= currentDate && (!endDate || endDate >= currentDate)
  })

  if (activeLeases.length === 0) {
    toast.error('Aucun bail actif trouvé pour ce bien à la date actuelle')
    return
  }

  const getMonthName = (m) => ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'][m - 1]

  if (!confirm(`Générer les loyers pour ${getMonthName(month)} ${year} ?\n${activeLeases.length} bail(x) actif(s) trouvé(s)`)) return

  generatingRents.value = true
  try {
    for (const lease of activeLeases) {
      await api.post('/api/rents/generate', {
        leaseId: lease.id,
        month: month,
        year: year
      })
    }
    toast.success(`Loyers générés pour ${getMonthName(month)} ${year}`)
    loadLeases()
  } catch (error) {
    console.error('Error generating rents:', error)
    toast.error(error.response?.data?.message || 'Erreur lors de la génération des loyers')
  } finally {
    generatingRents.value = false
  }
}

const openCreateLeaseModal = async () => {
  await loadTenants()
  editingLease.value = null
  leaseForm.value = {
    tenantId: '',
    startDate: '',
    endDate: '',
    monthlyRent: null,
    deposit: null,
    numberOfOccupants: 1,
    status: 'actif',
    notes: ''
  }
  showEditLeaseModal.value = true
}

const editLease = async (lease) => {
  await loadTenants()
  editingLease.value = lease
  leaseForm.value = {
    tenantId: lease.tenantId,
    startDate: lease.startDate ? lease.startDate.split('T')[0] : '',
    endDate: lease.endDate ? lease.endDate.split('T')[0] : '',
    monthlyRent: lease.rentAmount,
    deposit: lease.deposit,
    numberOfOccupants: lease.numberOfOccupants,
    status: lease.status,
    notes: lease.notes || ''
  }
  showEditLeaseModal.value = true
}

const closeEditLeaseModal = () => {
  showEditLeaseModal.value = false
  editingLease.value = null
  leaseForm.value = {
    startDate: '',
    endDate: '',
    monthlyRent: null,
    deposit: null,
    numberOfOccupants: 1,
    status: 'actif',
    notes: ''
  }
}

const saveLease = async () => {
  if (!leaseForm.value.tenantId || !leaseForm.value.startDate || !leaseForm.value.monthlyRent) {
    toast.error('Veuillez remplir tous les champs obligatoires')
    return
  }

  saving.value = true
  try {
    const data = {
      propertyId: route.params.id,
      tenantId: leaseForm.value.tenantId,
      startDate: leaseForm.value.startDate,
      endDate: leaseForm.value.endDate || null,
      rentAmount: leaseForm.value.monthlyRent,
      chargesAmount: 0,
      deposit: leaseForm.value.deposit || 0,
      numberOfOccupants: leaseForm.value.numberOfOccupants || 1,
      status: leaseForm.value.status,
      notes: leaseForm.value.notes || ''
    }

    if (editingLease.value) {
      await api.put(`/api/leases/${editingLease.value.id}`, data)
      toast.success('Bail modifié avec succès')
    } else {
      const createdLease = await api.post('/api/leases', data)
      const leaseId = createdLease.data.data.id

      try {
        await api.post('/api/lease-tenants', {
          leaseId: leaseId,
          tenantId: data.tenantId,
          isPrimary: true,
          startDate: data.startDate,
          endDate: null
        })
      } catch (e) { console.error(e) }

      try {
        await api.post('/api/lease-occupancy-periods', {
          leaseId: leaseId,
          startDate: data.startDate,
          numberOfOccupants: data.numberOfOccupants
        })
        toast.success('Bail créé avec succès')
      } catch (e) {
        console.error(e)
        toast.warning('Bail créé mais erreur lors de la création de la période d\'occupation')
      }
    }

    closeEditLeaseModal()
    await loadLeases()
  } catch (error) {
    console.error('Erreur sauvegarde bail:', error)
    toast.error(error.response?.data?.message || 'Erreur lors de la sauvegarde du bail')
  } finally {
    saving.value = false
  }
}

const openEndLeaseModal = (lease) => {
  selectedLease.value = lease
  endLeaseDate.value = new Date().toISOString().split('T')[0]
  showEndLeaseModal.value = true
}

const closeEndLeaseModal = () => {
  showEndLeaseModal.value = false
  selectedLease.value = null
  endLeaseDate.value = ''
}

const terminateLease = async () => {
  if (!selectedLease.value || !endLeaseDate.value) return
  
  saving.value = true
  try {
    const data = {
      propertyId: route.params.id,
      tenantId: selectedLease.value.tenantId,
      startDate: selectedLease.value.startDate,
      endDate: endLeaseDate.value,
      rentAmount: selectedLease.value.monthlyRent,
      chargesAmount: selectedLease.value.chargesAmount || 0,
      deposit: selectedLease.value.deposit,
      numberOfOccupants: selectedLease.value.numberOfOccupants,
      status: 'termine',
      notes: selectedLease.value.notes
    }

    await api.put(`/api/leases/${selectedLease.value.id}`, data)
    toast.success('Bail terminé avec succès')
    closeEndLeaseModal()
    await loadLeases()
  } catch (error) {
    console.error('Error terminating lease:', error)
    toast.error('Erreur lors de la fin du bail')
  } finally {
    saving.value = false
  }
}

const deleteLease = async (lease) => {
  if (!confirm(`Êtes-vous sûr de vouloir supprimer ce bail ?`)) return

  try {
    await propertyStore.deleteLease(lease.id)
    toast.success('Bail supprimé avec succès')
  } catch (error) {
    console.error('Erreur suppression bail:', error)
    toast.error('Erreur lors de la suppression du bail')
  }
}

const downloadDocument = async (document) => {
  try {
    const response = await api.get(`/api/documents/${document.id}/download`, { responseType: 'blob' })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', document.originalName)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
    toast.success('Document téléchargé')
  } catch (error) {
    console.error('Error downloading document:', error)
    toast.error('Erreur lors du téléchargement')
  }
}

const openUrl = (url) => {
  window.open(url, '_blank', 'noopener,noreferrer')
}

const editDocument = (document) => {
  const newName = prompt('Nouveau nom du document:', document.name)
  if (newName && newName !== document.name) {
    propertyStore.updateDocument(document.id, { name: newName })
      .then(() => toast.success('Document mis à jour'))
      .catch(() => toast.error('Erreur lors de la mise à jour'))
  }
}

const deleteDocument = async (document) => {
  if (!confirm(`Êtes-vous sûr de vouloir supprimer le document "${document.name}" ?`)) return
  try {
    await propertyStore.deleteDocument(document.id)
    toast.success('Document supprimé')
  } catch (error) {
    console.error('Error deleting document:', error)
    toast.error('Erreur lors de la suppression')
  }
}

onMounted(() => {
  loadProperty()
  loadLeases()
})
</script>
