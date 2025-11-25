import express from 'express';
import { authenticate } from '../middleware/auth.js';
import * as leaseController from '../controllers/lease.controller.js';

const router = express.Router();

router.use(authenticate);

router.get('/', leaseController.getAll);
router.get('/:id', leaseController.getOne);
router.post('/', leaseController.create);
router.put('/:id', leaseController.update);
router.put('/:id/terminate', leaseController.terminate);
router.delete('/:id', leaseController.remove);

// Gestion des occupants
router.post('/:id/occupants', leaseController.addOccupant);
router.put('/:id/occupants/:occupantId', leaseController.updateOccupant);
router.delete('/:id/occupants/:occupantId', leaseController.removeOccupant);

// Clôture et historique
router.put('/:id/close', leaseController.closeLease);
router.get('/:id/history', leaseController.getLeaseHistory);

export default router;
