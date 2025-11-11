<template>
  <div class="settings-view">
    <!-- En-tête moderne -->
    <div class="page-header-modern">
      <div>
        <h1 class="page-title-modern">Paramètres</h1>
        <p class="subtitle-modern">Gérez votre profil et vos préférences</p>
      </div>
    </div>

    <TabView class="modern-tabview">
      <TabPanel header="Profil">
        <Card class="modern-card">
          <template #title>
            <div class="card-title-icon">
              <i class="pi pi-user"></i>
              <span>Informations personnelles</span>
            </div>
          </template>
          <template #content>
            <div class="settings-form">
              <div class="p-field">
                <label>Prénom</label>
                <InputText v-model="profileForm.firstName" class="w-full" />
              </div>
              <div class="p-field">
                <label>Nom</label>
                <InputText v-model="profileForm.lastName" class="w-full" />
              </div>
              <div class="p-field">
                <label>Email</label>
                <InputText v-model="profileForm.email" type="email" class="w-full" />
              </div>
              <Button
                label="Mettre à jour le profil"
                icon="pi pi-save"
                @click="updateProfile"
                :loading="savingProfile"
              />
            </div>
          </template>
        </Card>

        <Card class="modern-card mt-4">
          <template #title>
            <div class="card-title-icon">
              <i class="pi pi-lock"></i>
              <span>Changer le mot de passe</span>
            </div>
          </template>
          <template #content>
            <div class="settings-form">
              <div class="p-field">
                <label>Mot de passe actuel</label>
                <Password
                  v-model="passwordForm.currentPassword"
                  :feedback="false"
                  toggleMask
                  class="w-full"
                />
              </div>
              <div class="p-field">
                <label>Nouveau mot de passe</label>
                <Password
                  v-model="passwordForm.newPassword"
                  toggleMask
                  class="w-full"
                />
              </div>
              <Button
                label="Changer le mot de passe"
                icon="pi pi-lock"
                @click="changePassword"
                :loading="savingPassword"
              />
            </div>
          </template>
        </Card>
      </TabPanel>

      <TabPanel header="Paramètres email">
        <Card class="modern-card">
          <template #title>
            <div class="card-title-icon">
              <i class="pi pi-envelope"></i>
              <span>Configuration SMTP</span>
            </div>
          </template>
          <template #content>
            <div class="settings-form">
              <Message severity="info" :closable="false" class="mb-4">
                Configurez vos paramètres SMTP pour envoyer des emails depuis votre propre serveur email.
              </Message>

              <div class="p-field">
                <label>Serveur SMTP</label>
                <InputText
                  v-model="emailForm.emailSmtpHost"
                  placeholder="smtp.gmail.com"
                  class="w-full"
                />
              </div>

              <div class="p-field">
                <label>Port SMTP</label>
                <InputNumber
                  v-model="emailForm.emailSmtpPort"
                  :min="1"
                  :max="65535"
                  placeholder="587"
                  class="w-full"
                />
              </div>

              <div class="p-field-checkbox">
                <Checkbox
                  v-model="emailForm.emailSmtpSecure"
                  :binary="true"
                  inputId="smtpSecure"
                />
                <label for="smtpSecure" class="ml-2">Utiliser SSL/TLS</label>
              </div>

              <div class="p-field">
                <label>Utilisateur SMTP</label>
                <InputText
                  v-model="emailForm.emailSmtpUser"
                  placeholder="votre-email@gmail.com"
                  class="w-full"
                />
              </div>

              <div class="p-field">
                <label>Mot de passe SMTP</label>
                <Password
                  v-model="emailForm.emailSmtpPass"
                  :feedback="false"
                  toggleMask
                  placeholder="Laisser vide pour ne pas modifier"
                  class="w-full"
                />
              </div>

              <div class="p-field">
                <label>Email expéditeur</label>
                <InputText
                  v-model="emailForm.emailFrom"
                  type="email"
                  placeholder="noreply@exemple.com"
                  class="w-full"
                />
              </div>

              <div class="flex gap-3">
                <Button
                  label="Enregistrer les paramètres"
                  icon="pi pi-save"
                  @click="updateEmailSettings"
                  :loading="savingEmail"
                />
                <Button
                  v-if="emailForm.emailConfigured"
                  label="Email configuré"
                  icon="pi pi-check"
                  severity="success"
                  disabled
                />
              </div>
            </div>
          </template>
        </Card>
      </TabPanel>
    </TabView>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'
import Card from 'primevue/card'
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Password from 'primevue/password'
import Button from 'primevue/button'
import Checkbox from 'primevue/checkbox'
import Message from 'primevue/message'

const toast = useToast()
const authStore = useAuthStore()

const savingProfile = ref(false)
const savingPassword = ref(false)
const savingEmail = ref(false)

const profileForm = ref({
  firstName: '',
  lastName: '',
  email: ''
})

const passwordForm = ref({
  currentPassword: '',
  newPassword: ''
})

const emailForm = ref({
  emailSmtpHost: '',
  emailSmtpPort: 587,
  emailSmtpSecure: false,
  emailSmtpUser: '',
  emailSmtpPass: '',
  emailFrom: '',
  emailConfigured: false
})

const loadProfile = async () => {
  try {
    const response = await api.get('/api/auth/me')
    const user = response.data.data

    profileForm.value = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: 'Impossible de charger le profil',
      life: 3000
    })
  }
}

const loadEmailSettings = async () => {
  try {
    const response = await api.get('/api/auth/email-settings')
    const settings = response.data.data

    emailForm.value = {
      emailSmtpHost: settings.emailSmtpHost || '',
      emailSmtpPort: settings.emailSmtpPort || 587,
      emailSmtpSecure: settings.emailSmtpSecure || false,
      emailSmtpUser: settings.emailSmtpUser || '',
      emailSmtpPass: '',
      emailFrom: settings.emailFrom || '',
      emailConfigured: settings.emailConfigured || false
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: 'Impossible de charger les paramètres email',
      life: 3000
    })
  }
}

const updateProfile = async () => {
  savingProfile.value = true
  try {
    await api.put('/api/auth/profile', profileForm.value)
    await authStore.fetchUser()

    toast.add({
      severity: 'success',
      summary: 'Succès',
      detail: 'Profil mis à jour avec succès',
      life: 3000
    })
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: error.response?.data?.error?.message || 'Impossible de mettre à jour le profil',
      life: 3000
    })
  } finally {
    savingProfile.value = false
  }
}

const changePassword = async () => {
  savingPassword.value = true
  try {
    await api.put('/api/auth/change-password', passwordForm.value)

    passwordForm.value = {
      currentPassword: '',
      newPassword: ''
    }

    toast.add({
      severity: 'success',
      summary: 'Succès',
      detail: 'Mot de passe modifié avec succès',
      life: 3000
    })
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: error.response?.data?.error?.message || 'Impossible de changer le mot de passe',
      life: 3000
    })
  } finally {
    savingPassword.value = false
  }
}

const updateEmailSettings = async () => {
  savingEmail.value = true
  try {
    const payload = { ...emailForm.value }

    // Remove password if empty
    if (!payload.emailSmtpPass) {
      delete payload.emailSmtpPass
    }

    const response = await api.put('/api/auth/email-settings', payload)
    emailForm.value.emailConfigured = response.data.data.emailConfigured
    emailForm.value.emailSmtpPass = ''

    toast.add({
      severity: 'success',
      summary: 'Succès',
      detail: 'Paramètres email mis à jour avec succès',
      life: 3000
    })
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: error.response?.data?.error?.message || 'Impossible de mettre à jour les paramètres email',
      life: 3000
    })
  } finally {
    savingEmail.value = false
  }
}

onMounted(() => {
  loadProfile()
  loadEmailSettings()
})
</script>

<style scoped>
.settings-view {
  padding: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
}

/* En-tête moderne */
.page-header-modern {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 2rem;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-600) 100%);
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  color: white;
}

.page-title-modern {
  font-size: 2.25rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.subtitle-modern {
  font-size: 1.1rem;
  opacity: 0.95;
  margin: 0;
}

/* Cartes modernes */
.modern-card {
  border-radius: 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.05);
  overflow: hidden;
  margin-bottom: 1.5rem;
}

.modern-card :deep(.p-card-title) {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-color);
  padding-bottom: 1rem;
  border-bottom: 2px solid var(--surface-100);
  margin-bottom: 1.5rem;
}

.modern-card :deep(.p-card-content) {
  padding: 1.5rem;
}

.card-title-icon {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.25rem;
  font-weight: 700;
}

.card-title-icon i {
  color: var(--primary-color);
  font-size: 1.5rem;
}

/* Formulaires */
.settings-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 700px;
}

.p-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.p-field label {
  font-weight: 600;
  color: var(--text-color);
  font-size: 0.95rem;
}

.p-field-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* TabView moderne */
.modern-tabview :deep(.p-tabview-nav) {
  gap: 0.5rem;
  background: transparent;
  border: none;
  display: flex;
  flex-wrap: wrap;
}

.modern-tabview :deep(.p-tabview-nav-link) {
  padding: 1rem 1.5rem !important;
  border-radius: 12px 12px 0 0;
  margin-right: 0.5rem;
  font-weight: 600;
  transition: all 0.2s ease;
  background: #f1f5f9;
  color: #334155;
  border: 1px solid #e2e8f0;
  border-bottom: none;
}

.modern-tabview :deep(.p-tabview-nav-link:hover) {
  background: #e2e8f0;
  color: #1e293b;
}

.modern-tabview :deep(.p-tabview-nav-link.p-highlight) {
  background: var(--primary-color);
  color: white !important;
  border-color: var(--primary-color);
}

.modern-tabview :deep(.p-tabview-panels) {
  padding: 2rem;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 0 12px 12px 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}

/* Inputs */
:deep(.p-password),
:deep(.p-inputnumber) {
  width: 100%;
}

:deep(.p-password input) {
  width: 100%;
}

/* Utilitaires */
.mt-4 {
  margin-top: 1.5rem;
}

.mb-4 {
  margin-bottom: 1rem;
}

.flex {
  display: flex;
}

.gap-3 {
  gap: 0.75rem;
}

.w-full {
  width: 100%;
}

/* Mode sombre */
.dark-mode .modern-card {
  background: #1e293b;
  border-color: #334155;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.dark-mode .modern-card :deep(.p-card-title) {
  color: #f1f5f9;
  border-bottom-color: #334155;
}

.dark-mode .card-title-icon i {
  color: #60a5fa;
}

.dark-mode .p-field label {
  color: #e2e8f0;
}

.dark-mode .modern-tabview :deep(.p-tabview-nav-link) {
  background: #1e293b;
  border-color: #334155;
  color: #e2e8f0;
}

.dark-mode .modern-tabview :deep(.p-tabview-nav-link:hover) {
  background: #334155;
  color: #f1f5f9;
}

.dark-mode .modern-tabview :deep(.p-tabview-nav-link.p-highlight) {
  background: var(--primary-color) !important;
  color: white !important;
  border-color: var(--primary-color) !important;
}

.dark-mode .modern-tabview :deep(.p-tabview-panels) {
  background: #1e293b;
  border-color: #334155;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

/* Responsive */
@media (max-width: 768px) {
  .settings-view {
    padding: 1rem;
  }

  .page-header-modern {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .page-title-modern {
    font-size: 1.75rem;
  }

  .settings-form {
    max-width: 100%;
  }
}
</style>
