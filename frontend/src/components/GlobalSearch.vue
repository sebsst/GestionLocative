<template>
  <div class="relative">
    <!-- Search Input -->
    <div class="form-control">
      <div class="input-group">
        <button
          @click="toggleSearch"
          class="btn btn-ghost btn-sm gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span class="hidden md:inline">Rechercher...</span>
          <kbd class="kbd kbd-sm hidden lg:inline">Ctrl+K</kbd>
        </button>
      </div>
    </div>

    <!-- Search Modal -->
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4"
      @click.self="closeSearch"
    >
      <!-- Backdrop -->
      <div class="fixed inset-0 bg-black/50" @click="closeSearch"></div>

      <!-- Search Box -->
      <div class="relative w-full max-w-2xl bg-base-100 rounded-lg shadow-2xl">
        <!-- Input -->
        <div class="flex items-center gap-3 p-4 border-b border-base-300">
          <svg class="w-5 h-5 text-base-content/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref="searchInput"
            v-model="searchQuery"
            type="text"
            placeholder="Rechercher un bien, un locataire, un bail..."
            class="flex-1 bg-transparent outline-none text-lg"
            @keydown.down.prevent="navigateDown"
            @keydown.up.prevent="navigateUp"
            @keydown.enter.prevent="selectResult"
            @keydown.esc="closeSearch"
          />
          <button @click="closeSearch" class="btn btn-ghost btn-sm btn-circle">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Results -->
        <div v-if="searchQuery.length >= 2" class="max-h-96 overflow-y-auto">
          <!-- Loading -->
          <div v-if="loading" class="p-8 text-center">
            <span class="loading loading-spinner loading-md"></span>
          </div>

          <!-- Results -->
          <div v-else-if="hasResults" class="p-2">
            <!-- Properties -->
            <div v-if="results.properties.length > 0" class="mb-4">
              <div class="px-3 py-2 text-xs font-semibold text-base-content/60 uppercase">Biens</div>
              <button
                v-for="(property, index) in results.properties"
                :key="'property-' + property.id"
                :class="[
                  'w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 hover:bg-base-200 transition-colors',
                  selectedIndex === getResultIndex('property', index) && 'bg-base-200'
                ]"
                @click="navigateToProperty(property.id)"
              >
                <div class="avatar placeholder">
                  <div class="bg-primary text-primary-content rounded-lg w-10">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="font-medium truncate">{{ property.name }}</div>
                  <div class="text-sm text-base-content/60 truncate">{{ property.address }}, {{ property.city }}</div>
                </div>
                <div class="badge badge-sm" :class="getStatusBadgeClass(property.status)">
                  {{ getStatusLabel(property.status) }}
                </div>
              </button>
            </div>

            <!-- Tenants -->
            <div v-if="results.tenants.length > 0" class="mb-4">
              <div class="px-3 py-2 text-xs font-semibold text-base-content/60 uppercase">Locataires</div>
              <button
                v-for="(tenant, index) in results.tenants"
                :key="'tenant-' + tenant.id"
                :class="[
                  'w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 hover:bg-base-200 transition-colors',
                  selectedIndex === getResultIndex('tenant', index) && 'bg-base-200'
                ]"
                @click="navigateToTenant(tenant.id)"
              >
                <div class="avatar placeholder">
                  <div class="bg-secondary text-secondary-content rounded-full w-10">
                    <span class="text-lg">{{ tenant.firstName[0] }}{{ tenant.lastName[0] }}</span>
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="font-medium">{{ tenant.firstName }} {{ tenant.lastName }}</div>
                  <div class="text-sm text-base-content/60 truncate">{{ tenant.email || tenant.phone }}</div>
                </div>
              </button>
            </div>

            <!-- Leases -->
            <div v-if="results.leases.length > 0">
              <div class="px-3 py-2 text-xs font-semibold text-base-content/60 uppercase">Baux</div>
              <button
                v-for="(lease, index) in results.leases"
                :key="'lease-' + lease.id"
                :class="[
                  'w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 hover:bg-base-200 transition-colors',
                  selectedIndex === getResultIndex('lease', index) && 'bg-base-200'
                ]"
                @click="navigateToLease(lease.propertyId)"
              >
                <div class="avatar placeholder">
                  <div class="bg-accent text-accent-content rounded-lg w-10">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="font-medium truncate">{{ lease.propertyName }}</div>
                  <div class="text-sm text-base-content/60">{{ lease.tenantName }}</div>
                </div>
                <div class="badge badge-sm" :class="getStatusBadgeClass(lease.status)">
                  {{ getStatusLabel(lease.status) }}
                </div>
              </button>
            </div>
          </div>

          <!-- No Results -->
          <div v-else class="p-8 text-center text-base-content/60">
            <svg class="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>Aucun résultat trouvé</p>
          </div>
        </div>

        <!-- Help Text -->
        <div v-else class="p-8 text-center text-base-content/60">
          <p class="text-sm">Tapez au moins 2 caractères pour rechercher</p>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between px-4 py-3 border-t border-base-300 text-xs text-base-content/60">
          <div class="flex gap-4">
            <span><kbd class="kbd kbd-xs">↑↓</kbd> Naviguer</span>
            <span><kbd class="kbd kbd-xs">Enter</kbd> Sélectionner</span>
            <span><kbd class="kbd kbd-xs">Esc</kbd> Fermer</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'

const router = useRouter()

const isOpen = ref(false)
const searchQuery = ref('')
const searchInput = ref(null)
const loading = ref(false)
const selectedIndex = ref(0)

const results = ref({
  properties: [],
  tenants: [],
  leases: []
})

let searchTimeout = null

const hasResults = computed(() => {
  return results.value.properties.length > 0 ||
         results.value.tenants.length > 0 ||
         results.value.leases.length > 0
})

const totalResults = computed(() => {
  return results.value.properties.length +
         results.value.tenants.length +
         results.value.leases.length
})

const getResultIndex = (type, index) => {
  let offset = 0
  if (type === 'tenant') offset = results.value.properties.length
  if (type === 'lease') offset = results.value.properties.length + results.value.tenants.length
  return offset + index
}

const performSearch = async () => {
  if (searchQuery.value.length < 2) {
    results.value = { properties: [], tenants: [], leases: [] }
    return
  }

  loading.value = true
  try {
    const response = await api.get('/api/search', {
      params: { q: searchQuery.value }
    })
    results.value = response.data.data
    selectedIndex.value = 0
  } catch (error) {
    console.error('Search error:', error)
  } finally {
    loading.value = false
  }
}

watch(searchQuery, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(performSearch, 300)
})

const toggleSearch = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    setTimeout(() => searchInput.value?.focus(), 100)
  }
}

const closeSearch = () => {
  isOpen.value = false
  searchQuery.value = ''
  results.value = { properties: [], tenants: [], leases: [] }
  selectedIndex.value = 0
}

const navigateDown = () => {
  if (selectedIndex.value < totalResults.value - 1) {
    selectedIndex.value++
  }
}

const navigateUp = () => {
  if (selectedIndex.value > 0) {
    selectedIndex.value--
  }
}

const selectResult = () => {
  let currentIndex = 0
  
  for (const property of results.value.properties) {
    if (currentIndex === selectedIndex.value) {
      navigateToProperty(property.id)
      return
    }
    currentIndex++
  }
  
  for (const tenant of results.value.tenants) {
    if (currentIndex === selectedIndex.value) {
      navigateToTenant(tenant.id)
      return
    }
    currentIndex++
  }
  
  for (const lease of results.value.leases) {
    if (currentIndex === selectedIndex.value) {
      navigateToLease(lease.propertyId)
      return
    }
    currentIndex++
  }
}

const navigateToProperty = async (id) => {
  const currentRoute = router.currentRoute.value
  if (currentRoute.path === `/properties/${id}`) {
    // Already on this property, just close search
    closeSearch()
    return
  }
  
  // If we're on a different property page, we need to force reload
  if (currentRoute.path.startsWith('/properties/')) {
    closeSearch()
    // Navigate away then back to force reload
    await router.push('/properties')
    await router.push(`/properties/${id}`)
  } else {
    closeSearch()
    await router.push(`/properties/${id}`)
  }
}

const navigateToTenant = async (id) => {
  const currentRoute = router.currentRoute.value
  if (currentRoute.path === `/tenants/${id}`) {
    closeSearch()
    return
  }
  
  if (currentRoute.path.startsWith('/tenants/')) {
    closeSearch()
    await router.push('/tenants')
    await router.push(`/tenants/${id}`)
  } else {
    closeSearch()
    await router.push(`/tenants/${id}`)
  }
}

const navigateToLease = async (propertyId) => {
  const currentRoute = router.currentRoute.value
  if (currentRoute.path === `/properties/${propertyId}`) {
    closeSearch()
    return
  }
  
  if (currentRoute.path.startsWith('/properties/')) {
    closeSearch()
    await router.push('/properties')
    await router.push(`/properties/${propertyId}`)
  } else {
    closeSearch()
    await router.push(`/properties/${propertyId}`)
  }
}

const getStatusBadgeClass = (status) => {
  const classMap = {
    disponible: 'badge-success',
    loue: 'badge-info',
    en_travaux: 'badge-warning',
    vendu: 'badge-error',
    actif: 'badge-success',
    termine: 'badge-error',
    resilie: 'badge-warning'
  }
  return classMap[status] || 'badge-ghost'
}

const getStatusLabel = (status) => {
  const labelMap = {
    disponible: 'Disponible',
    loue: 'Loué',
    en_travaux: 'En travaux',
    vendu: 'Vendu',
    actif: 'Actif',
    termine: 'Terminé',
    resilie: 'Résilié'
  }
  return labelMap[status] || status
}

// Keyboard shortcut
const handleKeydown = (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault()
    toggleSearch()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>
