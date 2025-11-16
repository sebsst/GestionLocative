import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import * as workController from '../controllers/work.controller.js';

const router = express.Router();

router.use(authenticate);

// Works
router.get('/', workController.getAll);
router.get('/statistics', workController.getStatistics);
router.get('/:id', workController.getOne);
router.post('/', upload.fields([
  { name: 'quote', maxCount: 10 },
  { name: 'invoiceFile', maxCount: 10 }
]), workController.create);
router.put('/:id', upload.fields([
  { name: 'quote', maxCount: 10 },
  { name: 'invoiceFile', maxCount: 10 }
]), workController.update);
router.delete('/:id', workController.remove);

// Artisans
router.get('/artisans/list', workController.getAllArtisans);
router.get('/artisans/:id', workController.getArtisan);
router.post('/artisans', workController.createArtisan);
router.put('/artisans/:id', workController.updateArtisan);
router.delete('/artisans/:id', workController.deleteArtisan);

// Quotes
router.get('/quotes/list', workController.getAllQuotes);
router.post('/quotes', workController.createQuote);
router.put('/quotes/:id', workController.updateQuote);

export default router;
