<template>
  <div class="app-sidebar">
    <nav class="sidebar-nav">
      <router-link
        v-for="item in menuItems"
        :key="item.to"
        :to="item.to"
        class="sidebar-item"
        :class="{ active: $route.path === item.to }"
      >
        <i :class="item.icon"></i>
        <span>{{ item.label }}</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup>
const menuItems = [
  {
    label: 'Tableau de bord',
    icon: 'pi pi-home',
    to: '/'
  },
  {
    label: 'Biens immobiliers',
    icon: 'pi pi-building',
    to: '/properties'
  },
  {
    label: 'Locataires',
    icon: 'pi pi-users',
    to: '/tenants'
  },
  {
    label: 'Loyers',
    icon: 'pi pi-wallet',
    to: '/rents'
  },
  {
    label: 'Charges',
    icon: 'pi pi-receipt',
    to: '/charges'
  },
  {
    label: 'Travaux',
    icon: 'pi pi-wrench',
    to: '/works'
  },
  {
    label: 'Déclaration fiscale',
    icon: 'pi pi-file',
    to: '/fiscal'
  },
  {
    label: 'Paramètres',
    icon: 'pi pi-cog',
    to: '/settings'
  }
]
</script>

<style scoped>
.app-sidebar {
  width: 250px;
  background: #ffffff;
  border-right: 1px solid #e2e8f0;
  padding: 1rem 0;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
}

.sidebar-item {
  display: flex;
  align-items: center;
  padding: 1rem 1.5rem;
  color: #64748b;
  text-decoration: none;
  transition: all 0.3s;
  border-left: 3px solid transparent;
  font-weight: 500;
}

.sidebar-item:hover {
  background: #f1f5f9;
  color: #1e293b;
}

.sidebar-item.active {
  background: linear-gradient(90deg, rgba(59, 130, 246, 0.1) 0%, transparent 100%);
  color: #3b82f6;
  border-left-color: #3b82f6;
}

.sidebar-item i {
  margin-right: 0.75rem;
  font-size: 1.2rem;
}

.sidebar-item span {
  font-weight: 500;
}
</style>
