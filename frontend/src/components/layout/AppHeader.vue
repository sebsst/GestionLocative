<template>
  <div class="app-header">
    <div class="header-left">
      <i class="pi pi-home" style="font-size: 1.5rem; margin-right: 1rem;"></i>
      <h1>Gestion Locative</h1>
    </div>
    <div class="header-right">
      <Button
        :icon="isDarkMode ? 'pi pi-sun' : 'pi pi-moon'"
        class="p-button-rounded p-button-text"
        @click="toggleTheme"
        v-tooltip.bottom="isDarkMode ? 'Mode clair' : 'Mode sombre'"
      />
      <Button
        icon="pi pi-user"
        class="p-button-rounded p-button-text"
        @click="toggleUserMenu"
      />
      <Menu ref="menu" :model="userMenuItems" :popup="true" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import Menu from 'primevue/menu'

const authStore = useAuthStore()
const router = useRouter()
const menu = ref()
const isDarkMode = ref(false)

const userMenuItems = [
  {
    label: authStore.user?.email || 'Utilisateur',
    items: [
      {
        label: 'Paramètres',
        icon: 'pi pi-cog',
        command: () => {
          router.push('/settings')
        }
      },
      {
        separator: true
      },
      {
        label: 'Déconnexion',
        icon: 'pi pi-sign-out',
        command: () => {
          authStore.logout()
        }
      }
    ]
  }
]

const toggleUserMenu = (event) => {
  menu.value.toggle(event)
}

const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value

  const themeLink = document.getElementById('theme-link')
  const newTheme = isDarkMode.value ? 'lara-dark-blue' : 'lara-light-blue'

  if (themeLink) {
    themeLink.href = `/themes/${newTheme}/theme.css`
  }

  // Sauvegarder la préférence
  localStorage.setItem('theme', newTheme)

  // Appliquer la classe au body pour les styles personnalisés
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark-mode')
  } else {
    document.documentElement.classList.remove('dark-mode')
  }
}

onMounted(() => {
  // Charger la préférence de thème
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'lara-dark-blue') {
    isDarkMode.value = true
    document.documentElement.classList.add('dark-mode')
  }
})
</script>

<style scoped>
.app-header {
  height: 60px;
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.header-left {
  display: flex;
  align-items: center;
}

.header-left .pi {
  color: #3b82f6;
}

.header-left h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
</style>
