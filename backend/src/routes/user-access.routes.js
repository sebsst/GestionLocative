import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { userContext } from '../middleware/userContext.js';
import {
    shareProperty,
    getSharedUsers,
    revokeAccess,
    updatePermissions,
    getMySharedProperties
} from '../controllers/user-access.controller.js';

const router = express.Router();

// Toutes les routes nécessitent l'authentification
router.use(authenticate);
router.use(userContext);

// Partager un bien avec un utilisateur
router.post('/properties/:id/share', shareProperty);

// Obtenir la liste des utilisateurs ayant accès à un bien
router.get('/properties/:id/shared-with', getSharedUsers);

// Révoquer un accès
router.delete('/property-access/:id', revokeAccess);

// Mettre à jour les permissions d'un accès
router.patch('/property-access/:id', updatePermissions);

// Obtenir mes biens partagés
router.get('/my-shared-properties', getMySharedProperties);

export default router;
