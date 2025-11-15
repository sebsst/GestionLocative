import express from 'express';
import * as fiscalDeclarationController from '../controllers/fiscalDeclaration.controller.js';

const router = express.Router();

router.get('/', fiscalDeclarationController.getAll);
router.get('/:id', fiscalDeclarationController.getOne);
router.get('/year/:year', fiscalDeclarationController.getByYear);
router.post('/', fiscalDeclarationController.create);
router.put('/:id', fiscalDeclarationController.update);
router.put('/year/:year', fiscalDeclarationController.updateByYear);
router.delete('/:id', fiscalDeclarationController.remove);

export default router;
