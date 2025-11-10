<template>
  <div class="p-8">
    <!-- Back Button -->
    <button
      @click="$router.back()"
      class="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-6 transition-colors"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      <span class="font-medium">Retour</span>
    </button>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>

    <!-- Content -->
    <div v-else-if="property" class="space-y-6">
      <!-- Header -->
      <div class="card">
        <div class="flex items-start justify-between mb-4">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">{{ property.name }}</h1>
            <p class="text-gray-600 dark:text-gray-400 mt-2 flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {{ property.address }}, {{ property.postalCode }} {{ property.city }}
            </p>
          </div>
          <button
            @click="editProperty"
            class="btn-primary flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Modifier
          </button>
        </div>
        <span
          :class="getStatusClass(property.status)"
          class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
        >
          {{ getStatusLabel(property.status) }}
        </span>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="card">
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Loyer actuel</p>
          <p class="text-3xl font-bold text-primary-600 dark:text-primary-400">
            {{ formatCurrency(property.currentRent) }}
          </p>
        </div>

        <div class="card">
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Type</p>
          <p class="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {{ formatPropertyType(property.type) }}
          </p>
        </div>

        <div class="card">
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Surface</p>
          <p class="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {{ property.surface }} m²
          </p>
        </div>

        <div class="card">
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Locataire</p>
          <p class="text-xl font-bold text-gray-900 dark:text-gray-100">
            {{ currentLease ? `${currentLease.Tenant.firstName} ${currentLease.Tenant.lastName}` : 'Disponible' }}
          </p>
        </div>
      </div>

      <!-- Tabs -->
      <TabView>
        <!-- Tab Informations -->
        <TabPanel header="Informations">
          <div class="card">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Type de bien</label>
                  <p class="text-lg font-semibold text-gray-900 dark:text-gray-100">{{ formatPropertyType(property.type) }}</p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Surface habitable</label>
                  <p class="text-lg font-semibold text-gray-900 dark:text-gray-100">{{ property.surface }} m²</p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Nombre de pièces</label>
                  <p class="text-lg font-semibold text-gray-900 dark:text-gray-100">{{ property.rooms }} pièce(s)</p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Loyer mensuel</label>
                  <p class="text-2xl font-bold text-primary-600 dark:text-primary-400">{{ formatCurrency(property.currentRent) }}</p>
                </div>
              </div>

              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Adresse complète</label>
                  <p class="text-lg text-gray-900 dark:text-gray-100">{{ property.address }}</p>
                  <p class="text-lg text-gray-900 dark:text-gray-100">{{ property.postalCode }} {{ property.city }}</p>
                </div>

                <div v-if="property.fiscalNumber">
                  <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Numéro fiscal</label>
                  <p class="text-lg text-gray-900 dark:text-gray-100">{{ property.fiscalNumber }}</p>
                </div>

                <div v-if="property.cadastralReference">
                  <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Référence cadastrale</label>
                  <p class="text-lg text-gray-900 dark:text-gray-100">{{ property.cadastralReference }}</p>
                </div>

                <div v-if="property.description">
                  <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Description</label>
                  <p class="text-base text-gray-900 dark:text-gray-100 leading-relaxed">{{ property.description }}</p>
                </div>
              </div>
            </div>
          </div>
        </TabPanel>

        <!-- Tab Locataires -->
        <TabPanel header="Locataires">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100">Gestion des locataires</h3>
            <button
              @click="showNewLeaseDialog = true"
              :disabled="hasActiveLease"
              class="btn-primary flex items-center gap-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Nouveau bail
            </button>
          </div>

          <!-- Current Lease -->
          <div v-if="currentLease" class="card mb-6">
            <div class="flex items-center justify-between mb-4">
              <h4 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Locataire actuel</h4>
              <div class="flex gap-2">
                <button
                  @click="editCurrentLease"
                  class="btn-secondary text-sm px-3 py-1.5"
                >
                  Modifier le bail
                </button>
                <button
                  @click="editCurrentTenant"
                  class="btn-secondary text-sm px-3 py-1.5"
                >
                  Modifier le locataire
                </button>
                <button
                  @click="confirmTerminateLease"
                  class="btn-danger text-sm px-3 py-1.5"
                >
                  Terminer le bail
                </button>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Locataire</label>
                <p class="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {{ currentLease.Tenant.firstName }} {{ currentLease.Tenant.lastName }}
                </p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Email</label>
                <p class="text-base text-gray-900 dark:text-gray-100">{{ currentLease.Tenant.email || 'Non renseigné' }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Téléphone</label>
                <p class="text-base text-gray-900 dark:text-gray-100">{{ currentLease.Tenant.phone || 'Non renseigné' }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Date d'emménagement</label>
                <p class="text-base text-gray-900 dark:text-gray-100">{{ formatDate(currentLease.startDate) }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Loyer mensuel</label>
                <p class="text-xl font-bold text-primary-600 dark:text-primary-400">{{ formatCurrency(currentLease.rentAmount) }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Dépôt de garantie</label>
                <p class="text-base text-gray-900 dark:text-gray-100">{{ formatCurrency(currentLease.deposit) }}</p>
              </div>
            </div>
          </div>

          <div v-else class="card text-center py-12">
            <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Aucun locataire actuellement</h3>
            <p class="text-gray-600 dark:text-gray-400">Ce bien est disponible à la location</p>
          </div>

          <!-- Past Leases -->
          <div v-if="pastLeases.length > 0" class="card mt-6">
            <h4 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Historique des locataires</h4>
            <DataTable :value="pastLeases" class="mt-4">
              <Column field="Tenant.firstName" header="Locataire">
                <template #body="{ data }">
                  {{ data.Tenant.firstName }} {{ data.Tenant.lastName }}
                </template>
              </Column>
              <Column field="startDate" header="Emménagement">
                <template #body="{ data }">
                  {{ formatDate(data.startDate) }}
                </template>
              </Column>
              <Column field="endDate" header="Départ">
                <template #body="{ data }">
                  {{ formatDate(data.endDate) }}
                </template>
              </Column>
              <Column field="rentAmount" header="Loyer">
                <template #body="{ data }">
                  {{ formatCurrency(data.rentAmount) }}
                </template>
              </Column>
            </DataTable>
          </div>
        </TabPanel>

        <!-- Tab Loyers & Charges -->
        <TabPanel header="Loyers & Charges">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100">Historique des loyers et charges</h3>
            <button
              @click="showRentHistoryDialog = true"
              class="btn-primary flex items-center gap-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Nouveau loyer/charges
            </button>
          </div>

          <!-- Current Rent -->
          <div v-if="currentRentHistory" class="card mb-6">
            <h4 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Loyer et charges en vigueur</h4>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div class="card bg-blue-50 dark:bg-blue-900/20">
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Loyer</p>
                <p class="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {{ formatCurrency(currentRentHistory.rentAmount) }}
                </p>
              </div>

              <div class="card bg-yellow-50 dark:bg-yellow-900/20">
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Charges</p>
                <p class="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {{ formatCurrency(currentRentHistory.chargesAmount) }}
                </p>
              </div>

              <div class="card bg-green-50 dark:bg-green-900/20">
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Total mensuel</p>
                <p class="text-2xl font-bold text-green-600 dark:text-green-400">
                  {{ formatCurrency(parseFloat(currentRentHistory.rentAmount) + parseFloat(currentRentHistory.chargesAmount)) }}
                </p>
              </div>

              <div class="card">
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">En vigueur depuis</p>
                <p class="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {{ formatDate(currentRentHistory.startDate) }}
                </p>
              </div>
            </div>

            <div v-if="currentRentHistory.notes" class="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p class="text-sm text-gray-900 dark:text-gray-100">{{ currentRentHistory.notes }}</p>
            </div>
          </div>

          <div v-else class="card text-center py-12">
            <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Aucun loyer défini</h3>
            <p class="text-gray-600 dark:text-gray-400">Créez une entrée pour définir le loyer et les charges</p>
          </div>

          <!-- Rent History Table -->
          <div v-if="rentHistory.length > 0" class="card mt-6">
            <h4 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Historique complet</h4>
            <DataTable :value="rentHistory" sortField="startDate" :sortOrder="-1">
              <Column field="startDate" header="Date de début" sortable>
                <template #body="{ data }">
                  {{ formatDate(data.startDate) }}
                </template>
              </Column>
              <Column field="endDate" header="Date de fin">
                <template #body="{ data }">
                  {{ data.endDate ? formatDate(data.endDate) : 'En cours' }}
                </template>
              </Column>
              <Column field="rentAmount" header="Loyer">
                <template #body="{ data }">
                  {{ formatCurrency(data.rentAmount) }}
                </template>
              </Column>
              <Column field="chargesAmount" header="Charges">
                <template #body="{ data }">
                  {{ formatCurrency(data.chargesAmount) }}
                </template>
              </Column>
              <Column header="Total">
                <template #body="{ data }">
                  <span class="font-semibold text-green-600 dark:text-green-400">
                    {{ formatCurrency(parseFloat(data.rentAmount) + parseFloat(data.chargesAmount)) }}
                  </span>
                </template>
              </Column>
              <Column field="isCurrent" header="Statut">
                <template #body="{ data }">
                  <span
                    :class="data.isCurrent ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'"
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  >
                    {{ data.isCurrent ? 'Actuel' : 'Archivé' }}
                  </span>
                </template>
              </Column>
            </DataTable>
          </div>
        </TabPanel>
      </TabView>
    </div>

    <!-- Dialog New Lease -->
    <Dialog
      v-model:visible="showNewLeaseDialog"
      header="Créer un nouveau bail"
      :modal="true"
      :style="{ width: '700px' }"
    >
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Locataire *</label>
          <select v-model="leaseForm.tenantId" class="input-field" required>
            <option value="">Sélectionnez un locataire</option>
            <option v-for="tenant in tenants" :key="tenant.id" :value="tenant.id">
              {{ tenant.fullName }}
            </option>
          </select>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date d'emménagement *</label>
            <Calendar v-model="leaseForm.startDate" dateFormat="dd/mm/yy" class="w-full" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date de fin (optionnel)</label>
            <Calendar v-model="leaseForm.endDate" dateFormat="dd/mm/yy" showButtonBar class="w-full" />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre de personnes *</label>
          <InputNumber v-model="leaseForm.numberOfOccupants" :min="1" class="w-full" />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Loyer mensuel (€) *</label>
            <InputNumber v-model="leaseForm.rentAmount" mode="currency" currency="EUR" locale="fr-FR" class="w-full" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Charges (€)</label>
            <InputNumber v-model="leaseForm.chargesAmount" mode="currency" currency="EUR" locale="fr-FR" class="w-full" />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dépôt de garantie (€)</label>
          <InputNumber v-model="leaseForm.deposit" mode="currency" currency="EUR" locale="fr-FR" class="w-full" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
          <textarea v-model="leaseForm.notes" rows="3" class="input-field"></textarea>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <button @click="showNewLeaseDialog = false" class="btn-secondary">Annuler</button>
          <button @click="createLease" :disabled="savingLease" class="btn-primary">
            {{ savingLease ? 'Création...' : 'Créer le bail' }}
          </button>
        </div>
      </template>
    </Dialog>

    <!-- Dialog Rent History -->
    <Dialog
      v-model:visible="showRentHistoryDialog"
      header="Définir un nouveau loyer et charges"
      :modal="true"
      :style="{ width: '600px' }"
    >
      <div class="space-y-4">
        <div class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-4">
          <p class="text-sm text-gray-900 dark:text-gray-100">
            Cette nouvelle entrée remplacera le loyer et les charges actuels à partir de la date définie.
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date de début de validité *</label>
          <Calendar v-model="rentHistoryForm.startDate" dateFormat="dd/mm/yy" class="w-full" />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Loyer mensuel (€) *</label>
            <InputNumber v-model="rentHistoryForm.rentAmount" mode="currency" currency="EUR" locale="fr-FR" class="w-full" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Charges mensuelles (€)</label>
            <InputNumber v-model="rentHistoryForm.chargesAmount" mode="currency" currency="EUR" locale="fr-FR" class="w-full" />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
          <textarea v-model="rentHistoryForm.notes" rows="3" class="input-field" placeholder="Ex: augmentation annuelle, révision IRL..."></textarea>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <button @click="showRentHistoryDialog = false" class="btn-secondary">Annuler</button>
          <button @click="createRentHistory" :disabled="savingRentHistory" class="btn-primary">
            {{ savingRentHistory ? 'Enregistrement...' : 'Enregistrer' }}
          </button>
        </div>
      </template>
    </Dialog>

    <!-- Dialog Edit Tenant -->
    <Dialog
      v-model:visible="showEditTenantDialog"
      header="Modifier le locataire"
      :modal="true"
      :style="{ width: '600px' }"
    >
      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prénom *</label>
            <input v-model="tenantForm.firstName" type="text" class="input-field" required />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom *</label>
            <input v-model="tenantForm.lastName" type="text" class="input-field" required />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
          <input v-model="tenantForm.email" type="email" class="input-field" />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Téléphone</label>
            <input v-model="tenantForm.phone" type="tel" class="input-field" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mobile</label>
            <input v-model="tenantForm.mobile" type="tel" class="input-field" />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">IBAN</label>
          <input v-model="tenantForm.iban" type="text" class="input-field" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
          <textarea v-model="tenantForm.notes" rows="3" class="input-field"></textarea>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <button @click="showEditTenantDialog = false" class="btn-secondary">Annuler</button>
          <button @click="updateTenant" :disabled="savingTenant" class="btn-primary">
            {{ savingTenant ? 'Enregistrement...' : 'Enregistrer' }}
          </button>
        </div>
      </template>
    </Dialog>

    <!-- Dialog Edit Lease -->
    <Dialog
      v-model:visible="showEditLeaseDialog"
      header="Modifier le bail"
      :modal="true"
      :style="{ width: '700px' }"
    >
      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date d'emménagement *</label>
            <Calendar v-model="editLeaseForm.startDate" dateFormat="dd/mm/yy" class="w-full" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date de fin (optionnel)</label>
            <Calendar v-model="editLeaseForm.endDate" dateFormat="dd/mm/yy" showButtonBar class="w-full" />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre de personnes *</label>
          <InputNumber v-model="editLeaseForm.numberOfOccupants" :min="1" class="w-full" />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Loyer mensuel (€) *</label>
            <InputNumber v-model="editLeaseForm.rentAmount" mode="currency" currency="EUR" locale="fr-FR" class="w-full" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Charges (€)</label>
            <InputNumber v-model="editLeaseForm.chargesAmount" mode="currency" currency="EUR" locale="fr-FR" class="w-full" />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dépôt de garantie (€)</label>
          <InputNumber v-model="editLeaseForm.deposit" mode="currency" currency="EUR" locale="fr-FR" class="w-full" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
          <textarea v-model="editLeaseForm.notes" rows="3" class="input-field"></textarea>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <button @click="showEditLeaseDialog = false" class="btn-secondary">Annuler</button>
          <button @click="updateLease" :disabled="updatingLease" class="btn-primary">
            {{ updatingLease ? 'Enregistrement...' : 'Enregistrer' }}
          </button>
        </div>
      </template>
    </Dialog>

    <!-- Dialog Edit Property -->
    <Dialog
      v-model:visible="showEditPropertyDialog"
      header="Modifier la propriété"
      :modal="true"
      :style="{ width: '600px' }"
    >
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom du bien *</label>
          <input v-model="propertyForm.name" type="text" class="input-field" required />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Adresse *</label>
          <input v-model="propertyForm.address" type="text" class="input-field" required />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ville *</label>
            <input v-model="propertyForm.city" type="text" class="input-field" required />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Code postal *</label>
            <input v-model="propertyForm.postalCode" type="text" class="input-field" required />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Surface (m²)</label>
            <InputNumber v-model="propertyForm.surface" :min="0" class="w-full" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pièces</label>
            <InputNumber v-model="propertyForm.rooms" :min="0" class="w-full" />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Loyer actuel (€)</label>
          <InputNumber v-model="propertyForm.currentRent" mode="currency" currency="EUR" locale="fr-FR" class="w-full" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
          <textarea v-model="propertyForm.description" rows="3" class="input-field"></textarea>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <button @click="showEditPropertyDialog = false" class="btn-secondary">Annuler</button>
          <button @click="updateProperty" :disabled="updatingProperty" class="btn-primary">
            {{ updatingProperty ? 'Enregistrement...' : 'Enregistrer' }}
          </button>
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import api from '@/services/api'
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dialog from 'primevue/dialog'
import InputNumber from 'primevue/inputnumber'
import Calendar from 'primevue/calendar'

const route = useRoute()
const toast = useToast()
const confirm = useConfirm()

const property = ref(null)
const tenants = ref([])
const loading = ref(false)
const showNewLeaseDialog = ref(false)
const showRentHistoryDialog = ref(false)
const showEditTenantDialog = ref(false)
const showEditLeaseDialog = ref(false)
const showEditPropertyDialog = ref(false)
const savingLease = ref(false)
const savingRentHistory = ref(false)
const savingTenant = ref(false)
const updatingLease = ref(false)
const updatingProperty = ref(false)

const leaseForm = reactive({
  propertyId: route.params.id,
  tenantId: null,
  startDate: new Date(),
  endDate: null,
  rentAmount: null,
  chargesAmount: 0,
  deposit: null,
  numberOfOccupants: 1,
  status: 'actif',
  notes: ''
})

const rentHistoryForm = reactive({
  rentAmount: null,
  chargesAmount: 0,
  startDate: new Date(),
  notes: ''
})

const tenantForm = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  mobile: '',
  address: '',
  city: '',
  postalCode: '',
  iban: '',
  notes: ''
})

const editLeaseForm = reactive({
  startDate: null,
  endDate: null,
  rentAmount: null,
  chargesAmount: 0,
  deposit: null,
  numberOfOccupants: 1,
  notes: ''
})

const propertyForm = reactive({
  name: '',
  address: '',
  city: '',
  postalCode: '',
  surface: null,
  rooms: null,
  currentRent: null,
  description: ''
})

const currentLease = computed(() => {
  if (!property.value || !property.value.Leases) return null
  return property.value.Leases.find(l => l.status === 'actif')
})

const pastLeases = computed(() => {
  if (!property.value || !property.value.Leases) return []
  return property.value.Leases.filter(l => l.status !== 'actif')
})

const hasActiveLease = computed(() => !!currentLease.value)

const rentHistory = computed(() => {
  if (!property.value || !property.value.rentHistory) return []
  return property.value.rentHistory
})

const currentRentHistory = computed(() => {
  return rentHistory.value.find(r => r.isCurrent) || null
})

const loadProperty = async () => {
  loading.value = true
  try {
    const response = await api.get(`/api/properties/${route.params.id}`)
    property.value = response.data.data

    // Pré-remplir le formulaire de bail
    if (currentRentHistory.value) {
      leaseForm.rentAmount = currentRentHistory.value.rentAmount
      leaseForm.chargesAmount = currentRentHistory.value.chargesAmount
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: 'Impossible de charger le bien',
      life: 3000
    })
  } finally {
    loading.value = false
  }
}

const loadTenants = async () => {
  try {
    const response = await api.get('/api/tenants')
    tenants.value = response.data.data.map(t => ({
      ...t,
      fullName: `${t.firstName} ${t.lastName}`
    }))
  } catch (error) {
    console.error('Error loading tenants:', error)
  }
}

const createLease = async () => {
  savingLease.value = true
  try {
    await api.post('/api/leases', leaseForm)
    toast.add({
      severity: 'success',
      summary: 'Succès',
      detail: 'Bail créé avec succès',
      life: 3000
    })
    showNewLeaseDialog.value = false
    loadProperty()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: error.response?.data?.error?.message || 'Impossible de créer le bail',
      life: 3000
    })
  } finally {
    savingLease.value = false
  }
}

const confirmTerminateLease = () => {
  confirm.require({
    message: 'Voulez-vous vraiment terminer ce bail ?',
    header: 'Confirmation',
    icon: 'pi pi-exclamation-triangle',
    accept: async () => {
      try {
        await api.put(`/api/leases/${currentLease.value.id}/terminate`, {
          endDate: new Date()
        })
        toast.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Bail terminé avec succès',
          life: 3000
        })
        loadProperty()
      } catch (error) {
        toast.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de terminer le bail',
          life: 3000
        })
      }
    }
  })
}

const createRentHistory = async () => {
  savingRentHistory.value = true
  try {
    await api.post(`/api/property-rent/${route.params.id}/history`, rentHistoryForm)
    toast.add({
      severity: 'success',
      summary: 'Succès',
      detail: 'Loyer et charges enregistrés avec succès',
      life: 3000
    })
    showRentHistoryDialog.value = false
    loadProperty()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: 'Impossible d\'enregistrer',
      life: 3000
    })
  } finally {
    savingRentHistory.value = false
  }
}

const editCurrentTenant = () => {
  if (currentLease.value && currentLease.value.Tenant) {
    Object.assign(tenantForm, currentLease.value.Tenant)
    showEditTenantDialog.value = true
  }
}

const updateTenant = async () => {
  savingTenant.value = true
  try {
    const tenantId = currentLease.value.Tenant.id
    await api.put(`/api/tenants/${tenantId}`, tenantForm)
    toast.add({
      severity: 'success',
      summary: 'Succès',
      detail: 'Locataire modifié avec succès',
      life: 3000
    })
    showEditTenantDialog.value = false
    loadProperty()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: error.response?.data?.error?.message || 'Impossible de modifier le locataire',
      life: 3000
    })
  } finally {
    savingTenant.value = false
  }
}

const editCurrentLease = () => {
  if (currentLease.value) {
    editLeaseForm.startDate = new Date(currentLease.value.startDate)
    editLeaseForm.endDate = currentLease.value.endDate ? new Date(currentLease.value.endDate) : null
    editLeaseForm.rentAmount = currentLease.value.rentAmount
    editLeaseForm.chargesAmount = currentLease.value.chargesAmount
    editLeaseForm.deposit = currentLease.value.deposit
    editLeaseForm.numberOfOccupants = currentLease.value.numberOfOccupants
    editLeaseForm.notes = currentLease.value.notes || ''
    showEditLeaseDialog.value = true
  }
}

const updateLease = async () => {
  updatingLease.value = true
  try {
    const leaseId = currentLease.value.id
    await api.put(`/api/leases/${leaseId}`, editLeaseForm)
    toast.add({
      severity: 'success',
      summary: 'Succès',
      detail: 'Bail modifié avec succès',
      life: 3000
    })
    showEditLeaseDialog.value = false
    loadProperty()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: error.response?.data?.error?.message || 'Impossible de modifier le bail',
      life: 3000
    })
  } finally {
    updatingLease.value = false
  }
}

const editProperty = () => {
  if (property.value) {
    Object.assign(propertyForm, {
      name: property.value.name,
      address: property.value.address,
      city: property.value.city,
      postalCode: property.value.postalCode,
      surface: property.value.surface,
      rooms: property.value.rooms,
      currentRent: property.value.currentRent,
      description: property.value.description || ''
    })
    showEditPropertyDialog.value = true
  }
}

const updateProperty = async () => {
  updatingProperty.value = true
  try {
    await api.put(`/api/properties/${property.value.id}`, propertyForm)
    toast.add({
      severity: 'success',
      summary: 'Succès',
      detail: 'Propriété modifiée avec succès',
      life: 3000
    })
    showEditPropertyDialog.value = false
    loadProperty()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: 'Impossible de modifier la propriété',
      life: 3000
    })
  } finally {
    updatingProperty.value = false
  }
}

const getStatusClass = (status) => {
  const classMap = {
    disponible: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    loue: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    en_travaux: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    vendu: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  }
  return classMap[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
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
    commercial: 'Local commercial',
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

const formatDate = (date) => {
  return date ? new Date(date).toLocaleDateString('fr-FR') : '-'
}

onMounted(() => {
  loadProperty()
  loadTenants()
})
</script>
