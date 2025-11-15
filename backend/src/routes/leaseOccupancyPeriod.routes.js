import express from 'express';
import { authenticate } from '../middleware/auth.js';
import * as leaseOccupancyPeriodController from '../controllers/leaseOccupancyPeriod.controller.js';

const router = express.Router();

router.use(authenticate);

router.get('/lease/:leaseId', leaseOccupancyPeriodController.getByLeaseId);
router.get('/current/:leaseId', leaseOccupancyPeriodController.getCurrentPeriod);
router.post('/', leaseOccupancyPeriodController.create);
router.put('/:id', leaseOccupancyPeriodController.update);
router.delete('/:id', leaseOccupancyPeriodController.remove);

export default router;
