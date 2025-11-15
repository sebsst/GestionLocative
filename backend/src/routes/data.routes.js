import express from 'express';
import { exportData, importData, resetData } from '../controllers/data.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Toutes les routes nécessitent l'authentification
router.use(authenticate);

// Export de toutes les données
router.get('/export', exportData);

// Import de données
router.post('/import', importData);

// Réinitialisation de toutes les données
router.post('/reset', resetData);

export default router;
