<template>
  <div class="modern-view">
    <!-- En-tête -->
    <div class="page-header-modern">
      <div>
        <h1 class="page-title-modern">Comparaison des versions</h1>
        <p class="subtitle-modern">Version 1 (PrimeVue) vs Version 2 (Tailwind/Bank-Manager)</p>
      </div>
      <div class="flex gap-3">
        <Button
          label="Version 1 seule"
          icon="pi pi-arrow-left"
          @click="$router.push('/properties')"
          class="p-button-secondary"
        />
        <Button
          label="Version 2 seule"
          icon="pi pi-arrow-right"
          @click="$router.push('/properties-v2')"
          class="p-button-secondary"
        />
      </div>
    </div>

    <!-- Navigation onglets -->
    <div class="flex gap-2 mb-6">
      <button
        @click="activeView = 'v1'"
        :class="[
          'px-6 py-3 rounded-lg font-medium transition-all',
          activeView === 'v1'
            ? 'bg-primary-600 text-white shadow-lg'
            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
        ]"
      >
        <i class="pi pi-palette mr-2"></i>
        Version 1 - PrimeVue/Modern
      </button>
      <button
        @click="activeView = 'v2'"
        :class="[
          'px-6 py-3 rounded-lg font-medium transition-all',
          activeView === 'v2'
            ? 'bg-primary-600 text-white shadow-lg'
            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
        ]"
      >
        <i class="pi pi-table mr-2"></i>
        Version 2 - Tailwind/Bank-Manager
      </button>
      <button
        @click="activeView = 'both'"
        :class="[
          'px-6 py-3 rounded-lg font-medium transition-all',
          activeView === 'both'
            ? 'bg-primary-600 text-white shadow-lg'
            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
        ]"
      >
        <i class="pi pi-th-large mr-2"></i>
        Comparaison côte à côte
      </button>
    </div>

    <!-- Affichage Version 1 seule -->
    <div v-if="activeView === 'v1'" class="fade-in">
      <div class="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h3 class="font-bold text-blue-900 dark:text-blue-100 mb-2">
          <i class="pi pi-info-circle mr-2"></i>
          Version 1 - Style PrimeVue/Modern
        </h3>
        <p class="text-sm text-blue-800 dark:text-blue-200">
          Utilise les composants PrimeVue (DataTable, Card, Tag) avec les styles CSS personnalisés définis dans <code>modern-views.css</code> et <code>modern-tables.css</code>.
        </p>
      </div>
      <PropertiesView />
    </div>

    <!-- Affichage Version 2 seule -->
    <div v-if="activeView === 'v2'" class="fade-in">
      <div class="mb-4 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
        <h3 class="font-bold text-purple-900 dark:text-purple-100 mb-2">
          <i class="pi pi-info-circle mr-2"></i>
          Version 2 - Style Tailwind/Bank-Manager
        </h3>
        <p class="text-sm text-purple-800 dark:text-purple-200">
          Utilise Tailwind CSS pur avec des classes utilitaires, tableau HTML natif et style identique à bank-manager.
        </p>
      </div>
      <PropertiesViewV2 />
    </div>

    <!-- Affichage côte à côte -->
    <div v-if="activeView === 'both'" class="fade-in">
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <!-- Colonne Version 1 -->
        <div class="border-2 border-blue-300 dark:border-blue-700 rounded-xl overflow-hidden">
          <div class="bg-blue-100 dark:bg-blue-900 p-3 border-b border-blue-300 dark:border-blue-700">
            <h3 class="font-bold text-blue-900 dark:text-blue-100">
              <i class="pi pi-palette mr-2"></i>
              Version 1 - PrimeVue/Modern
            </h3>
            <p class="text-xs text-blue-700 dark:text-blue-300 mt-1">
              Composants PrimeVue + CSS personnalisé
            </p>
          </div>
          <div class="bg-white dark:bg-gray-900">
            <PropertiesView />
          </div>
        </div>

        <!-- Colonne Version 2 -->
        <div class="border-2 border-purple-300 dark:border-purple-700 rounded-xl overflow-hidden">
          <div class="bg-purple-100 dark:bg-purple-900 p-3 border-b border-purple-300 dark:border-purple-700">
            <h3 class="font-bold text-purple-900 dark:text-purple-100">
              <i class="pi pi-table mr-2"></i>
              Version 2 - Tailwind/Bank-Manager
            </h3>
            <p class="text-xs text-purple-700 dark:text-purple-300 mt-1">
              Tailwind CSS pur + HTML natif
            </p>
          </div>
          <div class="bg-white dark:bg-gray-900">
            <PropertiesViewV2 />
          </div>
        </div>
      </div>

      <!-- Légende -->
      <Card class="modern-card mt-6">
        <template #content>
          <h3 class="font-bold text-lg mb-4">
            <i class="pi pi-bookmark mr-2"></i>
            Différences principales
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 class="font-semibold text-blue-600 dark:text-blue-400 mb-2">
                <i class="pi pi-palette mr-1"></i>
                Version 1 (PrimeVue/Modern)
              </h4>
              <ul class="space-y-2 text-sm">
                <li class="flex items-start gap-2">
                  <i class="pi pi-check text-green-600 mt-1"></i>
                  <span>Composants PrimeVue (DataTable, Card, Tag, Dropdown)</span>
                </li>
                <li class="flex items-start gap-2">
                  <i class="pi pi-check text-green-600 mt-1"></i>
                  <span>Classes CSS personnalisées (modern-table, filters-modern, stat-card)</span>
                </li>
                <li class="flex items-start gap-2">
                  <i class="pi pi-check text-green-600 mt-1"></i>
                  <span>Styles définis dans modern-views.css et modern-tables.css</span>
                </li>
                <li class="flex items-start gap-2">
                  <i class="pi pi-check text-green-600 mt-1"></i>
                  <span>Pagination et tri intégrés dans DataTable</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 class="font-semibold text-purple-600 dark:text-purple-400 mb-2">
                <i class="pi pi-table mr-1"></i>
                Version 2 (Tailwind/Bank-Manager)
              </h4>
              <ul class="space-y-2 text-sm">
                <li class="flex items-start gap-2">
                  <i class="pi pi-check text-green-600 mt-1"></i>
                  <span>Tailwind CSS pur avec classes utilitaires</span>
                </li>
                <li class="flex items-start gap-2">
                  <i class="pi pi-check text-green-600 mt-1"></i>
                  <span>Tableau HTML natif (table, thead, tbody, tr, td)</span>
                </li>
                <li class="flex items-start gap-2">
                  <i class="pi pi-check text-green-600 mt-1"></i>
                  <span>Inputs et selects HTML natifs avec style Tailwind</span>
                </li>
                <li class="flex items-start gap-2">
                  <i class="pi pi-check text-green-600 mt-1"></i>
                  <span>Style identique à bank-manager (classes btn-primary, card, input-field)</span>
                </li>
              </ul>
            </div>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import PropertiesView from './PropertiesView.vue'
import PropertiesViewV2 from './PropertiesViewV2.vue'
import Button from 'primevue/button'
import Card from 'primevue/card'

const activeView = ref('both')
</script>

<style scoped>
.fade-in {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

code {
  background: rgba(0, 0, 0, 0.05);
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  font-family: 'Courier New', monospace;
}

.dark-mode code {
  background: rgba(255, 255, 255, 0.1);
}
</style>
