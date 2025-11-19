<template>
  <div class="p-8">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-3xl font-bold">Gestion des Baux</h1>
       <div class="flex gap-2">
         <button @click="showPropertyModal = true" class="btn btn-primary btn-sm gap-2">
           <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
           </svg>
           Nouveau bien
         </button>
         <button @click="loadLeases" class="btn btn-ghost btn-sm">
           <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
           </svg>
         </button>
       </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center items-center h-64">
      <span class="loading loading-spinner loading-lg text-primary"></span>
    </div>

    <!-- Lease Cards -->
    <div v-else-if="activeLeases.length > 0">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div
          v-for="lease in activeLeases"
          :key="lease.id"
          @click="selectLease(lease)"
          class="card bg-base-100 shadow-lg cursor-pointer transition-all hover:shadow-xl"
          :class="{
            'ring-2 ring-primary': selectedLease?.id === lease.id,
            'hover:scale-105': selectedLease?.id !== lease.id
          }"
        >
          <div class="card-body">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <h3 class="card-title text-lg">{{ lease.Property?.name }}</h3>
                <p class="text-sm opacity-70 mt-1">{{ lease.Property?.address }}</p>
                <p class="text-xs opacity-60">{{ lease.Property?.postalCode }} {{ lease.Property?.city }}</p>
              </div>
              <div v-if="selectedLease?.id === lease.id" class="badge badge-primary badge-sm">
                Sélectionné
              </div>
            </div>

            <div class="divider my-2"></div>

            <div class="flex items-center gap-2">
              <svg class="w-5 h-5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <div>
                <div class="font-semibold text-sm">{{ lease.Tenant?.firstName }} {{ lease.Tenant?.lastName }}</div>
                <div class="text-xs opacity-70">{{ lease.Tenant?.email }}</div>
              </div>
            </div>

            <div class="flex items-center justify-between mt-3">
              <div>
                <div class="text-xs opacity-70">Loyer mensuel</div>
                <div class="font-bold text-success text-lg">
                  {{ formatCurrency(parseFloat(lease.rentAmount) + parseFloat(lease.chargesAmount)) }}
                </div>
              </div>
              <div class="badge badge-outline">
                {{ lease.status }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Lease Details -->
      <div v-if="selectedLease" class="space-y-6">
        <!-- Summary Card -->
        <!--div class="card bg-gradient-to-r from-primary/10 to-secondary/10 shadow-xl">
          <div class="card-body">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <div class="text-xs opacity-70">Bien</div>
                <div class="font-bold">{{ selectedLease.Property?.name }}</div>
                <div class="text-sm opacity-70">{{ selectedLease.Property?.address }}</div>
              </div>
              <div>
                <div class="text-xs opacity-70">Locataire</div>
                <div class="font-bold">{{ selectedLease.Tenant?.firstName }} {{ selectedLease.Tenant?.lastName }}</div>
                <div class="text-sm opacity-70">{{ selectedLease.Tenant?.email }}</div>
              </div>
              <div>
                <div class="text-xs opacity-70">Période du bail</div>
                <div class="font-semibold">{{ formatDate(selectedLease.startDate) }}</div>
                <div class="text-sm opacity-70">{{ selectedLease.endDate ? 'Fin: ' + formatDate(selectedLease.endDate) : 'En cours' }}</div>
              </div>
              <div>
                <div class="text-xs opacity-70">Montant actuel</div>
                <div class="font-bold text-2xl text-success">{{ formatCurrency(currentRentPeriod?.totalAmount || selectedLease.rentAmount) }}</div>
                <div class="text-sm opacity-70">dont {{ formatCurrency(currentRentPeriod?.chargesAmount || selectedLease.chargesAmount) }} de charges</div>
              </div>
            </div>
          </div>
        </div -->

        <!-- Quick Actions -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
           <button @click="openOccupancyModal" class="btn btn-primary btn-lg">
             <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
             </svg>
             <div class="flex flex-col items-start">
               <span>Gérer les occupants</span>
               <span class="text-xs opacity-70">Nombre et périodes</span>
             </div>
           </button>

           <button @click="openRentPeriodModal" class="btn btn-secondary btn-lg">
             <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
             <div class="flex flex-col items-start">
               <span>Gérer les montants</span>
               <span class="text-xs opacity-70">Loyer et charges</span>
             </div>
           </button>

          <button @click="generateRents" class="btn btn-accent btn-lg" :disabled="generatingRents">
            <span v-if="generatingRents" class="loading loading-spinner"></span>
            <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <div class="flex flex-col items-start">
              <span>Générer loyers</span>
              <span class="text-xs opacity-70">Mois en cours</span>
            </div>
          </button>
        </div>

        <!-- Management Sections -->
        <div class="tabs tabs-lifted gap-4">
          <a class="tab" :class="{ 'tab-active': activeSection === 'rent-periods' }" @click="activeSection = 'rent-periods'">
            Historique des montants
          </a>
          <a class="tab" :class="{ 'tab-active': activeSection === 'occupancy' }" @click="activeSection = 'occupancy'">
            Périodes d'occupation
          </a>
          <a class="tab" :class="{ 'tab-active': activeSection === 'rents' }" @click="activeSection = 'rents'">
            Loyers
          </a>
        </div>

        <!-- Rent Periods Section -->
        <div v-if="activeSection === 'rent-periods'" class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <h2 class="card-title">Historique des montants de loyer</h2>

            <div v-if="rentPeriods.length > 0" class="overflow-x-auto">
              <table class="table table-zebra">
                <thead>
                  <tr>
                    <th>Période</th>
                    <th class="text-right">Loyer HC</th>
                    <th class="text-right">Charges</th>
                    <th class="text-right">Total</th>
                    <th>Motif</th>
                    <th>IRL</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="period in rentPeriods" :key="period.id" class="h-6">
                    <td>
                      <div class="text-sm">
                        {{ formatDate(period.startDate) }}
                        <span v-if="period.endDate"> → {{ formatDate(period.endDate) }}</span>
                        <span v-else class="badge badge-success badge-xs ml-1">Actuel</span>
                      </div>
                    </td>
                    <td class="text-right font-semibold">{{ formatCurrency(period.rentAmount) }}</td>
                    <td class="text-right">{{ formatCurrency(period.chargesAmount) }}</td>
                    <td class="text-right font-bold">{{ formatCurrency(period.totalAmount) }}</td>
                    <td>
                      <span class="badge badge-sm" :class="getReasonBadgeClass(period.changeReason)">
                        {{ getReasonLabel(period.changeReason) }}
                      </span>
                    </td>
                    <td>
                      <div v-if="period.irlIndex" class="text-xs">
                        {{ period.irlQuarter }}: {{ period.irlIndex }}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else class="text-center py-8 text-base-content/60">
              Aucun historique de montant. Cliquez sur "Gérer les montants" pour commencer.
            </div>
          </div>
        </div>

        <!-- Occupancy Periods Section -->
        <div v-if="activeSection === 'occupancy'" class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <h2 class="card-title">Périodes d'occupation</h2>

            <div v-if="occupancyPeriods.length > 0" class="overflow-x-auto">
              <table class="table table-zebra">
                <thead>
                  <tr>
                    <th>Période</th>
                    <th>Nombre d'occupants</th>
                    <th>Durée</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="period in occupancyPeriods" :key="period.id" class="h-6">
                    <td>
                      <div class="text-sm">
                        {{ formatDate(period.startDate) }}
                        <span v-if="period.endDate"> → {{ formatDate(period.endDate) }}</span>
                        <span v-else class="badge badge-success badge-xs ml-1">Actuel</span>
                      </div>
                    </td>
                    <td>
                      <div class="flex items-center gap-2">
                        <svg class="w-4 h-4 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span class="font-semibold">{{ period.numberOfOccupants }}</span>
                      </div>
                    </td>
                    <td>
                      <span class="text-sm">{{ calculateDuration(period) }}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else class="text-center py-8 text-base-content/60">
              Aucune période d'occupation. Cliquez sur "Gérer les occupants" pour commencer.
            </div>
          </div>
        </div>

        <!-- Rents Section -->
        <div v-if="activeSection === 'rents'" class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <div class="flex items-center justify-between mb-4">
              <h2 class="card-title">Loyers</h2>
              <select v-model="rentsFilter.year" @change="loadRents" class="select select-bordered select-sm">
                <option :value="new Date().getFullYear()">{{ new Date().getFullYear() }}</option>
                <option :value="new Date().getFullYear() - 1">{{ new Date().getFullYear() - 1 }}</option>
                <option :value="new Date().getFullYear() - 2">{{ new Date().getFullYear() - 2 }}</option>
              </select>
            </div>

            <div v-if="rents.length > 0" class="overflow-x-auto">
              <table class="table table-sm">
                <thead>
                  <tr>
                    <th>Période</th>
                    <th class="text-right">Attendu</th>
                    <th class="text-right">Payé</th>
                    <th>Statut</th>
                    <th>Date paiement</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="rent in rents" :key="rent.id" class="h-6">
                    <td>{{ getMonthName(rent.month) }} {{ rent.year }}</td>
                    <td class="text-right font-semibold">{{ formatCurrency(rent.expectedAmount) }}</td>
                    <td class="text-right">{{ formatCurrency(rent.paidAmount || 0) }}</td>
                    <td>
                      <span class="badge badge-sm" :class="getRentStatusClass(rent.status)">
                        {{ getRentStatusLabel(rent.status) }}
                      </span>
                    </td>
                    <td>{{ rent.paymentDate ? formatDate(rent.paymentDate) : '-' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else class="text-center py-8 text-base-content/60">
              Aucun loyer pour cette année.
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- No Active Leases -->
    <div v-else class="text-center py-16">
      <svg class="w-24 h-24 mx-auto mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <h3 class="text-xl font-semibold mb-2">Aucun bail actif</h3>
      <p class="text-base-content/60">Créez un bail depuis la vue Biens ou Locataires</p>
    </div>

    <!-- Modals -->
    <LeaseRentPeriodModal
      v-if="selectedLease"
      :is-open="showRentPeriodModal"
      :lease-id="selectedLease.id"
      @close="closeRentPeriodModal"
      @updated="loadLeaseData"
    />

     <LeaseOccupancyModal
       v-if="selectedLease"
       :show="showOccupancyModal"
       :lease="selectedLease"
       @close="closeOccupancyModal"
       @updated="loadLeaseData"
     />

     <!-- New Property Modal -->
     <Modal
       v-model="showPropertyModal"
       title="Nouveau bien"
       size="md"
       :hide-footer="true"
     >
       <div class="space-y-4">
         <div class="form-control">
           <label class="label">
             <span class="label-text">Nom du bien *</span>
           </label>
           <input
             v-model="propertyForm.name"
             type="text"
             placeholder="Ex: Appartement 3 pièces, Maison centre-ville..."
             class="input input-bordered w-full"
             required
           />
         </div>

         <div class="form-control">
           <label class="label">
             <span class="label-text">Adresse *</span>
           </label>
           <input
             v-model="propertyForm.address"
             type="text"
             placeholder="Numéro et rue"
             class="input input-bordered w-full"
             required
           />
         </div>

         <div class="grid grid-cols-2 gap-4">
           <div class="form-control">
             <label class="label">
               <span class="label-text">Code postal *</span>
             </label>
             <input
               v-model="propertyForm.postalCode"
               type="text"
               placeholder="75001"
               class="input input-bordered w-full"
               required
             />
           </div>

           <div class="form-control">
             <label class="label">
               <span class="label-text">Ville *</span>
             </label>
             <input
               v-model="propertyForm.city"
               type="text"
               placeholder="Paris"
               class="input input-bordered w-full"
               required
             />
           </div>
         </div>

         <div class="form-control">
           <label class="label">
             <span class="label-text">Type de bien</span>
           </label>
           <select v-model="propertyForm.type" class="select select-bordered w-full">
             <option value="appartement">Appartement</option>
             <option value="maison">Maison</option>
             <option value="bureau">Bureau</option>
             <option value="commerce">Commerce</option>
             <option value="terrain">Terrain</option>
             <option value="autre">Autre</option>
           </select>
         </div>

         <div class="form-control">
           <label class="label">
             <span class="label-text">Surface (m²)</span>
           </label>
           <input
             v-model.number="propertyForm.surface"
             type="number"
             min="0"
             step="0.01"
             placeholder="75.5"
             class="input input-bordered w-full"
           />
         </div>

         <div class="form-control">
           <label class="label">
             <span class="label-text">Nombre de pièces</span>
           </label>
           <input
             v-model.number="propertyForm.rooms"
             type="number"
             min="0"
             placeholder="3"
             class="input input-bordered w-full"
           />
         </div>

         <div class="form-control">
           <label class="label">
             <span class="label-text">Description</span>
           </label>
           <textarea
             v-model="propertyForm.description"
             rows="3"
             placeholder="Description détaillée du bien..."
             class="textarea textarea-bordered w-full"
           ></textarea>
         </div>
       </div>

       <template #footer>
         <div class="flex justify-end gap-2">
           <button @click="closePropertyModal" class="btn">Annuler</button>
           <button @click="createProperty" :disabled="creatingProperty" class="btn btn-primary">
             {{ creatingProperty ? 'Création...' : 'Créer le bien' }}
           </button>
         </div>
       </template>
     </Modal>
   </div>
 </template>

<script setup>
import { ref, onMounted, computed, reactive } from 'vue';
import { useToast } from 'vue-toastification';
import api from '@/services/api';
import Modal from '@/components/ui/Modal.vue';
import LeaseRentPeriodModal from '@/components/LeaseRentPeriodModal.vue';
import LeaseOccupancyModal from '@/components/LeaseOccupancyModal.vue';

const toast = useToast();

const loading = ref(false);
const activeLeases = ref([]);
const selectedLease = ref(null);
const activeSection = ref('rent-periods');

const rentPeriods = ref([]);
const currentRentPeriod = ref(null);
const occupancyPeriods = ref([]);
const rents = ref([]);
const rentsFilter = ref({ year: new Date().getFullYear() });

const propertyForm = reactive({
  name: '',
  address: '',
  postalCode: '',
  city: '',
  type: 'appartement',
  surface: null,
  rooms: null,
  description: ''
});

const showRentPeriodModal = ref(false);
const showOccupancyModal = ref(false);
const showPropertyModal = ref(false);
const generatingRents = ref(false);
const creatingProperty = ref(false);

onMounted(() => {
  loadLeases();
});

const loadLeases = async () => {
  loading.value = true;
  try {
    const response = await api.get('/api/leases?status=actif');
    activeLeases.value = response.data.data || [];

    if (activeLeases.value.length > 0) {
      selectLease(activeLeases.value[0]);
    }
  } catch (error) {
    console.error('Error loading leases:', error);
    toast.error('Erreur lors du chargement des baux');
  } finally {
    loading.value = false;
  }
};

const selectLease = async (lease) => {
  selectedLease.value = lease;
  await loadLeaseData();
};

const loadLeaseData = async () => {
  if (!selectedLease.value) return;

  await Promise.all([
    loadRentPeriods(),
    loadCurrentRentPeriod(),
    loadOccupancyPeriods(),
    loadRents()
  ]);
};

const loadRentPeriods = async () => {
  try {
    const response = await api.get(`/api/lease-rent-periods/history/${selectedLease.value.id}`);
    rentPeriods.value = response.data.data || [];
  } catch (error) {
    console.error('Error loading rent periods:', error);
  }
};

const loadCurrentRentPeriod = async () => {
  try {
    const response = await api.get(`/api/lease-rent-periods/current/${selectedLease.value.id}`);
    currentRentPeriod.value = response.data.data;
  } catch (error) {
    // No current period is OK
    currentRentPeriod.value = null;
  }
};

const loadOccupancyPeriods = async () => {
  try {
    const response = await api.get(`/api/lease-occupancy-periods/lease/${selectedLease.value.id}`);
    occupancyPeriods.value = response.data.data || [];
  } catch (error) {
    console.error('Error loading occupancy periods:', error);
  }
};

const loadRents = async () => {
  try {
    const response = await api.get(`/api/rents?leaseId=${selectedLease.value.id}&year=${rentsFilter.value.year}`);
    rents.value = response.data.data || [];
  } catch (error) {
    console.error('Error loading rents:', error);
  }
};

const generateRents = async () => {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  if (!confirm(`Générer les loyers pour ${getMonthName(month)} ${year} ?`)) return;

  generatingRents.value = true;
  try {
    await api.post('/api/rents/generate', { month, year });
    toast.success('Loyers générés avec succès');
    await loadRents();
  } catch (error) {
    console.error('Error generating rents:', error);
    toast.error(error.response?.data?.message || 'Erreur lors de la génération des loyers');
  } finally {
    generatingRents.value = false;
  }
};

const openRentPeriodModal = () => {
  if (!selectedLease.value) {
    toast.error('Veuillez sélectionner un bail');
    return;
  }
  showRentPeriodModal.value = true;
};

const closeRentPeriodModal = () => {
  showRentPeriodModal.value = false;
};

const openOccupancyModal = () => {
  if (!selectedLease.value) {
    toast.error('Veuillez sélectionner un bail');
    return;
  }
  showOccupancyModal.value = true;
};

const closeOccupancyModal = () => {
  showOccupancyModal.value = false;
};

const closePropertyModal = () => {
  showPropertyModal.value = false;
  resetPropertyForm();
};

const resetPropertyForm = () => {
  Object.assign(propertyForm, {
    name: '',
    address: '',
    postalCode: '',
    city: '',
    type: 'appartement',
    surface: null,
    rooms: null,
    description: ''
  });
};

const createProperty = async () => {
  if (!propertyForm.name || !propertyForm.address || !propertyForm.postalCode || !propertyForm.city) {
    toast.error('Veuillez remplir tous les champs obligatoires');
    return;
  }

  creatingProperty.value = true;
  try {
    await api.post('/api/properties', propertyForm);
    toast.success('Bien créé avec succès');
    closePropertyModal();
    // Optionally reload leases if needed
  } catch (error) {
    console.error('Error creating property:', error);
    toast.error(error.response?.data?.message || 'Erreur lors de la création du bien');
  } finally {
    creatingProperty.value = false;
  }
};

const calculateDuration = (period) => {
  const start = new Date(period.startDate);
  const end = period.endDate ? new Date(period.endDate) : new Date();

  const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (years > 0 && remainingMonths > 0) {
    return `${years} an${years > 1 ? 's' : ''} et ${remainingMonths} mois`;
  } else if (years > 0) {
    return `${years} an${years > 1 ? 's' : ''}`;
  } else if (months > 0) {
    return `${months} mois`;
  } else {
    const days = Math.floor((end - start) / (1000 * 60 * 60 * 24));
    return `${days} jour${days > 1 ? 's' : ''}`;
  }
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
};

const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const getMonthName = (month) => {
  const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  return months[month - 1];
};

const getReasonLabel = (reason) => {
  const labels = {
    initial: 'Initial',
    irl_revision: 'IRL',
    tenant_change: 'Locataire',
    work_completion: 'Travaux',
    occupant_change: 'Occupants',
    charge_increase: 'Charges',
    rent_decrease: 'Diminution',
    other: 'Autre'
  };
  return labels[reason] || reason;
};

const getReasonBadgeClass = (reason) => {
  const classes = {
    initial: 'badge-neutral',
    irl_revision: 'badge-primary',
    tenant_change: 'badge-secondary',
    work_completion: 'badge-accent',
    occupant_change: 'badge-info',
    charge_increase: 'badge-warning',
    rent_decrease: 'badge-error',
    other: 'badge-ghost'
  };
  return classes[reason] || 'badge-ghost';
};

const getRentStatusLabel = (status) => {
  const labels = {
    en_attente: 'En attente',
    paye: 'Payé',
    partiel: 'Partiel',
    en_retard: 'En retard'
  };
  return labels[status] || status;
};

const getRentStatusClass = (status) => {
  const classes = {
    en_attente: 'badge-warning',
    paye: 'badge-success',
    partiel: 'badge-info',
    en_retard: 'badge-error'
  };
  return classes[status] || 'badge-ghost';
};
</script>
