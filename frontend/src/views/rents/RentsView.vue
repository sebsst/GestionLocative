<template>
  <div class="p-8">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold">Gestion des loyers</h1>
        <p class="text-base-content/70 mt-1">Suivi des paiements et génération des loyers</p>
      </div>
      <button
        @click="showGenerateDialog = true"
        class="btn btn-primary gap-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Générer les loyers du mois
      </button>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
      <div class="stats shadow">
        <div class="stat">
          <div class="stat-title">Total loyers</div>
          <div class="stat-value">{{ rents.length }}</div>
        </div>
      </div>

      <div class="stats shadow bg-warning text-warning-content">
        <div class="stat">
          <div class="stat-title text-warning-content/70">En attente</div>
          <div class="stat-value">{{ pendingCount }}</div>
        </div>
      </div>

      <div class="stats shadow bg-error text-error-content">
        <div class="stat">
          <div class="stat-title text-error-content/70">En retard</div>
          <div class="stat-value">{{ lateCount }}</div>
        </div>
      </div>

      <div class="stats shadow bg-success text-success-content">
        <div class="stat">
          <div class="stat-title text-success-content/70">Payés</div>
          <div class="stat-value">{{ paidCount }}</div>
        </div>
      </div>

      <div class="stats shadow">
        <div class="stat">
          <div class="stat-title">Montant perçu</div>
          <div class="stat-value text-xl">{{ formatCurrency(totalPaidAmount) }}</div>
        </div>
      </div>

      <div class="stats shadow">
        <div class="stat">
          <div class="stat-title">Montant attendu</div>
          <div class="stat-value text-xl">{{ formatCurrency(totalExpectedAmount) }}</div>
        </div>
      </div>
    </div>

    <!-- Réévaluation IRL -->
    <div class="card bg-gradient-to-br from-primary/10 to-secondary/10 shadow-xl mb-6">
      <div class="card-body">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="card-title text-xl">
              <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              Réévaluation de loyer IRL
            </h2>
            <p class="text-sm text-base-content/60 mt-1">
              Calculez l'augmentation annuelle selon l'Indice de référence des loyers
            </p>
          </div>
          <button @click="showIRLDialog = true" class="btn btn-primary gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Calculer
          </button>
        </div>
      </div>
    </div>

    <!-- Filtres -->
    <div class="card bg-base-100 shadow-xl mb-6">
      <div class="card-body">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text">Année</span>
            </label>
            <select v-model="filters.year" class="select select-bordered w-full" @change="loadRents">
              <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
            </select>
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">Mois</span>
            </label>
            <select v-model="filters.month" class="select select-bordered w-full" @change="loadRents">
              <option value="">Tous les mois</option>
              <option v-for="month in months" :key="month.value" :value="month.value">
                {{ month.label }}
              </option>
            </select>
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">Statut</span>
            </label>
            <select v-model="filters.status" class="select select-bordered w-full" @change="loadRents">
              <option value="">Tous les statuts</option>
              <option v-for="status in statusOptions" :key="status.value" :value="status.value">
                {{ status.label }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center items-center h-64">
      <span class="loading loading-spinner loading-lg text-primary"></span>
    </div>

    <!-- Table -->
    <div v-else-if="rents.length > 0" class="card bg-base-100 shadow-xl overflow-hidden">
      <div class="overflow-x-auto">
        <table class="table table-zebra">
          <thead class="bg-base-200">
            <tr class="border-b-2 border-base-300">
              <th class="border-r border-base-300">Locataire</th>
              <th class="border-r border-base-300">Bien</th>
              <th class="border-r border-base-300">Période</th>
              <th class="text-right border-r border-base-300">Montant attendu</th>
              <th class="text-right border-r border-base-300">Provisions charges</th>
              <th class="text-right border-r border-base-300">Montant payé</th>
              <th class="text-center border-r border-base-300">Statut</th>
              <th class="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="rent in rents" :key="rent.id" class="hover h-6">
              <td>
                <div class="font-medium">
                  {{ rent.Lease?.Tenant?.firstName }} {{ rent.Lease?.Tenant?.lastName }}
                </div>
              </td>
              <td>
                <div class="text-sm">
                  {{ rent.Lease?.Property?.name }}
                </div>
              </td>
              <td>
                <div class="text-sm">
                  {{ getMonthName(rent.month) }} {{ rent.year }}
                </div>
              </td>
              <td class="text-right">
                <div class="text-sm font-medium">
                  {{ formatCurrency(rent.expectedAmount) }}
                </div>
              </td>
              <td class="text-right">
                <div class="text-sm font-medium text-info">
                  {{ formatCurrency(rent.chargeProvisions) }}
                </div>
                <div class="text-xs text-base-content/50">
                  ({{ ((parseFloat(rent.chargeProvisions) / parseFloat(rent.expectedAmount)) * 100).toFixed(0) }}%)
                </div>
              </td>
              <td class="text-right">
                <div class="text-sm font-medium">
                  {{ formatCurrency(rent.paidAmount) }}
                </div>
              </td>
              <td class="text-center">
                <div
                  :class="getBadgeClass(rent.status)"
                  class="badge badge-sm"
                >
                  {{ getStatusLabel(rent.status) }}
                </div>
              </td>
              <td>
                 <div class="flex items-center justify-center gap-2">
                  <button
                    v-if="rent.status !== 'paye'"
                    @click="quickMarkAsPaid(rent)"
                    class="btn btn-ghost btn-xs text-success"
                    title="Marquer comme payé (montant complet)"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                  <button
                    @click="editPayment(rent)"
                    class="btn btn-ghost btn-xs text-primary"
                    :title="rent.status === 'paye' ? 'Modifier le paiement' : 'Enregistrer un paiement'"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    v-if="rent.status !== 'paye'"
                    @click="sendReminder(rent)"
                    class="btn btn-ghost btn-xs text-info"
                    title="Envoyer un rappel"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </button>
                  <button
                    @click="downloadReminder(rent)"
                    class="btn btn-ghost btn-xs text-secondary"
                    title="Télécharger le rappel"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="card bg-base-100 shadow-xl">
      <div class="card-body items-center text-center py-12">
        <svg class="w-16 h-6 text-base-content/30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 class="text-lg font-semibold mb-2">Aucun loyer trouvé</h3>
        <p class="text-base-content/60">Générez les loyers du mois en cours</p>
      </div>
    </div>

    <!-- Dialog Generate Rents -->
    <Modal
      v-model="showGenerateDialog"
      title="Générer les loyers"
      size="md"
      :hide-footer="true"
    >
      <div class="space-y-4">
        <!-- Mode de génération -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-semibold">Mode de génération</span>
          </label>
          <div class="btn-group w-full">
            <button
              @click="generateForm.mode = 'single'"
              :class="['btn flex-1', generateForm.mode === 'single' ? 'btn-primary' : 'btn-outline']"
            >
              Mois unique
            </button>
            <button
              @click="generateForm.mode = 'range'"
              :class="['btn flex-1', generateForm.mode === 'range' ? 'btn-primary' : 'btn-outline']"
            >
              Plusieurs mois
            </button>
          </div>
        </div>

        <!-- Génération mois unique -->
        <template v-if="generateForm.mode === 'single'">
          <div class="grid grid-cols-2 gap-4">
            <div class="form-control">
              <label class="label">
                <span class="label-text">Mois</span>
              </label>
              <select v-model="generateForm.month" class="select select-bordered w-full">
                <option v-for="month in months" :key="month.value" :value="month.value">
                  {{ month.label }}
                </option>
              </select>
            </div>
            <div class="form-control">
              <label class="label">
                <span class="label-text">Année</span>
              </label>
              <select v-model="generateForm.year" class="select select-bordered w-full">
                <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
              </select>
            </div>
          </div>
        </template>

        <!-- Génération période -->
        <template v-else>
          <div class="alert alert-info">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="text-sm">Générez les loyers pour tous les mois entre le mois de début et le mois de fin</span>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="form-control">
              <label class="label">
                <span class="label-text">Mois de début</span>
              </label>
              <select v-model="generateForm.startMonth" class="select select-bordered w-full">
                <option v-for="month in months" :key="month.value" :value="month.value">
                  {{ month.label }}
                </option>
              </select>
            </div>
            <div class="form-control">
              <label class="label">
                <span class="label-text">Année de début</span>
              </label>
              <select v-model="generateForm.startYear" class="select select-bordered w-full">
                <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="form-control">
              <label class="label">
                <span class="label-text">Mois de fin</span>
              </label>
              <select v-model="generateForm.endMonth" class="select select-bordered w-full">
                <option v-for="month in months" :key="month.value" :value="month.value">
                  {{ month.label }}
                </option>
              </select>
            </div>
            <div class="form-control">
              <label class="label">
                <span class="label-text">Année de fin</span>
              </label>
              <select v-model="generateForm.endYear" class="select select-bordered w-full">
                <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
              </select>
            </div>
          </div>

          <!-- Aperçu des mois -->
          <div v-if="monthsToGenerate.length > 0" class="card bg-base-200">
            <div class="card-body p-4">
              <h4 class="font-semibold text-sm mb-2">Mois à générer ({{ monthsToGenerate.length }} mois) :</h4>
              <div class="flex flex-wrap gap-2">
                <div
                  v-for="period in monthsToGenerate"
                  :key="`${period.month}-${period.year}`"
                  class="badge badge-primary"
                >
                  {{ getMonthName(period.month) }} {{ period.year }}
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <button @click="showGenerateDialog = false" class="btn">Annuler</button>
          <button @click="generateRents" :disabled="generating || (generateForm.mode === 'range' && monthsToGenerate.length === 0)" class="btn btn-primary">
            <span v-if="generating" class="loading loading-spinner loading-sm"></span>
            {{ generating ? 'Génération...' : `Générer ${generateForm.mode === 'range' ? `(${monthsToGenerate.length} mois)` : ''}` }}
          </button>
        </div>
      </template>
    </Modal>

    <!-- Dialog Payment -->
    <Modal
      v-model="showPaymentDialog"
      title="Enregistrer un paiement"
      size="sm"
      :hide-footer="true"
    >
      <div class="space-y-4">
        <div class="form-control">
          <label class="label">
            <span class="label-text">Montant payé (€)</span>
          </label>
          <input
            v-model.number="paymentForm.paidAmount"
            type="number"
            min="0"
            step="0.01"
            placeholder="800.00"
            class="input input-bordered w-full"
          />
        </div>
        <div class="form-control">
          <label class="label">
            <span class="label-text">Date de paiement</span>
          </label>
          <input
            v-model="paymentForm.paymentDate"
            type="date"
            class="input input-bordered w-full"
          />
        </div>
        <div class="form-control">
          <label class="label">
            <span class="label-text">Moyen de paiement</span>
          </label>
          <select v-model="paymentForm.paymentMethod" class="select select-bordered w-full">
            <option v-for="method in paymentMethods" :key="method.value" :value="method.value">
              {{ method.label }}
            </option>
          </select>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <button @click="showPaymentDialog = false" class="btn">Annuler</button>
          <button @click="savePayment" :disabled="saving" class="btn btn-primary">
            {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
          </button>
        </div>
      </template>
    </Modal>

    <!-- Dialog Réévaluation IRL -->
    <Modal
      v-model="showIRLDialog"
      title="Calculateur de réévaluation IRL"
      size="lg"
      :hide-footer="true"
    >
      <div class="space-y-6">
        <!-- Info IRL -->
        <div class="alert alert-info">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div class="text-sm">
            <p class="font-semibold">Formule de calcul</p>
            <p>Nouveau loyer = Loyer actuel × (IRL du trimestre de référence de la révision / IRL du même trimestre de l'année précédente)</p>
          </div>
        </div>

        <!-- Sélection du bail -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-semibold">Bail à réévaluer *</span>
          </label>
          <select v-model="irlForm.leaseId" class="select select-bordered w-full" @change="onLeaseSelected">
            <option value="">Sélectionnez un bail</option>
            <option v-for="lease in activeLeases" :key="lease.id" :value="lease.id">
              {{ lease.Tenant?.firstName }} {{ lease.Tenant?.lastName }} - {{ lease.Property?.name }} ({{ formatCurrency(lease.monthlyRent) }})
            </option>
          </select>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <!-- Loyer actuel -->
          <div class="form-control">
            <label class="label">
              <span class="label-text">Loyer actuel (€) *</span>
            </label>
            <input
              v-model.number="irlForm.currentRent"
              type="number"
              min="0"
              step="0.01"
              placeholder="800.00"
              class="input input-bordered w-full"
              required
            />
          </div>

          <!-- Date de révision -->
          <div class="form-control">
            <label class="label">
              <span class="label-text">Date de révision *</span>
            </label>
            <input
              v-model="irlForm.revisionDate"
              type="date"
              class="input input-bordered w-full"
              required
            />
          </div>
        </div>

        <!-- IRL Section -->
        <div class="grid grid-cols-2 gap-4">
          <!-- IRL Référence (année N-1) -->
          <div class="form-control">
            <label class="label">
              <span class="label-text">IRL Trimestre référence (N-1) *</span>
              <span class="label-text-alt">{{ irlForm.referenceQuarter }}</span>
            </label>
            <input
              v-model.number="irlForm.oldIRL"
              type="number"
              min="0"
              step="0.01"
              placeholder="136.00"
              class="input input-bordered w-full"
              required
              @input="calculateNewRent"
            />
          </div>

          <!-- IRL Actuel (année N) -->
          <div class="form-control">
            <label class="label">
              <span class="label-text">IRL Trimestre actuel (N) *</span>
              <span class="label-text-alt">{{ irlForm.currentQuarter }}</span>
            </label>
            <input
              v-model.number="irlForm.newIRL"
              type="number"
              min="0"
              step="0.01"
              placeholder="140.00"
              class="input input-bordered w-full"
              required
              @input="calculateNewRent"
            />
          </div>
        </div>

        <!-- Lien INSEE -->
        <div class="text-center">
          <a
            href="https://www.insee.fr/fr/statistiques/serie/001515333"
            target="_blank"
            class="link link-primary text-sm gap-1 inline-flex items-center"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Consulter l'IRL officiel sur le site de l'INSEE
          </a>
        </div>

        <!-- Résultat -->
        <div v-if="irlCalculation.isCalculated" class="card bg-gradient-to-r from-success/20 to-info/20 border border-success/30">
          <div class="card-body">
            <h3 class="card-title text-success">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Résultat de la réévaluation
            </h3>

            <div class="grid grid-cols-2 gap-4 mt-4">
              <div>
                <p class="text-sm text-base-content/60">Loyer actuel</p>
                <p class="text-2xl font-bold">{{ formatCurrency(irlCalculation.oldRent) }}</p>
              </div>
              <div>
                <p class="text-sm text-base-content/60">Nouveau loyer</p>
                <p class="text-2xl font-bold text-success">{{ formatCurrency(irlCalculation.newRent) }}</p>
              </div>
            </div>

            <div class="divider my-2"></div>

            <div class="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p class="text-base-content/60">Variation IRL</p>
                <p class="font-semibold" :class="irlCalculation.variation >= 0 ? 'text-success' : 'text-error'">
                  {{ irlCalculation.variation >= 0 ? '+' : '' }}{{ irlCalculation.variation.toFixed(2) }}%
                </p>
              </div>
              <div>
                <p class="text-base-content/60">Augmentation</p>
                <p class="font-semibold text-success">
                  {{ formatCurrency(irlCalculation.increase) }}
                </p>
              </div>
              <div>
                <p class="text-base-content/60">Augmentation annuelle</p>
                <p class="font-semibold text-info">
                  {{ formatCurrency(irlCalculation.yearlyIncrease) }}
                </p>
              </div>
            </div>

            <div class="alert alert-success mt-4">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span class="text-sm">
                À compter du {{ formatDate(irlForm.revisionDate) }}, le nouveau loyer mensuel sera de <strong>{{ formatCurrency(irlCalculation.newRent) }}</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-between gap-2">
          <button
            @click="generateWordLetter"
            :disabled="!irlCalculation.isCalculated || generatingWord"
            class="btn btn-outline btn-primary"
          >
            <span v-if="generatingWord" class="loading loading-spinner loading-sm"></span>
            <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            {{ generatingWord ? 'Génération...' : 'Générer courrier Word' }}
          </button>
          <div class="flex gap-2">
            <button @click="closeIRLDialog" class="btn btn-ghost">Annuler</button>
            <button
              @click="applyIRLIncrease"
              :disabled="!irlCalculation.isCalculated || saving"
              class="btn btn-success"
            >
              <span v-if="saving" class="loading loading-spinner loading-sm"></span>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              {{ saving ? 'Application...' : 'Appliquer la réévaluation' }}
            </button>
          </div>
        </div>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useToast } from 'vue-toastification'
import api from '@/services/api'
import Modal from '@/components/ui/Modal.vue'
import Docxtemplater from 'docxtemplater'
import PizZip from 'pizzip'
import { saveAs } from 'file-saver'

const toast = useToast()

const rents = ref([])
const activeLeases = ref([])
const loading = ref(false)
const showGenerateDialog = ref(false)
const showPaymentDialog = ref(false)
const showIRLDialog = ref(false)
const generating = ref(false)
const saving = ref(false)
const generatingWord = ref(false)
const selectedRent = ref(null)

const filters = reactive({
  year: new Date().getFullYear(),
  month: null,
  status: null
})

const generateForm = reactive({
  mode: 'single',
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
  startMonth: new Date().getMonth() + 1,
  startYear: new Date().getFullYear(),
  endMonth: new Date().getMonth() + 1,
  endYear: new Date().getFullYear()
})

const paymentForm = reactive({
  paidAmount: 0,
  paymentDate: new Date().toISOString().split('T')[0],
  paymentMethod: 'virement'
})

const irlForm = reactive({
  leaseId: '',
  currentRent: null,
  revisionDate: new Date().toISOString().split('T')[0],
  oldIRL: null,
  newIRL: null,
  referenceQuarter: '',
  currentQuarter: ''
})

const irlCalculation = reactive({
  isCalculated: false,
  oldRent: 0,
  newRent: 0,
  variation: 0,
  increase: 0,
  yearlyIncrease: 0
})

const years = computed(() => {
  const currentYear = new Date().getFullYear()
  return Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)
})

const months = [
  { label: 'Janvier', value: 1 },
  { label: 'Février', value: 2 },
  { label: 'Mars', value: 3 },
  { label: 'Avril', value: 4 },
  { label: 'Mai', value: 5 },
  { label: 'Juin', value: 6 },
  { label: 'Juillet', value: 7 },
  { label: 'Août', value: 8 },
  { label: 'Septembre', value: 9 },
  { label: 'Octobre', value: 10 },
  { label: 'Novembre', value: 11 },
  { label: 'Décembre', value: 12 }
]

const statusOptions = [
  { label: 'En attente', value: 'en_attente' },
  { label: 'Payé', value: 'paye' },
  { label: 'Partiel', value: 'partiel' },
  { label: 'En retard', value: 'en_retard' }
]

const paymentMethods = [
  { label: 'Virement', value: 'virement' },
  { label: 'Chèque', value: 'cheque' },
  { label: 'Espèces', value: 'especes' },
  { label: 'Prélèvement', value: 'prelevement' }
]

// Computed stats
const pendingCount = computed(() => {
  return rents.value.filter(r => r.status === 'en_attente').length
})

const lateCount = computed(() => {
  return rents.value.filter(r => r.status === 'en_retard').length
})

const paidCount = computed(() => {
  return rents.value.filter(r => r.status === 'paye').length
})

const totalPaidAmount = computed(() => {
  return rents.value.reduce((sum, r) => sum + (parseFloat(r.paidAmount) || 0), 0)
})

const totalExpectedAmount = computed(() => {
  return rents.value.reduce((sum, r) => sum + (parseFloat(r.expectedAmount) || 0), 0)
})

const monthsToGenerate = computed(() => {
  if (generateForm.mode !== 'range') return []

  const periods = []
  const startDate = new Date(generateForm.startYear, generateForm.startMonth - 1, 1)
  const endDate = new Date(generateForm.endYear, generateForm.endMonth - 1, 1)

  if (startDate > endDate) return []

  const currentDate = new Date(startDate)
  while (currentDate <= endDate) {
    periods.push({
      month: currentDate.getMonth() + 1,
      year: currentDate.getFullYear()
    })
    currentDate.setMonth(currentDate.getMonth() + 1)
  }

  return periods
})

const loadRents = async () => {
  loading.value = true
  try {
    const params = {}
    if (filters.year) params.year = filters.year
    if (filters.month) params.month = filters.month
    if (filters.status) params.status = filters.status

    const response = await api.get('/api/rents', { params })
    rents.value = response.data.data || []
  } catch (error) {
    toast.error('Impossible de charger les loyers')
    console.error('Error loading rents:', error)
  } finally {
    loading.value = false
  }
}

const generateRents = async () => {
  generating.value = true
  try {
    if (generateForm.mode === 'single') {
      // Génération d'un seul mois
      await api.post('/api/rents/generate', {
        month: generateForm.month,
        year: generateForm.year
      })
      toast.success('Loyers générés avec succès')
    } else {
      // Génération de plusieurs mois
      if (monthsToGenerate.value.length === 0) {
        toast.warning('Veuillez sélectionner une période valide')
        return
      }

      let successCount = 0
      let errorCount = 0

      for (const period of monthsToGenerate.value) {
        try {
          await api.post('/api/rents/generate', {
            month: period.month,
            year: period.year
          })
          successCount++
        } catch (error) {
          console.error(`Error generating rents for ${period.month}/${period.year}:`, error)
          errorCount++
        }
      }

      if (errorCount === 0) {
        toast.success(`${successCount} mois de loyers générés avec succès`)
      } else {
        toast.warning(`${successCount} mois générés avec succès, ${errorCount} échec(s)`)
      }
    }

    showGenerateDialog.value = false
    loadRents()
  } catch (error) {
    toast.error(error.response?.data?.error?.message || 'Impossible de générer les loyers')
    console.error('Error generating rents:', error)
  } finally {
    generating.value = false
  }
}

const quickMarkAsPaid = async (rent) => {
  try {
    await api.put(`/api/rents/${rent.id}/pay`, {
      paidAmount: rent.expectedAmount,
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'virement'
    })
    toast.success(`Loyer marqué comme payé - ${formatCurrency(rent.expectedAmount)}`)
    loadRents()
  } catch (error) {
    toast.error('Impossible d\'enregistrer le paiement')
    console.error('Error marking as paid:', error)
  }
}

const editPayment = (rent) => {
  selectedRent.value = rent
  paymentForm.paidAmount = rent.paidAmount || rent.expectedAmount
  paymentForm.paymentDate = rent.paymentDate ? new Date(rent.paymentDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  paymentForm.paymentMethod = rent.paymentMethod || 'virement'
  showPaymentDialog.value = true
}

const savePayment = async () => {
  saving.value = true
  try {
    await api.put(`/api/rents/${selectedRent.value.id}/pay`, paymentForm)
    toast.success('Paiement enregistré avec succès')
    showPaymentDialog.value = false
    loadRents()
  } catch (error) {
    toast.error('Impossible d\'enregistrer le paiement')
    console.error('Error saving payment:', error)
  } finally {
    saving.value = false
  }
}

const sendReminder = async (rent) => {
  try {
    await api.post(`/api/documents/rent-reminder/${rent.id}/send`)
    toast.success('Rappel envoyé avec succès')
  } catch (error) {
    toast.error('Impossible d\'envoyer le rappel')
    console.error('Error sending reminder:', error)
  }
}

const downloadReminder = async (rent) => {
  try {
    const response = await api.get(`/api/documents/rent-reminder/${rent.id}`, {
      responseType: 'blob'
    })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `rappel-loyer-${rent.month}-${rent.year}.pdf`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    toast.success('Rappel téléchargé avec succès')
  } catch (error) {
    toast.error('Impossible de télécharger le rappel')
    console.error('Error downloading reminder:', error)
  }
}

const getBadgeClass = (status) => {
  const classMap = {
    en_attente: 'badge-warning',
    paye: 'badge-success',
    partiel: 'badge-info',
    en_retard: 'badge-error'
  }
  return classMap[status] || 'badge-ghost'
}

const getStatusLabel = (status) => {
  const labelMap = {
    en_attente: 'En attente',
    paye: 'Payé',
    partiel: 'Partiel',
    en_retard: 'En retard'
  }
  return labelMap[status] || status
}

const getMonthName = (month) => {
  return months.find(m => m.value === month)?.label || month
}

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

// IRL Functions
const loadActiveLeases = async () => {
  try {
    const response = await api.get('/api/leases', { params: { status: 'actif' } })
    activeLeases.value = response.data.data || []
  } catch (error) {
    console.error('Error loading leases:', error)
  }
}

const getQuarterLabel = (date) => {
  const d = new Date(date)
  const month = d.getMonth() + 1
  const year = d.getFullYear()

  let quarter = ''
  if (month >= 1 && month <= 3) quarter = 'T1'
  else if (month >= 4 && month <= 6) quarter = 'T2'
  else if (month >= 7 && month <= 9) quarter = 'T3'
  else quarter = 'T4'

  return `${quarter} ${year}`
}

const updateQuarterLabels = () => {
  if (irlForm.revisionDate) {
    const revisionDate = new Date(irlForm.revisionDate)
    const lastYear = new Date(revisionDate)
    lastYear.setFullYear(lastYear.getFullYear() - 1)

    irlForm.currentQuarter = getQuarterLabel(revisionDate)
    irlForm.referenceQuarter = getQuarterLabel(lastYear)
  }
}

const onLeaseSelected = () => {
  const selectedLease = activeLeases.value.find(l => l.id === irlForm.leaseId)
  if (selectedLease) {
    irlForm.currentRent = selectedLease.monthlyRent
  }
}

const calculateNewRent = () => {
  if (irlForm.currentRent && irlForm.oldIRL && irlForm.newIRL && irlForm.oldIRL > 0) {
    const ratio = irlForm.newIRL / irlForm.oldIRL
    const newRent = irlForm.currentRent * ratio
    const increase = newRent - irlForm.currentRent
    const variation = ((irlForm.newIRL - irlForm.oldIRL) / irlForm.oldIRL) * 100

    irlCalculation.isCalculated = true
    irlCalculation.oldRent = irlForm.currentRent
    irlCalculation.newRent = Math.round(newRent * 100) / 100
    irlCalculation.increase = Math.round(increase * 100) / 100
    irlCalculation.yearlyIncrease = Math.round(increase * 12 * 100) / 100
    irlCalculation.variation = variation
  } else {
    irlCalculation.isCalculated = false
  }
}

const resetIRLForm = () => {
  Object.assign(irlForm, {
    leaseId: '',
    currentRent: null,
    revisionDate: new Date().toISOString().split('T')[0],
    oldIRL: null,
    newIRL: null,
    referenceQuarter: '',
    currentQuarter: ''
  })
  irlCalculation.isCalculated = false
}

const closeIRLDialog = () => {
  showIRLDialog.value = false
  resetIRLForm()
}

// Generate Word document for rent increase letter
const generateWordLetter = async () => {
  if (!irlForm.leaseId) {
    toast.warning('Veuillez sélectionner un bail')
    return
  }

  generatingWord.value = true
  try {
    // Get full lease data with tenant and property info
    const leaseResponse = await api.get(`/api/leases/${irlForm.leaseId}`)
    const lease = leaseResponse.data.data

    // Create a simple document programmatically
    // In a real app, you would load a template file
    const doc = createRentIncreaseDocument({
      tenant: lease.Tenant,
      property: lease.Property,
      revisionDate: new Date(irlForm.revisionDate),
      oldRent: irlCalculation.oldRent,
      newRent: irlCalculation.newRent,
      oldIRL: irlForm.oldIRL,
      newIRL: irlForm.newIRL,
      referenceQuarter: irlForm.referenceQuarter,
      currentQuarter: irlForm.currentQuarter,
      variation: irlCalculation.variation,
      increase: irlCalculation.increase
    })

    // Save the document
    const filename = `Courrier_augmentation_loyer_${lease.Tenant.lastName}_${new Date().toISOString().split('T')[0]}.docx`
    saveAs(doc, filename)
    toast.success('Courrier généré avec succès')
  } catch (error) {
    console.error('Error generating Word letter:', error)
    toast.error('Erreur lors de la génération du courrier')
  } finally {
    generatingWord.value = false
  }
}

// Helper function to create the Word document
const createRentIncreaseDocument = (data) => {
  const today = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

  // Create a simple text-based document structure
  const content = `






                                              Le ${today}


Objet : Notification de révision annuelle du loyer


${data.tenant.civility || 'Madame, Monsieur'} ${data.tenant.firstName} ${data.tenant.lastName}
${data.property.address}
${data.property.postalCode} ${data.property.city}


${data.tenant.civility || 'Madame, Monsieur'},

Conformément aux dispositions de l'article 17 d de la loi du 6 juillet 1989 et à la clause de révision annuelle prévue dans votre contrat de location, je vous informe par la présente de la révision du montant de votre loyer.

DÉTAILS DE LA RÉVISION :

Loyer mensuel actuel : ${formatCurrency(data.oldRent)}
Nouveau loyer mensuel : ${formatCurrency(data.newRent)}
Augmentation mensuelle : ${formatCurrency(data.increase)} (soit +${data.variation.toFixed(2)}%)
Augmentation annuelle : ${formatCurrency(data.increase * 12)}

Date d'application : ${data.revisionDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}

CALCUL BASÉ SUR L'IRL :

IRL de référence (${data.referenceQuarter}) : ${data.oldIRL}
Nouvel IRL (${data.currentQuarter}) : ${data.newIRL}

Formule appliquée :
Nouveau loyer = Loyer actuel × (Nouvel IRL / IRL de référence)
Nouveau loyer = ${formatCurrency(data.oldRent)} × (${data.newIRL} / ${data.oldIRL})
Nouveau loyer = ${formatCurrency(data.newRent)}

Cette révision est conforme à la réglementation en vigueur et basée sur l'évolution de l'Indice de Référence des Loyers publié par l'INSEE.

Le nouveau montant de loyer sera donc de ${formatCurrency(data.newRent)} à compter du ${data.revisionDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}.

Je vous prie d'agréer, ${data.tenant.civility || 'Madame, Monsieur'}, l'expression de mes salutations distinguées.


                                              Le bailleur,



                                              _____________________
                                              Signature`

  // Convert to Word format using basic XML structure
  const docContent = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${content.split('\n').map(line => `
    <w:p>
      <w:pPr>
        ${line.trim() === '' ? '' : '<w:spacing w:after="0"/>'}
      </w:pPr>
      <w:r>
        <w:t xml:space="preserve">${line}</w:t>
      </w:r>
    </w:p>`).join('')}
  </w:body>
</w:document>`

  const zip = new PizZip()
  zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`)

  zip.file('_rels/.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`)

  zip.file('word/_rels/document.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
</Relationships>`)

  zip.file('word/document.xml', docContent)

  return zip.generate({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
}

const applyIRLIncrease = async () => {
  if (!irlForm.leaseId) {
    alert('Attention: Veuillez sélectionner un bail')
    return
  }

  if (!confirm(`Voulez-vous appliquer cette augmentation de loyer ?\n\nLoyer actuel : ${formatCurrency(irlCalculation.oldRent)}\nNouveau loyer : ${formatCurrency(irlCalculation.newRent)}\n\nCette action mettra à jour le loyer du bail sélectionné.`)) {
    return
  }

  saving.value = true
  try {
    await api.put(`/api/leases/${irlForm.leaseId}`, {
      monthlyRent: irlCalculation.newRent
    })
    alert(`Succès: Le loyer a été mis à jour à ${formatCurrency(irlCalculation.newRent)}`)
    closeIRLDialog()
    loadActiveLeases()
  } catch (error) {
    alert(`Erreur: ${error.response?.data?.error?.message || 'Impossible d\'appliquer la réévaluation'}`)
    console.error('Error applying IRL increase:', error)
  } finally {
    saving.value = false
  }
}

// Watch for revision date changes
watch(() => irlForm.revisionDate, (newDate) => {
  if (newDate) {
    updateQuarterLabels()
  }
})

onMounted(() => {
  loadRents()
  loadActiveLeases()
  updateQuarterLabels()
})
</script>
