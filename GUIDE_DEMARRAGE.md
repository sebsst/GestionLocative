# Guide de démarrage - Gestion Locative

## Installation et démarrage rapide

### Prérequis
- Node.js 18 ou supérieur
- PostgreSQL 15 ou supérieur
- Docker (optionnel mais recommandé)

### Méthode 1: Démarrage avec Docker (Recommandé)

1. **Cloner le projet**
```bash
cd "gestion-locative"
```

2. **Configurer l'environnement**
```bash
cp .env.example .env
# Éditer le fichier .env avec vos paramètres
```

3. **Démarrer l'application**
```bash
docker-compose up -d
```

L'application sera accessible à:
- Frontend: http://localhost:80
- Backend API: http://localhost:3000

### Méthode 2: Installation locale

#### Backend

1. **Installer les dépendances**
```bash
cd backend
npm install
```

2. **Configurer la base de données**
```bash
# Créer une base de données PostgreSQL nommée 'gestion_locative'
# Configurer les variables d'environnement dans le fichier .env
```

3. **Démarrer le serveur**
```bash
npm run dev
```

Le backend sera disponible sur http://localhost:3000

#### Frontend

1. **Installer les dépendances**
```bash
cd frontend
npm install
```

2. **Démarrer le serveur de développement**
```bash
npm run dev
```

Le frontend sera disponible sur http://localhost:5173

## Configuration

### Variables d'environnement

Créez un fichier `.env` à la racine du projet backend avec:

```env
# Database
DATABASE_URL=postgresql://admin:admin123@localhost:5432/gestion_locative

# JWT
JWT_SECRET=votre-secret-tres-securise
JWT_EXPIRES_IN=7d

# Server
PORT=3000
NODE_ENV=development

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre-email@gmail.com
SMTP_PASS=votre-mot-de-passe-application
EMAIL_FROM=noreply@gestion-locative.com

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### Configuration email Gmail

1. Activer la validation en deux étapes sur votre compte Gmail
2. Générer un mot de passe d'application:
   - Allez dans les paramètres du compte Google
   - Sécurité > Validation en deux étapes
   - Mots de passe des applications
   - Générer un mot de passe pour "Application personnalisée"
3. Utiliser ce mot de passe dans `SMTP_PASS`

## Premiers pas

### 1. Créer un compte utilisateur

Au premier lancement, créez un compte via l'interface de connexion:
- Cliquez sur "S'inscrire" (si disponible) ou utilisez l'API directement:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "votre-mot-de-passe",
    "firstName": "Admin",
    "lastName": "User"
  }'
```

### 2. Se connecter

Utilisez les identifiants créés pour vous connecter via l'interface web.

### 3. Ajouter vos premiers biens

1. Allez dans "Biens immobiliers"
2. Cliquez sur "Nouveau bien"
3. Remplissez le formulaire avec les informations du bien
4. Enregistrez

### 4. Ajouter des locataires

1. Allez dans "Locataires"
2. Cliquez sur "Nouveau locataire"
3. Remplissez les informations du locataire
4. Enregistrez

### 5. Créer un bail

Les baux se créent automatiquement lors de l'association d'un locataire à un bien. Vous pouvez gérer les baux depuis la page de détail du bien ou du locataire.

### 6. Générer les loyers mensuels

1. Allez dans "Loyers"
2. Cliquez sur "Générer les loyers du mois"
3. Sélectionnez le mois et l'année
4. Les loyers seront créés automatiquement pour tous les baux actifs

## Fonctionnalités principales

### Gestion des biens
- CRUD complet (Créer, Lire, Mettre à jour, Supprimer)
- Différents types: appartements, maisons, immeubles, terrains, garages, etc.
- Suivi du statut: disponible, loué, en travaux, vendu
- Historique des locataires

### Gestion des locataires
- Informations complètes (coordonnées, RIB, documents)
- Historique des baux
- Suivi des communications
- Envoi de courriers automatiques

### Gestion des loyers
- Génération automatique mensuelle
- Suivi des paiements
- Indicateurs de retard
- Envoi automatique de rappels et mises en demeure
- Génération de PDF

### Gestion des charges
- Charges individuelles et communes
- Répartition automatique par surface, occupants ou appartement
- Différents types: copropriété, électricité, eau, ordures, etc.
- Suivi des fréquences (mensuel, trimestriel, annuel)

### Gestion des travaux
- Suivi des travaux réalisés et prévus
- Gestion des artisans
- Devis et factures
- Historique des paiements

### Déclaration fiscale
- Génération automatique des déclarations
- Calcul des revenus et charges par année
- Revenus par immeuble
- Export PDF pour déclaration

## Dépannage

### Le backend ne démarre pas

1. Vérifier que PostgreSQL est démarré
2. Vérifier les variables d'environnement dans `.env`
3. Vérifier les logs: `docker-compose logs backend`

### Le frontend ne se connecte pas au backend

1. Vérifier que le backend est démarré sur le port 3000
2. Vérifier la configuration du proxy dans `frontend/vite.config.js`
3. Vérifier les logs du navigateur (F12)

### Les emails ne sont pas envoyés

1. Vérifier la configuration SMTP dans `.env`
2. Tester la connexion SMTP
3. Vérifier les logs du backend

### Erreur de connexion à la base de données

1. Vérifier que PostgreSQL est démarré
2. Vérifier l'URL de connexion dans `.env`
3. Créer la base de données si elle n'existe pas:
```bash
psql -U postgres
CREATE DATABASE gestion_locative;
```

## Support et documentation

- README principal: [README.md](./README.md)
- Documentation API: http://localhost:3000/api (une fois démarré)
- Structure du projet détaillée dans le README

## Déploiement en production

### Avec Docker

1. **Configurer les variables d'environnement de production**
```bash
cp .env.example .env
# Modifier avec vos valeurs de production
# IMPORTANT: Changer JWT_SECRET avec une valeur sécurisée
```

2. **Builder et démarrer**
```bash
docker-compose up -d --build
```

3. **Configurer un reverse proxy (nginx)**
```nginx
server {
    listen 80;
    server_name votre-domaine.com;

    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

4. **Configurer HTTPS avec Let's Encrypt**
```bash
certbot --nginx -d votre-domaine.com
```

## Sauvegarde

### Sauvegarde de la base de données

```bash
# Créer une sauvegarde
docker-compose exec postgres pg_dump -U admin gestion_locative > backup.sql

# Restaurer une sauvegarde
docker-compose exec -T postgres psql -U admin gestion_locative < backup.sql
```

### Sauvegarde des fichiers uploadés

```bash
# Sauvegarder le dossier uploads
tar -czf uploads-backup.tar.gz backend/uploads
```

## Mise à jour

```bash
# Arrêter l'application
docker-compose down

# Récupérer les dernières modifications
git pull

# Reconstruire les images
docker-compose build

# Redémarrer
docker-compose up -d
```

## Bonnes pratiques

1. **Sécurité**
   - Changer le JWT_SECRET en production
   - Utiliser des mots de passe forts
   - Activer HTTPS en production
   - Faire des sauvegardes régulières

2. **Performance**
   - Configurer un reverse proxy avec cache
   - Utiliser une base de données dédiée en production
   - Monitorer les logs et performances

3. **Maintenance**
   - Faire des sauvegardes régulières
   - Tester les mises à jour sur un environnement de staging
   - Monitorer les erreurs et logs

## Licence

MIT
