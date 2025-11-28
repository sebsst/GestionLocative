<template>
  <div class="p-4">
    <!-- En-tête -->
    <div class="flex items-center justify-between mb-4">
      <div>
        <h1 class="text-2xl font-bold">Biens immobiliers</h1>
        <p class="text-sm text-base-content/70">Gestion de votre patrimoine immobilier</p>
      </div>
      <button
        @click="openNewPropertyDialog"
        class="btn btn-primary gap-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Nouveau bien
      </button>
    </div>

    <!-- Filtres -->
    <div class="card bg-base-100 shadow-xl mb-3">
      <div class="card-body py-3 px-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text">Recherche</span>
            </label>
            <input
              v-model="filters.search"
              type="text"
              placeholder="Nom du bien ou adresse..."
              class="input input-bordered w-full"
              @input="loadProperties"
            />
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">Type de bien</span>
            </label>
            <select v-model="filters.type" class="select select-bordered w-full" @change="loadProperties">
              <option value="">Tous les types</option>
              <option v-for="type in propertyTypes" :key="type.value" :value="type.value">
                {{ type.label }}
              </option>
            </select>
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">Statut</span>
            </label>
            <select v-model="filters.status" class="select select-bordered w-full" @change="loadProperties">
              <option value="">Tous les statuts</option>
              <option v-for="status in statusOptions" :key="status.value" :value="status.value">
                {{ status.label }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>

     <!-- View Toggle -->
     <div v-if="properties.length > 0" class="flex items-center justify-between mt-3 mb-2">
       <h2 class="text-lg font-semibold">Propriétés</h2>
                 <div class="flex gap-2">
         <button
           @click="viewMode = 'table'"
           :class="viewMode === 'table' ? 'btn-primary' : 'btn-ghost'"
           class="btn btn-sm"
         >
           <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
           </svg>
           Tableau
         </button>
         <button
           @click="viewMode = 'cards'"
           :class="viewMode === 'cards' ? 'btn-primary' : 'btn-ghost'"
           class="btn btn-sm"
         >
           <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
           </svg>
           Cartes
         </button>
       </div>
     </div>

     <!-- Loading -->
     <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
       <SkeletonCard v-for="i in 8" :key="i" />
     </div>

     <!-- Table -->
     <div v-else-if="properties.length > 0 && viewMode === 'table'" class="card bg-base-100 shadow-xl overflow-hidden">
      <div class="overflow-x-auto">
        <table class="table table-zebra">
          <thead class="bg-base-200">
            <tr class="border-b-2 border-base-300">
              <th class="border-r border-base-300">Bien</th>
              <th class="border-r border-base-300">Type</th>
              <th class="border-r border-base-300">Adresse</th>
              <th class="border-r border-base-300">Ville</th>
              <th class="text-center border-r border-base-300">Surface</th>
              <th class="text-right border-r border-base-300">Loyer</th>
              <th class="text-center border-r border-base-300">Statut</th>
              <th class="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="property in organizedProperties" :key="property.id">
              <!-- Immeuble ou propriété indépendante -->
               <tr class="hover" :class="{ 'font-semibold': property.type === 'immeuble' }">
                <td>
                  <div class="flex items-center gap-3">
                    <div class="avatar placeholder">
                      <div :class="property.type === 'immeuble' ? 'bg-accent text-accent-content' : 'bg-primary text-primary-content'" class="rounded-lg w-10 flex items-center justify-center">
                        <svg v-if="property.type === 'immeuble'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span v-else class="text-sm font-bold">{{ property.name.charAt(0).toUpperCase() }}</span>
                      </div>
                    </div>
                    <div>
                      <div class="font-medium flex items-center gap-2">
                        {{ property.name }}
                        <span v-if="property.isShared" class="badge badge-sm badge-secondary gap-1">
                          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                          </svg>
                          Partagé
                        </span>
                        <span v-if="property.type === 'immeuble' && property.apartments?.length" class="badge badge-sm badge-ghost">
                          {{ property.apartments.length }} appt{{ property.apartments.length > 1 ? 's' : '' }}
                        </span>
                      </div>
                      <div class="text-sm opacity-60">{{ property.postalCode }}</div>
                    </div>
                  </div>
                </td>
              <td>
                <div class="badge badge-info badge-sm">{{ formatPropertyType(property.type) }}</div>
              </td>
              <td>{{ property.address }}</td>
              <td class="opacity-70">{{ property.city }}</td>
              <td class="text-center">{{ property.surface }} m²</td>
              <td class="text-right font-semibold">{{ formatCurrency(property.currentRent) }}</td>
              <td class="text-center">
                <div :class="getStatusBadgeClass(property.status)" class="badge badge-sm">
                  {{ getStatusLabel(property.status) }}
                </div>
              </td>
              <td>
                <div class="flex items-center justify-center gap-2">
                  <button
                    @click="viewProperty(property)"
                    class="btn btn-ghost btn-xs"
                    title="Voir détails"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  <button
                    @click="editProperty(property)"
                    class="btn btn-ghost btn-xs"
                    title="Modifier"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    @click="deleteProperty(property)"
                    class="btn btn-ghost btn-xs text-error"
                    title="Supprimer"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
              </tr>

              <!-- Appartements de l'immeuble -->
               <tr v-for="apartment in property.apartments" :key="apartment.id" class="hover bg-base-200/30">
                <td>
                  <div class="flex items-center gap-3 pl-8">
                    <svg class="w-4 h-4 text-base-content/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                    <div class="avatar placeholder">
                      <div class="bg-base-300 text-base-content rounded-lg w-8 flex items-center justify-center">
                        <span class="text-xs font-bold">{{ apartment.name.charAt(0).toUpperCase() }}</span>
                      </div>
                    </div>
                    <div>
                      <div class="font-medium text-sm">{{ apartment.name }}</div>
                      <div class="text-xs opacity-50">{{ apartment.postalCode }}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="badge badge-outline badge-sm">{{ formatPropertyType(apartment.type) }}</div>
                </td>
                <td class="text-sm">{{ apartment.address }}</td>
                <td class="opacity-70 text-sm">{{ apartment.city }}</td>
                <td class="text-center text-sm">{{ apartment.surface }} m²</td>
                <td class="text-right font-semibold text-sm">{{ formatCurrency(apartment.currentRent) }}</td>
                <td class="text-center">
                  <div :class="getStatusBadgeClass(apartment.status)" class="badge badge-sm">
                    {{ getStatusLabel(apartment.status) }}
                  </div>
                </td>
                <td>
                  <div class="flex items-center justify-center gap-3">
                    <button
                      @click="viewProperty(apartment)"
                      class="btn btn-ghost btn-xs"
                      title="Voir détails"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button
                      @click="editProperty(apartment)"
                      class="btn btn-ghost btn-xs"
                      title="Modifier"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      @click="deleteProperty(apartment)"
                      class="btn btn-ghost btn-xs text-error"
                      title="Supprimer"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
     </div>

       <div v-if="viewMode === 'cards'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
         <div
           v-for="property in properties"
           :key="property.id"
           @click="viewProperty(property)"
           class="card bg-base-100 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-base-200 group"
         >
           <div class="card-body p-2">
             <!-- Header: Status & Type -->
             <div class="flex justify-between items-start mb-1">
               <div class="badge badge-sm" :class="getStatusBadgeClass(property.status)">
                 {{ getStatusLabel(property.status) }}
               </div>
               <div class="text-[10px] font-medium text-base-content/60 uppercase tracking-wider">
                 {{ formatPropertyType(property.type) }}
               </div>
             </div>

             <!-- Title & Address -->
             <div class="mb-2">
               <div class="flex items-center gap-2 mb-1">
                 <h3 class="card-title text-base font-bold truncate flex-1 leading-tight" :title="property.name">
                   {{ property.name }}
                 </h3>
                 <div v-if="property.isShared" class="badge badge-secondary badge-xs gap-1 flex-shrink-0">
                   <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                   </svg>
                 </div>
               </div>
               <p class="text-xs text-base-content/70 truncate flex items-center gap-1 mt-0.5">
                 <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                 </svg>
                 {{ property.city }} ({{ property.postalCode }})
               </p>
             </div>

             <!-- Key Metrics Grid -->
             <div class="grid grid-cols-2 gap-2 py-2 border-t border-base-100">
               <div class="flex flex-col">
                 <span class="text-[10px] text-base-content/50">Surface</span>
                 <span class="font-semibold text-xs">{{ property.surface ? property.surface + ' m²' : '-' }}</span>
               </div>
               <div class="flex flex-col">
                 <span class="text-[10px] text-base-content/50">Loyer</span>
                 <span class="font-semibold text-xs text-primary">{{ property.currentRent ? formatCurrency(property.currentRent) : '-' }}</span>
               </div>
             </div>
             
             <!-- Footer: Action -->
             <div class="card-actions justify-end mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button class="btn btn-xs btn-ghost text-primary gap-1">
                  Voir le détail
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
             </div>
           </div>
          </div>
        </div>

      <!-- Empty State -->
     <div v-else-if="properties.length === 0" class="card bg-base-100 shadow-xl">
      <div class="card-body items-center text-center py-12">
        <svg class="w-16 h-6 text-base-content/30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <h3 class="text-lg font-semibold mb-2">Aucun bien trouvé</h3>
        <p class="text-base-content/60">{{ filters.search ? 'Essayez de modifier les filtres' : 'Ajoutez votre premier bien immobilier' }}</p>
      </div>
    </div>

    <!-- Dialog Create/Edit -->
    <Modal
      v-model="showDialog"
      :title="editingProperty ? 'Modifier le bien' : 'Nouveau bien'"
      size="lg"
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
            placeholder="Appartement Centre-ville"
            class="input input-bordered w-full"
            required
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text">Type de bien *</span>
            </label>
            <select v-model="propertyForm.type" class="select select-bordered w-full" required>
              <option value="">Sélectionnez un type</option>
              <option v-for="type in propertyTypes" :key="type.value" :value="type.value">
                {{ type.label }}
              </option>
            </select>
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">Statut *</span>
            </label>
            <select v-model="propertyForm.status" class="select select-bordered w-full" required>
              <option value="">Sélectionnez un statut</option>
              <option v-for="status in statusOptions" :key="status.value" :value="status.value">
                {{ status.label }}
              </option>
            </select>
          </div>
        </div>

        <div v-if="propertyForm.type === 'appartement'" class="form-control">
          <label class="label">
            <span class="label-text">Appartient à l'immeuble</span>
          </label>
          <select v-model="propertyForm.buildingId" class="select select-bordered w-full">
            <option :value="null">Aucun immeuble (appartement indépendant)</option>
            <option v-for="building in buildings" :key="building.id" :value="building.id">
              {{ building.name }} - {{ building.address }}
            </option>
          </select>
          <label class="label">
            <span class="label-text-alt">Sélectionnez l'immeuble auquel appartient cet appartement</span>
          </label>
        </div>

        <div class="form-control">
          <label class="label">
            <span class="label-text">Adresse *</span>
          </label>
          <input
            v-model="propertyForm.address"
            type="text"
            placeholder="123 Rue de la Paix"
            class="input input-bordered w-full"
            required
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
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
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text">Surface (m²)</span>
            </label>
            <input
              v-model.number="propertyForm.surface"
              type="number"
              min="0"
              placeholder="50"
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
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text">Loyer mensuel (€)</span>
            </label>
            <input
              v-model.number="propertyForm.currentRent"
              type="number"
              min="0"
              step="0.01"
              placeholder="800"
              class="input input-bordered w-full"
            />
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">Taxe foncière annuelle (€)</span>
            </label>
            <input
              v-model.number="propertyForm.propertyTax"
              type="number"
              min="0"
              step="0.01"
              placeholder="1200"
              class="input input-bordered w-full"
            />
          </div>
        </div>

        <div class="form-control">
          <label class="label">
            <span class="label-text">Description</span>
          </label>
          <textarea
            v-model="propertyForm.description"
            rows="3"
            placeholder="Description du bien..."
            class="textarea textarea-bordered w-full"
          ></textarea>
        </div>
      </div>

      <!-- Auto-save indicator -->
      <div v-if="lastSaved" class="px-6 py-2 text-xs text-base-content/60 border-t border-base-300">
        💾 Brouillon sauvegardé {{ formatLastSaved(lastSaved) }}
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <button @click="closeDialog" class="btn btn-ghost">Annuler</button>
          <button @click="saveProperty" :disabled="saving" class="btn btn-primary">
            <span v-if="saving" class="loading loading-spinner loading-sm"></span>
            {{ saving ? 'Enregistrement...' : (editingProperty ? 'Modifier' : 'Créer') }}
          </button>
        </div>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import api from '@/services/api'
import Modal from '@/components/ui/Modal.vue'
import SkeletonCard from '@/components/ui/SkeletonCard.vue'
import { useFormAutoSave } from '@/composables/useFormAutoSave'

const router = useRouter()
const toast = useToast()

const properties = ref([])
const buildings = ref([])
const loading = ref(false)
const showDialog = ref(false)
const saving = ref(false)
const editingProperty = ref(null)
const viewMode = ref('cards')

// Organiser les propriétés en hiérarchie (immeubles avec leurs appartements)
const organizedProperties = computed(() => {
  const result = []
  const propertiesByBuilding = {}

  // Grouper les appartements par immeuble
  properties.value.forEach(property => {
    if (property.buildingId) {
      if (!propertiesByBuilding[property.buildingId]) {
        propertiesByBuilding[property.buildingId] = []
      }
      propertiesByBuilding[property.buildingId].push(property)
    }
  })

  // Construire la liste organisée
  properties.value.forEach(property => {
    // Si c'est un bien sans buildingId (immeuble, maison, etc.)
    if (!property.buildingId) {
      // Ajouter le bien avec ses appartements s'il en a
      result.push({
        ...property,
        apartments: propertiesByBuilding[property.id] || []
      })
    }
  })

  return result
})

const filters = reactive({
  search: '',
  type: '',
  status: ''
})

const propertyForm = reactive({
  name: '',
  type: '',
  status: 'disponible',
  address: '',
  city: '',
  postalCode: '',
  surface: null,
  rooms: null,
  currentRent: null,
  propertyTax: null,
  description: '',
  buildingId: null
})

// Auto-save for property form
const { lastSaved, clearStorage: clearPropertyDraft } = useFormAutoSave(
  computed(() => editingProperty.value ? `property-form-${editingProperty.value.id}` : 'property-form-new'),
  propertyForm,
  30000 // Save every 30 seconds
)

const propertyTypes = [
  { label: 'Appartement', value: 'appartement' },
  { label: 'Maison', value: 'maison' },
  { label: 'Immeuble', value: 'immeuble' },
  { label: 'Terrain', value: 'terrain' },
  { label: 'Garage', value: 'garage' },
  { label: 'Local commercial', value: 'commercial' },
  { label: 'Meublé', value: 'meuble' }
]

const statusOptions = [
  { label: 'Disponible', value: 'disponible' },
  { label: 'Loué', value: 'loue' },
  { label: 'En travaux', value: 'en_travaux' },
  { label: 'Vendu', value: 'vendu' }
]

const loadProperties = async () => {
  loading.value = true
  try {
    const params = {}
    if (filters.search) params.search = filters.search
    if (filters.type) params.type = filters.type
    if (filters.status) params.status = filters.status

    const response = await api.get('/api/properties', { params })
    properties.value = response.data.data || []
  } catch (error) {
    toast.error('Impossible de charger les biens')
    console.error('Error loading properties:', error)
  } finally {
    loading.value = false
  }
}

const loadBuildings = async () => {
  try {
    const response = await api.get('/api/properties', {
      params: { type: 'immeuble' }
    })
    buildings.value = response.data.data || []
  } catch (error) {
    console.error('Error loading buildings:', error)
  }
}

const resetForm = () => {
  Object.assign(propertyForm, {
    name: '',
    type: '',
    status: 'disponible',
    address: '',
    city: '',
    postalCode: '',
    surface: null,
    rooms: null,
    currentRent: null,
    propertyTax: null,
    description: '',
    buildingId: null
  })
}

const closeDialog = () => {
  showDialog.value = false
  editingProperty.value = null
  resetForm()
  // Don't clear draft on close, only on successful save
}

const saveProperty = async () => {
  if (!propertyForm.name || !propertyForm.type || !propertyForm.address || !propertyForm.city || !propertyForm.postalCode) {
    toast.warning('Veuillez remplir tous les champs obligatoires')
    return
  }

  saving.value = true
  try {
    if (editingProperty.value) {
      await api.put(`/api/properties/${editingProperty.value.id}`, propertyForm)
      toast.success('Bien modifié avec succès')
    } else {
      await api.post('/api/properties', propertyForm)
      toast.success('Bien créé avec succès')
    }
    // Clear auto-saved draft after successful save
    clearPropertyDraft()
    closeDialog()
    loadProperties()
  } catch (error) {
    toast.error(error.response?.data?.error?.message || 'Impossible de sauvegarder le bien')
    console.error('Error saving property:', error)
  } finally {
    saving.value = false
  }
}

const viewProperty = (property) => {
  router.push(`/properties/${property.id}`)
}

const editProperty = async (property) => {
  editingProperty.value = property
  Object.assign(propertyForm, property)
  await loadBuildings()
  showDialog.value = true
}

const openNewPropertyDialog = async () => {
  await loadBuildings()
  showDialog.value = true
}

const deleteProperty = async (property) => {
  if (!confirm(`Voulez-vous vraiment supprimer ${property.name} ?`)) {
    return
  }

  try {
    await api.delete(`/api/properties/${property.id}`)
    toast.success('Bien supprimé avec succès')
    loadProperties()
  } catch (error) {
    toast.error('Impossible de supprimer le bien')
    console.error('Error deleting property:', error)
  }
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

const formatPropertyType = (type) => {
  const typeMap = {
    appartement: 'Appartement',
    maison: 'Maison',
    immeuble: 'Immeuble',
    terrain: 'Terrain',
    garage: 'Garage',
    commercial: 'Commercial',
    meuble: 'Meublé'
  }
  return typeMap[type] || type
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(value || 0)
}

const formatLastSaved = (date) => {
  const now = new Date()
  const diff = Math.floor((now - date) / 1000) // seconds
  
  if (diff < 60) return 'à l\'instant'
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`
  return `il y a ${Math.floor(diff / 3600)} h`
}

onMounted(() => {
  loadProperties()
})

// Keyboard shortcuts for the dialog
watch(showDialog, (isOpen) => {
  if (isOpen) {
    const handleKeyboard = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        saveProperty()
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        saveProperty()
      }
    }
    window.addEventListener('keydown', handleKeyboard)
    window._propertyDialogCleanup = () => window.removeEventListener('keydown', handleKeyboard)
  } else if (window._propertyDialogCleanup) {
    window._propertyDialogCleanup()
    delete window._propertyDialogCleanup
  }
})
</script>
