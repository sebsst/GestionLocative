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
    <div v-if="loading" class="flex justify-center items-center h-64">
      <span class="loading loading-spinner loading-lg text-primary"></span>
    </div>

    <!-- Content -->
    <div v-else-if="property" class="space-y-6">
      <!-- Header -->
      <div class="card bg-gradient-to-r from-primary/10 to-secondary/10 shadow-xl">
        <div class="card-body">
          <div class="flex items-start justify-between mb-4">
            <div>
              <h1 class="text-3xl font-bold">{{ property.name }}</h1>
              <p class="text-base-content/70 mt-2 flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {{ property.address }}, {{ property.postalCode }} {{ property.city }}
              </p>
            </div>
            <div class="flex gap-2">
              <div :class="getStatusBadgeClass(property.status)" class="badge badge-lg">
                {{ getStatusLabel(property.status) }}
               </div>
           </div>


         </div>
       </div>
     </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="stats shadow">
          <div class="stat">
            <div class="stat-title">Surface</div>
            <div class="stat-value text-2xl">{{ property.surface }} m²</div>
            <div class="stat-desc">{{ property.rooms }} pièces</div>
          </div>
        </div>

        <div class="stats shadow">
          <div class="stat">
            <div class="stat-title">Loyer mensuel</div>
            <div class="stat-value text-2xl text-success">{{ formatCurrency(property.currentRent) }}</div>
          </div>
        </div>

        <div class="stats shadow">
          <div class="stat">
            <div class="stat-title">Taxe foncière</div>
            <div class="stat-value text-2xl text-warning">{{ formatCurrency(property?.propertyTax || 0) }}</div>
            <div class="stat-desc">par an</div>
          </div>
        </div>

        <div class="stats shadow">
          <div class="stat">
            <div class="stat-title">Type de bien</div>
            <div class="stat-value text-xl">{{ formatPropertyType(property.type) }}</div>
          </div>
        </div>
       </div>

        <!-- Management Actions -->
        <div v-if="leases.length > 0" class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button @click="openOccupancyModal()" class="btn btn-primary btn-lg">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <div class="flex flex-col items-start">
              <span>Gérer les occupants</span>
              <span class="text-xs opacity-70">Nombre et périodes</span>
            </div>
          </button>

          <button @click="openRentPeriodModal()" class="btn btn-secondary btn-lg">
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



        <!-- Tabs -->
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body p-0">
            <!-- Tab Navigation -->
            <div class="flex border-b border-base-300">
              <button
                @click="activeTab = 'leases'; loadLeases()"
                :class="[
                  'px-6 py-3 font-medium transition-colors border-b-2',
                  activeTab === 'leases'
                    ? 'border-primary text-primary bg-base-200'
                    : 'border-transparent text-base-content/70 hover:text-base-content hover:bg-base-200'
                ]"
              >
                Baux
              </button>
              <button
                @click="activeTab = 'info'"
                :class="[
                  'px-6 py-3 font-medium transition-colors border-b-2',
                  activeTab === 'info'
                    ? 'border-primary text-primary bg-base-200'
                    : 'border-transparent text-base-content/70 hover:text-base-content hover:bg-base-200'
                ]"
              >
                Informations
              </button>
              <button
                @click="activeTab = 'documents'; loadDocuments()"
                :class="[
                  'px-6 py-3 font-medium transition-colors border-b-2',
                  activeTab === 'documents'
                    ? 'border-primary text-primary bg-base-200'
                    : 'border-transparent text-base-content/70 hover:text-base-content hover:bg-base-200'
                ]"
              >
                Documents
              </button>
            </div>

          <!-- Tab Content -->
           <div v-if="activeTab === 'info'" class="p-6 space-y-4">
               <!-- Informations générales -->
               <div class="flex items-center justify-between mb-4">
                 <h3 class="text-xl font-bold">Informations générales</h3>
                 <button @click="toggleInfoEdit" class="btn btn-outline btn-sm">
                   <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                   </svg>
                   {{ isEditingInfo ? 'Annuler' : 'Modifier' }}
                 </button>
               </div>
               <!-- Property Name and Address (always editable when in edit mode) -->
               <div v-if="isEditingInfo" class="space-y-4 mb-6">
                 <div class="form-control">
                   <label class="label">
                     <span class="label-text font-semibold">Nom du bien *</span>
                   </label>
                   <input
                     v-model="infoForm.name"
                     type="text"
                     class="input input-bordered w-full"
                     required
                   />
                 </div>

                 <div class="form-control">
                   <label class="label">
                     <span class="label-text font-semibold">Adresse *</span>
                   </label>
                   <input
                     v-model="infoForm.address"
                     type="text"
                     class="input input-bordered w-full"
                     required
                   />
                 </div>

                 <div class="grid grid-cols-2 gap-4">
                   <div class="form-control">
                     <label class="label">
                       <span class="label-text font-semibold">Code postal *</span>
                     </label>
                     <input
                       v-model="infoForm.postalCode"
                       type="text"
                       class="input input-bordered w-full"
                       required
                     />
                   </div>

                   <div class="form-control">
                     <label class="label">
                       <span class="label-text font-semibold">Ville *</span>
                     </label>
                     <input
                       v-model="infoForm.city"
                       type="text"
                       class="input input-bordered w-full"
                       required
                     />
                   </div>
                 </div>
               </div>

               <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div class="space-y-3">
                   <div v-if="!isEditingInfo" class="flex justify-between py-2 border-b border-base-300">
                     <span class="font-semibold">Type de bien</span>
                     <span>{{ formatPropertyType(property.type) }}</span>
                   </div>
                   <div v-else class="form-control">
                     <label class="label">
                       <span class="label-text font-semibold">Type de bien</span>
                     </label>
                     <select v-model="infoForm.type" class="select select-bordered w-full">
                       <option value="appartement">Appartement</option>
                       <option value="maison">Maison</option>
                       <option value="bureau">Bureau</option>
                       <option value="commerce">Commerce</option>
                       <option value="terrain">Terrain</option>
                       <option value="autre">Autre</option>
                     </select>
                   </div>

                   <div v-if="!isEditingInfo" class="flex justify-between py-2 border-b border-base-300">
                     <span class="font-semibold">Surface</span>
                     <span>{{ property.surface }} m²</span>
                   </div>
                   <div v-else class="form-control">
                     <label class="label">
                       <span class="label-text font-semibold">Surface (m²)</span>
                     </label>
                     <input
                       v-model.number="infoForm.surface"
                       type="number"
                       min="0"
                       step="0.01"
                       class="input input-bordered w-full"
                     />
                   </div>

                   <div v-if="!isEditingInfo" class="flex justify-between py-2 border-b border-base-300">
                     <span class="font-semibold">Nombre de pièces</span>
                     <span>{{ property.rooms }}</span>
                   </div>
                   <div v-else class="form-control">
                     <label class="label">
                       <span class="label-text font-semibold">Nombre de pièces</span>
                     </label>
                     <input
                       v-model.number="infoForm.rooms"
                       type="number"
                       min="0"
                       class="input input-bordered w-full"
                     />
                   </div>
                 </div>

                 <div class="space-y-3">
                   <div v-if="!isEditingInfo" class="flex justify-between py-2 border-b border-base-300">
                     <span class="font-semibold">Référence cadastrale</span>
                      <span>{{ property.cadastralReference || 'N/A' }}</span>
                   </div>
                   <div v-else class="form-control">
                     <label class="label">
                       <span class="label-text font-semibold">Référence cadastrale</span>
                     </label>
                     <input
                       v-model="infoForm.cadastralReference"
                       type="text"
                       class="input input-bordered w-full"
                     />
                   </div>

                   <div v-if="!isEditingInfo" class="flex justify-between py-2 border-b border-base-300">
                     <span class="font-semibold">Numéro fiscal</span>
                      <span>{{ property?.fiscalNumber || 'N/A' }}</span>
                   </div>
                   <div v-else class="form-control">
                     <label class="label">
                       <span class="label-text font-semibold">Numéro fiscal</span>
                     </label>
                     <input
                       v-model="infoForm.fiscalNumber"
                       type="text"
                       class="input input-bordered w-full"
                     />
                   </div>

                   <div v-if="!isEditingInfo" class="flex justify-between py-2 border-b border-base-300">
                     <span class="font-semibold">Prix d'achat</span>
                      <span>{{ property?.purchasePrice ? formatCurrency(property.purchasePrice) : 'N/A' }}</span>
                   </div>
                   <div v-else class="form-control">
                     <label class="label">
                       <span class="label-text font-semibold">Prix d'achat (€)</span>
                     </label>
                     <input
                       v-model.number="infoForm.purchasePrice"
                       type="number"
                       min="0"
                       step="0.01"
                       class="input input-bordered w-full"
                     />
                   </div>

                   <div v-if="!isEditingInfo" class="flex justify-between py-2 border-b border-base-300">
                     <span class="font-semibold">Date d'achat</span>
                      <span>{{ property?.purchaseDate ? formatDate(property.purchaseDate) : 'N/A' }}</span>
                   </div>
                   <div v-else class="form-control">
                     <label class="label">
                       <span class="label-text font-semibold">Date d'achat</span>
                     </label>
                     <input
                       v-model="infoForm.purchaseDate"
                       type="date"
                       class="input input-bordered w-full"
                     />
                   </div>
                 </div>
               </div>

               <div class="mt-6">
                 <h4 class="font-semibold mb-2">Description</h4>
                 <div v-if="!isEditingInfo">
                   <p v-if="property.description" class="text-base-content/80">{{ property.description }}</p>
                   <p v-else class="text-base-content/50 italic">Aucune description</p>
                 </div>
                 <div v-else class="form-control">
                   <textarea
                     v-model="infoForm.description"
                     rows="3"
                     placeholder="Description détaillée du bien..."
                     class="textarea textarea-bordered w-full"
                   ></textarea>
                 </div>
               </div>

               <!-- Edit Actions -->
               <div v-if="isEditingInfo" class="flex justify-end gap-2 mt-6">
                 <button @click="toggleInfoEdit" class="btn btn-ghost">Annuler</button>
                 <button @click="saveInfoChanges" :disabled="saving" class="btn btn-primary">
                   <span v-if="saving" class="loading loading-spinner loading-sm"></span>
                   Enregistrer
                 </button>
               </div>
          </div>

          <div v-if="activeTab === 'leases'" class="p-6 space-y-4">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-xl font-bold">Historique des baux</h3>
                <button @click="openCreateLeaseModal" class="btn btn-primary btn-sm">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Créer un bail
                </button>
              </div>

              <div v-if="leases.length > 0" class="overflow-x-auto">
                <table class="table table-zebra">
                  <thead class="bg-base-200">
                    <tr class="border-b-2 border-base-300">
                      <th class="border-r border-base-300">Locataire</th>
                      <th class="border-r border-base-300">Début</th>
                      <th class="border-r border-base-300">Fin</th>
                      <th class="border-r border-base-300">Loyer</th>
                      <th class="border-r border-base-300">Statut</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="lease in leases" :key="lease.id" class="h-6">
                      <td>{{ lease.Tenant?.firstName }} {{ lease.Tenant?.lastName }}</td>
                      <td>{{ formatDate(lease.startDate) }}</td>
                      <td>{{ lease.endDate ? formatDate(lease.endDate) : 'En cours' }}</td>
                      <td>{{ formatCurrency(lease.monthlyRent) }}</td>
                      <td>
                        <div :class="lease.status === 'actif' ? 'badge-success' : 'badge-error'" class="badge">
                          {{ lease.status }}
                        </div>
                      </td>
                      <td>
                        <div class="flex gap-1">
                          <button @click="openOccupancyModal(lease)" class="btn btn-ghost btn-xs btn-square" title="Gérer les périodes d'occupation">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </button>
                          <button @click="openRentPeriodModal(lease)" class="btn btn-ghost btn-xs btn-square" title="Gérer l'historique des loyers">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                          <button @click="editLease(lease)" class="btn btn-ghost btn-xs btn-square" title="Modifier le bail">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button @click="deleteLease(lease)" class="btn btn-ghost btn-xs btn-square text-error" title="Supprimer le bail">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div v-else class="text-center py-8 text-base-content/60">
                Aucun bail enregistré
              </div>
          </div>

          <div v-if="activeTab === 'finances'" class="p-6 space-y-4">
              <h3 class="text-xl font-bold mb-4">Données financières</h3>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div class="stats shadow">
                  <div class="stat">
                    <div class="stat-title">Revenus locatifs (année)</div>
                    <div class="stat-value text-success">{{ formatCurrency(financialData.yearlyRevenue) }}</div>
                  </div>
                </div>

                <div class="stats shadow">
                  <div class="stat">
                    <div class="stat-title">Charges (année)</div>
                    <div class="stat-value text-error">{{ formatCurrency(financialData.yearlyCharges) }}</div>
                  </div>
                </div>

                <div class="stats shadow">
                  <div class="stat">
                    <div class="stat-title">Résultat net</div>
                    <div class="stat-value text-info">{{ formatCurrency(financialData.yearlyRevenue - financialData.yearlyCharges) }}</div>
                  </div>
                </div>
              </div>

              <div class="bg-base-200 p-4 rounded-lg">
                <h4 class="font-semibold mb-3">Charges déductibles</h4>
                <div class="space-y-2">
                  <div class="flex justify-between">
                    <span>Taxe foncière</span>
                    <span class="font-semibold">{{ formatCurrency(property.propertyTax) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>Charges de copropriété</span>
                    <span class="font-semibold">{{ formatCurrency(financialData.yearlyCharges) }}</span>
                  </div>
                </div>
              </div>
          </div>
         </div>
       </div>
     </div>

     <!-- Documents Section (shown when documents tab is active) -->
     <div v-if="activeTab === 'documents'" class="mt-6">
       <div class="card bg-base-100 shadow-xl">
         <div class="card-body">
           <!-- Documents Section Header -->
           <div class="flex justify-between items-center mb-6">
             <div>
               <h3 class="text-xl font-bold">Documents du bien</h3>
               <p class="text-sm text-base-content/60 mt-1">Gérez les documents associés à ce bien immobilier</p>
             </div>
             <button @click="showDocumentUploadModal = true" class="btn btn-primary gap-2">
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
                    <button v-if="document.filePath" @click="downloadDocument(document)" class="btn btn-ghost btn-sm" title="Télécharger">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </button>
                    <button v-if="document.url" @click="openUrl(document.url)" class="btn btn-ghost btn-sm" title="Ouvrir le lien">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </button>
                   <button @click="editDocument(document)" class="btn btn-ghost btn-sm" title="Modifier">
                     <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                     </svg>
                   </button>
                   <button @click="deleteDocument(document)" class="btn btn-ghost btn-sm text-error" title="Supprimer">
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
    <div v-if="showEditLeaseModal" @click.self="closeEditLeaseModal" class="modal modal-open">
      <div class="modal-box max-w-2xl">
        <button @click="closeEditLeaseModal" class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
        <h3 class="font-bold text-lg mb-4">{{ editingLease ? 'Modifier le bail' : 'Créer un nouveau bail' }}</h3>

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
       </div>
      </div>

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
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'
import api from '@/services/api'
import LeaseOccupancyModal from '@/components/LeaseOccupancyModal.vue'
import LeaseRentPeriodModal from '@/components/LeaseRentPeriodModal.vue'
import DocumentUploadModal from '@/components/DocumentUploadModal.vue'

const route = useRoute()
const toast = useToast()
const property = ref(null)
const loading = ref(false)
const saving = ref(false)
const notFound = ref(false)
const activeTab = ref('leases')
const leases = ref([])
const showOccupancyModal = ref(false)
const showRentPeriodModal = ref(false)
const showEditLeaseModal = ref(false)
const generatingRents = ref(false)
const selectedLease = ref(null)
const isEditingInfo = ref(false)
const documents = ref([])
const showDocumentUploadModal = ref(false)
const infoForm = reactive({
  name: '',
  address: '',
  postalCode: '',
  city: '',
  type: 'appartement',
  surface: null,
  rooms: null,
  cadastralReference: '',
  fiscalNumber: '',
  purchasePrice: null,
  purchaseDate: '',
  description: ''
})
const editingLease = ref(null)
const tenants = ref([])
const financialData = ref({
  yearlyRevenue: 0,
  yearlyCharges: 0
})

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
  loading.value = true
  notFound.value = false
  try {
    const response = await api.get(`/api/properties/${route.params.id}`)
    property.value = response.data.data
  } catch (error) {
    console.error('Error loading property:', error)
    if (error.response?.status === 404) {
      // Property not found - this is expected if no properties exist
      console.log('Property not found - user needs to create properties first')
      notFound.value = true
    } else {
      toast.error('Impossible de charger le bien')
      notFound.value = true
    }
  } finally {
    loading.value = false
  }
}

const loadLeases = async () => {
  try {
    const response = await api.get(`/api/leases?propertyId=${route.params.id}`)
    leases.value = response.data.data || []
  } catch (error) {
    console.error('Error loading leases:', error)
    leases.value = []
  }
}

const loadTenants = async () => {
  try {
    const response = await api.get('/api/tenants')
    tenants.value = response.data.data || []
  } catch (error) {
    console.error('Error loading tenants:', error)
    tenants.value = []
  }
}

const loadFinances = async () => {
  try {
    const currentYear = new Date().getFullYear()

    // Charger les loyers de l'année
    const rentsResponse = await api.get('/api/rents', {
      params: {
        year: currentYear,
        propertyId: route.params.id,
        status: 'paye'
      }
    })
    const rents = rentsResponse.data.data || []
    financialData.value.yearlyRevenue = rents.reduce((sum, r) => sum + (parseFloat(r.paidAmount) || 0), 0)

    // Charger les charges de l'année
    const chargesResponse = await api.get('/api/charges', {
      params: {
        year: currentYear,
        propertyId: route.params.id
      }
    })
    const charges = chargesResponse.data.data || []
    financialData.value.yearlyCharges = charges.reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0)
  } catch (error) {
    console.error('Error loading finances:', error)
  }
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(value || 0)
}

const getMonthName = (month) => {
  const months = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ]
  return months[month - 1] || 'Mois inconnu'
}

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('fr-FR')
}

const formatPropertyType = (type) => {
  const typeMap = {
    appartement: 'Appartement',
    maison: 'Maison',
    immeuble: 'Immeuble',
    terrain: 'Terrain',
    garage: 'Garage',
    fond_commerce: 'Fonds de commerce',
    meuble: 'Meublé'
  }
  return typeMap[type] || type
}

const getStatusBadgeClass = (status) => {
  const classMap = {
    disponible: 'badge-success',
    loue: 'badge-info',
    en_travaux: 'badge-warning',
    vendu: 'badge-error'
  }
  return classMap[status] || 'badge-ghost'
}

const getStatusLabel = (status) => {
  const labelMap = {
    disponible: 'Disponible',
    loue: 'Loué',
    en_travaux: 'En travaux',
    vendu: 'Vendu'
  }
  return labelMap[status] || status
}

const findActiveLease = () => {
  if (leases.value.length === 0) return null

  // Find the currently active lease based on dates
  const currentDate = new Date()
  const activeLease = leases.value.find(l => {
    const startDate = new Date(l.startDate)
    const endDate = l.endDate ? new Date(l.endDate) : null
    return startDate <= currentDate && (!endDate || endDate >= currentDate)
  })

  // Fallback: lease with status 'actif' or first lease
  const fallbackLease = leases.value.find(l => l.status === 'actif') || leases.value[0]
  return activeLease || fallbackLease
}

const openOccupancyModal = async (lease = null) => {
  // If leases haven't been loaded yet, load them
  if (leases.value.length === 0) {
    await loadLeases()
  }

  // If a lease is provided, use it; otherwise find active lease
  selectedLease.value = lease || findActiveLease()

  // Only open modal if we have a valid lease
  if (selectedLease.value?.id) {
    showOccupancyModal.value = true
  } else {
    toast.error('Aucun bail actif trouvé pour ce bien')
  }
}



const toggleInfoEdit = () => {
  if (isEditingInfo.value) {
    // Cancel editing - reset form
    isEditingInfo.value = false
  } else {
    // Start editing - populate form with current data
    Object.assign(infoForm, {
      name: property.value.name,
      address: property.value.address,
      postalCode: property.value.postalCode,
      city: property.value.city,
      type: property.value.type,
      surface: property.value.surface,
      rooms: property.value.rooms,
      cadastralReference: property.value.cadastralReference || '',
      fiscalNumber: property.value.fiscalNumber || '',
      purchasePrice: property.value.purchasePrice,
      purchaseDate: property.value.purchaseDate,
      description: property.value.description || ''
    })
    isEditingInfo.value = true
  }
}

const saveInfoChanges = async () => {
  // Validate required fields
  if (!infoForm.name || !infoForm.address || !infoForm.postalCode || !infoForm.city) {
    toast.error('Veuillez remplir tous les champs obligatoires')
    return
  }

  saving.value = true
  try {
    await api.put(`/api/properties/${route.params.id}`, infoForm)
    toast.success('Informations mises à jour avec succès')

    // Reload property data
    await loadProperty()

    isEditingInfo.value = false
  } catch (error) {
    console.error('Error updating property info:', error)
    toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour')
  } finally {
    saving.value = false
  }
}

const openRentPeriodModal = async (lease = null) => {
  // If leases haven't been loaded yet, load them
  if (leases.value.length === 0) {
    await loadLeases()
  }

  // If a lease is provided, use it; otherwise find active lease
  selectedLease.value = lease || findActiveLease()

  // Only open modal if we have a valid lease
  if (selectedLease.value && selectedLease.value.id) {
    showRentPeriodModal.value = true
  } else {
    toast.error('Aucun bail trouvé pour ce bien')
  }
}

const generateRents = async () => {
  // If leases haven't been loaded yet, load them
  if (leases.value.length === 0) {
    await loadLeases()
  }

  if (!leases.value.length) {
    toast.error('Aucun bail associé à ce bien')
    return
  }

  const currentDate = new Date()
  const month = currentDate.getMonth() + 1 // JavaScript months are 0-indexed
  const year = currentDate.getFullYear()

  // Find active leases based on current date
  const activeLeases = leases.value.filter(lease => {
    const startDate = new Date(lease.startDate)
    const endDate = lease.endDate ? new Date(lease.endDate) : null
    return startDate <= currentDate && (!endDate || endDate >= currentDate)
  })

  if (activeLeases.length === 0) {
    toast.error('Aucun bail actif trouvé pour ce bien à la date actuelle')
    return
  }

  if (!confirm(`Générer les loyers pour ${getMonthName(month)} ${year} ?\n${activeLeases.length} bail(x) actif(s) trouvé(s)`)) return

  generatingRents.value = true
  try {
    // Generate rents for each active lease
    for (const lease of activeLeases) {
      if (!lease.id) {
        console.error('Lease without ID found:', lease)
        continue
      }
      await api.post('/api/rents/generate', {
        leaseId: lease.id,
        month: month,
        year: year
      })
    }

    toast.success(`Loyers générés pour ${getMonthName(month)} ${year}`)
    // Optionally reload data
    loadLeases()
  } catch (error) {
    console.error('Error generating rents:', error)
    toast.error(error.response?.data?.message || 'Erreur lors de la génération des loyers')
  } finally {
    generatingRents.value = false
  }
}

const openCreateLeaseModal = async () => {
  // Load tenants for selection
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

const editLease = (lease) => {
  editingLease.value = lease
  leaseForm.value = {
    tenantId: lease.tenantId,
    startDate: lease.startDate ? lease.startDate.split('T')[0] : '',
    endDate: lease.endDate ? lease.endDate.split('T')[0] : '',
    monthlyRent: lease.monthlyRent,
    deposit: lease.deposit,
    numberOfOccupants: lease.numberOfOccupants || 1,
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
  // Validate required fields
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
      chargesAmount: 0, // Default value, can be updated via rent periods
      deposit: leaseForm.value.deposit || 0,
      numberOfOccupants: leaseForm.value.numberOfOccupants || 1,
      status: leaseForm.value.status,
      notes: leaseForm.value.notes || ''
    }

    if (editingLease.value) {
      // Update existing lease
      await api.put(`/api/leases/${editingLease.value.id}`, data)
      toast.success('Bail modifié avec succès')
    } else {
      // Create new lease
      const createdLease = await api.post('/api/leases', data)
      const leaseId = createdLease.data.data.id

      // Automatically add tenant to the lease
      try {
        await api.post('/api/lease-tenants', {
          leaseId: leaseId,
          tenantId: data.tenantId,
          isPrimary: true, // First tenant is primary
          startDate: data.startDate,
          endDate: null
        })
      } catch (tenantError) {
        console.error('Error adding tenant to lease:', tenantError)
        // Don't fail the whole operation
      }

      // Automatically create initial occupancy period
      try {
        await api.post('/api/lease-occupancy-periods', {
          leaseId: leaseId,
          startDate: data.startDate,
          numberOfOccupants: data.numberOfOccupants
        })
        toast.success('Bail créé avec succès')
      } catch (occupancyError) {
        console.error('Error creating initial occupancy period:', occupancyError)
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

const deleteLease = async (lease) => {
  if (!confirm(`Êtes-vous sûr de vouloir supprimer ce bail ?\n\nLocataire: ${lease.Tenant?.firstName} ${lease.Tenant?.lastName}\nDu ${formatDate(lease.startDate)} au ${lease.endDate ? formatDate(lease.endDate) : 'En cours'}`)) {
    return
  }

  try {
    await api.delete(`/api/leases/${lease.id}`)
    toast.success('Bail supprimé avec succès')
    await loadLeases()
  } catch (error) {
    console.error('Erreur suppression bail:', error)
    toast.error('Erreur lors de la suppression du bail')
  }
}

// Document management methods
const loadDocuments = async () => {
  try {
    const response = await api.get(`/api/documents/property/${route.params.id}`)
    documents.value = response.data.data || []
  } catch (error) {
    console.error('Error loading documents:', error)
    documents.value = []
  }
}

const downloadDocument = async (document) => {
  try {
    const response = await api.get(`/api/documents/${document.id}/download`, {
      responseType: 'blob'
    })

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
  // For now, just show a simple edit dialog
  const newName = prompt('Nouveau nom du document:', document.name)
  if (newName && newName !== document.name) {
    updateDocument(document.id, { name: newName })
  }
}

const updateDocument = async (documentId, updates) => {
  try {
    await api.put(`/api/documents/${documentId}`, updates)
    toast.success('Document mis à jour')
    loadDocuments()
  } catch (error) {
    console.error('Error updating document:', error)
    toast.error('Erreur lors de la mise à jour')
  }
}

const deleteDocument = async (document) => {
  if (!confirm(`Êtes-vous sûr de vouloir supprimer le document "${document.name}" ?`)) {
    return
  }

  try {
    await api.delete(`/api/documents/${document.id}`)
    toast.success('Document supprimé')
    loadDocuments()
  } catch (error) {
    console.error('Error deleting document:', error)
    toast.error('Erreur lors de la suppression')
  }
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

onMounted(() => {
  loadProperty()
  loadLeases()
})
</script>
