import express from 'express';
import { authenticate } from '../middleware/auth.js';
import * as propertyController from '../controllers/property.controller.js';

const router = express.Router();

router.use(authenticate);

router.get('/', propertyController.getAll);
router.get('/statistics', propertyController.getStatistics);
router.get('/:id', propertyController.getOne);
router.post('/', propertyController.create);
router.put('/:id', propertyController.update);
router.delete('/:id', propertyController.remove);

export default router;
