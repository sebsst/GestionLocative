<template>
  <div class="property-detail">
    <Button
      icon="pi pi-arrow-left"
      label="Retour"
      class="p-button-text p-button-lg back-button"
      @click="$router.back()"
    />

    <div v-if="loading" class="loading">
      <ProgressSpinner />
    </div>

    <div v-else-if="property" class="content-wrapper">
      <!-- En-tête avec titre et actions -->
      <div class="page-header-modern">
        <div class="header-content">
          <div class="title-section">
            <h1 class="page-title-modern">{{ property.name }}</h1>
            <div class="subtitle-modern">
              <i class="pi pi-map-marker"></i>
              <span>{{ property.address }}, {{ property.city }}</span>
            </div>
          </div>
          <Button
            label="Modifier"
            icon="pi pi-pencil"
            class="p-button-rounded p-button-lg"
            @click="editProperty"
          />
        </div>
        <Tag
          :value="property.status"
          :severity="getStatusSeverity(property.status)"
          class="status-tag-large"
        />
      </div>

      <!-- Cartes de résumé -->
      <div class="summary-cards">
        <div class="stat-card stat-card-primary">
          <div class="stat-icon">
            <i class="pi pi-euro"></i>
          </div>
          <div class="stat-content">
            <div class="stat-label">Loyer actuel</div>
            <div class="stat-value">{{ formatCurrency(property.currentRent) }}</div>
          </div>
        </div>

        <div class="stat-card stat-card-info">
          <div class="stat-icon">
            <i class="pi pi-home"></i>
          </div>
          <div class="stat-content">
            <div class="stat-label">Type</div>
            <div class="stat-value-small">{{ formatPropertyType(property.type) }}</div>
          </div>
        </div>

        <div class="stat-card stat-card-success">
          <div class="stat-icon">
            <i class="pi pi-th-large"></i>
          </div>
          <div class="stat-content">
            <div class="stat-label">Surface</div>
            <div class="stat-value">{{ property.surface }} m²</div>
          </div>
        </div>

        <div class="stat-card stat-card-warning">
          <div class="stat-icon">
            <i class="pi pi-users"></i>
          </div>
          <div class="stat-content">
            <div class="stat-label">Locataire</div>
            <div class="stat-value-small">
              {{ currentLease ? `${currentLease.Tenant.firstName} ${currentLease.Tenant.lastName}` : 'Disponible' }}
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs pour organiser les informations -->
      <TabView class="modern-tabview">
        <!-- Onglet Informations générales -->
        <TabPanel header="Informations">

          <Card class="modern-card">
            <template #content>
              <div class="info-grid-modern">
                <div class="info-item-modern">
                  <div class="info-icon">
                    <i class="pi pi-tag"></i>
                  </div>
                  <div class="info-content">
                    <span class="info-label">Type de bien</span>
                    <span class="info-value">{{ formatPropertyType(property.type) }}</span>
                  </div>
                </div>

                <div class="info-item-modern">
                  <div class="info-icon">
                    <i class="pi pi-flag"></i>
                  </div>
                  <div class="info-content">
                    <span class="info-label">Statut</span>
                    <Tag :value="property.status" :severity="getStatusSeverity(property.status)" />
                  </div>
                </div>

                <div class="info-item-modern">
                  <div class="info-icon">
                    <i class="pi pi-map-marker"></i>
                  </div>
                  <div class="info-content">
                    <span class="info-label">Adresse complète</span>
                    <span class="info-value">{{ property.address }}<br>{{ property.postalCode }} {{ property.city }}</span>
                  </div>
                </div>

                <div class="info-item-modern">
                  <div class="info-icon">
                    <i class="pi pi-expand"></i>
                  </div>
                  <div class="info-content">
                    <span class="info-label">Surface habitable</span>
                    <span class="info-value">{{ property.surface }} m²</span>
                  </div>
                </div>

                <div class="info-item-modern">
                  <div class="info-icon">
                    <i class="pi pi-th-large"></i>
                  </div>
                  <div class="info-content">
                    <span class="info-label">Nombre de pièces</span>
                    <span class="info-value">{{ property.rooms }} pièce(s)</span>
                  </div>
                </div>

                <div class="info-item-modern">
                  <div class="info-icon">
                    <i class="pi pi-euro"></i>
                  </div>
                  <div class="info-content">
                    <span class="info-label">Loyer mensuel</span>
                    <span class="info-value highlight">{{ formatCurrency(property.currentRent) }}</span>
                  </div>
                </div>

                <div class="info-item-modern" v-if="property.fiscalNumber">
                  <div class="info-icon">
                    <i class="pi pi-id-card"></i>
                  </div>
                  <div class="info-content">
                    <span class="info-label">Numéro fiscal</span>
                    <span class="info-value">{{ property.fiscalNumber }}</span>
                  </div>
                </div>

                <div class="info-item-modern" v-if="property.cadastralReference">
                  <div class="info-icon">
                    <i class="pi pi-map"></i>
                  </div>
                  <div class="info-content">
                    <span class="info-label">Référence cadastrale</span>
                    <span class="info-value">{{ property.cadastralReference }}</span>
                  </div>
                </div>

                <div class="info-item-modern full-width" v-if="property.description">
                  <div class="info-icon">
                    <i class="pi pi-align-left"></i>
                  </div>
                  <div class="info-content">
                    <span class="info-label">Description</span>
                    <span class="info-value description">{{ property.description }}</span>
                  </div>
                </div>
              </div>
            </template>
          </Card>
        </TabPanel>

        <!-- Onglet Locataires -->
        <TabPanel header="Locataires">

          <div class="section-header">
            <h3 class="section-title">
              <i class="pi pi-users"></i>
              Gestion des locataires
            </h3>
            <Button
              label="Nouveau bail"
              icon="pi pi-plus"
              class="p-button-rounded p-button-success"
              @click="showNewLeaseDialog = true"
              :disabled="hasActiveLease"
            />
          </div>

          <!-- Locataire actuel -->
          <Card v-if="currentLease" class="modern-card tenant-card">
            <template #title>
              <div class="card-header-modern">
                <div class="card-title-icon">
                  <i class="pi pi-user"></i>
                  <span>Locataire actuel</span>
                </div>
                <div class="header-actions">
                  <Button
                    label="Modifier le bail"
                    icon="pi pi-file-edit"
                    class="p-button-sm p-button-info p-button-rounded"
                    @click="editCurrentLease"
                  />
                  <Button
                    label="Modifier le locataire"
                    icon="pi pi-pencil"
                    class="p-button-sm p-button-warning p-button-rounded"
                    @click="editCurrentTenant"
                  />
                  <Button
                    label="Terminer le bail"
                    icon="pi pi-sign-out"
                    class="p-button-sm p-button-danger p-button-rounded"
                    @click="confirmTerminateLease"
                  />
                </div>
              </div>
            </template>
            <template #content>
              <div class="lease-info-modern">
                <div class="lease-item">
                  <i class="pi pi-user item-icon"></i>
                  <div>
                    <span class="item-label">Locataire</span>
                    <span class="item-value">{{ currentLease.Tenant.firstName }} {{ currentLease.Tenant.lastName }}</span>
                  </div>
                </div>

                <div class="lease-item">
                  <i class="pi pi-envelope item-icon"></i>
                  <div>
                    <span class="item-label">Email</span>
                    <span class="item-value">{{ currentLease.Tenant.email || 'Non renseigné' }}</span>
                  </div>
                </div>

                <div class="lease-item">
                  <i class="pi pi-phone item-icon"></i>
                  <div>
                    <span class="item-label">Téléphone</span>
                    <span class="item-value">{{ currentLease.Tenant.phone || 'Non renseigné' }}</span>
                  </div>
                </div>

                <div class="lease-item">
                  <i class="pi pi-calendar item-icon"></i>
                  <div>
                    <span class="item-label">Date d'emménagement</span>
                    <span class="item-value">{{ formatDate(currentLease.startDate) }}</span>
                  </div>
                </div>

                <div class="lease-item">
                  <i class="pi pi-users item-icon"></i>
                  <div>
                    <span class="item-label">Nombre de personnes</span>
                    <span class="item-value">{{ currentLease.numberOfOccupants }} personne(s)</span>
                  </div>
                </div>

                <div class="lease-item highlight-item">
                  <i class="pi pi-euro item-icon"></i>
                  <div>
                    <span class="item-label">Loyer mensuel</span>
                    <span class="item-value amount">{{ formatCurrency(currentLease.rentAmount) }}</span>
                  </div>
                </div>

                <div class="lease-item">
                  <i class="pi pi-money-bill item-icon"></i>
                  <div>
                    <span class="item-label">Charges</span>
                    <span class="item-value">{{ formatCurrency(currentLease.chargesAmount) }}</span>
                  </div>
                </div>

                <div class="lease-item">
                  <i class="pi pi-shield item-icon"></i>
                  <div>
                    <span class="item-label">Dépôt de garantie</span>
                    <span class="item-value">{{ formatCurrency(currentLease.deposit) }}</span>
                  </div>
                </div>
              </div>
            </template>
          </Card>

          <div v-else class="empty-state">
            <i class="pi pi-home empty-icon"></i>
            <h3>Aucun locataire actuellement</h3>
            <p>Ce bien est disponible à la location. Créez un nouveau bail pour l'attribuer à un locataire.</p>
            <Button
              label="Créer un bail"
              icon="pi pi-plus"
              class="p-button-rounded p-button-lg"
              @click="showNewLeaseDialog = true"
            />
          </div>

          <!-- Historique des locataires -->
          <Card v-if="pastLeases.length > 0" class="modern-card mt-4">
            <template #title>
              <div class="card-title-icon">
                <i class="pi pi-history"></i>
                <span>Historique des locataires</span>
              </div>
            </template>
            <template #content>
              <DataTable
                :value="pastLeases"
                class="modern-table"
                stripedRows
                :paginator="pastLeases.length > 5"
                :rows="5"
              >
                <Column field="Tenant.firstName" header="Locataire">
                  <template #body="{ data }">
                    <div class="tenant-cell">
                      <i class="pi pi-user"></i>
                      <span>{{ data.Tenant.firstName }} {{ data.Tenant.lastName }}</span>
                    </div>
                  </template>
                </Column>
                <Column field="startDate" header="Emménagement">
                  <template #body="{ data }">
                    {{ formatDate(data.startDate) }}
                  </template>
                </Column>
                <Column field="endDate" header="Départ">
                  <template #body="{ data }">
                    {{ formatDate(data.endDate) }}
                  </template>
                </Column>
                <Column field="numberOfOccupants" header="Personnes">
                  <template #body="{ data }">
                    <Tag :value="`${data.numberOfOccupants} pers.`" severity="info" />
                  </template>
                </Column>
                <Column field="rentAmount" header="Loyer">
                  <template #body="{ data }">
                    <span class="currency-cell">{{ formatCurrency(data.rentAmount) }}</span>
                  </template>
                </Column>
              </DataTable>
            </template>
          </Card>
        </TabPanel>

        <!-- Onglet Loyers et Charges -->
        <TabPanel header="Loyers & Charges">

          <div class="section-header">
            <h3 class="section-title">
              <i class="pi pi-money-bill"></i>
              Historique des loyers et charges
            </h3>
            <Button
              label="Nouveau loyer/charges"
              icon="pi pi-plus"
              class="p-button-rounded p-button-success"
              @click="showRentHistoryDialog = true"
            />
          </div>

          <!-- Loyer et charges actuels -->
          <Card v-if="currentRentHistory" class="modern-card rent-card">
            <template #title>
              <div class="card-title-icon">
                <i class="pi pi-check-circle"></i>
                <span>Loyer et charges en vigueur</span>
              </div>
            </template>
            <template #content>
              <div class="rent-display-modern">
                <div class="rent-stat-card">
                  <div class="rent-stat-icon rent-icon">
                    <i class="pi pi-home"></i>
                  </div>
                  <div class="rent-stat-content">
                    <div class="rent-stat-label">Loyer</div>
                    <div class="rent-stat-value">{{ formatCurrency(currentRentHistory.rentAmount) }}</div>
                  </div>
                </div>

                <div class="rent-stat-card">
                  <div class="rent-stat-icon charges-icon">
                    <i class="pi pi-money-bill"></i>
                  </div>
                  <div class="rent-stat-content">
                    <div class="rent-stat-label">Charges</div>
                    <div class="rent-stat-value">{{ formatCurrency(currentRentHistory.chargesAmount) }}</div>
                  </div>
                </div>

                <div class="rent-stat-card total-card">
                  <div class="rent-stat-icon total-icon">
                    <i class="pi pi-calculator"></i>
                  </div>
                  <div class="rent-stat-content">
                    <div class="rent-stat-label">Total mensuel</div>
                    <div class="rent-stat-value total">
                      {{ formatCurrency(parseFloat(currentRentHistory.rentAmount) + parseFloat(currentRentHistory.chargesAmount)) }}
                    </div>
                  </div>
                </div>

                <div class="rent-stat-card">
                  <div class="rent-stat-icon date-icon">
                    <i class="pi pi-calendar"></i>
                  </div>
                  <div class="rent-stat-content">
                    <div class="rent-stat-label">En vigueur depuis</div>
                    <div class="rent-stat-value-small">{{ formatDate(currentRentHistory.startDate) }}</div>
                  </div>
                </div>
              </div>

              <div v-if="currentRentHistory.notes" class="notes-section">
                <i class="pi pi-info-circle"></i>
                <span>{{ currentRentHistory.notes }}</span>
              </div>
            </template>
          </Card>

          <div v-else class="empty-state">
            <i class="pi pi-euro empty-icon"></i>
            <h3>Aucun loyer défini</h3>
            <p>Créez une entrée pour définir le loyer et les charges de ce bien.</p>
            <Button
              label="Définir le loyer"
              icon="pi pi-plus"
              class="p-button-rounded p-button-lg"
              @click="showRentHistoryDialog = true"
            />
          </div>

          <!-- Historique complet -->
          <Card v-if="rentHistory.length > 0" class="modern-card mt-4">
            <template #title>
              <div class="card-title-icon">
                <i class="pi pi-history"></i>
                <span>Historique complet</span>
              </div>
            </template>
            <template #content>
              <DataTable
                :value="rentHistory"
                class="modern-table"
                stripedRows
                :paginator="rentHistory.length > 10"
                :rows="10"
                sortField="startDate"
                :sortOrder="-1"
              >
                <Column field="startDate" header="Date de début" sortable>
                  <template #body="{ data }">
                    <div class="date-cell">
                      <i class="pi pi-calendar"></i>
                      {{ formatDate(data.startDate) }}
                    </div>
                  </template>
                </Column>
                <Column field="endDate" header="Date de fin">
                  <template #body="{ data }">
                    <div class="date-cell">
                      <i class="pi pi-calendar"></i>
                      {{ data.endDate ? formatDate(data.endDate) : 'En cours' }}
                    </div>
                  </template>
                </Column>
                <Column field="rentAmount" header="Loyer">
                  <template #body="{ data }">
                    <span class="currency-cell">{{ formatCurrency(data.rentAmount) }}</span>
                  </template>
                </Column>
                <Column field="chargesAmount" header="Charges">
                  <template #body="{ data }">
                    <span class="currency-cell">{{ formatCurrency(data.chargesAmount) }}</span>
                  </template>
                </Column>
                <Column header="Total">
                  <template #body="{ data }">
                    <span class="currency-cell total">
                      {{ formatCurrency(parseFloat(data.rentAmount) + parseFloat(data.chargesAmount)) }}
                    </span>
                  </template>
                </Column>
                <Column field="isCurrent" header="Statut">
                  <template #body="{ data }">
                    <Tag
                      :value="data.isCurrent ? 'Actuel' : 'Archivé'"
                      :severity="data.isCurrent ? 'success' : 'secondary'"
                      :icon="data.isCurrent ? 'pi pi-check' : 'pi pi-history'"
                    />
                  </template>
                </Column>
              </DataTable>
            </template>
          </Card>
        </TabPanel>
      </TabView>
    </div>

    <!-- Dialog Nouveau Bail -->
    <Dialog
      v-model:visible="showNewLeaseDialog"
      header="Créer un nouveau bail"
      :modal="true"
      :style="{ width: '700px', maxHeight: '90vh' }"
      class="modern-dialog"
    >
      <div class="lease-form" style="max-height: 60vh; overflow-y: auto;">
        <div class="p-field">
          <label><i class="pi pi-user"></i> Locataire *</label>
          <Dropdown
            v-model="leaseForm.tenantId"
            :options="tenants"
            optionLabel="fullName"
            optionValue="id"
            placeholder="Sélectionnez un locataire"
            :filter="true"
            required
            class="w-full"
          />
        </div>
        <div class="p-field-group">
          <div class="p-field">
            <label><i class="pi pi-calendar"></i> Date d'emménagement *</label>
            <Calendar v-model="leaseForm.startDate" dateFormat="dd/mm/yy" required class="w-full" />
          </div>
          <div class="p-field">
            <label><i class="pi pi-calendar"></i> Date de fin (optionnel)</label>
            <Calendar v-model="leaseForm.endDate" dateFormat="dd/mm/yy" showButtonBar class="w-full" />
          </div>
        </div>
        <div class="p-field">
          <label><i class="pi pi-users"></i> Nombre de personnes *</label>
          <InputNumber v-model="leaseForm.numberOfOccupants" :min="1" required class="w-full" />
        </div>
        <div class="p-field-group">
          <div class="p-field">
            <label><i class="pi pi-euro"></i> Loyer mensuel (€) *</label>
            <InputNumber v-model="leaseForm.rentAmount" mode="currency" currency="EUR" required class="w-full" />
          </div>
          <div class="p-field">
            <label><i class="pi pi-money-bill"></i> Charges (€)</label>
            <InputNumber v-model="leaseForm.chargesAmount" mode="currency" currency="EUR" class="w-full" />
          </div>
        </div>
        <div class="p-field">
          <label><i class="pi pi-shield"></i> Dépôt de garantie (€)</label>
          <InputNumber v-model="leaseForm.deposit" mode="currency" currency="EUR" class="w-full" />
        </div>
        <div class="p-field">
          <label><i class="pi pi-align-left"></i> Notes</label>
          <Textarea v-model="leaseForm.notes" rows="3" class="w-full" />
        </div>
      </div>
      <template #footer>
        <Button label="Annuler" @click="showNewLeaseDialog = false" class="p-button-text" />
        <Button label="Créer le bail" icon="pi pi-check" @click="createLease" :loading="savingLease" class="p-button-rounded" />
      </template>
    </Dialog>

    <!-- Dialog Nouveau Loyer/Charges -->
    <Dialog
      v-model:visible="showRentHistoryDialog"
      header="Définir un nouveau loyer et charges"
      :modal="true"
      :style="{ width: '600px' }"
      class="modern-dialog"
    >
      <div class="rent-history-form">
        <Message severity="info" :closable="false" class="mb-3">
          <i class="pi pi-info-circle"></i>
          Cette nouvelle entrée remplacera le loyer et les charges actuels à partir de la date définie.
        </Message>
        <div class="p-field">
          <label><i class="pi pi-calendar"></i> Date de début de validité *</label>
          <Calendar v-model="rentHistoryForm.startDate" dateFormat="dd/mm/yy" required class="w-full" />
        </div>
        <div class="p-field-group">
          <div class="p-field">
            <label><i class="pi pi-euro"></i> Loyer mensuel (€) *</label>
            <InputNumber v-model="rentHistoryForm.rentAmount" mode="currency" currency="EUR" required class="w-full" />
          </div>
          <div class="p-field">
            <label><i class="pi pi-money-bill"></i> Charges mensuelles (€)</label>
            <InputNumber v-model="rentHistoryForm.chargesAmount" mode="currency" currency="EUR" class="w-full" />
          </div>
        </div>
        <div class="p-field">
          <label><i class="pi pi-align-left"></i> Notes (ex: augmentation annuelle, révision IRL...)</label>
          <Textarea v-model="rentHistoryForm.notes" rows="3" class="w-full" />
        </div>
      </div>
      <template #footer>
        <Button label="Annuler" @click="showRentHistoryDialog = false" class="p-button-text" />
        <Button label="Enregistrer" icon="pi pi-check" @click="createRentHistory" :loading="savingRentHistory" class="p-button-rounded" />
      </template>
    </Dialog>

    <!-- Dialog Modification Locataire -->
    <Dialog
      v-model:visible="showEditTenantDialog"
      header="Modifier le locataire"
      :modal="true"
      :style="{ width: '600px', maxHeight: '90vh' }"
      class="modern-dialog"
    >
      <div class="modern-form" style="max-height: 60vh; overflow-y: auto;">
        <div class="p-field-group">
          <div class="p-field">
            <label><i class="pi pi-user"></i> Prénom *</label>
            <InputText v-model="tenantForm.firstName" required class="w-full" />
          </div>
          <div class="p-field">
            <label><i class="pi pi-user"></i> Nom *</label>
            <InputText v-model="tenantForm.lastName" required class="w-full" />
          </div>
        </div>
        <div class="p-field">
          <label><i class="pi pi-envelope"></i> Email</label>
          <InputText v-model="tenantForm.email" type="email" class="w-full" />
        </div>
        <div class="p-field-group">
          <div class="p-field">
            <label><i class="pi pi-phone"></i> Téléphone</label>
            <InputText v-model="tenantForm.phone" class="w-full" />
          </div>
          <div class="p-field">
            <label><i class="pi pi-mobile"></i> Mobile</label>
            <InputText v-model="tenantForm.mobile" class="w-full" />
          </div>
        </div>
        <div class="p-field">
          <label><i class="pi pi-map-marker"></i> Adresse</label>
          <InputText v-model="tenantForm.address" class="w-full" />
        </div>
        <div class="p-field-group">
          <div class="p-field">
            <label><i class="pi pi-map"></i> Ville</label>
            <InputText v-model="tenantForm.city" class="w-full" />
          </div>
          <div class="p-field">
            <label><i class="pi pi-map"></i> Code postal</label>
            <InputText v-model="tenantForm.postalCode" class="w-full" />
          </div>
        </div>
        <div class="p-field">
          <label><i class="pi pi-wallet"></i> IBAN</label>
          <InputText v-model="tenantForm.iban" class="w-full" />
        </div>
        <div class="p-field">
          <label><i class="pi pi-file-edit"></i> Notes</label>
          <Textarea v-model="tenantForm.notes" rows="3" class="w-full" />
        </div>
      </div>
      <template #footer>
        <Button label="Annuler" @click="showEditTenantDialog = false" class="p-button-text" />
        <Button label="Enregistrer" icon="pi pi-check" @click="updateTenant" :loading="savingTenant" class="p-button-rounded" />
      </template>
    </Dialog>

    <!-- Dialog Modification Bail -->
    <Dialog
      v-model:visible="showEditLeaseDialog"
      header="Modifier le bail"
      :modal="true"
      :style="{ width: '700px', maxHeight: '90vh' }"
      class="modern-dialog"
    >
      <div class="modern-form" style="max-height: 60vh; overflow-y: auto;">
        <div class="p-field-group">
          <div class="p-field">
            <label><i class="pi pi-calendar"></i> Date d'emménagement *</label>
            <Calendar v-model="editLeaseForm.startDate" dateFormat="dd/mm/yy" required class="w-full" />
          </div>
          <div class="p-field">
            <label><i class="pi pi-calendar"></i> Date de fin (optionnel)</label>
            <Calendar v-model="editLeaseForm.endDate" dateFormat="dd/mm/yy" showButtonBar class="w-full" />
          </div>
        </div>
        <div class="p-field">
          <label><i class="pi pi-users"></i> Nombre de personnes *</label>
          <InputNumber v-model="editLeaseForm.numberOfOccupants" :min="1" required class="w-full" />
        </div>
        <div class="p-field-group">
          <div class="p-field">
            <label><i class="pi pi-euro"></i> Loyer mensuel (€) *</label>
            <InputNumber v-model="editLeaseForm.rentAmount" mode="currency" currency="EUR" required class="w-full" />
          </div>
          <div class="p-field">
            <label><i class="pi pi-money-bill"></i> Charges (€)</label>
            <InputNumber v-model="editLeaseForm.chargesAmount" mode="currency" currency="EUR" class="w-full" />
          </div>
        </div>
        <div class="p-field">
          <label><i class="pi pi-shield"></i> Dépôt de garantie (€)</label>
          <InputNumber v-model="editLeaseForm.deposit" mode="currency" currency="EUR" class="w-full" />
        </div>
        <div class="p-field">
          <label><i class="pi pi-align-left"></i> Notes</label>
          <Textarea v-model="editLeaseForm.notes" rows="3" class="w-full" />
        </div>
      </div>
      <template #footer>
        <Button label="Annuler" @click="showEditLeaseDialog = false" class="p-button-text" />
        <Button label="Enregistrer" icon="pi pi-check" @click="updateLease" :loading="updatingLease" class="p-button-rounded" />
      </template>
    </Dialog>

    <!-- Dialog Modification Propriété -->
    <Dialog
      v-model:visible="showEditPropertyDialog"
      header="Modifier la propriété"
      :modal="true"
      :style="{ width: '600px', maxHeight: '90vh' }"
      class="modern-dialog"
    >
      <div class="modern-form" style="max-height: 60vh; overflow-y: auto;">
        <div class="p-field">
          <label><i class="pi pi-tag"></i> Nom du bien *</label>
          <InputText v-model="propertyForm.name" required class="w-full" />
        </div>
        <div class="p-field">
          <label><i class="pi pi-map-marker"></i> Adresse *</label>
          <InputText v-model="propertyForm.address" required class="w-full" />
        </div>
        <div class="p-field-group">
          <div class="p-field">
            <label><i class="pi pi-building"></i> Ville *</label>
            <InputText v-model="propertyForm.city" required class="w-full" />
          </div>
          <div class="p-field">
            <label><i class="pi pi-map"></i> Code postal *</label>
            <InputText v-model="propertyForm.postalCode" required class="w-full" />
          </div>
        </div>
        <div class="p-field-group">
          <div class="p-field">
            <label><i class="pi pi-th-large"></i> Surface (m²)</label>
            <InputNumber v-model="propertyForm.surface" :min="0" class="w-full" />
          </div>
          <div class="p-field">
            <label><i class="pi pi-th-large"></i> Pièces</label>
            <InputNumber v-model="propertyForm.rooms" :min="0" class="w-full" />
          </div>
        </div>
        <div class="p-field">
          <label><i class="pi pi-euro"></i> Loyer actuel (€)</label>
          <InputNumber v-model="propertyForm.currentRent" mode="currency" currency="EUR" locale="fr-FR" class="w-full" />
        </div>
        <div class="p-field">
          <label><i class="pi pi-align-left"></i> Description</label>
          <Textarea v-model="propertyForm.description" rows="3" class="w-full" />
        </div>
      </div>
      <template #footer>
        <Button label="Annuler" @click="showEditPropertyDialog = false" class="p-button-text" />
        <Button label="Enregistrer" icon="pi pi-check" @click="updateProperty" :loading="updatingProperty" class="p-button-rounded" />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import api from '@/services/api'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Tag from 'primevue/tag'
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Textarea from 'primevue/textarea'
import Dropdown from 'primevue/dropdown'
import Calendar from 'primevue/calendar'
import ProgressSpinner from 'primevue/progressspinner'
import Message from 'primevue/message'

const route = useRoute()
const toast = useToast()
const confirm = useConfirm()

const property = ref(null)
const tenants = ref([])
const loading = ref(false)
const showNewLeaseDialog = ref(false)
const showRentHistoryDialog = ref(false)
const showEditTenantDialog = ref(false)
const showEditLeaseDialog = ref(false)
const showEditPropertyDialog = ref(false)
const savingLease = ref(false)
const savingRentHistory = ref(false)
const savingTenant = ref(false)
const updatingLease = ref(false)
const updatingProperty = ref(false)

const leaseForm = reactive({
  propertyId: route.params.id,
  tenantId: null,
  startDate: new Date(),
  endDate: null,
  rentAmount: null,
  chargesAmount: 0,
  deposit: null,
  numberOfOccupants: 1,
  status: 'actif',
  notes: ''
})

const rentHistoryForm = reactive({
  rentAmount: null,
  chargesAmount: 0,
  startDate: new Date(),
  notes: ''
})

const tenantForm = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  mobile: '',
  address: '',
  city: '',
  postalCode: '',
  iban: '',
  notes: ''
})

const editLeaseForm = reactive({
  startDate: null,
  endDate: null,
  rentAmount: null,
  chargesAmount: 0,
  deposit: null,
  numberOfOccupants: 1,
  notes: ''
})

const propertyForm = reactive({
  name: '',
  address: '',
  city: '',
  postalCode: '',
  surface: null,
  rooms: null,
  currentRent: null,
  description: ''
})

const currentLease = computed(() => {
  if (!property.value || !property.value.Leases) return null
  return property.value.Leases.find(l => l.status === 'actif')
})

const pastLeases = computed(() => {
  if (!property.value || !property.value.Leases) return []
  return property.value.Leases.filter(l => l.status !== 'actif')
})

const hasActiveLease = computed(() => !!currentLease.value)

const rentHistory = computed(() => {
  if (!property.value || !property.value.rentHistory) return []
  return property.value.rentHistory
})

const currentRentHistory = computed(() => {
  return rentHistory.value.find(r => r.isCurrent) || null
})

const loadProperty = async () => {
  loading.value = true
  try {
    const response = await api.get(`/api/properties/${route.params.id}`)
    property.value = response.data.data

    // Pré-remplir le formulaire de bail avec le loyer actuel
    if (currentRentHistory.value) {
      leaseForm.rentAmount = currentRentHistory.value.rentAmount
      leaseForm.chargesAmount = currentRentHistory.value.chargesAmount
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: 'Impossible de charger le bien',
      life: 3000
    })
  } finally {
    loading.value = false
  }
}

const loadTenants = async () => {
  try {
    const response = await api.get('/api/tenants')
    tenants.value = response.data.data.map(t => ({
      ...t,
      fullName: `${t.firstName} ${t.lastName}`
    }))
  } catch (error) {
    console.error('Error loading tenants:', error)
  }
}

const createLease = async () => {
  savingLease.value = true
  try {
    await api.post('/api/leases', leaseForm)
    toast.add({
      severity: 'success',
      summary: 'Succès',
      detail: 'Bail créé avec succès',
      life: 3000
    })
    showNewLeaseDialog.value = false
    loadProperty()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: error.response?.data?.error?.message || 'Impossible de créer le bail',
      life: 3000
    })
  } finally {
    savingLease.value = false
  }
}

const confirmTerminateLease = () => {
  confirm.require({
    message: 'Voulez-vous vraiment terminer ce bail ? Le bien sera marqué comme disponible.',
    header: 'Confirmation',
    icon: 'pi pi-exclamation-triangle',
    accept: async () => {
      try {
        await api.put(`/api/leases/${currentLease.value.id}/terminate`, {
          endDate: new Date()
        })
        toast.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Bail terminé avec succès',
          life: 3000
        })
        loadProperty()
      } catch (error) {
        toast.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de terminer le bail',
          life: 3000
        })
      }
    }
  })
}

const createRentHistory = async () => {
  savingRentHistory.value = true
  try {
    await api.post(`/api/property-rent/${route.params.id}/history`, rentHistoryForm)
    toast.add({
      severity: 'success',
      summary: 'Succès',
      detail: 'Loyer et charges enregistrés avec succès',
      life: 3000
    })
    showRentHistoryDialog.value = false
    loadProperty()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: 'Impossible d\'enregistrer',
      life: 3000
    })
  } finally {
    savingRentHistory.value = false
  }
}

const editCurrentTenant = () => {
  if (currentLease.value && currentLease.value.Tenant) {
    Object.assign(tenantForm, currentLease.value.Tenant)
    showEditTenantDialog.value = true
  }
}

const updateTenant = async () => {
  savingTenant.value = true
  try {
    const tenantId = currentLease.value.Tenant.id
    await api.put(`/api/tenants/${tenantId}`, tenantForm)
    toast.add({
      severity: 'success',
      summary: 'Succès',
      detail: 'Locataire modifié avec succès',
      life: 3000
    })
    showEditTenantDialog.value = false
    loadProperty()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: error.response?.data?.error?.message || 'Impossible de modifier le locataire',
      life: 3000
    })
  } finally {
    savingTenant.value = false
  }
}

const editCurrentLease = () => {
  if (currentLease.value) {
    editLeaseForm.startDate = new Date(currentLease.value.startDate)
    editLeaseForm.endDate = currentLease.value.endDate ? new Date(currentLease.value.endDate) : null
    editLeaseForm.rentAmount = currentLease.value.rentAmount
    editLeaseForm.chargesAmount = currentLease.value.chargesAmount
    editLeaseForm.deposit = currentLease.value.deposit
    editLeaseForm.numberOfOccupants = currentLease.value.numberOfOccupants
    editLeaseForm.notes = currentLease.value.notes || ''
    showEditLeaseDialog.value = true
  }
}

const updateLease = async () => {
  updatingLease.value = true
  try {
    const leaseId = currentLease.value.id
    await api.put(`/api/leases/${leaseId}`, editLeaseForm)
    toast.add({
      severity: 'success',
      summary: 'Succès',
      detail: 'Bail modifié avec succès',
      life: 3000
    })
    showEditLeaseDialog.value = false
    loadProperty()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: error.response?.data?.error?.message || 'Impossible de modifier le bail',
      life: 3000
    })
  } finally {
    updatingLease.value = false
  }
}

const editProperty = () => {
  if (property.value) {
    Object.assign(propertyForm, {
      name: property.value.name,
      address: property.value.address,
      city: property.value.city,
      postalCode: property.value.postalCode,
      surface: property.value.surface,
      rooms: property.value.rooms,
      currentRent: property.value.currentRent,
      description: property.value.description || ''
    })
    showEditPropertyDialog.value = true
  }
}

const updateProperty = async () => {
  updatingProperty.value = true
  try {
    await api.put(`/api/properties/${property.value.id}`, propertyForm)
    toast.add({
      severity: 'success',
      summary: 'Succès',
      detail: 'Propriété modifiée avec succès',
      life: 3000
    })
    showEditPropertyDialog.value = false
    loadProperty()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: 'Impossible de modifier la propriété',
      life: 3000
    })
  } finally {
    updatingProperty.value = false
  }
}

const getStatusSeverity = (status) => {
  const severityMap = {
    disponible: 'success',
    loue: 'info',
    en_travaux: 'warning',
    vendu: 'danger'
  }
  return severityMap[status] || 'info'
}

const formatPropertyType = (type) => {
  const typeMap = {
    appartement: 'Appartement',
    maison: 'Maison',
    immeuble: 'Immeuble',
    terrain: 'Terrain',
    garage: 'Garage',
    commercial: 'Local commercial',
    meuble: 'Meublé'
  }
  return typeMap[type] || type
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(value || 0)
}

const formatDate = (date) => {
  return date ? new Date(date).toLocaleDateString('fr-FR') : '-'
}

onMounted(() => {
  loadProperty()
  loadTenants()
})
</script>

<style scoped>
.property-detail {
  padding: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
}

.back-button {
  margin-bottom: 1.5rem;
  font-weight: 600;
}

.loading {
  display: flex;
  justify-content: center;
  padding: 4rem;
}

.content-wrapper {
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

/* En-tête moderne */
.page-header-modern {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-600) 100%);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.page-header-modern::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  border-radius: 50%;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.title-section {
  flex: 1;
}

.page-title-modern {
  color: white;
  font-size: 2.25rem;
  font-weight: 700;
  margin: 0 0 0.75rem 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.subtitle-modern {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.95);
  font-size: 1.1rem;
}

.subtitle-modern i {
  font-size: 1rem;
}

.status-tag-large {
  font-size: 1rem;
  padding: 0.5rem 1.25rem;
  border-radius: 25px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Cartes de statistiques */
.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 1.75rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  flex-shrink: 0;
}

.stat-card-primary .stat-icon {
  background: linear-gradient(135deg, var(--primary-500) 0%, var(--primary-700) 100%);
  color: white;
}

.stat-card-info .stat-icon {
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  color: white;
}

.stat-card-success .stat-icon {
  background: linear-gradient(135deg, #10b981 0%, #047857 100%);
  color: white;
}

.stat-card-warning .stat-icon {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-color-secondary);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-color);
  line-height: 1;
}

.stat-value-small {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-color);
  line-height: 1.2;
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

/* Cartes modernes */
.modern-card {
  border-radius: 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.05);
  margin-bottom: 1.5rem;
  overflow: hidden;
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

.card-header-modern {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
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

/* Grille d'informations moderne */
.info-grid-modern {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.info-item-modern {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.25rem;
  background: var(--surface-50);
  border-radius: 12px;
  border-left: 4px solid var(--primary-color);
  transition: all 0.2s;
}

.info-item-modern:hover {
  background: var(--surface-100);
  transform: translateX(5px);
}

.info-item-modern.full-width {
  grid-column: 1 / -1;
}

.info-icon {
  width: 40px;
  height: 40px;
  background: var(--primary-color);
  color: white;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 1.25rem;
}

.info-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-color-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 1.1rem;
  color: var(--text-color);
  font-weight: 500;
}

.info-value.highlight {
  color: var(--primary-color);
  font-weight: 700;
  font-size: 1.5rem;
}

.info-value.description {
  line-height: 1.6;
}

/* Section header */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-color);
  margin: 0;
}

.section-title i {
  color: var(--primary-color);
  font-size: 1.75rem;
}

/* Informations de bail modernes */
.lease-info-modern {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.lease-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: var(--surface-50);
  border-radius: 10px;
  transition: all 0.2s;
}

.lease-item:hover {
  background: var(--surface-100);
}

.lease-item.highlight-item {
  background: linear-gradient(135deg, var(--primary-50) 0%, var(--primary-100) 100%);
  border: 2px solid var(--primary-color);
}

.item-icon {
  color: var(--primary-color);
  font-size: 1.5rem;
  flex-shrink: 0;
  margin-top: 0.25rem;
}

.lease-item div {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.item-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-color-secondary);
}

.item-value {
  font-size: 1.1rem;
  font-weight: 500;
  color: var(--text-color);
}

.item-value.amount {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-color);
}

/* Affichage du loyer moderne */
.rent-display-modern {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.rent-stat-card {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  border: 2px solid var(--surface-200);
  transition: all 0.3s;
}

.rent-stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.rent-stat-card.total-card {
  border-color: #10b981;
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
}

.rent-stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.rent-icon {
  background: linear-gradient(135deg, var(--primary-500) 0%, var(--primary-700) 100%);
  color: white;
}

.charges-icon {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
}

.total-icon {
  background: linear-gradient(135deg, #10b981 0%, #047857 100%);
  color: white;
}

.date-icon {
  background: linear-gradient(135deg, #6366f1 0%, #4338ca 100%);
  color: white;
}

.rent-stat-content {
  flex: 1;
}

.rent-stat-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-color-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.5rem;
}

.rent-stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-color);
  line-height: 1;
}

.rent-stat-value.total {
  color: #10b981;
  font-size: 2rem;
}

.rent-stat-value-small {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-color);
}

.notes-section {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.25rem;
  background: var(--blue-50);
  border-left: 4px solid var(--blue-500);
  border-radius: 8px;
  margin-top: 1.5rem;
}

.notes-section i {
  color: var(--blue-500);
  font-size: 1.25rem;
  margin-top: 0.25rem;
}

.notes-section span {
  flex: 1;
  line-height: 1.6;
  color: var(--text-color);
}

/* Empty state */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: var(--surface-50);
  border-radius: 16px;
  border: 2px dashed var(--surface-300);
}

.empty-icon {
  font-size: 4rem;
  color: var(--text-color-secondary);
  margin-bottom: 1.5rem;
  opacity: 0.5;
}

.empty-state h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-color);
  margin: 0 0 1rem 0;
}

.empty-state p {
  font-size: 1.1rem;
  color: var(--text-color-secondary);
  margin: 0 0 2rem 0;
  line-height: 1.6;
}

/* Table moderne */
.modern-table :deep(.p-datatable-thead > tr > th) {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-600) 100%);
  color: white;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  font-size: 0.875rem;
  padding: 1.25rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-bottom: 2px solid var(--primary-700);
}

.modern-table :deep(.p-datatable-tbody > tr) {
  transition: all 0.2s;
  border-bottom: 1px solid #e5e7eb;
}

.modern-table :deep(.p-datatable-tbody > tr:nth-child(even)) {
  background: #f9fafb;
}

.modern-table :deep(.p-datatable-tbody > tr:hover) {
  background: var(--primary-50) !important;
  transform: scale(1.005);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.modern-table :deep(.p-datatable-tbody > tr > td) {
  padding: 1.25rem 1rem;
  font-size: 1rem;
  border-right: 1px solid #e5e7eb;
}

.modern-table :deep(.p-datatable-tbody > tr > td:last-child) {
  border-right: none;
}

/* Pagination et filtres */
.modern-table :deep(.p-paginator) {
  background: #f9fafb;
  border-top: 2px solid var(--primary-color);
  padding: 1rem;
}

.modern-table :deep(.p-paginator .p-paginator-current) {
  color: var(--text-color);
  font-weight: 600;
}

.modern-table :deep(.p-paginator-pages .p-paginator-page) {
  min-width: 2.5rem;
  height: 2.5rem;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.2s;
}

.modern-table :deep(.p-paginator-pages .p-paginator-page:hover) {
  background: var(--primary-50);
  color: var(--primary-color);
}

.modern-table :deep(.p-paginator-pages .p-paginator-page.p-highlight) {
  background: var(--primary-color);
  color: white;
}

.tenant-cell,
.date-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.tenant-cell i,
.date-cell i {
  color: var(--primary-color);
  font-size: 1.1rem;
}

.currency-cell {
  font-weight: 600;
  color: var(--text-color);
}

.currency-cell.total {
  color: #10b981;
  font-weight: 700;
  font-size: 1.1rem;
}

/* Formulaires */
.lease-form,
.rent-history-form,
.modern-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.p-field {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.p-field-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.p-field label {
  font-weight: 700;
  color: var(--text-color);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
}

.p-field label i {
  color: var(--primary-color);
  font-size: 1rem;
}

.modern-dialog :deep(.p-dialog-header) {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-600) 100%);
  color: white;
  padding: 1.5rem 2rem;
  border-radius: 12px 12px 0 0;
}

.modern-dialog :deep(.p-dialog-title) {
  font-weight: 700;
  font-size: 1.5rem;
}

.modern-dialog :deep(.p-dialog-content) {
  padding: 2rem;
}

.w-full {
  width: 100%;
}

/* Espacements */
.mt-4 {
  margin-top: 2rem;
}

.mb-3 {
  margin-bottom: 1.5rem;
}

/* Mode sombre */
.dark-mode .stat-card {
  background: #1e293b;
  border-color: #334155;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.dark-mode .stat-label {
  color: #94a3b8;
}

.dark-mode .stat-value,
.dark-mode .stat-value-small {
  color: #f1f5f9;
}

.dark-mode .modern-tabs :deep(.p-tabview-nav) {
  background: #1e293b;
}

.dark-mode .modern-card {
  background: #1e293b;
  border-color: #334155;
}

.dark-mode .modern-card :deep(.p-card-title) {
  color: #f1f5f9;
}

.dark-mode .info-label,
.dark-mode .lease-label,
.dark-mode .rent-stat-label {
  color: #94a3b8;
}

.dark-mode .info-value,
.dark-mode .lease-value,
.dark-mode .rent-stat-value,
.dark-mode .rent-stat-value-small {
  color: #f1f5f9;
}

.dark-mode .card-title-icon i {
  color: #60a5fa;
}

.dark-mode .rent-stat-card {
  background: #1e293b;
  border-color: #334155;
}

.dark-mode .rent-stat-card.total-card {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.1) 100%);
  border-color: #10b981;
}

.dark-mode .rent-stat-value.total {
  color: #10b981;
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

.dark-mode .modern-dialog :deep(.p-dialog-content) {
  background: #1e293b;
  color: #e2e8f0;
}

/* Responsive */
@media (max-width: 768px) {
  .property-detail {
    padding: 1rem;
  }

  .page-title-modern {
    font-size: 1.75rem;
  }

  .summary-cards {
    grid-template-columns: 1fr;
  }

  .info-grid-modern,
  .lease-info-modern,
  .rent-display-modern {
    grid-template-columns: 1fr;
  }

  .p-field-group {
    grid-template-columns: 1fr;
  }

  .header-content {
    flex-direction: column;
    gap: 1rem;
  }

  .stat-value {
    font-size: 1.5rem;
  }

  .section-title {
    font-size: 1.25rem;
  }
}
</style>
