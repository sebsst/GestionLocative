import express from 'express';
import { authenticate } from '../middleware/auth.js';
import * as documentController from '../controllers/document.controller.js';

const router = express.Router();

router.use(authenticate);

router.get('/rent-reminder/:rentId', documentController.generateRentReminder);
router.post('/rent-reminder/:rentId/send', documentController.sendRentReminder);

router.get('/late-notice/:rentId', documentController.generateLateRentNotice);
router.post('/late-notice/:rentId/send', documentController.sendLateRentNotice);

router.get('/lease-contract/:leaseId', documentController.generateLeaseContract);

export default router;
