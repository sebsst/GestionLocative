import express from 'express';
import { authenticate } from '../middleware/auth.js';
import * as rentController from '../controllers/rent.controller.js';

const router = express.Router();

router.use(authenticate);

router.get('/', rentController.getAll);
router.get('/late', rentController.getLateRents);
router.get('/statistics', rentController.getStatistics);
router.get('/:id', rentController.getOne);
router.post('/', rentController.create);
router.post('/generate', rentController.generateMonthlyRents);
router.put('/:id', rentController.update);
router.put('/:id/pay', rentController.markAsPaid);

export default router;
