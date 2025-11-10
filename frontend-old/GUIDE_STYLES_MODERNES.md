# Guide des Styles Modernes

Ce guide explique comment utiliser les styles modernes globaux dans vos vues.

## Structure HTML de base

```vue
<template>
  <div class="modern-view">
    <!-- En-tête -->
    <div class="page-header-modern">
      <div>
        <h1 class="page-title-modern">Titre de la page</h1>
        <p class="subtitle-modern">Description de la page</p>
      </div>
      <Button label="Action" icon="pi pi-plus" class="p-button-rounded p-button-lg p-button-success" />
    </div>

    <!-- Cartes de statistiques (optionnel) -->
    <div class="stats-grid">
      <div class="stat-card stat-primary">
        <div class="stat-icon"><i class="pi pi-home"></i></div>
        <div class="stat-content">
          <div class="stat-label">Label</div>
          <div class="stat-value">123</div>
        </div>
      </div>
      <!-- Répétez pour d'autres stats -->
    </div>

    <!-- Contenu principal -->
    <Card class="modern-card">
      <template #content>
        <!-- Filtres (optionnel) -->
        <div class="filters-modern">
          <span class="p-input-icon-left search-input">
            <i class="pi pi-search" />
            <InputText placeholder="Rechercher..." class="w-full" />
          </span>
        </div>

        <!-- Table -->
        <DataTable :value="items" class="modern-table" stripedRows>
          <!-- Colonnes -->
        </DataTable>
      </template>
    </Card>

    <!-- Dialog (optionnel) -->
    <Dialog v-model:visible="showDialog" header="Titre" class="modern-dialog">
      <div class="modern-form">
        <div class="p-field">
          <label><i class="pi pi-tag"></i> Label</label>
          <InputText class="w-full" />
        </div>
      </div>
    </Dialog>
  </div>
</template>
```

## Classes disponibles

### En-tête
- `page-header-modern` : En-tête avec gradient
- `page-title-modern` : Titre principal
- `subtitle-modern` : Sous-titre

### Statistiques
- `stats-grid` : Grille pour les cartes de stats
- `stat-card` : Carte de statistique
- Variantes : `stat-primary`, `stat-success`, `stat-info`, `stat-warning`, `stat-danger`, `stat-total`, `stat-available`, `stat-rented`, `stat-revenue`, `stat-pending`, `stat-progress`, `stat-done`
- `stat-icon` : Icône de la stat
- `stat-content` : Contenu de la stat
- `stat-label` : Label de la stat
- `stat-value` : Valeur de la stat
- `stat-value-small` : Valeur plus petite

### Cartes
- `modern-card` : Carte moderne avec ombres
- `card-title-icon` : Titre avec icône

### Filtres
- `filters-modern` : Container de filtres
- `search-input` : Input de recherche
- `filter-dropdown` : Dropdown de filtre

### Tables
- `modern-table` : Table moderne avec styles
- `name-cell`, `tenant-cell`, `property-cell`, `address-cell`, `date-cell` : Cellules avec icônes
- `currency-cell` : Cellule monétaire
- `action-buttons` : Container pour boutons d'action

### Formulaires
- `modern-form` : Formulaire moderne
- `p-field` : Champ de formulaire
- `p-field-group` : Groupe de champs (2 colonnes)

### Dialogues
- `modern-dialog` : Dialogue avec header gradient

### États vides
- `empty-state` : État vide complet
- `empty-state-small` : État vide compact

### Utilitaires
- `w-full` : Largeur 100%
- `ml-auto` : Marge gauche auto
- `mt-2`, `mt-3`, `mt-4` : Marges top
- `mb-2`, `mb-3`, `mb-4` : Marges bottom
- `gap-2`, `gap-3` : Espacements

## Exemple complet minimal

```vue
<template>
  <div class="modern-view">
    <div class="page-header-modern">
      <div>
        <h1 class="page-title-modern">Ma Vue</h1>
        <p class="subtitle-modern">Description</p>
      </div>
      <Button label="Nouveau" icon="pi pi-plus" class="p-button-rounded p-button-lg" />
    </div>

    <Card class="modern-card">
      <template #content>
        <DataTable :value="items" class="modern-table" stripedRows>
          <Column field="name" header="Nom" />
        </DataTable>
      </template>
    </Card>
  </div>
</template>

<style scoped>
/* Pas besoin de styles ! Tout est dans modern-views.css */
</style>
```

## Notes importantes

1. **Le fichier CSS est importé globalement** dans `main.js`
2. **Pas besoin de dupliquer les styles** dans vos composants
3. **Utilisez `<style scoped>`** uniquement pour les styles spécifiques à votre vue
4. **Responsive automatique** : Les styles s'adaptent aux petits écrans
5. **Animations incluses** : Effets de hover et transitions déjà configurés
