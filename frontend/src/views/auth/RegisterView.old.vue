<template>
  <div class="register-container">
    <div class="register-card">
      <div class="register-header">
        <i class="pi pi-home" style="font-size: 3rem; color: var(--primary-color);"></i>
        <h1>Gestion Locative</h1>
        <p>Créer votre compte</p>
      </div>

      <form @submit.prevent="handleRegister" class="register-form">
        <div class="p-field-group">
          <div class="p-field">
            <label for="firstName">Prénom</label>
            <InputText
              id="firstName"
              v-model="formData.firstName"
              placeholder="Votre prénom"
              required
              class="p-inputtext-lg"
            />
          </div>

          <div class="p-field">
            <label for="lastName">Nom</label>
            <InputText
              id="lastName"
              v-model="formData.lastName"
              placeholder="Votre nom"
              required
              class="p-inputtext-lg"
            />
          </div>
        </div>

        <div class="p-field">
          <label for="email">Email</label>
          <InputText
            id="email"
            v-model="formData.email"
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
            v-model="formData.password"
            placeholder="Minimum 6 caractères"
            toggleMask
            required
            class="p-inputtext-lg"
            :feedback="true"
          >
            <template #header>
              <h6>Choisissez un mot de passe</h6>
            </template>
            <template #footer>
              <Divider />
              <p class="mt-2">Suggestions</p>
              <ul class="pl-2 ml-2 mt-0" style="line-height: 1.5">
                <li>Au moins une minuscule</li>
                <li>Au moins une majuscule</li>
                <li>Au moins un chiffre</li>
                <li>Minimum 6 caractères</li>
              </ul>
            </template>
          </Password>
        </div>

        <div class="p-field">
          <label for="confirmPassword">Confirmer le mot de passe</label>
          <Password
            id="confirmPassword"
            v-model="formData.confirmPassword"
            placeholder="Confirmez votre mot de passe"
            :feedback="false"
            toggleMask
            required
            class="p-inputtext-lg"
          />
        </div>

        <Button
          type="submit"
          label="Créer mon compte"
          :loading="loading"
          class="p-button-lg register-button"
        />

        <Message v-if="error" severity="error" :closable="false">
          {{ error }}
        </Message>

        <div class="login-link">
          Vous avez déjà un compte ?
          <router-link to="/login" class="link">Se connecter</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'primevue/usetoast'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import Message from 'primevue/message'
import Divider from 'primevue/divider'

const authStore = useAuthStore()
const toast = useToast()

const formData = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const loading = ref(false)
const error = ref('')

const handleRegister = async () => {
  // Validation
  if (formData.password !== formData.confirmPassword) {
    error.value = 'Les mots de passe ne correspondent pas'
    return
  }

  if (formData.password.length < 6) {
    error.value = 'Le mot de passe doit contenir au moins 6 caractères'
    return
  }

  loading.value = true
  error.value = ''

  try {
    await authStore.register({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password
    })
    toast.add({
      severity: 'success',
      summary: 'Compte créé',
      detail: 'Bienvenue ! Votre compte a été créé avec succès.',
      life: 3000
    })
  } catch (err) {
    error.value = err.response?.data?.error?.message || 'Erreur lors de la création du compte'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.register-card {
  background: white;
  border-radius: 20px;
  padding: 3rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 500px;
}

.register-header {
  text-align: center;
  margin-bottom: 2rem;
}

.register-header h1 {
  margin: 1rem 0 0.5rem;
  color: #333;
  font-size: 2rem;
}

.register-header p {
  color: #666;
  margin: 0;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.p-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.p-field-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.p-field label {
  font-weight: 600;
  color: #333;
}

.register-button {
  width: 100%;
  margin-top: 1rem;
}

.login-link {
  text-align: center;
  color: #666;
  margin-top: 1rem;
}

.login-link .link {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 600;
}

.login-link .link:hover {
  text-decoration: underline;
}

:deep(.p-inputtext),
:deep(.p-password-input) {
  width: 100%;
}

:deep(.p-password) {
  width: 100%;
}
</style>
