<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <i class="pi pi-home" style="font-size: 3rem; color: var(--primary-color);"></i>
        <h1>Gestion Locative</h1>
        <p>Connectez-vous à votre compte</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="p-field">
          <label for="email">Email</label>
          <InputText
            id="email"
            v-model="credentials.email"
            type="email"
            placeholder="votre@email.com"
            required
            class="p-inputtext-lg"
          />
        </div>

        <div class="p-field">
          <label for="password">Mot de passe</label>
          <Password
            id="password"
            v-model="credentials.password"
            placeholder="Mot de passe"
            :feedback="false"
            toggleMask
            required
            class="p-inputtext-lg"
          />
        </div>

        <Button
          type="submit"
          label="Se connecter"
          :loading="loading"
          class="p-button-lg login-button"
        />

        <Message v-if="error" severity="error" :closable="false">
          {{ error }}
        </Message>

        <div class="register-link">
          Vous n'avez pas de compte ?
          <router-link to="/register" class="link">Créer un compte</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'primevue/usetoast'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import Message from 'primevue/message'

const authStore = useAuthStore()
const toast = useToast()

const credentials = ref({
  email: '',
  password: ''
})

const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  loading.value = true
  error.value = ''

  try {
    await authStore.login(credentials.value)
    toast.add({
      severity: 'success',
      summary: 'Connexion réussie',
      detail: 'Bienvenue !',
      life: 3000
    })
  } catch (err) {
    error.value = err.response?.data?.error?.message || 'Erreur de connexion'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.login-card {
  background: white;
  border-radius: 20px;
  padding: 3rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 450px;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-header h1 {
  margin: 1rem 0 0.5rem;
  color: #333;
  font-size: 2rem;
}

.login-header p {
  color: #666;
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.p-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.p-field label {
  font-weight: 600;
  color: #333;
}

.login-button {
  width: 100%;
  margin-top: 1rem;
}

.register-link {
  text-align: center;
  color: #666;
  margin-top: 1rem;
}

.register-link .link {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 600;
}

.register-link .link:hover {
  text-decoration: underline;
}

:deep(.p-inputtext),
:deep(.p-password-input) {
  width: 100%;
}
</style>
