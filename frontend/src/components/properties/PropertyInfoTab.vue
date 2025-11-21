<template>
  <div class="p-6 space-y-4">
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
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useToast } from 'vue-toastification'
import { usePropertyStore } from '@/stores/property'

const props = defineProps({
  property: {
    type: Object,
    required: true
  }
})

const toast = useToast()
const propertyStore = usePropertyStore()
const isEditingInfo = ref(false)
const saving = ref(false)

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

const formatCurrency = (value) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(value || 0)
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

const toggleInfoEdit = () => {
  if (isEditingInfo.value) {
    isEditingInfo.value = false
  } else {
    Object.assign(infoForm, {
      name: props.property.name,
      address: props.property.address,
      postalCode: props.property.postalCode,
      city: props.property.city,
      type: props.property.type,
      surface: props.property.surface,
      rooms: props.property.rooms,
      cadastralReference: props.property.cadastralReference || '',
      fiscalNumber: props.property.fiscalNumber || '',
      purchasePrice: props.property.purchasePrice,
      purchaseDate: props.property.purchaseDate,
      description: props.property.description || ''
    })
    isEditingInfo.value = true
  }
}

const saveInfoChanges = async () => {
  if (!infoForm.name || !infoForm.address || !infoForm.postalCode || !infoForm.city) {
    toast.error('Veuillez remplir tous les champs obligatoires')
    return
  }

  saving.value = true
  try {
    await propertyStore.updateProperty(props.property.id, infoForm)
    toast.success('Informations mises à jour avec succès')
    isEditingInfo.value = false
  } catch (error) {
    console.error('Error updating property info:', error)
    toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour')
  } finally {
    saving.value = false
  }
}
</script>
