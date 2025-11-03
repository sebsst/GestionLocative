import express from 'express';
import { authenticate } from '../middleware/auth.js';
import * as fiscalController from '../controllers/fiscal.controller.js';

const router = express.Router();

router.use(authenticate);

router.get('/:year', fiscalController.getFiscalData);
router.get('/:year/pdf', fiscalController.generateFiscalDeclaration);
router.get('/charges/by-property', fiscalController.getChargesByProperty);

export default router;
