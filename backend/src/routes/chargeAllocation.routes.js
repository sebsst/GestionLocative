import express from 'express';
import { authenticate } from '../middleware/auth.js';
import * as chargeAllocationController from '../controllers/chargeAllocation.controller.js';

const router = express.Router();

router.use(authenticate);

router.get('/', chargeAllocationController.getAll);
router.get('/:id', chargeAllocationController.getOne);
router.post('/', chargeAllocationController.create);
router.put('/:id', chargeAllocationController.update);
router.delete('/:id', chargeAllocationController.remove);

router.get('/charge/:chargeId', chargeAllocationController.getByChargeId);
router.get('/lease/:leaseId', chargeAllocationController.getByLeaseId);

export default router;
