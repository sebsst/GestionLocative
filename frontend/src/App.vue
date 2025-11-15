<template>
  <div class="app-container">
    <template v-if="!isLoginPage">
      <AppHeader v-if="isAuthenticated" />
      <div class="layout-container">
        <AppSidebar v-if="isAuthenticated" />
        <div class="main-content">
          <router-view />
        </div>
      </div>
    </template>
    <template v-else>
      <router-view />
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'

const route = useRoute()
const authStore = useAuthStore()

const isLoginPage = computed(() => route.path === '/login' || route.path === '/register')
const isAuthenticated = computed(() => authStore.isAuthenticated)
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.app-container {
  min-height: 100vh;
  background-color: oklch(var(--b2));
  color: oklch(var(--bc));
}

.layout-container {
  display: flex;
  min-height: calc(100vh - 60px);
}

.main-content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
  background-color: oklch(var(--b2));
  color: oklch(var(--bc));
}
</style>
