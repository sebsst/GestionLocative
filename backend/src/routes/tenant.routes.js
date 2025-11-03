import express from 'express';
import { authenticate } from '../middleware/auth.js';
import * as tenantController from '../controllers/tenant.controller.js';

const router = express.Router();

router.use(authenticate);

router.get('/', tenantController.getAll);
router.get('/:id', tenantController.getOne);
router.post('/', tenantController.create);
router.put('/:id', tenantController.update);
router.delete('/:id', tenantController.remove);

router.get('/:id/communications', tenantController.getCommunications);
router.post('/:id/communications', tenantController.addCommunication);

export default router;
