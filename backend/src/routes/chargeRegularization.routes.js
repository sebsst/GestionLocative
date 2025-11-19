import express from 'express';
import {
  getAllRegularizations,
  getRegularizationById,
  calculateRegularization,
  createRegularization,
  updateRegularization,
  deleteRegularization,
  getRegularizationStats,
  generateRegularizationPDF
} from '../controllers/chargeRegularization.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get statistics
router.get('/stats', getRegularizationStats);

// Calculate regularization (before creating)
router.post('/calculate', calculateRegularization);

// CRUD operations
router.get('/', getAllRegularizations);
router.get('/:id', getRegularizationById);
router.get('/:id/pdf', generateRegularizationPDF);
router.post('/', createRegularization);
router.put('/:id', updateRegularization);
router.delete('/:id', deleteRegularization);

export default router;
