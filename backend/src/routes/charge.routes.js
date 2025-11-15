import express from 'express';
import { authenticate } from '../middleware/auth.js';
import * as chargeController from '../controllers/charge.controller.js';

const router = express.Router();

router.use(authenticate);

router.get('/', chargeController.getAll);
router.get('/:id', chargeController.getOne);
router.post('/', chargeController.create);
router.put('/:id', chargeController.update);
router.delete('/:id', chargeController.remove);

router.post('/:id/distribute', chargeController.distributeChargeManually);
router.post('/:id/auto-distribute', chargeController.autoDistributeCharge);
router.post('/:id/distributions', chargeController.saveDistributions);
router.delete('/:id/distributions', chargeController.deleteDistributions);
router.get('/:id/distributions', chargeController.getDistributions);

export default router;
