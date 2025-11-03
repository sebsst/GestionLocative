import express from 'express';
import { authenticate } from '../middleware/auth.js';
import * as propertyRentHistoryController from '../controllers/propertyRentHistory.controller.js';

const router = express.Router();

router.use(authenticate);

router.get('/:propertyId/history', propertyRentHistoryController.getHistory);
router.get('/:propertyId/current', propertyRentHistoryController.getCurrent);
router.post('/:propertyId/history', propertyRentHistoryController.create);
router.put('/history/:id', propertyRentHistoryController.update);
router.delete('/history/:id', propertyRentHistoryController.remove);

export default router;
