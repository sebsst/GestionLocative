# Gestion Locative

Application complète de gestion locative avec Vue.js, Node.js et PostgreSQL.

## Fonctionnalités

### Gestion des biens immobiliers
- Appartements, maisons, immeubles, terrains, garages, fonds de commerce
- Description détaillée (surface, nombre de pièces, adresse, copropriété)
- Historique des locataires

### Gestion des locataires
- Informations complètes (coordonnées, RIB, documents)
- Suivi des communications (appel, courrier, SMS, mail)
- Historique par logement

### Gestion des loyers
- Suivi mensuel des paiements
- Indicateur de retard
- Génération automatique de relances
- Historique annuel

### Gestion des charges
- Charges de copropriété
- Charges communes (électricité, eau, ordures, etc.)
- Répartition automatique par logement
- Plusieurs modes de répartition (surface, occupants, par appartement)

### Gestion des travaux
- Travaux communs ou par logement
- Suivi des artisans
- Devis et prévisions
- Historique des paiements

### Déclarations fiscales
- Génération automatique des déclarations
- Calcul des revenus et charges
- Export PDF

## Stack technique

- **Frontend**: Vue.js 3 + Vite + PrimeVue
- **Backend**: Node.js + Express
- **Base de données**: PostgreSQL
- **Authentification**: JWT
- **Email**: Nodemailer
- **PDF**: PDFKit
- **Déploiement**: Docker + Docker Compose

## Installation

### Prérequis
- Node.js 18+
- PostgreSQL 15+
- Docker (optionnel)

### Installation locale

1. Cloner le repository
```bash
git clone <repo-url>
cd gestion-locative
```

2. Copier le fichier d'environnement
```bash
cp .env.example .env
# Éditer .env avec vos paramètres
```

3. Installer les dépendances
```bash
npm run install:all
```

4. Démarrer PostgreSQL
```bash
# Avec Docker
docker-compose up -d postgres

# Ou utilisez votre installation locale
```

5. Démarrer l'application
```bash
npm run dev
```

L'application sera accessible à:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

### Installation avec Docker

```bash
# Démarrer tous les services
npm run docker:up

# Arrêter les services
npm run docker:down

# Reconstruire les images
npm run docker:build
```

## Structure du projet

```
gestion-locative/
├── backend/                # Backend Node.js/Express
│   ├── src/
│   │   ├── config/        # Configuration
│   │   ├── controllers/   # Contrôleurs
│   │   ├── database/      # Migrations et seeds
│   │   ├── middleware/    # Middlewares
│   │   ├── models/        # Modèles de données
│   │   ├── routes/        # Routes API
│   │   ├── services/      # Services (email, PDF)
│   │   └── utils/         # Utilitaires
│   ├── uploads/           # Fichiers uploadés
│   └── Dockerfile
├── frontend/              # Frontend Vue.js
│   ├── src/
│   │   ├── assets/        # Assets statiques
│   │   ├── components/    # Composants Vue
│   │   ├── composables/   # Composables
│   │   ├── router/        # Configuration router
│   │   ├── stores/        # Pinia stores
│   │   ├── views/         # Pages
│   │   └── App.vue
│   └── Dockerfile
└── docker-compose.yml
```

## Développement

### Backend
```bash
cd backend
npm run dev
```

### Frontend
```bash
cd frontend
npm run dev
```

## API Documentation

L'API REST est disponible à `http://localhost:3000/api`

### Endpoints principaux

- `/api/auth` - Authentification
- `/api/properties` - Gestion des biens
- `/api/tenants` - Gestion des locataires
- `/api/rents` - Gestion des loyers
- `/api/charges` - Gestion des charges
- `/api/works` - Gestion des travaux
- `/api/documents` - Génération de documents

## Licence

MIT
