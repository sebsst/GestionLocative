import express from 'express';
import { authenticate } from '../middleware/auth.js';
import * as documentController from '../controllers/document.controller.js';
import { uploadProperty } from '../middleware/upload.js';

const router = express.Router();

router.use(authenticate);

// PDF generation routes
router.get('/rent-reminder/:rentId', documentController.generateRentReminder);
router.post('/rent-reminder/:rentId/send', documentController.sendRentReminder);

router.get('/late-notice/:rentId', documentController.generateLateRentNotice);
router.post('/late-notice/:rentId/send', documentController.sendLateRentNotice);

router.get('/lease-contract/:leaseId', documentController.generateLeaseContract);

// Property document management routes
router.get('/property/:propertyId', documentController.getPropertyDocuments);
router.get('/:id', documentController.getDocument);
router.get('/:id/download', documentController.downloadDocument);
router.post('/property/:propertyId', uploadProperty.single('document'), documentController.uploadDocument);
router.put('/:id', documentController.updateDocument);
router.delete('/:id', documentController.deleteDocument);

export default router;
