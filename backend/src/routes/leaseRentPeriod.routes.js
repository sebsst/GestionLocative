import express from 'express';
import { authenticate } from '../middleware/auth.js';
import * as leaseRentPeriodController from '../controllers/leaseRentPeriod.controller.js';

const router = express.Router();

router.use(authenticate);

router.get('/', leaseRentPeriodController.getAll);
router.get('/current/:leaseId', leaseRentPeriodController.getCurrentPeriod);
router.get('/history/:leaseId', leaseRentPeriodController.getHistory);
router.post('/', leaseRentPeriodController.create);
router.post('/calculate-irl', leaseRentPeriodController.calculateIRLRevision);
router.put('/:id', leaseRentPeriodController.update);
router.delete('/:id', leaseRentPeriodController.remove);

export default router;
