import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/auth/LoginView.vue')
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/auth/RegisterView.vue')
    },
    {
      path: '/',
      name: 'dashboard',
      component: () => import('@/views/DashboardView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/properties',
      name: 'properties',
      component: () => import('@/views/properties/PropertiesView.vue'),
      meta: { requiresAuth: true }
    },
    // Routes désactivées temporairement (vues avec PrimeVue)
    // {
    //   path: '/properties-v2',
    //   name: 'properties-v2',
    //   component: () => import('@/views/properties/PropertiesViewV2.vue'),
    //   meta: { requiresAuth: true }
    // },
    // {
    //   path: '/properties-compare',
    //   name: 'properties-compare',
    //   component: () => import('@/views/properties/PropertiesCompareView.vue'),
    //   meta: { requiresAuth: true }
    // },
    {
      path: '/properties/:id',
      name: 'property-detail',
      component: () => import('@/views/properties/PropertyDetailView.vue'),
      meta: { requiresAuth: true }
    },
    // {
    //   path: '/buildings/:id',
    //   name: 'building-detail',
    //   component: () => import('@/views/properties/BuildingDetailView.vue'),
    //   meta: { requiresAuth: true }
    // },
    {
      path: '/tenants',
      name: 'tenants',
      component: () => import('@/views/tenants/TenantsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/tenants/:id',
      name: 'tenant-detail',
      component: () => import('@/views/tenants/TenantDetailView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/leases',
      name: 'leases',
      component: () => import('@/views/leases/LeaseManagementView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/rents',
      name: 'rents',
      component: () => import('@/views/rents/RentsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/charges',
      name: 'charges',
      component: () => import('@/views/charges/ChargesView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/charge-allocation',
      name: 'charge-allocation',
      component: () => import('@/views/charges/ChargeAllocationView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/charge-regularization',
      name: 'charge-regularization',
      component: () => import('@/views/charges/ChargeRegularizationView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/works',
      name: 'works',
      component: () => import('@/views/works/WorksView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/fiscal',
      name: 'fiscal',
      component: () => import('@/views/FiscalView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/views/SettingsView.vue'),
      meta: { requiresAuth: true }
    }
  ]
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if ((to.path === '/login' || to.path === '/register') && authStore.isAuthenticated) {
    next('/')
  } else {
    next()
  }
})

export default router
